<template>
  <div class="space-y-6">
    <div>
      <label class="text-xs mb-2 block text-muted-foreground">ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ</label>
      <div
        class="flex items-center justify-between px-4 py-3 rounded-md border border-input bg-background text-sm"
      >
        <span class="metric-value">{{ authStore.userName }}</span>
        <Badge variant="default">
          {{ ROLE_LABELS[authStore.userRole] || authStore.userRole }}
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
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePreferencesStore } from '@/stores/preferences'
import { ROLE_LABELS } from '@/utils/constants'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

const authStore = useAuthStore()
const preferences = usePreferencesStore()

const twoFactor = ref(preferences.security.twoFactor)

watch(
  () => preferences.security,
  (val) => {
    twoFactor.value = val.twoFactor
  },
  { deep: true },
)

function handleChangePassword() {
  // Заглушка — смена пароля
}

function handleAccessLog() {
  // Заглушка — журнал доступа
}

async function save() {
  await preferences.save('security', { twoFactor: twoFactor.value })
}

function reset() {
  twoFactor.value = true
}

defineExpose({ save, reset })
</script>
