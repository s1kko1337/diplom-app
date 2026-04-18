<template>
  <RouterView />
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { resetAll } from '@/api/mock/_runtime'

if (new URLSearchParams(window.location.search).get('demo-reset') === '1') {
  resetAll()
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user_id')
  window.location.replace(window.location.pathname)
}

const authStore = useAuthStore()
authStore.fetchUser()
</script>
