// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  vite: {
    optimizeDeps: {
      include: [
        'sortablejs',
      ],
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
