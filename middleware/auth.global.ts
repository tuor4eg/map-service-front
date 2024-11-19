import { useCookie } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie('accessToken', { sameSite: true })
    
    if (!token.value && to.path !== '/login') {
        return navigateTo('/login')
    }
})

