import { defineNuxtConfig } from 'nuxt/config'
import Module from '..'

export default defineNuxtConfig({
  modules: [
    Module,
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
    },
    locales: ['en'].map(locale => ({
      code: locale,
      iso: locale,
      file: `${locale}.json`
    })),
    langDir: 'i18n',
    defaultLocale: 'en',
    lazy: true
  }
})
