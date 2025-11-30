/**
 * @vitest-environment jsdom
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Test file with dynamic slot typing
import { describe, it, expect } from 'vitest'
import { h, defineComponent, TransitionGroup } from 'vue'
import { computeComponentStructure } from '../../src/runtime/core/renderHelper'

describe('renderHelper', () => {
  describe('computeComponentStructure', () => {
    const createMockSlots = (_items: { id: number, name: string }[]) => ({
      item: ({ element }: { element: { id: number, name: string } }) => [
        h('div', { class: 'item' }, element.name),
      ],
    })

    describe('tag resolution', () => {
      it('should resolve HTML tag strings', () => {
        const items = [{ id: 1, name: 'Item 1' }]
        const structure = computeComponentStructure({
          $slots: createMockSlots(items),
          tag: 'ul',
          realList: items,
          getKey: (el: { id: number }) => el.id,
        })

        expect(structure.tag).toBe('ul')
        expect(structure.externalComponent).toBe(false)
        expect(structure.rootTransition).toBe(false)
      })

      it('should resolve div as default HTML tag', () => {
        const items = [{ id: 1, name: 'Item 1' }]
        const structure = computeComponentStructure({
          $slots: createMockSlots(items),
          tag: 'div',
          realList: items,
          getKey: (el: { id: number }) => el.id,
        })

        expect(structure.tag).toBe('div')
        expect(structure.externalComponent).toBe(false)
      })

      it('should resolve transition-group tag', () => {
        const items = [{ id: 1, name: 'Item 1' }]
        const structure = computeComponentStructure({
          $slots: createMockSlots(items),
          tag: 'transition-group',
          realList: items,
          getKey: (el: { id: number }) => el.id,
        })

        expect(structure.tag).toBe(TransitionGroup)
        expect(structure.rootTransition).toBe(true)
        expect(structure.externalComponent).toBe(false)
      })

      it('should resolve TransitionGroup tag', () => {
        const items = [{ id: 1, name: 'Item 1' }]
        const structure = computeComponentStructure({
          $slots: createMockSlots(items),
          tag: 'TransitionGroup',
          realList: items,
          getKey: (el: { id: number }) => el.id,
        })

        expect(structure.tag).toBe(TransitionGroup)
        expect(structure.rootTransition).toBe(true)
      })

      it('should resolve external component object directly', () => {
        const CustomComponent = defineComponent({
          name: 'CustomComponent',
          setup(_, { slots }) {
            return () => h('div', { class: 'custom' }, slots.default?.())
          },
        })

        const items = [{ id: 1, name: 'Item 1' }]
        const structure = computeComponentStructure({
          $slots: createMockSlots(items),
          tag: CustomComponent,
          realList: items,
          getKey: (el: { id: number }) => el.id,
        })

        expect(structure.tag).toBe(CustomComponent)
        expect(structure.externalComponent).toBe(true)
        expect(structure.rootTransition).toBe(false)
      })

      it('should resolve plain object component', () => {
        const PlainComponent = {
          name: 'PlainComponent',
          setup(_: unknown, { slots }: { slots: { default?: () => unknown } }) {
            return () => h('section', { class: 'plain' }, slots.default?.())
          },
        }

        const items = [{ id: 1, name: 'Item 1' }]
        const structure = computeComponentStructure({
          $slots: createMockSlots(items),
          tag: PlainComponent,
          realList: items,
          getKey: (el: { id: number }) => el.id,
        })

        expect(structure.tag).toBe(PlainComponent)
        expect(structure.externalComponent).toBe(true)
      })

      it('should resolve functional component', () => {
        const FunctionalComponent = (_props: unknown, { slots }: { slots: { default?: () => unknown } }) => {
          return h('article', { class: 'functional' }, slots.default?.())
        }

        const items = [{ id: 1, name: 'Item 1' }]
        const structure = computeComponentStructure({
          $slots: createMockSlots(items),
          tag: FunctionalComponent,
          realList: items,
          getKey: (el: { id: number }) => el.id,
        })

        expect(structure.tag).toBe(FunctionalComponent)
        expect(structure.externalComponent).toBe(true)
      })

      it('should handle component with props like el-collapse', () => {
        // Simulate Element Plus style component
        const ElCollapse = defineComponent({
          name: 'ElCollapse',
          props: {
            modelValue: { type: Array, default: () => [] },
            accordion: { type: Boolean, default: false },
          },
          emits: ['update:modelValue', 'change'],
          setup(props, { slots }) {
            return () => h('div', {
              class: 'el-collapse',
              role: 'tablist',
            }, slots.default?.())
          },
        })

        const items = [
          { name: '1', title: 'Section 1' },
          { name: '2', title: 'Section 2' },
        ]
        const structure = computeComponentStructure({
          $slots: {
            item: ({ element }: { element: { name: string, title: string } }) => [
              h('div', { class: 'el-collapse-item' }, element.title),
            ],
          },
          tag: ElCollapse,
          realList: items,
          getKey: (el: { name: string }) => el.name,
        })

        expect(structure.tag).toBe(ElCollapse)
        expect(structure.externalComponent).toBe(true)
        expect(structure.rootTransition).toBe(false)
      })
    })

    describe('_isRootComponent', () => {
      it('should return true for external components', () => {
        const CustomComponent = {
          setup(_: unknown, { slots }: { slots: { default?: () => unknown } }) {
            return () => h('div', slots.default?.())
          },
        }

        const items = [{ id: 1, name: 'Item 1' }]
        const structure = computeComponentStructure({
          $slots: createMockSlots(items),
          tag: CustomComponent,
          realList: items,
          getKey: (el: { id: number }) => el.id,
        })

        expect(structure._isRootComponent).toBe(true)
      })

      it('should return true for transition-group', () => {
        const items = [{ id: 1, name: 'Item 1' }]
        const structure = computeComponentStructure({
          $slots: createMockSlots(items),
          tag: 'transition-group',
          realList: items,
          getKey: (el: { id: number }) => el.id,
        })

        expect(structure._isRootComponent).toBe(true)
      })

      it('should return false for HTML tags', () => {
        const items = [{ id: 1, name: 'Item 1' }]
        const structure = computeComponentStructure({
          $slots: createMockSlots(items),
          tag: 'div',
          realList: items,
          getKey: (el: { id: number }) => el.id,
        })

        expect(structure._isRootComponent).toBe(false)
      })
    })
  })
})
