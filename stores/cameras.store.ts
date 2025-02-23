import { defineStore } from 'pinia'
import type { TCamera } from '~/types/types'
import type ApiService from '@/services/api.service'

export const useCamerasStore = defineStore('cameras', () => {
    const cameras = ref<TCamera[]>([])
    const { $apiService } = useNuxtApp()
    const apiService = $apiService as ApiService

    const loadCameras = async () => {
        try {
            const response = await apiService.cameraList()
            cameras.value = response.cameras
        } catch (error) {
            console.error('Error loading cameras:', error)
            cameras.value = []
        }
    }

    return {
        cameras,
        loadCameras
    }
}) 