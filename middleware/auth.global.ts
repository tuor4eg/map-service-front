import { useCookie, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const config = useRuntimeConfig()

    const cookieOptions: Record<string, any> = {
        sameSite: 'none' as const,
        secure: true,
        path: '/',
        httpOnly: false,
        domain: config.public.domain
    }

    const accessToken = useCookie('accessToken', cookieOptions)
    const refreshToken = useCookie('refreshToken', cookieOptions)
    
    if ((!accessToken.value || !refreshToken.value) && to.path !== '/login') {
        return navigateTo('/login')
    }
})

