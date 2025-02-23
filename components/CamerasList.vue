<template>
    <div>
        <v-text-field
            v-model="searchQuery"
            :label="t('userMenu.camerasList.search')"
            prepend-inner-icon="mdi-magnify"
            class="pa-6 pb-0"
            hide-details
            variant="outlined"
            density="compact"
        />
        <v-list class="pa-6">
            <v-list-item
                v-for="camera in filteredCameras"
                :key="camera._id"
                :title="camera.title"
                :subtitle="camera.address || camera.description"
                :value="camera"
            >
                <template v-slot:append>
                    <div class="d-flex align-center">
                        <v-tooltip :text="t('userMenu.camerasList.openViewer')">
                            <template v-slot:activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    icon="mdi-cctv"
                                    size="small"
                                    color="grey"
                                    class="mr-3"
                                    variant="text"
                                    @click="selectCamera(camera)"
                                />
                            </template>
                        </v-tooltip>
                    </div>
                </template>
            </v-list-item>
        </v-list>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { TCamera } from '../types/types'
import { useCamerasStore } from '~/stores/cameras.store'

const { t } = useI18n()
const geocodingService = useNuxtApp().$geocodingService
const camerasStore = useCamerasStore()

interface CameraWithAddress extends TCamera {
    address?: string
}

const camerasWithAddresses = ref<CameraWithAddress[]>([])
const searchQuery = ref('')

onMounted(async () => {
    camerasWithAddresses.value = await Promise.all(
        camerasStore.cameras.map(async (camera) => {
            const address = await geocodingService.getAddressFromCoords(camera.coordinates)
            return { ...camera, address }
        })
    )
})

const filteredCameras = computed(() => {
    const query = searchQuery.value.toLowerCase()
    if (!query) return camerasWithAddresses.value
    
    return camerasWithAddresses.value.filter(camera => {
        const titleMatch = camera.title.toLowerCase().includes(query)
        const addressMatch = camera.address?.toLowerCase().includes(query) || false
        const descriptionMatch = camera.description?.toLowerCase().includes(query) || false
        return titleMatch || addressMatch || descriptionMatch
    })
})

const selectCamera = (camera: TCamera) => {
    emit('update:modelValue', camera)
    emit('close')
}

const emit = defineEmits(['update:modelValue', 'close'])
</script>

<style scoped>
</style> 