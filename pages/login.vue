<template>
    <v-container
        class="d-flex align-center justify-center"
        style="height: 100vh"
    >
        <v-card width="400">
            <v-card-text v-if="debug" class="debug-info">
                <pre>Access Token: {{ accessToken }}</pre>
                <pre>Refresh Token: {{ refreshToken }}</pre>
                <pre>Headers: {{ currentHeaders }}</pre>
                <pre>v.0002</pre>
            </v-card-text>
            <v-card-title>
                <v-container>
                    <v-row>
                        {{ $t('loginPage.title') }}

                        <v-spacer></v-spacer>

                        <v-btn variant="text">
                            {{ $t('loginPage.register') }}
                        </v-btn>
                    </v-row>
                </v-container>
            </v-card-title>
            <v-card-text>
                <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="login">
                    <v-text-field
                        :label="$t('loginPage.email')"
                        v-model="email"
                        :rules="[rules.required, rules.email]"
                        required
                    ></v-text-field>
                    <v-text-field
                        :label="$t('loginPage.password')"
                        v-model="password"
                        :rules="[rules.required]"
                        type="password"
                        required
                        @keyup.enter="login"
                    ></v-text-field>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn
                    :disabled="!valid"
                    color="primary"
                    @click="login"
                >
                    {{ $t('loginPage.submit') }}
                </v-btn>
            </v-card-actions>
        </v-card>
        <v-snackbar v-model="toast.show" :timeout="3000" color="error">
            {{ toast.message }}
        </v-snackbar>
    </v-container>
</template>

<script setup>
import { useUserStore } from '../stores/user.store'
import { navigateTo } from '#app'

const apiService = useNuxtApp().$apiService

const { locale, t } = useI18n()

const changeLocale = lang => {
    locale.value = lang
}

const email = ref('')
const password = ref('')
const valid = ref(false)

const toast = ref({
    show: false,
    message: ''
})

const rules = {
    required: value => !!value || t('loginPage.rules.required'),
    email: value => {
        const pattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/
        return pattern.test(value) || t('loginPage.rules.invalidEmail')
    }
}

const login = async () => {
    try {
        if (valid.value) {
            const res = await apiService.login({
                email: email.value,
                password: password.value
            })

            const store = useUserStore()

            store.setUser(res.user)

            navigateTo('/')
        }
    } catch (e) {
        toast.value.show = true
        toast.value.message = t('loginPage.loginError')
    }
}

const debug = ref(true)
const accessToken = computed(() => useCookie('accessToken', { sameSite: 'lax' }).value)
const refreshToken = computed(() => useCookie('refreshToken', { sameSite: 'lax' }).value)
const currentHeaders = computed(() => {
    const headers = {}
    if (accessToken.value) {
        headers['Authorization'] = `Bearer ${accessToken.value}`
    }
    return headers
})
</script>

<style scoped>
v-container {
    background-color: #f5f5f5;
}

.debug-info {
    background-color: #f5f5f5;
    padding: 10px;
    font-family: monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-all;
}
</style>
