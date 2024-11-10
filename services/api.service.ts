'use strict'

import { API_ENDPOINTS } from "~/constants/api.constant"

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
    private $fetch: typeof $fetch
    private headers: Record<string, string>
    private token?: string | null

    constructor(baseUrl: string, $fetch: any) {
        this.token = null
        this.baseUrl = baseUrl
        this.$fetch = $fetch
        this.headers = {
            'Content-Type': 'application/json'
        }
    }

    setToken(token: string) {
        this.token = token
    }

    getHeaders(options: any): Record<string, string> {
        const headers = Object.assign({}, this.headers, options)

        if (this.token) headers['Authorization'] = `Bearer ${this.token}`

        return headers
    }

    async fetch(endpoint: string, method: EMethods, body?: any, options = {}) {
        const request: TFetchRequest = {
            method,
            headers: this.getHeaders(options),
            credentials: 'include'
        }

        if (body) request.body = body

        return this.$fetch(`${this.baseUrl}${endpoint}`, request)
    }

    async get(endpoint: string, options?: any) {
        return await this.fetch(endpoint, EMethods.GET, options)
    }

    async post(endpoint: string, body: any, options?: any) {
        return await this.fetch(endpoint, EMethods.POST, body, options)
    }

    async login(data: any){
        return await this.post(API_ENDPOINTS.LOGIN, data)
    }

    async cameraList(){
        return await this.get(API_ENDPOINTS.CAMERA_LIST)
    }
}

export default ApiService
