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
        
        <!-- Индикатор загрузки -->
        <div v-if="isLoading" class="d-flex justify-center align-center pa-6">
            <v-progress-circular
                indeterminate
                color="primary"
                :size="50"
            ></v-progress-circular>
            <span class="ml-3">Загрузка камер...</span>
        </div>
        
        <v-list v-else class="pa-6">
            <v-list-item
                v-for="camera in paginatedCameras"
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
            
            <!-- Пагинация -->
            <div class="d-flex justify-center mt-4">
                <v-pagination
                    v-model="currentPage"
                    :length="totalPages"
                    :total-visible="7"
                    rounded
                ></v-pagination>
            </div>
        </v-list>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import type { TCamera } from '../types/types'
import { useCamerasStore } from '~/stores/cameras.store'
import type ApiService from '@/services/api.service'

const { t } = useI18n()
const geocodingService = useNuxtApp().$geocodingService
const apiService = useNuxtApp().$apiService as ApiService
const camerasStore = useCamerasStore()

const searchQuery = ref('')
const isLoading = ref(true)
const currentPage = ref(1)
const itemsPerPage = 50
const isLoadingAddresses = ref(false)

onMounted(async () => {
    try {
        isLoading.value = true
        // Камеры уже загружены в store, просто дожидаемся завершения загрузки
        await camerasStore.loadCameras()
    } catch (error) {
        console.error('Error loading cameras:', error)
    } finally {
        isLoading.value = false
        // Загружаем адреса для первой страницы
        loadAddressesForCurrentPage()
    }
})

// Загрузка адресов только для текущей страницы
const loadAddressesForCurrentPage = async () => {
    if (isLoadingAddresses.value) return
    
    try {
        isLoadingAddresses.value = true
        const currentPageCameras = paginatedCameras.value
        
        // Загружаем адреса только для камер на текущей странице, у которых еще нет адреса
        await Promise.all(
            currentPageCameras
                .filter(camera => !camera.address)
                .map(async (camera) => {
                    console.log('GEO!!!', camera)
                    // Запрашиваем адрес через geocodingService
                    const address = await geocodingService.getAddressFromCoords(camera.coordinates)
                    
                    if (address) {
                        try {
                            // Обновляем камеру с новым адресом
                            const updatedCamera = { ...camera, address }
                            await apiService.updateCamera(updatedCamera)
                            
                            // Обновляем адрес в store
                            const cameraIndex = camerasStore.cameras.findIndex(c => c._id === camera._id)
                            if (cameraIndex !== -1) {
                                camerasStore.cameras[cameraIndex] = updatedCamera
                            }
                        } catch (error) {
                            console.error(`Error updating camera ${camera.title}:`, error)
                        }
                    }
                })
        )
    } catch (error) {
        console.error('Error loading addresses:', error)
    } finally {
        isLoadingAddresses.value = false
    }
}

// Сброс страницы при изменении поискового запроса
watch(searchQuery, () => {
    currentPage.value = 1
})

// Загружаем адреса при изменении страницы
watch(currentPage, () => {
    loadAddressesForCurrentPage()
})

const filteredCameras = computed(() => {
    const query = searchQuery.value.toLowerCase()
    if (!query) return camerasStore.cameras
    
    return camerasStore.cameras.filter(camera => {
        const titleMatch = camera.title.toLowerCase().includes(query)
        const addressMatch = camera.address?.toLowerCase().includes(query) || false
        const descriptionMatch = camera.description?.toLowerCase().includes(query) || false
        return titleMatch || addressMatch || descriptionMatch
    })
})

const totalPages = computed(() => {
    return Math.ceil(filteredCameras.value.length / itemsPerPage)
})

const paginatedCameras = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredCameras.value.slice(startIndex, endIndex)
})

const selectCamera = (camera: TCamera) => {
    emit('update:modelValue', camera)
    emit('close')
}

const emit = defineEmits(['update:modelValue', 'close'])
</script>

<style scoped>
</style> 