import { useCookie } from 'nuxt/app'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const accessToken = useCookie('accessToken', { sameSite: true })
    const refreshToken = useCookie('refreshToken', { sameSite: true })
    
    if ((!accessToken.value || !refreshToken.value) && to.path !== '/login') {
        return navigateTo('/login')
    }
})

