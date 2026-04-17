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
import { ref, watch } from 'vue'
import { usePreferencesStore } from '@/stores/preferences'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'

const preferences = usePreferencesStore()

const criticalAlerts = ref(preferences.notifications.criticalAlerts)
const warnings = ref(preferences.notifications.warnings)
const infoMessages = ref(preferences.notifications.infoMessages)
const emailNotifications = ref(preferences.notifications.emailNotifications)
const email = ref(preferences.notifications.email)

watch(
  () => preferences.notifications,
  (val) => {
    criticalAlerts.value = val.criticalAlerts
    warnings.value = val.warnings
    infoMessages.value = val.infoMessages
    emailNotifications.value = val.emailNotifications
    email.value = val.email
  },
  { deep: true },
)

async function save() {
  await preferences.save('notifications', {
    criticalAlerts: criticalAlerts.value,
    warnings: warnings.value,
    infoMessages: infoMessages.value,
    emailNotifications: emailNotifications.value,
    email: email.value,
  })
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
