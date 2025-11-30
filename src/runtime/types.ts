import type { MoveEvent } from 'sortablejs'

// Re-export types from the component
export interface DraggableContext<T = unknown> {
  element: T
  index: number
}

export interface AddedEvent<T = unknown> {
  added: {
    element: T
    newIndex: number
  }
}

export interface RemovedEvent<T = unknown> {
  removed: {
    element: T
    oldIndex: number
  }
}

export interface MovedEvent<T = unknown> {
  moved: {
    element: T
    oldIndex: number
    newIndex: number
  }
}

export type ChangeEvent<T = unknown>
  = | AddedEvent<T>
    | RemovedEvent<T>
    | MovedEvent<T>

export interface DraggedContext<T = unknown> {
  index: number
  element: T
  futureIndex: number
}

export interface RelatedContext<T = unknown> {
  index?: number
  element?: T
  list?: T[]
  component?: unknown
}

export interface MoveEventContext<T = unknown> extends MoveEvent {
  relatedContext: RelatedContext<T>
  draggedContext: DraggedContext<T>
}

// Module options
export interface ModuleOptions {
  /**
   * Prefix for the draggable component
   * @default ''
   */
  prefix?: string
}

declare module '#app' {
  interface NuxtApp {
    $draggable: typeof import('./components/Draggable.vue').default
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $draggable: typeof import('./components/Draggable.vue').default
  }
}
