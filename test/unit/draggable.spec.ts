/**
 * @vitest-environment jsdom
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Test file with dynamic slot typing
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, ref, nextTick } from 'vue'

import Draggable from '../../src/runtime/components/Draggable.vue'

// Mock Sortable.js - must be before import
vi.mock('sortablejs', () => {
  class MockSortable {
    el: HTMLElement
    options: Record<string, unknown>

    constructor(el: HTMLElement, options: Record<string, unknown>) {
      this.el = el
      this.options = options
    }

    destroy() {}

    option(_key: string, _value?: unknown) {
      return undefined
    }
  }

  return {
    default: MockSortable,
  }
})

describe('Draggable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render items from list', () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ]

      const wrapper = mount(Draggable, {
        props: {
          list: items,
          itemKey: 'id',
        },
        slots: {
          item: ({ element }: { element: { id: number, name: string } }) =>
            h('div', { class: 'item' }, element.name),
        },
      })

      expect(wrapper.findAll('.item')).toHaveLength(3)
      expect(wrapper.text()).toContain('Item 1')
      expect(wrapper.text()).toContain('Item 2')
      expect(wrapper.text()).toContain('Item 3')
    })

    it('should render with v-model', () => {
      const items = ref([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ])

      const wrapper = mount(Draggable, {
        props: {
          modelValue: items.value,
          itemKey: 'id',
        },
        slots: {
          item: ({ element }: { element: { id: number, name: string } }) =>
            h('div', { class: 'item' }, element.name),
        },
      })

      expect(wrapper.findAll('.item')).toHaveLength(2)
    })

    it('should render with custom tag', () => {
      const wrapper = mount(Draggable, {
        props: {
          list: [{ id: 1 }],
          itemKey: 'id',
          tag: 'ul',
        },
        slots: {
          item: () => h('li', 'Item'),
        },
      })

      expect(wrapper.element.tagName).toBe('UL')
    })

    it('should render with external component object as tag', () => {
      // Define a custom component similar to el-collapse
      const CustomContainer = {
        name: 'CustomContainer',
        setup(_: unknown, { slots }: { slots: { default?: () => unknown } }) {
          return () => h('div', { 'class': 'custom-container', 'data-custom': 'true' }, slots.default?.())
        },
      }

      const wrapper = mount(Draggable, {
        props: {
          list: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
          itemKey: 'id',
          tag: CustomContainer,
        },
        slots: {
          item: ({ element }: { element: { id: number, name: string } }) =>
            h('div', { class: 'item' }, element.name),
        },
      })

      // Should render the custom container component
      expect(wrapper.find('.custom-container').exists()).toBe(true)
      expect(wrapper.element.getAttribute('data-custom')).toBe('true')
      // Items should be rendered inside
      expect(wrapper.findAll('.item')).toHaveLength(2)
      expect(wrapper.text()).toContain('Item 1')
      expect(wrapper.text()).toContain('Item 2')
    })

    it('should pass componentData to external component', () => {
      const CustomContainer = {
        name: 'CustomContainer',
        props: {
          activePanel: String,
          customProp: Number,
        },
        setup(props: { activePanel?: string, customProp?: number }, { slots }: { slots: { default?: () => unknown } }) {
          return () => h('div', {
            'class': 'custom-container',
            'data-active': props.activePanel,
            'data-custom-prop': props.customProp,
          }, slots.default?.())
        },
      }

      const wrapper = mount(Draggable, {
        props: {
          list: [{ id: 1, name: 'Item 1' }],
          itemKey: 'id',
          tag: CustomContainer,
          componentData: {
            activePanel: 'panel-1',
            customProp: 42,
          },
        },
        slots: {
          item: ({ element }: { element: { name: string } }) =>
            h('div', { class: 'item' }, element.name),
        },
      })

      expect(wrapper.element.getAttribute('data-active')).toBe('panel-1')
      expect(wrapper.element.getAttribute('data-custom-prop')).toBe('42')
    })

    it('should work with defineComponent-style external component', () => {
      // Simulate how element-plus or other UI libraries define components
      const AccordionContainer = {
        name: 'AccordionContainer',
        emits: ['change'],
        props: {
          accordion: { type: Boolean, default: false },
          modelValue: { type: Array, default: () => [] },
        },
        setup(props: { accordion?: boolean }, { slots }: { slots: { default?: () => unknown } }) {
          return () => h('div', {
            class: ['accordion-wrapper', { 'is-accordion': props.accordion }],
            role: 'tablist',
          }, slots.default?.())
        },
      }

      const wrapper = mount(Draggable, {
        props: {
          list: [
            { name: '1', title: 'Section 1' },
            { name: '2', title: 'Section 2' },
          ],
          itemKey: 'name',
          tag: AccordionContainer,
          componentData: {
            accordion: true,
          },
        },
        slots: {
          item: ({ element }: { element: { name: string, title: string } }) =>
            h('div', { class: 'accordion-item' }, element.title),
        },
      })

      expect(wrapper.find('.accordion-wrapper').exists()).toBe(true)
      expect(wrapper.classes()).toContain('is-accordion')
      expect(wrapper.element.getAttribute('role')).toBe('tablist')
      expect(wrapper.findAll('.accordion-item')).toHaveLength(2)
    })

    it('should render header slot', () => {
      const wrapper = mount(Draggable, {
        props: {
          list: [{ id: 1, name: 'Item' }],
          itemKey: 'id',
        },
        slots: {
          header: () => h('div', { class: 'header' }, 'Header'),
          item: ({ element }: { element: { name: string } }) =>
            h('div', { class: 'item' }, element.name),
        },
      })

      expect(wrapper.find('.header').exists()).toBe(true)
      expect(wrapper.text()).toContain('Header')
    })

    it('should render footer slot', () => {
      const wrapper = mount(Draggable, {
        props: {
          list: [{ id: 1, name: 'Item' }],
          itemKey: 'id',
        },
        slots: {
          footer: () => h('div', { class: 'footer' }, 'Footer'),
          item: ({ element }: { element: { name: string } }) =>
            h('div', { class: 'item' }, element.name),
        },
      })

      expect(wrapper.find('.footer').exists()).toBe(true)
      expect(wrapper.text()).toContain('Footer')
    })
  })

  describe('itemKey', () => {
    it('should work with string itemKey', () => {
      const items = [{ id: 1, name: 'Item' }]

      const wrapper = mount(Draggable, {
        props: {
          list: items,
          itemKey: 'id',
        },
        slots: {
          item: ({ element }: { element: { name: string } }) =>
            h('div', element.name),
        },
      })

      expect(wrapper.text()).toContain('Item')
    })

    it('should work with function itemKey', () => {
      const items = [{ id: 1, name: 'Item' }]

      const wrapper = mount(Draggable, {
        props: {
          list: items,
          itemKey: (item: unknown) => (item as { id: number }).id,
        },
        slots: {
          item: ({ element }: { element: { name: string } }) =>
            h('div', element.name),
        },
      })

      expect(wrapper.text()).toContain('Item')
    })
  })

  describe('props validation', () => {
    it('should warn when both list and modelValue are provided', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mount(Draggable, {
        props: {
          list: [{ id: 1 }],
          modelValue: [{ id: 2 }],
          itemKey: 'id',
        },
        slots: {
          item: () => h('div', 'Item'),
        },
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        'modelValue and list props are mutually exclusive! Please set one or another.',
      )

      consoleSpy.mockRestore()
    })
  })

  describe('attributes', () => {
    it('should pass HTML attributes to container', () => {
      const wrapper = mount(Draggable, {
        props: {
          list: [{ id: 1 }],
          itemKey: 'id',
        },
        attrs: {
          'id': 'my-list',
          'class': 'draggable-list',
          'data-testid': 'list',
        },
        slots: {
          item: () => h('div', 'Item'),
        },
      })

      expect(wrapper.attributes('id')).toBe('my-list')
      expect(wrapper.classes()).toContain('draggable-list')
      expect(wrapper.attributes('data-testid')).toBe('list')
    })

    it('should not pass sortable options as HTML attributes', () => {
      const wrapper = mount(Draggable, {
        props: {
          list: [{ id: 1 }],
          itemKey: 'id',
        },
        attrs: {
          group: 'shared',
          animation: 150,
          ghostClass: 'ghost',
        },
        slots: {
          item: () => h('div', 'Item'),
        },
      })

      expect(wrapper.attributes('group')).toBeUndefined()
      expect(wrapper.attributes('animation')).toBeUndefined()
      expect(wrapper.attributes('ghostClass')).toBeUndefined()
    })
  })

  describe('data-draggable attribute', () => {
    it('should add data-draggable attribute to items', () => {
      const wrapper = mount(Draggable, {
        props: {
          list: [{ id: 1 }, { id: 2 }],
          itemKey: 'id',
        },
        slots: {
          item: ({ element }: { element: { id: number } }) =>
            h('div', { class: 'item' }, `Item ${element.id}`),
        },
      })

      const items = wrapper.findAll('.item')
      items.forEach((item) => {
        expect(item.attributes('data-draggable')).toBe('true')
      })
    })
  })
})

describe('Draggable Events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('change event', () => {
    it('should emit update:modelValue when using v-model', async () => {
      const items = ref([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ])

      const wrapper = mount(Draggable, {
        props: {
          'modelValue': items.value,
          'itemKey': 'id',
          'onUpdate:modelValue': (e: unknown[]) => {
            items.value = e as typeof items.value
          },
        },
        slots: {
          item: ({ element }: { element: { name: string } }) =>
            h('div', element.name),
        },
      })

      // Access internal methods to simulate list changes
      const vm = wrapper.vm as unknown as {
        alterList: (fn: (list: unknown[]) => void) => void
      }

      // Simulate a move operation
      vm.alterList((list) => {
        const item = list.splice(0, 1)[0]
        list.splice(1, 0, item)
      })

      await nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('emitChanges', () => {
    it('should emit change event with added payload', async () => {
      const wrapper = mount(Draggable, {
        props: {
          list: [{ id: 1 }],
          itemKey: 'id',
        },
        slots: {
          item: () => h('div', 'Item'),
        },
      })

      const vm = wrapper.vm as unknown as {
        emitChanges: (evt: unknown) => void
      }

      vm.emitChanges({
        added: {
          element: { id: 2, name: 'New Item' },
          newIndex: 1,
        },
      })

      await nextTick()

      const emitted = wrapper.emitted('change')
      expect(emitted).toBeTruthy()
      const changeEvent = emitted![0]![0] as {
        added: { element: { id: number, name: string }, newIndex: number }
      }
      expect(changeEvent.added.element.id).toBe(2)
      expect(changeEvent.added.newIndex).toBe(1)
    })

    it('should emit change event with removed payload', async () => {
      const wrapper = mount(Draggable, {
        props: {
          list: [{ id: 1 }, { id: 2 }],
          itemKey: 'id',
        },
        slots: {
          item: () => h('div', 'Item'),
        },
      })

      const vm = wrapper.vm as unknown as {
        emitChanges: (evt: unknown) => void
      }

      vm.emitChanges({
        removed: {
          element: { id: 1, name: 'Removed Item' },
          oldIndex: 0,
        },
      })

      await nextTick()

      const emitted = wrapper.emitted('change')
      expect(emitted).toBeTruthy()
      const changeEvent = emitted![0]![0] as {
        removed: { element: { id: number, name: string }, oldIndex: number }
      }
      expect(changeEvent.removed.element.id).toBe(1)
      expect(changeEvent.removed.oldIndex).toBe(0)
    })

    it('should emit change event with moved payload', async () => {
      const wrapper = mount(Draggable, {
        props: {
          list: [{ id: 1 }, { id: 2 }, { id: 3 }],
          itemKey: 'id',
        },
        slots: {
          item: () => h('div', 'Item'),
        },
      })

      const vm = wrapper.vm as unknown as {
        emitChanges: (evt: unknown) => void
      }

      vm.emitChanges({
        moved: {
          element: { id: 1, name: 'Moved Item' },
          oldIndex: 0,
          newIndex: 2,
        },
      })

      await nextTick()

      const emitted = wrapper.emitted('change')
      expect(emitted).toBeTruthy()
      const changeEvent = emitted![0]![0] as {
        moved: { element: { id: number, name: string }, oldIndex: number, newIndex: number }
      }
      expect(changeEvent.moved.element.id).toBe(1)
      expect(changeEvent.moved.oldIndex).toBe(0)
      expect(changeEvent.moved.newIndex).toBe(2)
    })
  })
})

describe('Draggable List Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('spliceList', () => {
    it('should splice list directly when using list prop', async () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ]

      const wrapper = mount(Draggable, {
        props: {
          list: items,
          itemKey: 'id',
        },
        slots: {
          item: ({ element }: { element: { name: string } }) =>
            h('div', element.name),
        },
      })

      const vm = wrapper.vm as unknown as {
        spliceList: (...args: [number, number, ...unknown[]]) => void
      }

      // Remove item at index 1
      vm.spliceList(1, 1)

      expect(items).toHaveLength(2)
      expect(items[0]!.id).toBe(1)
      expect(items[1]!.id).toBe(3)
    })

    it('should emit update:modelValue when using v-model', async () => {
      const items = ref([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ])

      const wrapper = mount(Draggable, {
        props: {
          modelValue: items.value,
          itemKey: 'id',
        },
        slots: {
          item: ({ element }: { element: { name: string } }) =>
            h('div', element.name),
        },
      })

      const vm = wrapper.vm as unknown as {
        spliceList: (...args: [number, number, ...unknown[]]) => void
      }

      // Add new item
      vm.spliceList(1, 0, { id: 3, name: 'New Item' })

      await nextTick()

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      const emittedList = emitted![0]![0] as unknown[]
      expect(emittedList).toHaveLength(3)
    })
  })

  describe('updatePosition', () => {
    it('should update position in list', async () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ]

      const wrapper = mount(Draggable, {
        props: {
          list: items,
          itemKey: 'id',
        },
        slots: {
          item: ({ element }: { element: { name: string } }) =>
            h('div', element.name),
        },
      })

      const vm = wrapper.vm as unknown as {
        updatePosition: (oldIndex: number, newIndex: number) => void
      }

      // Move item from index 0 to index 2
      vm.updatePosition(0, 2)

      expect(items[0]!.id).toBe(2)
      expect(items[1]!.id).toBe(3)
      expect(items[2]!.id).toBe(1)
    })

    it('should emit update:modelValue when moving with v-model', async () => {
      const items = ref([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ])

      const wrapper = mount(Draggable, {
        props: {
          modelValue: items.value,
          itemKey: 'id',
        },
        slots: {
          item: ({ element }: { element: { name: string } }) =>
            h('div', element.name),
        },
      })

      const vm = wrapper.vm as unknown as {
        updatePosition: (oldIndex: number, newIndex: number) => void
      }

      // Move item from index 2 to index 0
      vm.updatePosition(2, 0)

      await nextTick()

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      const emittedList = emitted![0]![0] as { id: number }[]
      expect(emittedList[0]!.id).toBe(3)
      expect(emittedList[1]!.id).toBe(1)
      expect(emittedList[2]!.id).toBe(2)
    })
  })
})

describe('Clone functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use default clone (identity function)', () => {
    const wrapper = mount(Draggable, {
      props: {
        list: [{ id: 1 }],
        itemKey: 'id',
      },
      slots: {
        item: () => h('div', 'Item'),
      },
    })

    const vm = wrapper.vm as unknown as {
      clone: (item: unknown) => unknown
    }

    const original = { id: 1, name: 'Test' }
    const cloned = vm.clone(original)

    expect(cloned).toBe(original) // Same reference by default
  })

  it('should use custom clone function', () => {
    const customClone = (item: unknown) => {
      const typedItem = item as { id: number, name: string }
      return {
        ...typedItem,
        id: typedItem.id + 100,
      }
    }

    const wrapper = mount(Draggable, {
      props: {
        list: [{ id: 1, name: 'Item' }],
        itemKey: 'id',
        clone: customClone,
      },
      slots: {
        item: () => h('div', 'Item'),
      },
    })

    const vm = wrapper.vm as unknown as {
      clone: (item: unknown) => { id: number, name: string }
    }

    const original = { id: 1, name: 'Test' }
    const cloned = vm.clone(original)

    expect(cloned).not.toBe(original)
    expect(cloned.id).toBe(101)
    expect(cloned.name).toBe('Test')
  })
})
