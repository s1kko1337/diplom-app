<template>
  <Card class="w-full max-w-sm mx-auto">
    <CardHeader class="text-center">
      <CardTitle class="text-lg">Вход в систему</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit.prevent="handleLogin">
        <div class="space-y-2">
          <label class="text-sm font-medium">Пользователь</label>
          <Select v-model="selectedUserId">
            <SelectTrigger>
              <SelectValue placeholder="Выберите пользователя" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="u in MOCK_USERS" :key="u.id" :value="u.id">
                {{ u.name }} — {{ ROLE_LABELS[u.role] }}
              </SelectItem>
            </SelectContent>
          </Select>
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
        Выберите пользователя и введите любой пароль
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/utils/constants'
import { MOCK_USERS } from '@/api/mock/users'
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

const selectedUserId = ref('user-1')
const password = ref('')

async function handleLogin() {
  const success = await authStore.login({
    username: 'mock',
    password: password.value || 'mock',
    userId: selectedUserId.value,
  })
  if (success) {
    const redirect = route.query.redirect
    router.push(redirect || { name: 'home' })
  }
}
</script>
