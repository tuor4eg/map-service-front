// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },
    modules: ['vue-yandex-maps/nuxt', '@nuxtjs/i18n', '@pinia/nuxt'],
    yandexMaps: {
        apikey: process.env.YANDEX_API_KEY
    },
    i18n: {
        vueI18n: './i18n.config.ts'
    },
    css: [
        'vuetify/lib/styles/main.sass',
        '@mdi/font/css/materialdesignicons.css'
    ],
    build: {
        transpile: ['vuetify']
    },
    runtimeConfig: {
        app: {
            apiBaseURL: process.env.API_BASE_URL
        }
    },
    vite: {
        css: {
            preprocessorOptions: {
                sass: {
                    api: 'modern'
                }
            }
        }
    }
})
