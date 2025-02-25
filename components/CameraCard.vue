<template>
    <v-card width="500" @click.stop class="camera-card">
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
                <div class="d-flex align-center mb-2">
                    <v-icon icon="mdi-map-marker" class="mr-2"></v-icon>
                    <span>{{ address }}</span>
                </div>
                <div class="d-flex align-center mb-4">
                    <span class="mr-2">
                        <v-icon icon="mdi-crosshairs-gps" class="mr-1"></v-icon>
                        {{ cameraData.coordinates.join(', ') }}
                    </span>
                    <v-tooltip :text="tooltipText.coordinates">
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
                <div v-if="cameraData.url" class="d-flex align-center mb-4">
                    <v-icon icon="mdi-video" class="mr-2"></v-icon>
                    <a :href="cameraData.url" target="_blank" class="text-decoration-none">
                        {{ t('cameraInfo.connect') }}
                    </a>
                </div>
                <template v-if="cameraData.access">
                    <v-divider class="my-3"></v-divider>
                    <div class="mb-2">
                        <span class="text-subtitle-2">{{ t('cameraInfo.credentials') }}</span>
                    </div>
                    <div class="d-flex align-center mb-2">
                        <span class="mr-2">
                            <v-icon icon="mdi-account" class="mr-1"></v-icon>
                            {{ cameraData.access.credentials.login }}
                        </span>
                        <v-tooltip :text="tooltipText.login">
                            <template v-slot:activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    density="comfortable"
                                    variant="text"
                                    icon="mdi-content-copy"
                                    @click="copyLogin"
                                    size="small"
                                ></v-btn>
                            </template>
                        </v-tooltip>
                    </div>
                    <div class="d-flex align-center">
                        <span class="mr-2">
                            <v-icon icon="mdi-key" class="mr-1"></v-icon>
                            {{ cameraData.access.credentials.password }}
                        </span>
                        <v-tooltip :text="tooltipText.password">
                            <template v-slot:activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    density="comfortable"
                                    variant="text"
                                    icon="mdi-content-copy"
                                    @click="copyPassword"
                                    size="small"
                                ></v-btn>
                            </template>
                        </v-tooltip>
                    </div>
                </template>
                <template v-if="cameraData.ownerContact?.name || cameraData.ownerContact?.accounts.length">
                    <v-divider class="my-3"></v-divider>
                    <div class="mb-2">
                        <span class="text-subtitle-2">{{ t('cameraInfo.ownerContact') }}</span>
                    </div>
                    <div v-if="cameraData.ownerContact?.name" class="d-flex align-center mb-2">
                        <v-icon icon="mdi-account" class="mr-2"></v-icon>
                        <span>{{ cameraData.ownerContact.name }}</span>
                    </div>
                    <div v-for="(account, index) in cameraData.ownerContact?.accounts || []" :key="index" class="d-flex align-center mb-2">
                        <v-icon :icon="getContactIcon(account.type)" class="mr-2"></v-icon>
                        <span class="mr-2">{{ account.value }}</span>
                        <v-tooltip :text="tooltipText[`contact${index}`]">
                            <template v-slot:activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    density="comfortable"
                                    variant="text"
                                    icon="mdi-content-copy"
                                    @click="copyContact(account.value, index)"
                                    size="small"
                                ></v-btn>
                            </template>
                        </v-tooltip>
                    </div>
                </template>
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
import type GeocodingService from '@/services/geocoding.service'

const { t } = useI18n()

const cameraData = ref<TCamera>({
    title: '',
    description: '',
    coordinates: [0, 0],
    url: '',
    _id: '',
    access: undefined,
    ownerContact: undefined
})

const apiService = useNuxtApp().$apiService as ApiService
const geocodingService = useNuxtApp().$geocodingService as GeocodingService

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

const address = ref('')

type TooltipTexts = {
    coordinates: string
    login: string
    password: string
    [key: `contact${number}`]: string
}

const tooltipText = ref<TooltipTexts>({
    coordinates: t('common.copyToClipboard'),
    login: t('common.copyToClipboard'),
    password: t('common.copyToClipboard'),
    contact0: t('common.copyToClipboard'),
    contact1: t('common.copyToClipboard'),
    contact2: t('common.copyToClipboard')
})

const isLoading = ref(true)

onMounted(async () => {
    try {
        const { camera } = await apiService.cameraInfo(props.id)

        cameraData.value.title = camera.title
        cameraData.value.description = camera.description
        cameraData.value.coordinates = camera.coordinates
        cameraData.value.url = camera.url
        cameraData.value.access = camera.access
        cameraData.value.ownerContact = camera.ownerContact

        // Fetch address from coordinates
        address.value = await geocodingService.getAddressFromCoords(camera.coordinates)
    } catch (error) {
        console.error('Error loading camera data:', error)
    } finally {
        isLoading.value = false
    }
})

const copyCoordinates = () => {
    navigator.clipboard.writeText(cameraData.value.coordinates.join(', '))
    tooltipText.value.coordinates = t('common.copied')
    setTimeout(() => {
        tooltipText.value.coordinates = t('common.copyToClipboard')
    }, 2000)
}

const copyLogin = () => {
    if (cameraData.value.access) {
        navigator.clipboard.writeText(cameraData.value.access.credentials.login)
        tooltipText.value.login = t('common.copied')
        setTimeout(() => {
            tooltipText.value.login = t('common.copyToClipboard')
        }, 2000)
    }
}

const copyPassword = () => {
    if (cameraData.value.access) {
        navigator.clipboard.writeText(cameraData.value.access.credentials.password)
        tooltipText.value.password = t('common.copied')
        setTimeout(() => {
            tooltipText.value.password = t('common.copyToClipboard')
        }, 2000)
    }
}

const getContactIcon = (type: string): string => {
    switch (type.toLowerCase()) {
        case 'telegram':
            return 'mdi-send'
        case 'phone':
            return 'mdi-phone'
        case 'email':
            return 'mdi-email'
        case 'whatsapp':
            return 'mdi-whatsapp'
        default:
            return 'mdi-account-box'
    }
}

const copyContact = (value: string, index: number) => {
    navigator.clipboard.writeText(value)
    tooltipText.value[`contact${index}` as keyof typeof tooltipText.value] = t('common.copied')
    setTimeout(() => {
        tooltipText.value[`contact${index}` as keyof typeof tooltipText.value] = t('common.copyToClipboard')
    }, 2000)
}
</script>
