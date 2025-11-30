import { camelize } from '../util/string'
import { events, isReadOnly, type DragEvent } from './sortableEvents'
import { isHtmlAttribute } from '../util/tags'
import type { Options as SortableOptions } from 'sortablejs'

export interface CallBackBuilder {
  manageAndEmit: (
    event: DragEvent,
  ) => (evtData: unknown, originalElement?: HTMLElement) => void
  emit: (event: DragEvent) => (evtData: unknown) => void
  manage: (
    event: DragEvent,
  ) => (evtData: unknown, originalElement?: HTMLElement) => unknown
}

export interface CreateSortableOptionParams {
  $attrs: Record<string, unknown>
  callBackBuilder: CallBackBuilder
}

export interface GetComponentAttributesParams {
  $attrs: Record<string, unknown>
  componentData?: Record<string, unknown>
}

function project<T>(entries: [string, T][]): Record<string, T> {
  return entries.reduce<Record<string, T>>((res, [key, value]) => {
    res[key] = value
    return res
  }, {})
}

function getComponentAttributes({
  $attrs,
  componentData = {},
}: GetComponentAttributesParams): Record<string, unknown> {
  const attributes = project(
    Object.entries($attrs).filter(([key]) => isHtmlAttribute(key)),
  )
  return {
    ...attributes,
    ...componentData,
  }
}

function createSortableOption({
  $attrs,
  callBackBuilder,
}: CreateSortableOptionParams): SortableOptions & { draggable: string } {
  const options = project(getValidSortableEntries($attrs)) as SortableOptions

  ;(
    Object.entries(callBackBuilder) as [
      keyof CallBackBuilder,
      CallBackBuilder[keyof CallBackBuilder],
    ][]
  ).forEach(([eventType, eventBuilder]) => {
    events[eventType].forEach((event) => {
      (options as Record<string, unknown>)[`on${event}`] = eventBuilder(
        event as DragEvent,
      )
    })
  })

  const draggable = `[data-draggable]${(options as Record<string, unknown>).draggable || ''}`
  return {
    ...options,
    draggable,
  }
}

function getValidSortableEntries(
  value: Record<string, unknown>,
): [string, unknown][] {
  return Object.entries(value)
    .filter(([key]) => !isHtmlAttribute(key))
    .map(([key, val]): [string, unknown] => [camelize(key), val])
    .filter(([key]) => !isReadOnly(key as string))
}

export {
  getComponentAttributes,
  createSortableOption,
  getValidSortableEntries,
}
