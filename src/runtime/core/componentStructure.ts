import type { VNode, Component } from 'vue'

export interface DraggableContext<T = unknown> {
  element: T
  index: number
}

export interface NodeInfo {
  el?: HTMLElement
}

export interface RootInfo {
  externalComponent: boolean
  transition: boolean
  tag: string | Component
}

export interface NodesInfo {
  header: VNode[]
  default: VNode[]
  footer: VNode[]
}

export interface ComponentStructureOptions<T = unknown> {
  nodes: NodesInfo
  root: RootInfo
  realList: T[] | null
}

interface DraggableHTMLElement extends HTMLElement {
  __draggable_context?: DraggableContext
}

const getHtmlElementFromNode = (node: VNode): HTMLElement | undefined =>
  (node as unknown as NodeInfo).el

const addContext = <T>(
  domElement: HTMLElement | undefined,
  context: DraggableContext<T>,
): void => {
  if (domElement) {
    (domElement as DraggableHTMLElement).__draggable_context = context
  }
}

const getContext = <T>(
  domElement: HTMLElement | null,
): DraggableContext<T> | undefined =>
  domElement
    ? ((domElement as DraggableHTMLElement)
        .__draggable_context as DraggableContext<T>)
    : undefined

class ComponentStructure<T = unknown> {
  defaultNodes: VNode[]
  children: VNode[]
  externalComponent: boolean
  rootTransition: boolean
  tag: string | Component
  realList: T[] | null

  constructor({
    nodes: { header, default: defaultNodes, footer },
    root,
    realList,
  }: ComponentStructureOptions<T>) {
    this.defaultNodes = defaultNodes
    this.children = [...header, ...defaultNodes, ...footer]
    this.externalComponent = root.externalComponent
    this.rootTransition = root.transition
    this.tag = root.tag
    this.realList = realList
  }

  get _isRootComponent(): boolean {
    return this.externalComponent || this.rootTransition
  }

  render(
    h: typeof import('vue').h,
    attributes: Record<string, unknown>,
  ): VNode {
    const { tag, children, _isRootComponent } = this
    const option = !_isRootComponent ? children : { default: () => children }
    return h(tag as string, attributes, option as VNode[])
  }

  updated(): void {
    const { defaultNodes, realList } = this
    if (!realList) return

    defaultNodes.forEach((node, index) => {
      addContext(getHtmlElementFromNode(node), {
        element: realList[index],
        index,
      })
    })
  }

  getUnderlyingVm(domElement: HTMLElement): DraggableContext<T> | undefined {
    return getContext<T>(domElement)
  }

  getVmIndexFromDomIndex(domIndex: number, element: HTMLElement): number {
    const { defaultNodes } = this
    const { length } = defaultNodes
    const domChildren = element.children
    const domElement = domChildren.item(domIndex) as HTMLElement | null

    if (domElement === null) {
      return length
    }
    const context = getContext<T>(domElement)
    if (context) {
      return context.index
    }

    if (length === 0) {
      return 0
    }
    const firstNode = defaultNodes[0]
    const firstDomListElement = firstNode ? getHtmlElementFromNode(firstNode) : undefined
    const indexFirstDomListElement = firstDomListElement
      ? [...domChildren].findIndex(el => el === firstDomListElement)
      : -1

    // Better fallback: if we can't find the first element, count draggable elements
    if (indexFirstDomListElement === -1) {
      // Count data-draggable elements up to domIndex
      const draggableElements = [...domChildren].filter(
        el => el.hasAttribute && el.hasAttribute('data-draggable'),
      )
      const targetIndex = draggableElements.indexOf(domElement)
      return targetIndex >= 0
        ? targetIndex
        : domIndex < domChildren.length / 2
          ? 0
          : length
    }

    return domIndex < indexFirstDomListElement ? 0 : length
  }
}

export { ComponentStructure }
