// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },
    modules: ['vue-yandex-maps/nuxt', '@nuxtjs/i18n', '@pinia/nuxt'],
    yandexMaps: {
        apikey: ''
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
        public: {
            apiBaseURL: process.env.NUXT_PUBLIC_API_BASE_URL,
            nodeEnv: process.env.NUXT_PUBLIC_NODE_ENV,
            yandexMaps: {
                apikey: ''
            }
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
