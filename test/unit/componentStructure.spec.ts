/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { ComponentStructure } from '../../src/runtime/core/componentStructure'
import type { VNode } from 'vue'

describe('ComponentStructure', () => {
  describe('constructor', () => {
    it('should initialize with nodes and root info', () => {
      const structure = new ComponentStructure({
        nodes: {
          header: [],
          default: [],
          footer: [],
        },
        root: {
          externalComponent: false,
          transition: false,
          tag: 'div',
        },
        realList: [],
      })

      expect(structure.tag).toBe('div')
      expect(structure.externalComponent).toBe(false)
      expect(structure.rootTransition).toBe(false)
      expect(structure.children).toEqual([])
      expect(structure.realList).toEqual([])
    })

    it('should combine header, default, and footer nodes', () => {
      const headerNode = { key: 'header' } as VNode
      const defaultNode = { key: 'default' } as VNode
      const footerNode = { key: 'footer' } as VNode

      const structure = new ComponentStructure({
        nodes: {
          header: [headerNode],
          default: [defaultNode],
          footer: [footerNode],
        },
        root: {
          externalComponent: false,
          transition: false,
          tag: 'div',
        },
        realList: null,
      })

      expect(structure.children).toHaveLength(3)
      expect(structure.children[0]).toBe(headerNode)
      expect(structure.children[1]).toBe(defaultNode)
      expect(structure.children[2]).toBe(footerNode)
    })
  })

  describe('_isRootComponent', () => {
    it('should return true for external components', () => {
      const structure = new ComponentStructure({
        nodes: { header: [], default: [], footer: [] },
        root: {
          externalComponent: true,
          transition: false,
          tag: 'MyComponent',
        },
        realList: null,
      })

      expect(structure._isRootComponent).toBe(true)
    })

    it('should return true for transitions', () => {
      const structure = new ComponentStructure({
        nodes: { header: [], default: [], footer: [] },
        root: {
          externalComponent: false,
          transition: true,
          tag: 'TransitionGroup',
        },
        realList: null,
      })

      expect(structure._isRootComponent).toBe(true)
    })

    it('should return false for regular HTML tags', () => {
      const structure = new ComponentStructure({
        nodes: { header: [], default: [], footer: [] },
        root: {
          externalComponent: false,
          transition: false,
          tag: 'div',
        },
        realList: null,
      })

      expect(structure._isRootComponent).toBe(false)
    })
  })

  describe('getVmIndexFromDomIndex', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = document.createElement('div')
      document.body.appendChild(container)
    })

    it('should return length when domElement is null', () => {
      const structure = new ComponentStructure({
        nodes: {
          header: [],
          default: [{ key: '1' } as VNode, { key: '2' } as VNode],
          footer: [],
        },
        root: {
          externalComponent: false,
          transition: false,
          tag: 'div',
        },
        realList: [{}, {}],
      })

      // Empty container, so item(10) returns null
      const result = structure.getVmIndexFromDomIndex(10, container)
      expect(result).toBe(2) // Returns length of defaultNodes
    })
  })
})
