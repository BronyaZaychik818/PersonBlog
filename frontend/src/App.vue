<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.token) {
    await authStore.verify()
  }
})
</script>

<template>
  <router-view />
</template>
