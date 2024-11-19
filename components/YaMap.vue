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
            <template v-for="camera in camerasList">
                <yandex-map-default-marker
                    :settings="{ ...camera, popup: { position: 'top' } }"
                >
                    <template #popup="{ close }">
                        <camera-card :close="close" />
                    </template>
                </yandex-map-default-marker>
            </template>
            <yandex-map-listener 
            :settings="{
                onClick: clickMap
            }"/>
        </yandex-map>
    </div>
</template>

<script setup lang="ts">
import { shallowRef, ref } from 'vue'
import type { YMap, LngLat, DomEvent } from '@yandex/ymaps3-types'
import {
    YandexMap,
    YandexMapDefaultSchemeLayer,
    YandexMapDefaultMarker,
    YandexMapDefaultFeaturesLayer,
    YandexMapListener
} from 'vue-yandex-maps'

const map = shallowRef<null | YMap>(null)

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
    console.log(event)
    if (!event) console.log('Clicked on the map')
}
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
</style>
