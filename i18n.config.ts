import en from './locales/en.json'
import ru from './locales/ru.json'

export default defineI18nConfig(() => ({
    legacy: false,
    langDir: './locales',
    defaultLocale: 'en',
    messages: { en, ru },
    locales: [
        {
            code: 'en',
            iso: 'en-US'
        },
        {
            code: 'ru',
            iso: 'ru-RU'
        }
    ],
    detectBrowserLanguage: {
        useCookie: true,
        cookieKey: 'i18n_redirected',
        alwaysRedirect: false,
        fallbackLocale: 'en'
    }
}))
