import { defineNuxtPlugin } from '#app'
import GeocodingService from '~/services/geocoding.service'

export default defineNuxtPlugin((nuxtApp) => {
    const geocodingService = new GeocodingService()
    
    return {
        provide: {
            geocodingService
        }
    }
}) 