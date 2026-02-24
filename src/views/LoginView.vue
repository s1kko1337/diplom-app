<template>
  <div class="bg-surface-1 border-2 border-border p-8">
    <h2 class="text-lg mb-6 text-center">ВХОД В СИСТЕМУ</h2>

    <form class="space-y-4" @submit.prevent="handleLogin">
      <div>
        <label class="text-xs mb-2 block opacity-70">ЛОГИН</label>
        <input
          v-model="username"
          type="text"
          placeholder="admin"
          autocomplete="username"
          class="w-full px-4 py-3 bg-surface-2 border-2 border-border text-sm focus:border-primary outline-none transition-colors"
        />
      </div>

      <div>
        <label class="text-xs mb-2 block opacity-70">ПАРОЛЬ</label>
        <input
          v-model="password"
          type="password"
          placeholder="••••••"
          autocomplete="current-password"
          class="w-full px-4 py-3 bg-surface-2 border-2 border-border text-sm focus:border-primary outline-none transition-colors"
        />
      </div>

      <div
        v-if="authStore.error"
        class="p-3 bg-status-critical-bg text-status-critical-text border border-primary text-sm"
      >
        {{ authStore.error }}
      </div>

      <button
        type="submit"
        :disabled="authStore.loading"
        class="w-full py-3 border-2 border-primary text-sm hover:bg-surface-2 transition-all duration-150 disabled:opacity-50"
      >
        {{ authStore.loading ? 'ВХОД...' : 'ВОЙТИ' }}
      </button>
    </form>

    <div class="mt-6 text-center text-xs opacity-40">Введите любой логин и пароль для входа</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')

async function handleLogin() {
  const success = await authStore.login({
    username: username.value,
    password: password.value,
  })
  if (success) {
    const redirect = route.query.redirect
    router.push(redirect || { name: 'home' })
  }
}
</script>
