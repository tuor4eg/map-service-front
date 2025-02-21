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
                zoom: 9,
            },
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
                }"
            ></yandex-map-listener>
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
    YandexMapMarker,
} from 'vue-yandex-maps'
import type ApiService from '@/services/api.service'
import type { TCamera } from '~/types/types'
import { useI18n } from 'vue-i18n'

const map = shallowRef<null | YMap>(null)
const popup = ref<null | string>(null)
const selectedLocation = ref<SearchResult | null>(null)

const centerCoords = ref([37.573856, 55.751574])
const camerasList = ref<Array<TCamera>>([])

const apiService = useNuxtApp().$apiService as ApiService
const config = useRuntimeConfig()
const yandexApiKey = config.public.yandexMaps.apikey

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

const getCamerasList = async (): Promise<void> => {
    const { cameras } = await apiService.cameraList()

    camerasList.value = cameras
}

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

const geocode = async (query: string): Promise<SearchResult[]> => {
    try {
        const response = await fetch(
            `https://geocode-maps.yandex.ru/1.x/?apikey=${yandexApiKey}&format=json&geocode=${encodeURIComponent(query)}&kind=house&lang=${locale.value === 'ru' ? 'ru_RU' : 'en_US'}`
        )
        const data = await response.json()
        const features = data.response.GeoObjectCollection.featureMember
        
        return features
            .filter((feature: any) => {
                const kind = feature.GeoObject.metaDataProperty.GeocoderMetaData.kind
                return ['house', 'locality'].includes(kind)
            })
            .map((feature: any) => {
                const coordinates = feature.GeoObject.Point.pos.split(' ').map(Number) as [number, number]
                return {
                    value: feature.GeoObject.name,
                    fullAddress: feature.GeoObject.metaDataProperty.GeocoderMetaData.Address.formatted,
                    coordinates,
                    id: feature.GeoObject.metaDataProperty.GeocoderMetaData.Address.formatted
                }
            })
    } catch (error) {
        console.error('Geocoding error:', error)
        return []
    }
}

const clickMap = async (event: any) => {
    if (!event && popup.value) {
        popup.value = null
        return
    }

    if (event?.entity?.geometry?.coordinates) {
        const [longitude, latitude] = event.entity.geometry.coordinates
        const results = await geocode(`${longitude},${latitude}`)
        
        if (results.length > 0) {
            selectedLocation.value = results[0]
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
        searchResults.value = await geocode(searchQuery.value)
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
</style>
