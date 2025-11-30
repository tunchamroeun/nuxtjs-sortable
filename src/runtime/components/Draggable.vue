<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts" generic="T">
import Sortable, { type SortableEvent } from 'sortablejs'
import { insertNodeAt, removeNode } from '../util/htmlHelper'
import { console } from '../util/console'
import {
  getComponentAttributes,
  createSortableOption,
  getValidSortableEntries,
  type CallBackBuilder,
} from '../core/componentBuilderHelper'
import { computeComponentStructure } from '../core/renderHelper'
import type { DragEvent } from '../core/sortableEvents'
import {
  h,
  nextTick,
  ref,
  computed,
  watch,
  onMounted,
  onUpdated,
  onBeforeUnmount,
  useSlots,
  useAttrs,
  getCurrentInstance,
  type VNode,
} from 'vue'
import type {
  ComponentStructure,
  DraggableContext,
} from '../core/componentStructure'
import type {
  ChangeEvent,
  DraggedContext as DraggedContextBase,
  RelatedContext as RelatedContextBase,
  MoveEventContext as MoveEventContextBase,
} from '../types'

// Component options using defineOptions (Vue 3.3+)
defineOptions({
  inheritAttrs: false,
})

// Extend HTMLElement to include our custom property
interface DraggableHTMLElement extends HTMLElement {
  __draggable_component__?: DraggableComponentInstance
}

// Extend the SortableEvent item to include our custom property
interface DraggableItem extends HTMLElement {
  _underlying_vm_?: T
}

// Extended SortableEvent with our custom item type
interface DraggableSortableEvent extends Omit<
  SortableEvent,
  'item' | 'pullMode'
> {
  item: DraggableItem
  clone: HTMLElement
  pullMode?: boolean | 'clone'
  newIndex: number
  oldIndex: number
  from: HTMLElement
  to: HTMLElement
  related: HTMLElement
  willInsertAfter?: boolean
}

// Component instance interface
interface DraggableComponentInstance {
  realList: T[] | null
  getUnderlyingVm: (
    domElement: HTMLElement,
  ) => DraggableContext<T> | undefined | null
  getVmIndexFromDomIndex: (domIndex: number) => number
  componentStructure: ComponentStructure
  targetDomElement: HTMLElement
  context?: DraggableContext<T>
}

// Props definition
const props = withDefaults(defineProps<{
  list?: T[] | null
  modelValue?: T[] | null
  itemKey: string | ((item: T) => string | number)
  clone?: (original: T) => T
  tag?: string
  move?: (evt: MoveEventContextBase<T>, originalEvent: Event) => boolean | number | undefined
  componentData?: Record<string, unknown> | null
}>(), {
  list: null,
  modelValue: null,
  clone: (original: T) => original,
  tag: 'div',
  move: undefined,
  componentData: null,
})

// Emits - includes all Sortable.js events
const emit = defineEmits<{
  'update:modelValue': [value: T[]]
  'change': [evt: ChangeEvent<T>]
  // Sortable.js events (manageAndEmit)
  'start': [evt: unknown]
  'add': [evt: unknown]
  'remove': [evt: unknown]
  'update': [evt: unknown]
  'end': [evt: unknown]
  // Sortable.js events (emit only)
  'choose': [evt: unknown]
  'unchoose': [evt: unknown]
  'sort': [evt: unknown]
  'filter': [evt: unknown]
  'clone': [evt: unknown]
  // Sortable.js events (manage)
  'move': [evt: unknown, originalEvent: Event]
}>()

// Slots (header and footer are optional)
defineSlots<{
  item: (props: { element: T, index: number }) => unknown
  header?: () => unknown
  footer?: () => unknown
}>()

// Module-level dragging element tracker
let draggingElement: HTMLElement | null = null

// Get instance and core Vue utilities
const instance = getCurrentInstance()!
const slots = useSlots()
const attrs = useAttrs()

// Reactive state
const error = ref(false)

// Internal state (non-reactive references)
let _sortable: Sortable | undefined
let componentStructure: ComponentStructure
let targetDomElement: HTMLElement
let context: DraggableContext<T> | undefined

// Computed
const realList = computed<T[] | null>(() => {
  return props.list ? props.list : props.modelValue
})

const getKey = computed<(element: T) => string | number>(() => {
  const { itemKey } = props
  if (typeof itemKey === 'function') {
    return itemKey
  }
  return (element: T) => {
    const value = (element as Record<string, string | number | undefined>)[itemKey]
    return value ?? ''
  }
})

// Helper functions for emit and manage
function emitEvent(evtName: string, evtData: unknown): void {
  nextTick(() => emit(evtName.toLowerCase() as keyof typeof emit, evtData as never))
}

