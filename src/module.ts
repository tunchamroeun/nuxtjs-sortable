import { defineNuxtModule, addPlugin, createResolver, addComponent } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Prefix for the draggable component
   * @default ''
   */
  prefix?: string
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    draggable?: ModuleOptions
  }
  interface NuxtOptions {
    draggable: ModuleOptions
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@typed-draggable/nuxt',
    configKey: 'draggable',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    prefix: '',
  },
  setup(options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Add the Draggable component (Vue SFC with script setup and generics)
    addComponent({
      name: `${options.prefix}Draggable`,
      filePath: resolver.resolve('./runtime/components/Draggable.vue'),
      mode: 'client',
    })

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin({
      src: resolver.resolve('./runtime/plugin'),
      mode: 'client',
    })
  },
})
