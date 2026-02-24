<template>
  <RouterView />
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
authStore.fetchUser()
</script>
