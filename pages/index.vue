<template>
    <YaMap />
</template>

<script setup>
import YaMap from '~/components/YaMap.vue';
import { useUserStore } from '../stores/user.store'

const store = useUserStore()

</script>

<style scoped>
.text-center {
    text-align: center;
}
</style>
