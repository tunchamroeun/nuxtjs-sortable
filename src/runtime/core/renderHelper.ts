import {
  ComponentStructure,
  type NodesInfo,
  type RootInfo,
} from './componentStructure'
import { isHtmlTag, isTransition } from '../util/tags'
import { resolveComponent, TransitionGroup, type Slots, type VNode } from 'vue'

export interface ComputeNodesParams<T = unknown> {
  $slots: Slots
  realList: T[] | null
  getKey: (element: T) => string | number
}

export interface ComputeComponentStructureParams<T = unknown> {
  $slots: Slots
  tag: string
  realList: T[] | null
  getKey: (element: T) => string | number
}

function getSlot(slots: Slots, key: string): VNode[] {
  const slotValue = slots[key]
  return slotValue ? slotValue() : []
}

function computeNodes<T>({
  $slots,
  realList,
  getKey,
}: ComputeNodesParams<T>): NodesInfo {
  const normalizedList = realList || []
  const header = getSlot($slots, 'header')
  const footer = getSlot($slots, 'footer')
  const { item } = $slots
  if (!item) {
    throw new Error('draggable element must have an item slot')
  }
  const defaultNodes = normalizedList.flatMap((element, index) =>
    item({ element, index }).map((node) => {
      node.key = getKey(element)
      node.props = { ...(node.props || {}), 'data-draggable': true }
      return node
    }),
  )
  if (defaultNodes.length !== normalizedList.length) {
    throw new Error('Item slot must have only one child')
  }
  return {
    header,
    footer,
    default: defaultNodes,
  }
}

function getRootInformation(tag: string): RootInfo {
  const transition = isTransition(tag)
  const externalComponent = !isHtmlTag(tag) && !transition
  return {
    transition,
    externalComponent,
    tag: externalComponent
      ? resolveComponent(tag)
      : transition
        ? TransitionGroup
        : tag,
  } as RootInfo
}

function computeComponentStructure<T>({
  $slots,
  tag,
  realList,
  getKey,
}: ComputeComponentStructureParams<T>): ComponentStructure<T> {
  const nodes = computeNodes({ $slots, realList, getKey })
  const root = getRootInformation(tag)
  return new ComponentStructure({ nodes, root, realList })
}

export { computeComponentStructure }
