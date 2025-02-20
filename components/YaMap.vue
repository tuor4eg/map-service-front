<template>
    <div class="map-container">
        <yandex-map
            v-model="map"
            :settings="{
            location: {
                center: centerCoords as LngLat,
                zoom: 9,
            },
            }"
        >
            <yandex-map-default-scheme-layer />
            <yandex-map-default-features-layer />
            <yandex-map-clusterer zoom-on-cluster-click>
                <template v-for="camera in camerasList">
                    <yandex-map-marker
                        :settings="{ coordinates: camera.coordinates, onClick: () => popup = camera._id }"
                    >
                        <div class="cluster">
                            <i class="mdi mdi-cctv"></i>
                        </div>
                        <camera-card 
                            :close="() => popup = null" 
                            v-if="popup === camera._id" 
                            :id="camera._id"
                            class="camera-card-popup" 
                        />
                    </yandex-map-marker>
                </template>
                <template #cluster="{ length }">
                    <div class="cluster">
                        <i class="mdi mdi-cctv"></i>
                        <span class="cluster-count">{{ length }}</span>
                    </div>
                </template>
            </yandex-map-clusterer>
            <yandex-map-listener 
            :settings="{
                onClick: clickMap
            }"/>
        </yandex-map>
    </div>
</template>

<script setup lang="ts">
import { shallowRef, ref } from 'vue'
import type { YMap, LngLat } from '@yandex/ymaps3-types'
import {
    YandexMap,
    YandexMapDefaultSchemeLayer,
    YandexMapDefaultFeaturesLayer,
    YandexMapListener,
    YandexMapClusterer,
    YandexMapMarker
} from 'vue-yandex-maps'
import type { TCamera } from '../types/types'

const map = shallowRef<null | YMap>(null)
const popup = ref<null | number>(null)

const centerCoords = ref([37.573856, 55.751574])
const camerasList = ref<Array<any>>([])

const apiService: any = useNuxtApp().$apiService

onMounted(async () => {
    await getCamerasList()

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                centerCoords.value = [
                    position.coords.longitude,
                    position.coords.latitude
                ]
            },
            error => {
                console.error('Error getting location:', error)
            }
        )
    } else {
        console.error('Geolocation is not supported by this browser.')
    }
})

const getCamerasList = async () => {
    const { cameras } = await apiService.cameraList()

    camerasList.value = cameras
}

const clickMap = (event: any) => {
    if (!event && popup.value) {
        popup.value = null
    }
}

const centerMap = (coordinates: number[]) => {
    if (map.value && Array.isArray(coordinates) && coordinates.length === 2) {
        map.value.setLocation({ 
            center: coordinates as LngLat,
            zoom: 15,
            duration: 400 
        })
    }
}

const showCamera = (cameraId: number) => {
    if (cameraId) {
        popup.value = cameraId
    }
}

defineExpose({
    centerMap,
    showCamera
})
</script>

<style scoped>
.map-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

yandex-map {
    width: 100%;
    height: 100%;
}

.marker-popup {
    background: #fff;
    border-radius: 10px;
    padding: 10px;
    color: black;
    cursor: pointer;
    font-size: 14px;
    white-space: nowrap;
}

.cluster {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border: 2px solid #2196F3;
}

.cluster i {
    font-size: 18px;
    color: #2196F3;
    margin-top: -2px;
}

.cluster-count {
    font-size: 10px;
    font-weight: bold;
    color: #333;
    margin-top: -2px;
    line-height: 1;
}

.camera-card-popup {
    position: absolute;
    bottom: 45px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
}
</style>
