import { defineNuxtPlugin } from '#app'
import Draggable from './components/Draggable.vue'

export default defineNuxtPlugin((_nuxtApp) => {
  // The component is already registered via addComponent in module.ts
  // This plugin ensures sortablejs is properly initialized on the client side
  return {
    provide: {
      draggable: Draggable,
    },
  }
})
