<template>
  <NuxtPage />
</template>

<script setup>
const { t } = useI18n()

useHead(() => ({
  title: t('common.appTitle'),
  titleTemplate: '%s',
  meta: [
    { name: 'description', content: t('common.appTitle') }
  ]
}))
</script>
