<template>
    <v-card v-if="user" class="user-menu-container" flat :class="{ 'no-pointer-events': !activeMenu }">
        <v-layout class="transparent-layout">
            <v-navigation-drawer
                :expand-on-hover="!activeMenu"
                :rail="!activeMenu"
                permanent
                width="256"
                class="drawer-with-events"
            >
                <v-list>
                    <v-list-item
                        prepend-avatar="/images/logo.jpg"
                        :subtitle="user.email"
                        :title="user.name"
                    ></v-list-item>
                </v-list>

                <v-divider></v-divider>

                <v-list density="compact" nav>
                    <v-list-item
                        prepend-icon="mdi-cctv"
                        :title="t('userMenu.camerasList.title')"
                        value="camerasList"
                        :active="activeMenu === 'camerasList'"
                        @click="activeMenu = 'camerasList'"
                    ></v-list-item>
                    <v-list-item
                        prepend-icon="mdi-cog"
                        :title="t('userMenu.userSettings.title')"
                        value="settings"
                        :active="activeMenu === 'settings'"
                        @click="activeMenu = 'settings'"
                    ></v-list-item>
                </v-list>

                <template v-slot:append>
                    <v-list>
                        <v-list-item
                            prepend-icon="mdi-logout"
                            :title="t('userMenu.logout')"
                            value="logout"
                            @click="logout"
                        ></v-list-item>
                    </v-list>
                </template>
            </v-navigation-drawer>

            <v-main v-if="activeMenu">
                <v-container class="menu-content pa-4 ma-0" fluid>
                    <div class="close-button-container">
                        <v-btn
                            icon="mdi-close"
                            variant="text"
                            size="small"
                            class="close-button"
                            @click="activeMenu = null"
                        ></v-btn>
                    </div>
                    <h2 class="text-h5 mb-4">{{ menuTitle }}</h2>
                    <component 
                        :is="activeComponent" 
                        @update:model-value="handleCameraSelect"
                        @close="activeMenu = null"
                    />
                </v-container>
            </v-main>
        </v-layout>
    </v-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../stores/user.store'
import { ref, computed } from 'vue'
import CamerasList from './CamerasList.vue'
import UserSettings from './UserSettings.vue'
import type { TCamera } from '../types/types'
import type ApiService from '@/services/api.service'

const apiService = useNuxtApp().$apiService as ApiService

type MenuType = 'camerasList' | 'settings' | null

const activeMenu = ref<MenuType>(null)

const menuTitle = computed(() => {
    switch (activeMenu.value) {
        case 'camerasList':
            return t('userMenu.camerasList.title')
        case 'settings':
            return t('userMenu.userSettings.title')
        default:
            return ''
    }
})

const activeComponent = computed(() => {
    switch (activeMenu.value) {
        case 'camerasList':
            return CamerasList

        case 'settings':
            return UserSettings
        default:
            return null
    }
})

const logout = async () => {
    await apiService.logout()
}

const { t } = useI18n()

const userStore = useUserStore()
const user = computed(() => userStore.user)

const emit = defineEmits(['select-camera'])

const handleCameraSelect = (camera: TCamera) => {
    emit('select-camera', camera)
    activeMenu.value = null
}
</script>

<style scoped>
.user-menu-container {
    width: 100%;
    height: 100vh;
    background-color: transparent !important;
}

.transparent-layout {
    background-color: transparent !important;
}

.menu-content {
    background-color: white;
    height: 100vh;
    overflow-y: auto;
    padding-top: 8px;
    border-left: 1px solid #e0e0e0;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    max-width: none;
}

.close-button-container {
    position: fixed;
    top: 8px;
    right: 32px;
    z-index: 100;
}

.close-button {
    background-color: white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.no-pointer-events {
    pointer-events: none;
}

.drawer-with-events {
    pointer-events: auto;
}
</style>
