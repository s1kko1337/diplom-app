<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between py-3 border-b border-border">
      <div>
        <div class="text-sm mb-1">Критические уведомления</div>
        <div class="text-xs text-muted-foreground">Звуковые и визуальные уведомления</div>
      </div>
      <Switch v-model="criticalAlerts" />
    </div>

    <div class="flex items-center justify-between py-3 border-b border-border">
      <div>
        <div class="text-sm mb-1">Предупреждения</div>
        <div class="text-xs text-muted-foreground">Уведомления о превышении порогов</div>
      </div>
      <Switch v-model="warnings" />
    </div>

    <div class="flex items-center justify-between py-3 border-b border-border">
      <div>
        <div class="text-sm mb-1">Информационные сообщения</div>
        <div class="text-xs text-muted-foreground">Уведомления о плановых событиях</div>
      </div>
      <Switch v-model="infoMessages" />
    </div>

    <div class="flex items-center justify-between py-3 border-b border-border">
      <div>
        <div class="text-sm mb-1">Email-уведомления</div>
        <div class="text-xs text-muted-foreground">Отправлять уведомления на email</div>
      </div>
      <Switch v-model="emailNotifications" />
    </div>

    <div>
      <label class="text-xs mb-2 block text-muted-foreground">EMAIL ДЛЯ УВЕДОМЛЕНИЙ</label>
      <Input v-model="email" type="email" placeholder="admin@rudgormash.ru" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'

const STORAGE_KEY = 'settings_notifications'

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const saved = loadSaved()

const criticalAlerts = ref(saved.criticalAlerts ?? true)
const warnings = ref(saved.warnings ?? true)
const infoMessages = ref(saved.infoMessages ?? false)
const emailNotifications = ref(saved.emailNotifications ?? true)
const email = ref(saved.email || '')

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      criticalAlerts: criticalAlerts.value,
      warnings: warnings.value,
      infoMessages: infoMessages.value,
      emailNotifications: emailNotifications.value,
      email: email.value,
    }),
  )
}

function reset() {
  criticalAlerts.value = true
  warnings.value = true
  infoMessages.value = false
  emailNotifications.value = true
  email.value = ''
}

defineExpose({ save, reset })
</script>
