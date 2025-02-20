<template>
    <div class="user-settings">
        <v-list>
            <v-list-item>
                <v-select
                    v-model="settings.language"
                    :label="t('userMenu.userSettings.language.title')"
                    :items="availableLanguages"
                ></v-select>
            </v-list-item>
        </v-list>
            <v-btn
                color="primary"
                @click="saveSettings"
            >
                {{ t('userMenu.userSettings.saveButton') }}
            </v-btn>

        <!-- Добавляем snackbar для уведомлений -->
        <v-snackbar
            v-model="snackbar.show"
            :color="snackbar.color"
            :timeout="3000"
        >
            {{ snackbar.text }}
        </v-snackbar>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const apiService = useNuxtApp().$apiService

const settings = ref({
    language: locale.value
})

const availableLanguages = useNuxtApp().$i18n.availableLocales.map(locale => ({
    title: t(`userMenu.userSettings.language.options.${locale}`),
    value: locale
}))

const snackbar = ref({
    show: false,
    text: '',
    color: 'success'
})

const saveSettings = async () => {
    try {
        locale.value = settings.value.language

        const data = {
            settings: {
                language: locale.value
            }
        }

        await apiService.updateUser(data)
        
        snackbar.value = {
            show: true,
            text: t('userMenu.userSettings.saveSuccess'),
            color: 'success'
        }
        
    } catch (error) {
        snackbar.value = {
            show: true,
            text: t('userMenu.userSettings.saveError'),
            color: 'error'
        }
    }
}

onMounted(async () => {
    try {

    } catch (error) {
        console.error('Error loading settings:', error)
    }
})
</script>

<style scoped>
.user-settings {
    padding: 16px;
    padding-bottom: 72px;
}

.settings-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background-color: white;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}
</style> 