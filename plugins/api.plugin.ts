import ApiService from "~/services/api.service"

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    const apiService = new ApiService(config.app.apiBaseURL as string)
      
    nuxtApp.provide('apiService', apiService)
  })
  