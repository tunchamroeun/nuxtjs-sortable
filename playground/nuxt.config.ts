import type { ModuleOptions } from '../src/module'

export default defineNuxtConfig({
  modules: [
    ['../src/module', { prefix: '' } satisfies ModuleOptions],
  ],
  devtools: { enabled: true },
  compatibilityDate: '2024-11-01',
})
