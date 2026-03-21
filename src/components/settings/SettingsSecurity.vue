<template>
  <div class="space-y-6">
    <div>
      <label class="text-xs mb-2 block text-muted-foreground">ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ</label>
      <div
        class="flex items-center justify-between px-4 py-3 rounded-md border border-input bg-background text-sm"
      >
        <span class="metric-value">{{ authStore.userName }}</span>
        <Badge :variant="authStore.userRole === 'admin' ? 'default' : 'secondary'">
          {{ authStore.userRole === 'admin' ? 'Администратор' : 'Пользователь' }}
        </Badge>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Button variant="outline" @click="handleChangePassword">СМЕНИТЬ ПАРОЛЬ</Button>
      <Button variant="outline" @click="handleAccessLog">ЖУРНАЛ ДОСТУПА</Button>
    </div>

    <div class="flex items-center justify-between py-3 border-t border-border">
      <div>
        <div class="text-sm mb-1">Двухфакторная аутентификация</div>
        <div class="text-xs text-muted-foreground">Дополнительная защита входа</div>
      </div>
      <Switch v-model="twoFactor" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

const STORAGE_KEY = 'settings_security'

const authStore = useAuthStore()

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const saved = loadSaved()
const twoFactor = ref(saved.twoFactor ?? true)

function handleChangePassword() {
  // Заглушка — смена пароля
}

function handleAccessLog() {
  // Заглушка — журнал доступа
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ twoFactor: twoFactor.value }))
}

function reset() {
  twoFactor.value = true
}

defineExpose({ save, reset })
</script>
