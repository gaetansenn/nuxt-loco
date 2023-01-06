import { defineNuxtConfig } from 'nuxt/config'
import Loco from '..'

export default defineNuxtConfig({
  modules: [
    Loco,
    '@nuxtjs/i18n'
  ],
  loco: {
    locale: 'en',
    token: process.env.LOCO_API_KEY as string
  },
  i18n: {
    // add `vueI18n` option to `@nuxtjs/i18n` module options
    vueI18n: {
      legacy: false,
      locale: 'en'
    }
  }
})
