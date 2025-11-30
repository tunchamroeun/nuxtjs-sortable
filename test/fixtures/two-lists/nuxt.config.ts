import type { ModuleOptions } from '../../../src/module'
import TypedDraggableModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    [TypedDraggableModule, { prefix: '' } satisfies ModuleOptions],
  ],
  compatibilityDate: '2024-11-01',
})
