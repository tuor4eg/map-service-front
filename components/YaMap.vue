<template>
    <div class="map-container">
        <div v-if="map" class="search-container">
            <div class="search-box">
                <i class="mdi mdi-magnify search-icon"></i>
                <input 
                    type="text" 
                    v-model="searchQuery" 
                    :placeholder="t('map.searchPlaceholder')"
                    class="search-input"
                    @input="handleSearch"
                >
                <v-tooltip
                    :text="t('map.resetSearch')"
                    location="bottom"
                >
                    <template v-slot:activator="{ props }">
                        <i 
                            v-if="searchQuery || selectedLocation"
                            class="mdi mdi-close reset-icon"
                            @click="resetSearch"
                            v-bind="props"
                        ></i>
                    </template>
                </v-tooltip>
            </div>
            <div v-if="searchResults.length" class="search-results">
                <div 
                    v-for="result in searchResults" 
                    :key="result.id"
                    class="search-result-item"
                    @click="selectAddress(result)"
                >
                    <div class="search-result-name">{{ result.value }}</div>
                    <div class="search-result-address">{{ result.fullAddress }}</div>
                </div>
            </div>
        </div>
        <yandex-map
            v-model="map"
            :settings="{
                location: {
                    center: centerCoords as LngLat,
                    zoom: 15,
                }
            }"
            :options="{
                minZoom: 2,
                maxZoom: 19
            }"
        >
            <yandex-map-default-scheme-layer />
            <yandex-map-default-features-layer />
            
            <!-- Маркер для найденного адреса -->
            <yandex-map-marker
                v-if="selectedLocation"
                :settings="{ coordinates: selectedLocation.coordinates }"
            >
                <div class="search-marker">
                    <i class="mdi mdi-map-marker"></i>
                </div>
                <div class="search-marker-popup">
                    <span>{{ selectedLocation.fullAddress }}</span>
                    <div class="popup-actions">
                        <v-tooltip
                            :text="showCopyTooltip ? t('map.coordinatesCopied') : t('map.copyCoordinates')"
                            location="top"
                        >
                            <template v-slot:activator="{ props }">
                                <i 
                                    class="mdi mdi-content-copy copy-icon"
                                    @click.stop="copyCoordinates(selectedLocation.coordinates)"
                                    v-bind="props"
                                ></i>
                            </template>
                        </v-tooltip>
                        <v-tooltip
                            :text="t('map.resetSearch')"
                            location="top"
                        >
                            <template v-slot:activator="{ props }">
                                <i 
                                    class="mdi mdi-close reset-popup-icon" 
                                    @click="resetSearch"
                                    v-bind="props"
                                ></i>
                            </template>
                        </v-tooltip>
                    </div>
                </div>
            </yandex-map-marker>

            <yandex-map-clusterer 
                zoom-on-cluster-click
            >
                <template v-for="[coords, cameras] in groupedCameras" :key="coords">
                    <yandex-map-marker
                        :settings="{ 
                            coordinates: coords.split(',').map(Number).reverse() as LngLat
                        }"
                    >
                        <div class="cluster">
                            <i class="mdi mdi-cctv"></i>
                            <span v-if="cameras.length > 1" class="cluster-count">{{ cameras.length }}</span>
                        </div>
                        <div 
                            class="cluster-hover-area"
                            @mouseenter="handleMarkerHover(coords)"
                            @mouseleave="handleMarkerLeave()"
                        >
                            <div v-if="hoveredMarker === coords && !popup" class="cameras-hover-menu">
                                <div class="cameras-list">
                                    <div 
                                        v-for="camera in cameras" 
                                        :key="camera._id"
                                        class="camera-item"
                                        @click.stop="handleCameraClick(camera._id)"
                                    >
                                        <v-icon icon="mdi-cctv" size="small" color="primary" class="mr-2" />
                                        {{ camera.title }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <camera-card 
                            :close="() => popup = null" 
                            v-if="popup && cameras.some(cam => cam._id === popup)" 
                            :id="popup"
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
                }"
            ></yandex-map-listener>
        </yandex-map>
    </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, computed } from 'vue'
import type { YMap, LngLat } from '@yandex/ymaps3-types'
import {
    YandexMap,
    YandexMapDefaultSchemeLayer,
    YandexMapDefaultFeaturesLayer,
    YandexMapListener,
    YandexMapClusterer,
    YandexMapMarker,
} from 'vue-yandex-maps'
import type { TCamera } from '~/types/types'
import { useI18n } from 'vue-i18n'
import { useCamerasStore } from '~/stores/cameras.store'

const map = shallowRef<null | YMap>(null)
const popup = ref<null | string>(null)
const hoveredMarker = ref<string | null>(null)
const selectedLocation = ref<SearchResult | null>(null)

const centerCoords = ref([37.573856, 55.751574])

const camerasStore = useCamerasStore()

