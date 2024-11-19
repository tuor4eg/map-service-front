import ApiService from "~/services/api.service"
import { useApiFetch } from "~/composables/useApiFetch"

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    const apiService = new ApiService(config.app.apiBaseURL as string, useApiFetch)
      
    nuxtApp.provide('apiService', apiService)
  })
  