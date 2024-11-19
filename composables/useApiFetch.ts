// composables/useApiFetch.ts
import { v4 } from 'uuid'

export async function useApiFetch(url: string, options: any = {}, refresh = false) {
    try {
        ensureDeviceUUID()

        const authToken = useCookie('accessToken', { sameSite: true })
        const refreshToken = useCookie('refreshToken', { sameSite: true })

        const token = refresh ? refreshToken.value : authToken.value

        options.headers['Authorization'] = `Bearer ${token}`

        const response = await $fetch(url, {
            ...options,
            onRequest({ options }: { options: any }) {
                console.log('Request made:', options)
            },
            onResponse({ response }: { response: any }) {
                console.log('Response received:', response)

                if (response.status === 401 && refresh) {
                    console.warn('Refresh token is expired, redirecting to login...')
                    navigateTo('/login')
                }
            },
            onResponseError({ response }: { response: any }) {
                console.error('Fetch error:', response)

                if (response.status === 500) {
                    console.warn('Server error occurred')
                }
            }
        })
        return response
    } catch (error) {
        //console.error('Error during fetch:', error)
        throw error
    }
}

function generateDeviceUUID(): string {
    return v4()
}

function ensureDeviceUUID() {
    const deviceUUID = useCookie('deviceUUID', { sameSite: true })

    if (!deviceUUID.value) {
        const deviceUUIDValue = generateDeviceUUID()

        deviceUUID.value = deviceUUIDValue
    }
}
