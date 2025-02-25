import { useCookie, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const config = useRuntimeConfig()
    const cookieOptions = {
        sameSite: 'none' as const,
        secure: config.public.nodeEnv === 'production',
        path: '/',
        httpOnly: true
    }

    const accessToken = useCookie('accessToken', cookieOptions)
    const refreshToken = useCookie('refreshToken', cookieOptions)
    
    if ((!accessToken.value || !refreshToken.value) && to.path !== '/login') {
        return navigateTo('/login')
    }
})

