<template>
    <v-card>
        <v-card-title><v-icon icon="mdi-cctv" class="mr-2"></v-icon>Информация о камере</v-card-title>
        <v-card-subtitle><v-icon icon="mdi-binoculars" class="mr-2"></v-icon>Это камера, в которую смотрит товарищ майор.</v-card-subtitle>
        <v-card-text>
            <p> Он тебя видит.</p>
            <p>Не зли его.</p>
        </v-card-text>
        <v-card-actions>
            <v-btn color="primary" @click="close()">Закрыть</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
defineProps({
    close: {
        type: Function,
        required: true
    }
})

</script>
