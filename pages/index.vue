<template>
    <div>
        <YaMap ref="mapRef" />
        <UserMenu @select-camera="handleCameraSelect" />
        <LoadingScreen />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TCamera } from '../types/types'
import YaMap from '~/components/YaMap.vue'
import UserMenu from '~/components/UserMenu.vue'
import LoadingScreen from '~/components/LoadingScreen.vue'
import type ApiService from '@/services/api.service'
import { useCamerasStore } from '~/stores/cameras.store'

const apiService = useNuxtApp().$apiService as ApiService
const { locale } = useI18n()
const userStore = useUserStore()
const camerasStore = useCamerasStore()

const mapRef = ref()

const handleCameraSelect = (camera: TCamera) => {
    if (camera.coordinates) {
        const [longitude, latitude] = camera.coordinates
        mapRef.value?.centerMap([latitude, longitude])
        mapRef.value?.showCamera(camera._id)
    }
}

onMounted(async () => {
    await apiService.userInfo(locale)
    await camerasStore.loadCameras()
})
</script>

<style scoped></style>