function manage(evtName: string) {
  return (
    evtData: DraggableSortableEvent,
    originalElement?: HTMLElement,
  ): unknown => {
    if (realList.value !== null) {
      const methodName = `onDrag${evtName}` as keyof typeof methods
      return methods[methodName]?.(evtData as never, originalElement as never)
    }
    return undefined
  }
}

function manageAndEmit(evtName: string) {
  const delegateCallBack = manage(evtName)
  return (
    evtData: DraggableSortableEvent,
    originalElement?: HTMLElement,
  ): void => {
    delegateCallBack(evtData, originalElement)
    emitEvent(evtName, evtData)
  }
}

// Methods
const methods = {
  getUnderlyingVm(domElement: HTMLElement): DraggableContext<T> | null {
    return componentStructure?.getUnderlyingVm(domElement) as DraggableContext<T> | null || null
  },

  getUnderlyingPotencialDraggableComponent(
    htmElement: HTMLElement,
  ): DraggableComponentInstance | undefined {
    return (htmElement as DraggableHTMLElement).__draggable_component__
  },

  emitChanges(evt: ChangeEvent<T>): void {
    nextTick(() => emit('change', evt))
  },

  alterList(onList: (list: T[]) => void): void {
    if (props.list) {
      onList(props.list)
      return
    }
    const newList = [...(props.modelValue as T[])]
    onList(newList)
    emit('update:modelValue', newList)
  },

  spliceList(...args: [number, number, ...T[]]): void {
    const spliceList = (list: T[]) => list.splice(...args)
    methods.alterList(spliceList)
  },

  updatePosition(oldIndex: number, newIndex: number): void {
    const updatePosition = (list: T[]) =>
      list.splice(newIndex, 0, list.splice(oldIndex, 1)[0] as T)
    methods.alterList(updatePosition)
  },

  getRelatedContextFromMoveEvent({
    to,
    related,
  }: {
    to: HTMLElement
    related: HTMLElement
  }): RelatedContextBase<T> {
    const component = methods.getUnderlyingPotencialDraggableComponent(to)
    if (!component) {
      return { component }
    }
    const list = component.realList as T[] | undefined
    const relatedContext: RelatedContextBase<T> = { list, component }
    if (to !== related && list) {
      const destination = component.getUnderlyingVm(related) || {}
      return { ...destination, ...relatedContext }
    }
    return relatedContext
  },

  getVmIndexFromDomIndex(domIndex: number): number {
    return componentStructure.getVmIndexFromDomIndex(domIndex, targetDomElement)
  },

  onDragStart(evt: DraggableSortableEvent): void {
    context = methods.getUnderlyingVm(evt.item) ?? undefined
    // Fallback: if context not found, find it by DOM index
    if (!context) {
      const domChildren = [...targetDomElement.children]
      const domIndex = domChildren.indexOf(evt.item)
      if (domIndex >= 0 && realList.value) {
        // Try to find the element index by counting data-draggable elements
        const draggableIndex
          = domChildren
            .slice(0, domIndex + 1)
            .filter(
              el => el.hasAttribute && el.hasAttribute('data-draggable'),
            ).length - 1

        if (draggableIndex >= 0 && draggableIndex < realList.value.length) {
          context = {
            index: draggableIndex,
            element: realList.value[draggableIndex],
          } as DraggableContext<T>
        }
      }
    }
    if (context) {
      evt.item._underlying_vm_ = props.clone(context.element as T)
    }
    draggingElement = evt.item
  },

  onDragAdd(evt: DraggableSortableEvent): void {
    const element = evt.item._underlying_vm_
    if (element === undefined) {
      return
    }
    removeNode(evt.item)
    const newIndex = methods.getVmIndexFromDomIndex(evt.newIndex)
    methods.spliceList(newIndex, 0, element as T)
    const added = { element: element as T, newIndex }
    methods.emitChanges({ added })
  },

  onDragRemove(evt: DraggableSortableEvent): void {
    insertNodeAt(instance.proxy!.$el as HTMLElement, evt.item, evt.oldIndex)
    if (evt.pullMode === 'clone') {
      removeNode(evt.clone)
      return
    }
    const { index: oldIndex, element } = context!
    methods.spliceList(oldIndex, 1)
    const removed = { element: element as T, oldIndex }
    methods.emitChanges({ removed })
  },

  onDragUpdate(evt: DraggableSortableEvent): void {
    removeNode(evt.item)
    insertNodeAt(evt.from, evt.item, evt.oldIndex)
    const oldIndex = context!.index
    const newIndex = methods.getVmIndexFromDomIndex(evt.newIndex)
    methods.updatePosition(oldIndex, newIndex)
    const moved = {
      element: context!.element as T,
      oldIndex,
      newIndex,
    }
    methods.emitChanges({ moved })
  },

  computeFutureIndex(
    relatedContext: RelatedContextBase<T>,
    evt: DraggableSortableEvent,
  ): number {
    if (!relatedContext.element) {
      return 0
    }
    const domChildren = [...evt.to.children].filter(
      el => (el as HTMLElement).style.display !== 'none',
    )
    const currentDomIndex = domChildren.indexOf(evt.related)
    const currentIndex
      = (relatedContext.component as DraggableComponentInstance)!.getVmIndexFromDomIndex(currentDomIndex)
    const draggedInList = domChildren.includes(draggingElement!)
    return draggedInList || !evt.willInsertAfter
      ? currentIndex
      : currentIndex + 1
  },

  onDragMove(
    evt: DraggableSortableEvent,
    originalEvent: Event,
  ): boolean | number | undefined {
    const { move } = props
    if (!move || !realList.value) {
      return true
    }

    const relatedContext = methods.getRelatedContextFromMoveEvent(evt)
    const futureIndex = methods.computeFutureIndex(relatedContext, evt)
    const draggedContext: DraggedContextBase<T> = {
      index: context!.index,
      element: context!.element as T,
      futureIndex,
    }
    const sendEvent: MoveEventContextBase<T> = {
      ...evt,
      relatedContext,
      draggedContext,
    } as unknown as MoveEventContextBase<T>
    return move(sendEvent, originalEvent)
  },

  onDragEnd(): void {
    draggingElement = null
  },
}

