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

        <div class="space-y-2">
          <label class="text-sm font-medium">Роль</label>
          <Select v-model="role">
            <SelectTrigger>
              <SelectValue placeholder="Выберите роль" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="(label, key) in ROLE_LABELS" :key="key" :value="key">
                {{ label }}
              </SelectItem>
            </SelectContent>
          </Select>
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
        Введите любой логин и пароль, выберите роль для входа
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/utils/constants'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const role = ref('engineer')

async function handleLogin() {
  const success = await authStore.login({
    username: username.value,
    password: password.value,
    role: role.value,
  })
  if (success) {
    const redirect = route.query.redirect
    router.push(redirect || { name: 'home' })
  }
}
</script>
