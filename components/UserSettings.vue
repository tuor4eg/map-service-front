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

            <v-list-item>
                <v-card class="pa-4 mt-4">
                    <v-card-title>{{ t('userMenu.userSettings.password.title') }}</v-card-title>
                    <v-card-text>
                        <v-form 
                            v-model="passwordForm.valid"
                            ref="formRef"
                        >
                            <v-text-field
                                v-model="passwordForm.newPassword"
                                :label="t('userMenu.userSettings.password.new')"
                                :type="showPassword.new ? 'text' : 'password'"
                                :rules="[rules.passwordLength, rules.passwordComplexity]"
                                :append-inner-icon="showPassword.new ? 'mdi-eye-off' : 'mdi-eye'"
                                @click:append-inner="showPassword.new = !showPassword.new"
                            ></v-text-field>
                            <v-text-field
                                v-model="passwordForm.confirmPassword"
                                :label="t('userMenu.userSettings.password.confirm')"
                                :type="showPassword.confirm ? 'text' : 'password'"
                                :rules="[rules.passwordMatch]"
                                :required="!!passwordForm.newPassword"
                                :append-inner-icon="showPassword.confirm ? 'mdi-eye-off' : 'mdi-eye'"
                                @click:append-inner="showPassword.confirm = !showPassword.confirm"
                            ></v-text-field>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-list-item>
        </v-list>
        <v-btn
            color="primary"
            @click="saveSettings"
            :disabled="!!passwordForm.newPassword && (!passwordForm.valid || !passwordForm.confirmPassword)"
        >
            {{ t('userMenu.userSettings.saveButton') }}
        </v-btn>

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

const rules = {
    passwordLength: (value) => !value || value.length >= 8 || t('userMenu.userSettings.rules.passwordLength'),
    passwordComplexity: (value) => {
        if (!value) return true
        const hasUpperCase = /[A-Z]/.test(value)
        const hasLowerCase = /[a-z]/.test(value)
        const hasNumbers = /\d/.test(value)
        return (hasUpperCase && hasLowerCase && hasNumbers) || t('userMenu.userSettings.rules.passwordComplexity')
    },
    passwordMatch: (value) => {
        if (!passwordForm.value.newPassword) return true
        return value === passwordForm.value.newPassword || t('userMenu.userSettings.rules.passwordMatch')
    }
}

const passwordForm = ref({
    valid: false,
    newPassword: '',
    confirmPassword: ''
})

const formRef = ref(null)

const showPassword = ref({
    new: false,
    confirm: false
})

const resetPasswordForm = () => {
    passwordForm.value.newPassword = ''
    passwordForm.value.confirmPassword = ''
    formRef.value?.resetValidation()
}

const saveSettings = async () => {
    try {
        const data = {
            settings: {
                language: settings.value.language
            }
        }

        if (passwordForm.value.newPassword && passwordForm.value.valid) {
            data.password = passwordForm.value.newPassword
        }

        await apiService.updateUser(data)
        locale.value = settings.value.language

        if (data.password) {
            resetPasswordForm()
        }
        
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