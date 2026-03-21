<template>
  <Card class="w-full max-w-sm mx-auto">
    <CardHeader class="text-center">
      <CardTitle class="text-lg">Вход в систему</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit.prevent="handleLogin">
        <div class="space-y-2">
          <label class="text-sm font-medium" for="login-username">Логин</label>
          <Input
            id="login-username"
            v-model="username"
            type="text"
            placeholder="admin"
            autocomplete="username"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium" for="login-password">Пароль</label>
          <Input
            id="login-password"
            v-model="password"
            type="password"
            placeholder="••••••"
            autocomplete="current-password"
          />
        </div>

        <div
          v-if="authStore.error"
          class="rounded-md p-3 bg-destructive/10 text-destructive border border-destructive/20 text-sm"
        >
          {{ authStore.error }}
        </div>

        <Button type="submit" :disabled="authStore.loading" class="w-full">
          {{ authStore.loading ? 'Вход...' : 'Войти' }}
        </Button>
      </form>

      <div class="mt-6 text-center text-xs text-muted-foreground">
        Введите любой логин и пароль для входа
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
