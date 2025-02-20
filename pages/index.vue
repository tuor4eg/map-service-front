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
const apiService = useNuxtApp().$apiService as ApiService
const { locale } = useI18n()

const mapRef = ref()

const handleCameraSelect = (camera: TCamera) => {
    if (camera.coordinates) {
        mapRef.value?.centerMap(camera.coordinates)
        mapRef.value?.showCamera(camera._id)
    }
}

onMounted(async () => {
    await apiService.userInfo(locale)
})
</script>

<style scoped></style>
