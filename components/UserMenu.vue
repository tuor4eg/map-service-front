<template>
    <v-card v-if="user">
        <v-layout>
            <v-navigation-drawer expand-on-hover rail>
                <v-list>
                    <v-list-item
                        prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
                        :subtitle="user.email"
                        :title="user.name"
                    ></v-list-item>
                </v-list>

                <v-divider></v-divider>

                <v-list density="compact" nav>
                    <v-list-item
                        prepend-icon="mdi-folder"
                        title="My Files"
                        value="myfiles"
                    ></v-list-item>
                    <v-list-item
                        prepend-icon="mdi-account-multiple"
                        title="Shared with me"
                        value="shared"
                    ></v-list-item>
                    <v-list-item
                        prepend-icon="mdi-star"
                        title="Starred"
                        value="starred"
                    ></v-list-item>
                </v-list>

                <v-spacer></v-spacer>
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
        </v-layout>
    </v-card>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../stores/user.store'

const apiService = useNuxtApp().$apiService

const logout = async () => {
    await apiService.logout()
}

const { t } = useI18n()

const userStore = useUserStore()

const user = computed(() => userStore.user)

defineProps({})
</script>

<style scoped></style>
