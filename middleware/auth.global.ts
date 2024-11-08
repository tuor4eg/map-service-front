import { useRouter } from '#app'
import { useCookie } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie('authToken') // Предположим, что JWT хранится в cookie
    
    if (!token.value && to.path !== '/login') {
        return navigateTo('/login')
    }
})
