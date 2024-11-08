// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },
    modules: ['vue-yandex-maps/nuxt', '@nuxtjs/i18n'],
    yandexMaps: {
        apikey: '8da47fb9-b361-4e81-ae29-afeb3f928f1a'
    },
    i18n: {
        vueI18n: "./i18n.config.ts",
    },
    css: [
        'vuetify/lib/styles/main.sass',
        '@mdi/font/css/materialdesignicons.css'
    ],
    build: {
        transpile: ['vuetify']
    }
})
