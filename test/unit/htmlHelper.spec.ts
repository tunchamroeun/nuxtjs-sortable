/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { insertNodeAt, removeNode } from '../../src/runtime/util/htmlHelper'

describe('htmlHelper utilities', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  describe('removeNode', () => {
    it('should remove a node from its parent', () => {
      const child = document.createElement('span')
      container.appendChild(child)

      expect(container.children.length).toBe(1)
      removeNode(child)
      expect(container.children.length).toBe(0)
    })

    it('should do nothing if node has no parent', () => {
      const orphan = document.createElement('span')
      // Should not throw
      expect(() => removeNode(orphan)).not.toThrow()
    })
  })

  describe('insertNodeAt', () => {
    it('should insert node at the beginning', () => {
      const existing = document.createElement('span')
      existing.textContent = 'existing'
      container.appendChild(existing)

      const newNode = document.createElement('span')
      newNode.textContent = 'new'

      insertNodeAt(container, newNode, 0)

      expect(container.children.length).toBe(2)
      expect(container.children[0]!.textContent).toBe('new')
      expect(container.children[1]!.textContent).toBe('existing')
    })

    it('should insert node at the end', () => {
      const existing = document.createElement('span')
      existing.textContent = 'existing'
      container.appendChild(existing)

      const newNode = document.createElement('span')
      newNode.textContent = 'new'

      insertNodeAt(container, newNode, 1)

      expect(container.children.length).toBe(2)
      expect(container.children[0]!.textContent).toBe('existing')
      expect(container.children[1]!.textContent).toBe('new')
    })

    it('should insert node in the middle', () => {
      const first = document.createElement('span')
      first.textContent = 'first'
      container.appendChild(first)

      const third = document.createElement('span')
      third.textContent = 'third'
      container.appendChild(third)

      const second = document.createElement('span')
      second.textContent = 'second'

      insertNodeAt(container, second, 1)

      expect(container.children.length).toBe(3)
      expect(container.children[0]!.textContent).toBe('first')
      expect(container.children[1]!.textContent).toBe('second')
      expect(container.children[2]!.textContent).toBe('third')
    })

    it('should insert node into empty container', () => {
      const newNode = document.createElement('span')
      newNode.textContent = 'new'

      insertNodeAt(container, newNode, 0)

      expect(container.children.length).toBe(1)
      expect(container.children[0]!.textContent).toBe('new')
    })
  })
})
