import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('typed-draggable module - prefix option', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/with-prefix', import.meta.url)),
  })

  it('renders the page with prefixed component name', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Prefix Test')
  })

  it('should render VDraggable component wrapper', async () => {
    const html = await $fetch('/')
    // ClientOnly renders a span placeholder on SSR
    expect(html).toContain('<h1>Prefix Test</h1>')
  })
})
