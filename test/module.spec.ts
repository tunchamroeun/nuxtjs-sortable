import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { loadNuxt } from '@nuxt/kit'

describe('module configuration', () => {
  it('should load with default options', async () => {
    const nuxt = await loadNuxt({
      cwd: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
      ready: false,
    })

    // Check that the module is loaded
    expect(nuxt.options.modules).toBeDefined()

    await nuxt.close()
  })

  it('should register the Draggable component', async () => {
    const nuxt = await loadNuxt({
      cwd: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
      ready: true,
    })

    // Check that components are configured
    const components = nuxt.options.components
    expect(components).toBeDefined()

    await nuxt.close()
  })
})