const groupedCameras = computed(() => {
    const groups = new Map<string, TCamera[]>()
    
    camerasStore.cameras.forEach(camera => {
        const key = camera.coordinates.join(',')
        if (!groups.has(key)) {
            groups.set(key, [])
        }
        groups.get(key)!.push(camera)
    })
    
    return groups
})

const geocodingService = useNuxtApp().$geocodingService
const config = useRuntimeConfig()

interface SearchResult {
    value: string
    fullAddress: string
    coordinates: [number, number]
    id: string
}

const searchQuery = ref('')
const searchResults = ref<Array<SearchResult>>([])
const searchTimeout = ref<any>(null)

const { t, locale } = useI18n()

const showCopyTooltip = ref(false)

onMounted(async (): Promise<void> => {
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

const copyCoordinates = async (coordinates: number[]): Promise<void> => {
    try {
        const coordsForClipboard = [...coordinates].reverse().join(', ')
        await navigator.clipboard.writeText(coordsForClipboard)
        showCopyTooltip.value = true
        setTimeout(() => {
            showCopyTooltip.value = false
        }, 2000)
    } catch (error) {
        console.error('Copy error:', error)
    }
}

const clickMap = async (event: any) => {
    if (!event || popup.value) {
        popup.value = null
        return
    }

    if (event?.entity?.geometry?.coordinates) {
        const [longitude, latitude] = event.entity.geometry.coordinates
        const results = await geocodingService.geocode(`${longitude},${latitude}`, locale.value)
        
        if (results.length > 0) {
            selectedLocation.value = {
                ...results[0],
                coordinates: [longitude, latitude]
            }
        }
    }
}

const centerMap = (coordinates: number[]): void => {
    if (map.value && Array.isArray(coordinates) && coordinates.length === 2) {
        map.value.setLocation({ 
            center: coordinates as LngLat,
            zoom: 15,
            duration: 400 
        })
    }
}

const showCamera = (cameraId: string): void => {
    if (cameraId) {
        popup.value = cameraId
    }
}

const handleSearch = async (): Promise<void> => {
    if (searchTimeout.value) clearTimeout(searchTimeout.value)
    
    if (!searchQuery.value) {
        searchResults.value = []
        return
    }

    searchTimeout.value = setTimeout(async () => {
        searchResults.value = await geocodingService.geocode(searchQuery.value, locale.value)
    }, 300)
}

const selectAddress = (result: SearchResult): void => {
    searchQuery.value = result.value
    selectedLocation.value = result
    centerMap(result.coordinates)
    searchResults.value = []
}

const resetSearch = (): void => {
    searchQuery.value = ''
    searchResults.value = []
    selectedLocation.value = null
}

const handleMarkerHover = (coords: string) => {
    hoveredMarker.value = coords
}

const handleMarkerLeave = () => {
    hoveredMarker.value = null
}

const handleCameraClick = async (cameraId: string) => {
    popup.value = cameraId
    const cameras = groupedCameras.value.get(hoveredMarker.value || '')
    const camera = cameras?.find((c: TCamera) => c._id === cameraId)
}

const getAddressFromCoords = async (coordinates: number[]): Promise<string> => {
    return await geocodingService.getAddressFromCoords(coordinates)
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
    position: relative;
    z-index: -1;
}

.cluster i {
    font-size: 20px;
    color: #2196F3;
}

.cluster-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #E53935;
    color: white;
    border-radius: 50%;
    min-width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    padding: 0 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.camera-card-popup {
    position: absolute;
    bottom: 45px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
}

.search-container {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000;
    width: 300px;
}

.search-box {
    background: white;
    border-radius: 8px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    position: relative;
}

.search-input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 14px;
    padding: 4px 8px;
    background: transparent;
}

.search-icon {
    color: #666;
    font-size: 20px;
    margin-right: 8px;
}

.search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border-radius: 8px;
    margin-top: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    max-height: 300px;
    overflow-y: auto;
}

.search-result-item {
    padding: 10px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.search-result-item:hover {
    background-color: #f5f5f5;
}

.search-result-name {
    font-weight: 500;
    margin-bottom: 2px;
}

.search-result-address {
    font-size: 12px;
    color: #666;
}

.search-marker {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    position: relative;
}

.search-marker i.mdi-map-marker {
    color: #E53935;
    font-size: 32px;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
}

.search-marker-popup {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.popup-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 8px;
}

.copy-icon,
.reset-popup-icon,
.reset-icon {
    color: #666;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    transition: color 0.2s;
}

.copy-icon:hover {
    color: #2196F3;
}

.reset-popup-icon:hover,
.reset-icon:hover {
    color: #E53935;
}

.cluster-hover-area {
    position: absolute;
    width: 60px;
    height: 60px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    z-index: 10000;
}

.cameras-hover-menu {
    position: absolute;
    bottom: 45px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border-radius: 8px;
    min-width: 200px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10001;
    pointer-events: auto;
}

.cameras-list {
    padding: 8px 0;
}

.camera-item {
    padding: 8px 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;
    font-size: 14px;
}

.camera-item:hover {
    background-color: #f5f5f5;
}
</style>
