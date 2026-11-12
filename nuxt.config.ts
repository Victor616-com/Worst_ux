// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@unocss/nuxt'],
  css: ['@unocss/reset/tailwind.css', '~/assets/css/main.css'],
  app: {
    head: {
      title: 'Worst UX',
      htmlAttrs: { lang: 'en' },
    },
  },
  build: {
    transpile: ['gsap'],
  },
})
