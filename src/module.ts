import { writeFile, mkdir } from 'fs/promises'
import https from 'https'
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import consola from 'consola'

const logger = consola.withScope('nuxt:loco')

interface ModuleOptions {
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
  setup (options, nuxt) {
    const parameters: any = {}
    const { resolve } = createResolver(nuxt.options.srcDir)

    if (options.fallback) {
      parameters.fallback = options.fallback
    }
    if (options.filter) {
      parameters.filter = options.filter
    }

    if (!options.path) {
      options.path = resolve('public/i18n')
    }

    let path = 'https://localise.biz/api/export/all.json'

    if (Object.keys(parameters).length) {
      path = `${path}?${(new URLSearchParams(parameters)).toString()}`
    }

    nuxt.hook('build:before', async () => {
      let [error, response]: any = await new Promise((resolve) => {
        https.get({
          protocol: 'https:',
          hostname: 'localise.biz',
          path,
          method: 'GET',
          headers: {
            Authorization: `Loco ${options.token}`
          }
        }, (res) => {
          if (res.statusCode !== 200) return resolve([`http status code is ${res.statusCode}`])

          let data = ''

          res.on('data', (chunk) => {
            data += chunk
          })

          res.on('end', () => {
            resolve([false, JSON.parse(data)])
          })
        }).on('error', (error) => {
          resolve([error])
        })
      })

      if (error) {
        logger.error('Unable to fetch translation', error)
      } else {
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
      }
    })
  }
})

declare module '@nuxt/schema' {
  interface NuxtConfig {
    loco?: ModuleOptions
  }
  interface NuxtOptions {
    loco?: ModuleOptions
  }
}
