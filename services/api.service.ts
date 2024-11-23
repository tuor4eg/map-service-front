'use strict'

import { v4 } from 'uuid'
import { Mutex, type MutexInterface } from 'async-mutex'

import { API_ENDPOINTS } from '~/constants/api.constant'

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

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
        this.headers = {
            'Content-Type': 'application/json'
        }
        this.noAuthEndpoints = [API_ENDPOINTS.LOGIN, API_ENDPOINTS.LOGOUT]
        this.mutex = new Mutex()
        this.refreshing = false
    }

    hasNoAuth(endpoint: string): boolean {
        return this.noAuthEndpoints.includes(endpoint)
    }

    isRefreshEndpoint(endpoint: string): boolean {
        return endpoint === API_ENDPOINTS.REFRESH
    }

    enableRefreshMode(){
        this.refreshing = true
    }

    disableRefreshMode(){
        this.refreshing = false
    }

    isAuthError(error: any): boolean {
        return error.statusCode === 401
    }

    getHeaders(options: any): Record<string, string> {
        const headers = Object.assign({}, this.headers, options)

        const authToken = useCookie(ACCESS_TOKEN, { sameSite: true })
        const refreshToken = useCookie(REFRESH_TOKEN, { sameSite: true })

        const token = this.refreshing
            ? refreshToken.value
            : authToken.value

        headers['Authorization'] = `Bearer ${token}`

        return headers
    }

    generateDeviceUUID(): string {
        return v4()
    }

    ensureDeviceUUID() {
        const deviceUUID = useCookie(DEVICE_UUID, { sameSite: true, maxAge: COOKIE_MAX_AGE })

        if (!deviceUUID.value) {
            const deviceUUIDValue = this.generateDeviceUUID()

            deviceUUID.value = deviceUUIDValue
        }
    }

    async fetch(endpoint: string, method: EMethods, body?: any, options = {}) {
        const request: TFetchRequest = {
            method,
            headers: this.getHeaders(options),
            credentials: 'include'
        }

        const url = `${this.baseUrl}${endpoint}`

        this.ensureDeviceUUID()

        if (body) request.body = body

        if (this.refreshing) return await $fetch(url, request)

        return this.mutex.runExclusive(async () => {
            try {
                return await $fetch(url, request)
            } catch (err) {
                if (this.isAuthError(err) && !this.hasNoAuth(endpoint)) {
                    try {
                        this.enableRefreshMode()

                        await this.refresh()

                        this.disableRefreshMode()

                        request.headers = this.getHeaders(options)

                        return await $fetch(url, request)
                    } catch (err) {
                        navigateTo('/login')
                    }
                } else {
                    throw err
                }
            }
        })
    }

    async get(endpoint: string, options?: any) {
        return await this.fetch(endpoint, EMethods.GET, options)
    }

    async post(endpoint: string, body: any, options?: any) {
        return await this.fetch(endpoint, EMethods.POST, body, options)
    }

    async login(data: any) {
        return await this.post(API_ENDPOINTS.LOGIN, data)
    }

    async logout(){
        const res = await this.post(API_ENDPOINTS.LOGOUT, {})

        const authToken = useCookie(ACCESS_TOKEN, { sameSite: true })
        const refreshToken = useCookie(REFRESH_TOKEN, { sameSite: true })

        authToken.value = null
        refreshToken.value = null

        navigateTo('/login')
    }

    async refresh() {
        return await this.post(API_ENDPOINTS.REFRESH, {})
    }

    async userInfo() {
        return await this.get(API_ENDPOINTS.INFO)
    }

    async cameraList() {
        return await this.get(API_ENDPOINTS.CAMERA_LIST)
    }
}

export default ApiService
