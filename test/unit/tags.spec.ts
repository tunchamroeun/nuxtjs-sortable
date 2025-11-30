import { describe, it, expect } from 'vitest'
import { isHtmlTag, isHtmlAttribute, isTransition } from '../../src/runtime/util/tags'

describe('tags utilities', () => {
  describe('isHtmlTag', () => {
    it('should return true for valid HTML tags', () => {
      expect(isHtmlTag('div')).toBe(true)
      expect(isHtmlTag('span')).toBe(true)
      expect(isHtmlTag('ul')).toBe(true)
      expect(isHtmlTag('li')).toBe(true)
      expect(isHtmlTag('table')).toBe(true)
      expect(isHtmlTag('tbody')).toBe(true)
      expect(isHtmlTag('tr')).toBe(true)
      expect(isHtmlTag('td')).toBe(true)
    })

    it('should return false for non-HTML tags', () => {
      expect(isHtmlTag('my-component')).toBe(false)
      expect(isHtmlTag('CustomComponent')).toBe(false)
      expect(isHtmlTag('fake-tag')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isHtmlTag('')).toBe(false)
    })
  })

  describe('isTransition', () => {
    it('should return true for transition-group', () => {
      expect(isTransition('transition-group')).toBe(true)
      expect(isTransition('TransitionGroup')).toBe(true)
    })

    it('should return false for other values', () => {
      expect(isTransition('transition')).toBe(false)
      expect(isTransition('div')).toBe(false)
      expect(isTransition('Transition')).toBe(false)
    })
  })

  describe('isHtmlAttribute', () => {
    it('should return true for standard HTML attributes', () => {
      expect(isHtmlAttribute('id')).toBe(true)
      expect(isHtmlAttribute('class')).toBe(true)
      expect(isHtmlAttribute('style')).toBe(true)
      expect(isHtmlAttribute('role')).toBe(true)
    })

    it('should return true for data attributes', () => {
      expect(isHtmlAttribute('data-id')).toBe(true)
      expect(isHtmlAttribute('data-test')).toBe(true)
      expect(isHtmlAttribute('data-custom-value')).toBe(true)
    })

    it('should return true for aria attributes', () => {
      expect(isHtmlAttribute('aria-label')).toBe(true)
      expect(isHtmlAttribute('aria-hidden')).toBe(true)
      expect(isHtmlAttribute('aria-describedby')).toBe(true)
    })

    it('should return true for event handlers', () => {
      expect(isHtmlAttribute('onClick')).toBe(true)
      expect(isHtmlAttribute('onMouseOver')).toBe(true)
      expect(isHtmlAttribute('onDragStart')).toBe(true)
    })

    it('should return false for sortable options', () => {
      expect(isHtmlAttribute('group')).toBe(false)
      expect(isHtmlAttribute('sort')).toBe(false)
      expect(isHtmlAttribute('delay')).toBe(false)
      expect(isHtmlAttribute('animation')).toBe(false)
      expect(isHtmlAttribute('handle')).toBe(false)
      expect(isHtmlAttribute('ghostClass')).toBe(false)
    })
  })
})
