<template>
    <v-container class="d-flex align-center justify-center" style="height: 100vh;">
        <v-card width="400">
            <v-card-title>{{$t('loginPage.title')}}</v-card-title>
            <v-card-text>
                <v-form ref="form" v-model="valid" lazy-validation>
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
                    ></v-text-field>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn :disabled="!valid" color="primary" @click="login">
                    {{$t('loginPage.submit')}}
                </v-btn>
                <div>
                    <v-btn @click="changeLocale('en')">English</v-btn>
                    <v-btn @click="changeLocale('ru')">Русский</v-btn>
                </div>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()

const changeLocale = (lang) => {
    locale.value = lang
}

const email = ref('')
const password = ref('')
const valid = ref(false)

const rules = {
    required: (value) => !!value || t('loginPage.rules.required'),
    email: (value) => {
        const pattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
        return pattern.test(value) || t('loginPage.rules.invalidEmail')
    }
}

const login = () => {
    if (valid.value) {
        console.log('Logging in with:', { email: email.value, password: password.value })
        // Здесь можно добавить вызов API для авторизации
    }
}
</script>

<style scoped>
v-container {
    background-color: #f5f5f5;
}
</style>
