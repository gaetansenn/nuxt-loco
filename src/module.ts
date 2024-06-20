import { writeFile, mkdir } from 'fs/promises'
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import { ofetch } from 'ofetch'
import consola from 'consola'

const logger = consola.withScope('nuxt:loco')

export interface ModuleOptions {
  locale: string,
  token: string,
  filter?: string[],
  fallback?: string,
  path?: string,
  disabled?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-loco',
    configKey: 'loco'
  },
  async setup (options, nuxt) {
    if (options.disabled) { return }

    const parameters: any = {}
    const { resolve } = createResolver(nuxt.options.srcDir)

    if (options.fallback) {
      parameters.fallback = options.fallback
    }
    if (options.filter) {
      parameters.filter = options.filter
    }

    if (!options.path) {
      options.path = resolve('i18n')
    }

    let path = 'https://localise.biz/api/export/all.json'

    if (Object.keys(parameters).length) {
      path = `${path}?${(new URLSearchParams(parameters)).toString()}`
    }

    try {
      let response = await ofetch(path, {
        headers: {
          Authorization: `Loco ${options.token}`
        },
        parseResponse: JSON.parse
      })

      if (options.locale) {
        response = {
          [`${options.locale}`]: response
        }
      }

      // Create folder if not exist
      try {
        await mkdir(options.path as string, { recursive: true })

        await Promise.all(Object.keys(response).map(async (locale) => {
          logger.info(`sync ${locale} locale`)

          await writeFile(`${options.path}/${locale}.json`, JSON.stringify(response[locale]))
        }))
      } catch (err) {
        logger.error('Unable to create folder', err)
      }
    } catch (err) {
      logger.error('Unable to fetch translation: ', err)
    }
  }
})
