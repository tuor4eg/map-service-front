<template>
    <div class="starred-cameras">
        <v-list>
            <v-list-item
                v-for="camera in starredCameras"
                :key="camera.id"
                :title="camera.name"
                :subtitle="camera.location"
                @click="selectCamera(camera)"
            >
                <template v-slot:prepend>
                    <v-icon :color="camera.isOnline ? 'green' : 'grey'">
                        mdi-video
                    </v-icon>
                </template>
                <template v-slot:append>
                    <v-icon
                        @click.stop="toggleFavorite(camera)"
                        color="amber"
                    >
                        mdi-star
                    </v-icon>
                </template>
            </v-list-item>
        </v-list>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const apiService = useNuxtApp().$apiService
const starredCameras = ref([])

const selectCamera = (camera) => {
    emit('camera-selected', camera)
}

const toggleFavorite = async (camera) => {
    try {
        await apiService.toggleCameraFavorite(camera.id)
        // Удаляем камеру из списка избранных
        starredCameras.value = starredCameras.value.filter(c => c.id !== camera.id)
    } catch (error) {
        console.error('Error toggling favorite:', error)
    }
}

onMounted(async () => {
    try {
        const response = await apiService.getStarredCameras()
        starredCameras.value = response.cameras
    } catch (error) {
        console.error('Error loading starred cameras:', error)
    }
})

const emit = defineEmits(['camera-selected'])
</script>

<style scoped>
.starred-cameras {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
}
</style> 