<template>
    <div>
        <v-list class="pa-6">
            <v-list-item
                v-for="camera in cameras"
                :key="camera._id"
                :title="camera.title"
                :subtitle="camera.description"
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
                        <!---<v-tooltip :text="t('userMenu.camerasList.addFavorite')">
                            <template v-slot:activator="{ props }">
                                <v-icon
                                    v-bind="props"
                                    @click.stop="toggleFavorite(camera)"
                                    color="grey"
                                >
                                    mdi-star
                                </v-icon>
                            </template>
                        </v-tooltip>-->
                    </div>
                </template>
            </v-list-item>
        </v-list>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { TCamera, TUser } from '../types/types'
import type ApiService from '@/services/api.service'

const { t } = useI18n()

const apiService = useNuxtApp().$apiService as ApiService
const cameras = ref<TCamera[]>([])

const userStore = useUserStore()

const user = computed<TUser | null>(() => userStore.user)

const selectedCamera = ref<TCamera | null>(null)

const selectCamera = (camera: TCamera) => {
    selectedCamera.value = camera
    emit('update:modelValue', camera)
    emit('close')
}

const toggleFavorite = async (camera: TCamera) => {
    try {
        console.log('toggle')
    } catch (error) {
        console.error('Error toggling favorite:', error)
    }
}

onMounted(async () => {
    try {
        const response = await apiService.сamerasByUser(user.value!.id)
        cameras.value = response.cameras
    } catch (error) {
        console.error('Error loading cameras:', error)
    }
})

const emit = defineEmits(['update:modelValue', 'close'])
</script>

<style scoped>
</style> 