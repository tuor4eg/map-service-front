'use strict'

import { API_ENDPOINTS } from '~/constants/api.constant'

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
    private fetchData: any
    private headers: Record<string, string>
    private refreshing: boolean
    private noRefreshEndpoints: string[]

    constructor(baseUrl: string, fetchData: any) {
        this.baseUrl = baseUrl
        this.fetchData = fetchData
        this.headers = {
            'Content-Type': 'application/json'
        }
        this.refreshing = false
        this.noRefreshEndpoints = [API_ENDPOINTS.LOGIN, API_ENDPOINTS.LOGOUT]
    }


    enableRefreshMode(): void {
        this.refreshing = true
    }

    disableRefreshMode(): void {
        this.refreshing = false
    }

    getHeaders(options: any): Record<string, string> {
        const headers = Object.assign({}, this.headers, options)

        return headers
    }

    async fetch(endpoint: string, method: EMethods, body?: any, options = {}) {
        const request: TFetchRequest = {
            method,
            headers: this.getHeaders(options),
            credentials: 'include'
        }

        if (body) request.body = body

        try {
            return await this.fetchData(`${this.baseUrl}${endpoint}`, request, this.refreshing)
        } catch (err) {
            if (!this.noRefreshEndpoints.includes(endpoint) && !this.refreshing) {
                this.enableRefreshMode()

                console.log('token failed trying to refresh')

                await this.refresh()

                this.disableRefreshMode()

                return await this.fetchData(`${this.baseUrl}${endpoint}`, request, this.refreshing)
            } else {
                throw err
            }
        }
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

    async refresh() {
        return await this.post(API_ENDPOINTS.REFRESH, {})
    }

    async cameraList() {
        return await this.get(API_ENDPOINTS.CAMERA_LIST)
    }
}

export default ApiService
