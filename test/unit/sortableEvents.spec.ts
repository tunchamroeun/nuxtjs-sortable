import { describe, it, expect } from 'vitest'
import { events, isReadOnly } from '../../src/runtime/core/sortableEvents'

describe('sortableEvents', () => {
  describe('events object', () => {
    it('should have manageAndEmit events', () => {
      expect(events.manageAndEmit).toContain('Start')
      expect(events.manageAndEmit).toContain('Add')
      expect(events.manageAndEmit).toContain('Remove')
      expect(events.manageAndEmit).toContain('Update')
      expect(events.manageAndEmit).toContain('End')
    })

    it('should have emit events', () => {
      expect(events.emit).toContain('Choose')
      expect(events.emit).toContain('Unchoose')
      expect(events.emit).toContain('Sort')
      expect(events.emit).toContain('Filter')
      expect(events.emit).toContain('Clone')
    })

    it('should have manage events', () => {
      expect(events.manage).toContain('Move')
    })
  })

  describe('isReadOnly', () => {
    it('should return true for event handler names', () => {
      expect(isReadOnly('onStart')).toBe(true)
      expect(isReadOnly('onAdd')).toBe(true)
      expect(isReadOnly('onRemove')).toBe(true)
      expect(isReadOnly('onUpdate')).toBe(true)
      expect(isReadOnly('onEnd')).toBe(true)
      expect(isReadOnly('onMove')).toBe(true)
      expect(isReadOnly('onChoose')).toBe(true)
      expect(isReadOnly('onUnchoose')).toBe(true)
      expect(isReadOnly('onSort')).toBe(true)
      expect(isReadOnly('onFilter')).toBe(true)
      expect(isReadOnly('onClone')).toBe(true)
    })

    it('should return false for non-event names', () => {
      expect(isReadOnly('group')).toBe(false)
      expect(isReadOnly('sort')).toBe(false)
      expect(isReadOnly('delay')).toBe(false)
      expect(isReadOnly('animation')).toBe(false)
      expect(isReadOnly('handle')).toBe(false)
      expect(isReadOnly('ghostClass')).toBe(false)
      expect(isReadOnly('disabled')).toBe(false)
    })
  })
})
