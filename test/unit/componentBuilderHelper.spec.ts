import { describe, it, expect } from 'vitest'
import {
  getComponentAttributes,
  getValidSortableEntries,
} from '../../src/runtime/core/componentBuilderHelper'

describe('componentBuilderHelper', () => {
  describe('getComponentAttributes', () => {
    it('should filter HTML attributes from $attrs', () => {
      const result = getComponentAttributes({
        $attrs: {
          id: 'my-id',
          class: 'my-class',
          style: 'color: red',
          role: 'list',
          group: 'shared', // sortable option - should be excluded
          animation: 150, // sortable option - should be excluded
        },
      })

      expect(result).toHaveProperty('id', 'my-id')
      expect(result).toHaveProperty('class', 'my-class')
      expect(result).toHaveProperty('style', 'color: red')
      expect(result).toHaveProperty('role', 'list')
      expect(result).not.toHaveProperty('group')
      expect(result).not.toHaveProperty('animation')
    })

    it('should include data-* attributes', () => {
      const result = getComponentAttributes({
        $attrs: {
          'data-testid': 'draggable-list',
          'data-custom': 'value',
          'group': 'shared',
        },
      })

      expect(result).toHaveProperty('data-testid', 'draggable-list')
      expect(result).toHaveProperty('data-custom', 'value')
      expect(result).not.toHaveProperty('group')
    })

    it('should include aria-* attributes', () => {
      const result = getComponentAttributes({
        $attrs: {
          'aria-label': 'Draggable list',
          'aria-describedby': 'help-text',
          'disabled': true,
        },
      })

      expect(result).toHaveProperty('aria-label', 'Draggable list')
      expect(result).toHaveProperty('aria-describedby', 'help-text')
      expect(result).not.toHaveProperty('disabled')
    })

    it('should merge with componentData', () => {
      const result = getComponentAttributes({
        $attrs: {
          id: 'my-id',
          class: 'from-attrs',
        },
        componentData: {
          class: 'from-component-data',
          customProp: 'value',
        },
      })

      expect(result).toHaveProperty('id', 'my-id')
      expect(result).toHaveProperty('class', 'from-component-data') // componentData overrides
      expect(result).toHaveProperty('customProp', 'value')
    })

    it('should handle empty $attrs', () => {
      const result = getComponentAttributes({
        $attrs: {},
      })

      expect(result).toEqual({})
    })
  })

  describe('getValidSortableEntries', () => {
    it('should filter out HTML attributes', () => {
      const result = getValidSortableEntries({
        id: 'my-id',
        class: 'my-class',
        group: 'shared',
        animation: 150,
      })

      const keys = result.map(([key]) => key)
      expect(keys).not.toContain('id')
      expect(keys).not.toContain('class')
      expect(keys).toContain('group')
      expect(keys).toContain('animation')
    })

    it('should filter out event handlers', () => {
      const result = getValidSortableEntries({
        onStart: () => {},
        onEnd: () => {},
        group: 'shared',
        sort: true,
      })

      const keys = result.map(([key]) => key)
      expect(keys).not.toContain('onStart')
      expect(keys).not.toContain('onEnd')
      expect(keys).toContain('group')
      expect(keys).toContain('sort')
    })

    it('should camelize kebab-case keys', () => {
      const result = getValidSortableEntries({
        'ghost-class': 'ghost',
        'chosen-class': 'chosen',
        'drag-class': 'drag',
      })

      const keys = result.map(([key]) => key)
      expect(keys).toContain('ghostClass')
      expect(keys).toContain('chosenClass')
      expect(keys).toContain('dragClass')
    })

    it('should preserve values', () => {
      const result = getValidSortableEntries({
        group: 'shared',
        animation: 150,
        disabled: false,
      })

      const obj = Object.fromEntries(result)
      expect(obj).toHaveProperty('group', 'shared')
      expect(obj).toHaveProperty('animation', 150)
      expect(obj).toHaveProperty('disabled', false)
    })
  })
})
