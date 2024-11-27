<template>
    <YaMap />
    <UserMenu />
    <LoadingScreen />
</template>

<script setup>
import YaMap from '~/components/YaMap.vue'
import UserMenu from '~/components/UserMenu.vue'
import LoadingScreen from '~/components/LoadingScreen.vue'
import { useUserStore } from '../stores/user.store'

const userStore = useUserStore()
const apiService = useNuxtApp().$apiService

const config = useRuntimeConfig()
console.log('API Base URL:', config.public.apiBaseURL)

onMounted(async () => {
    const res = await apiService.userInfo()

    userStore.setUser(res.user)
})
</script>

<style scoped></style>
