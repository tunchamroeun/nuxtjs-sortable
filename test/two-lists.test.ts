import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('typed-draggable module - two lists', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/two-lists', import.meta.url)),
  })

  it('renders the page title', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Two Lists Test')
  })

  it('should render list container structure', async () => {
    const html = await $fetch('/')
    expect(html).toContain('lists-container')
  })

  it('should render without HTTP errors', async () => {
    const html = await $fetch('/')
    expect(html).not.toContain('500 Internal Server Error')
  })
})
