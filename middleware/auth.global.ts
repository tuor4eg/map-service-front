import { useCookie } from 'nuxt/app'

const cookieOptions = {
    sameSite: 'none' as const,
    secure: true,
    path: '/',
    httpOnly: false
}

export default defineNuxtRouteMiddleware(async (to, from) => {
    const accessToken = useCookie('accessToken', cookieOptions)
    const refreshToken = useCookie('refreshToken', cookieOptions)
    
    if ((!accessToken.value || !refreshToken.value) && to.path !== '/login') {
        return navigateTo('/login')
    }
})

