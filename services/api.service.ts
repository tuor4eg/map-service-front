'use strict'

import { v4 } from 'uuid'
import { Mutex, type MutexInterface } from 'async-mutex'
import type { Ref } from 'vue'

import { API_ENDPOINTS } from '~/constants/api.constant'
import type { TUser } from '~/types/types'
import { useUserStore } from '~/stores/user.store'

const ACCESS_TOKEN = 'accessToken'
const REFRESH_TOKEN ='refreshToken'
const DEVICE_UUID = 'deviceUUID'
const COOKIE_MAX_AGE = 60* 60 *24 *7 // 7 days

enum EMethods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}

type TFetchRequest = {
    method: EMethods
    headers: Record<string, string>
    body?: any
    credentials: RequestCredentials
}

class ApiService {
    private baseUrl: string
    private headers: Record<string, string>
    private noAuthEndpoints: string[]
    private mutex: MutexInterface
    private refreshing: boolean
    private userStore: ReturnType<typeof useUserStore>

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
        this.headers = {
            'Content-Type': 'application/json'
        }
        this.noAuthEndpoints = [API_ENDPOINTS.USER_LOGIN, API_ENDPOINTS.USER_LOGOUT]
        this.mutex = new Mutex()
        this.refreshing = false
        this.userStore = useUserStore()
    }

    getCookieOptions(): Record<string, any> {
        const config = useRuntimeConfig()
        return {
            sameSite: 'none' as const,
            secure: true,
            path: '/',
            httpOnly: false,
            domain: config.public.domain
        }
    }

    hasNoAuth(endpoint: string): boolean {
        return this.noAuthEndpoints.includes(endpoint)
    }

    isRefreshEndpoint(endpoint: string): boolean {
        return endpoint === API_ENDPOINTS.USER_REFRESH
    }

    enableRefreshMode(): void {
        this.refreshing = true
    }

    disableRefreshMode(): void {
        this.refreshing = false
    }

    isAuthError(error: any): boolean {
        return error.statusCode === 401
    }

    getHeaders(options: any): Record<string, string> {
        const headers = Object.assign({}, this.headers, options)

        const authToken = useCookie(ACCESS_TOKEN, this.getCookieOptions())
        const refreshToken = useCookie(REFRESH_TOKEN, this.getCookieOptions())

        const token = this.refreshing
            ? refreshToken.value
            : authToken.value

        headers['Authorization'] = `Bearer ${token}`

        return headers
    }

    generateDeviceUUID(): string {
        return v4()
    }

    ensureDeviceUUID(): void {
        const deviceUUID = useCookie(DEVICE_UUID, this.getCookieOptions())

        if (!deviceUUID.value) {
            const deviceUUIDValue = this.generateDeviceUUID()

            deviceUUID.value = deviceUUIDValue
        }
    }

    async fetch(endpoint: string, method: EMethods, body?: any, options = {}): Promise<any> {
        const request: TFetchRequest = {
            method,
            headers: this.getHeaders(options),
            credentials: 'include'
        }

        const url = `${this.baseUrl}${endpoint}`

        this.ensureDeviceUUID()

        if (body) request.body = JSON.stringify(body)

        if (this.refreshing) return await $fetch<any>(url, request)

        return this.mutex.runExclusive(async () => {
            try {
                return await $fetch<any>(url, request)
            } catch (err) {
                if (this.isAuthError(err) && !this.hasNoAuth(endpoint)) {
                    try {
                        this.enableRefreshMode()

                        await this.refresh()

                        this.disableRefreshMode()

                        request.headers = this.getHeaders(options)

                        return await $fetch<any>(url, request)
                    } catch (err) {
                        navigateTo('/login')
                    }
                } else {
                    throw err
                }
            }
        })
    }

    async get(endpoint: string, options?: any): Promise<any> {
        return await this.fetch(endpoint, EMethods.GET, options)
    }

    async post(endpoint: string, body: any, options?: any): Promise<any> {
        return await this.fetch(endpoint, EMethods.POST, body, options)
    }

    async login(data: any): Promise<any> {
        return await this.post(API_ENDPOINTS.USER_LOGIN, data)
    }

    async logout(): Promise<void> {
        await this.post(API_ENDPOINTS.USER_LOGOUT, {})

        const authToken = useCookie(ACCESS_TOKEN, this.getCookieOptions())
        const refreshToken = useCookie(REFRESH_TOKEN, this.getCookieOptions())

        authToken.value = null
        refreshToken.value = null
        this.userStore.clearUser()

        navigateTo('/login')
    }

    async refresh(): Promise<any> {
        return await this.post(API_ENDPOINTS.USER_REFRESH, {})
    }

    async userInfo(locale?: Ref<string>): Promise<TUser> {
        const res = await this.get(API_ENDPOINTS.USER_INFO)
        this.userStore.setUser(res.user)
        
        if (res.user.settings?.language && locale) {
            locale.value = res.user.settings.language
        }
        
        return res.user
    }

    async cameraList(): Promise<any> {
        return await this.get(API_ENDPOINTS.CAMERA_LIST)
    }

    async cameraInfo(id: string): Promise<any> {
        return await this.get(`${API_ENDPOINTS.CAMERA_INFO}${id}`)
    }

    async сamerasByUser(userId: string): Promise<any> {
        return await this.get(`${API_ENDPOINTS.CAMERA_LIST_BY_USER}${userId}`)
    }

    async updateUser(data: TUser): Promise<any> {
            return await this.post(API_ENDPOINTS.USER_UPDATE, data)
    }

    async getStarredCameras(userId: string): Promise<any> {
        return await this.get(`${API_ENDPOINTS.STARRED_CAMERAS}${userId }`)
    }
}

export default ApiService