// Watch attrs for sortable option changes
watch(
  () => attrs,
  (newOptionValue) => {
    if (!_sortable) return
    getValidSortableEntries(newOptionValue).forEach(([key, value]) => {
      _sortable!.option(key as keyof Sortable.Options, value as never)
    })
  },
  { deep: true },
)

// Lifecycle: created equivalent
if (props.list !== null && props.modelValue !== null) {
  console.error(
    'modelValue and list props are mutually exclusive! Please set one or another.',
  )
}

// Lifecycle: mounted
onMounted(() => {
  if (error.value) {
    return
  }

  const $el = instance.proxy!.$el as HTMLElement
  componentStructure.updated()

  const callBackBuilder: CallBackBuilder = {
    manageAndEmit: (event: DragEvent) =>
      manageAndEmit(event) as (evtData: unknown, originalElement?: HTMLElement) => void,
    emit: (event: DragEvent) =>
      ((evtData: unknown) => emitEvent(event, evtData)) as (evtData: unknown) => void,
    manage: (event: DragEvent) =>
      manage(event) as (evtData: unknown, originalElement?: HTMLElement) => unknown,
  }

  const sortableOptions = createSortableOption({
    $attrs: attrs,
    callBackBuilder,
  })
  targetDomElement
    = $el.nodeType === 1
      ? $el
      : $el.parentElement!
  _sortable = new Sortable(targetDomElement, sortableOptions)
  ;(targetDomElement as DraggableHTMLElement).__draggable_component__
    = {
      realList: realList.value,
      getUnderlyingVm: methods.getUnderlyingVm,
      getVmIndexFromDomIndex: methods.getVmIndexFromDomIndex,
      componentStructure,
      targetDomElement,
      context,
    } as DraggableComponentInstance
})

// Lifecycle: updated
onUpdated(() => {
  componentStructure?.updated()
})

// Lifecycle: beforeUnmount
onBeforeUnmount(() => {
  if (_sortable !== undefined) _sortable.destroy()
})

// Functional component for rendering - this is the key pattern for script setup with render functions
const RenderContent = (): VNode => {
  try {
    error.value = false
    componentStructure = computeComponentStructure({
      $slots: slots,
      tag: props.tag,
      realList: realList.value,
      getKey: getKey.value,
    })
    const attributes = getComponentAttributes({
      $attrs: attrs,
      componentData: props.componentData ?? undefined,
    })
    return componentStructure.render(h, attributes)
  }
  catch (err) {
    error.value = true
    return h('pre', { style: { color: 'red' } }, (err as Error).stack)
  }
}

// Expose methods and properties that need to be accessible
defineExpose({
  realList,
  getUnderlyingVm: methods.getUnderlyingVm,
  getVmIndexFromDomIndex: methods.getVmIndexFromDomIndex,
  componentStructure: () => componentStructure,
  targetDomElement: () => targetDomElement,
  context: () => context,
  // Expose internal methods for testing and external access
  emitChanges: methods.emitChanges,
  alterList: methods.alterList,
  spliceList: methods.spliceList,
  updatePosition: methods.updatePosition,
  clone: props.clone,
})
</script>

<template>
  <RenderContent />
</template>
