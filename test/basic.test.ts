import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('typed-draggable module - basic', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders the page with draggable component', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Draggable Test')
  })

  it('should render page title in SSR', async () => {
    const html = await $fetch('/')
    expect(html).toContain('<h1>Draggable Test</h1>')
  })

  it('should not have HTTP 500 errors', async () => {
    const html = await $fetch('/')
    expect(html).not.toContain('500 Internal Server Error')
  })
})
