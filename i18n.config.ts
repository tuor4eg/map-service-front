import en from './locales/en.json'
import ru from './locales/ru.json'

export default defineI18nConfig(() => ({
    legacy: false,
    langDir: './locales',
    locale: 'ru',
    fallbackLocale: 'en',
    messages: { en, ru },
    detectBrowserLanguage: {
        useCookie: true,
        cookieKey: 'i18n_redirected',
        alwaysRedirect: true,
        fallbackLocale: 'en'
    }
}))
