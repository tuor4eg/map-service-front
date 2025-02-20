<template>
    <v-card width="350">
        <template v-if="isLoading">
            <v-card-title class="d-flex align-center">
                <v-skeleton-loader type="avatar" size="24" class="mr-2"></v-skeleton-loader>
                <v-skeleton-loader type="text" width="200"></v-skeleton-loader>
            </v-card-title>
            <v-card-subtitle>
                <v-skeleton-loader type="text" width="250"></v-skeleton-loader>
            </v-card-subtitle>
            <v-card-text>
                <v-skeleton-loader type="text" width="150" class="mb-2"></v-skeleton-loader>
                <v-skeleton-loader type="text" width="120"></v-skeleton-loader>
                <div class="d-flex align-center mt-4">
                    <v-skeleton-loader type="text" width="180"></v-skeleton-loader>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-skeleton-loader type="button"></v-skeleton-loader>
            </v-card-actions>
        </template>
        <template v-else>
            <v-card-title><v-icon icon="mdi-cctv" class="mr-2"></v-icon>{{ cameraData.title }}</v-card-title>
            <v-card-subtitle>{{ cameraData.description }}</v-card-subtitle>
            <v-card-text>
                <div class="d-flex align-center mb-4">
                    <v-icon icon="mdi-video" class="mr-2"></v-icon>
                    <a :href="cameraData.url" target="_blank" class="text-decoration-none">
                        {{ t('cameraInfo.connect') }}
                    </a>
                </div>
                <div class="d-flex align-center mt-4">
                    <span class="mr-2">
                        <v-icon icon="mdi-map-marker" class="mr-1"></v-icon>
                        {{ cameraData.coordinates.join(', ') }}
                    </span>
                    <v-tooltip :text="tooltipText">
                        <template v-slot:activator="{ props }">
                            <v-btn
                                v-bind="props"
                                density="comfortable"
                                variant="text"
                                icon="mdi-content-copy"
                                @click="copyCoordinates"
                                size="small"
                            ></v-btn>
                        </template>
                    </v-tooltip>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" @click="close()">{{ t('cameraInfo.close') }}</v-btn>
            </v-card-actions>
        </template>
    </v-card>
</template>

<script setup lang="ts">
import type ApiService from '@/services/api.service'
import type { TCamera } from '@/types/types'

const { t } = useI18n()


const cameraData = ref<TCamera>({
    title: '',
    description: '',
    coordinates: [0, 0],
    url: '',
    _id: ''
})

const apiService = useNuxtApp().$apiService as ApiService

const props = defineProps({
    close: {
        type: Function,
        required: true
    },
    id: {
        type: String,
        required: true
    }
})

const tooltipText = ref(t('common.copyToClipboard'))

const isLoading = ref(true)

onMounted(async () => {
    try {
        const { camera } = await apiService.cameraInfo(props.id)

        cameraData.value.title = camera.title
        cameraData.value.description = camera.description
        cameraData.value.coordinates = camera.coordinates
        cameraData.value.url = camera.url
    } catch (error) {
        console.error('Error loading camera data:', error)
    } finally {
        isLoading.value = false
    }
})

const copyCoordinates = () => {
    navigator.clipboard.writeText(cameraData.value.coordinates.join(', '))
    tooltipText.value = t('common.copied')
    setTimeout(() => {
        tooltipText.value = t('common.copyToClipboard')
    }, 2000)
}
</script>
