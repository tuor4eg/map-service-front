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
        <yandex-map-default-scheme-layer/>
        </yandex-map>
    </div>
  </template>
  
  <script setup lang="ts">
  import { shallowRef } from 'vue';
  import type { YMap, LngLat } from '@yandex/ymaps3-types';
  import { YandexMap, YandexMapDefaultSchemeLayer } from 'vue-yandex-maps';
  
  const map = shallowRef<null | YMap>(null);

  const centerCoords = ref([37.573856, 55.751574])

  onMounted(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                centerCoords.value = [
                    position.coords.longitude,
                    position.coords.latitude
                ]
            },
            (error) => {
                console.error('Error getting location:', error)
            }
        )
    } else {
        console.error('Geolocation is not supported by this browser.')
    }
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
</style>