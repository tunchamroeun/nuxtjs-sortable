export type ManageAndEmitEvent = 'Start' | 'Add' | 'Remove' | 'Update' | 'End'
export type EmitEvent = 'Choose' | 'Unchoose' | 'Sort' | 'Filter' | 'Clone'
export type ManageEvent = 'Move'
export type DragEvent = ManageAndEmitEvent | EmitEvent | ManageEvent

const manageAndEmit: readonly ManageAndEmitEvent[] = [
  'Start',
  'Add',
  'Remove',
  'Update',
  'End',
]
const emit: readonly EmitEvent[] = [
  'Choose',
  'Unchoose',
  'Sort',
  'Filter',
  'Clone',
]
const manage: readonly ManageEvent[] = ['Move']

const eventHandlerNames: readonly string[] = [manage, manageAndEmit, emit]
  .flatMap(events => events)
  .map(evt => `on${evt}`)

export interface Events {
  manage: readonly ManageEvent[]
  manageAndEmit: readonly ManageAndEmitEvent[]
  emit: readonly EmitEvent[]
}

const events: Events = {
  manage,
  manageAndEmit,
  emit,
}

function isReadOnly(eventName: string): boolean {
  return eventHandlerNames.includes(eventName)
}

export { events, isReadOnly }
