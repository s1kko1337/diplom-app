<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl">НАСТРОЙКИ СИСТЕМЫ</h2>
        <div class="text-xs sm:text-sm text-muted-foreground mt-1">
          Конфигурация системы мониторинга
        </div>
      </div>
      <div class="flex items-center gap-3 sm:gap-4">
        <span
          v-if="saveMessage"
          class="text-sm px-3 py-1 border border-primary bg-surface-2 transition-all duration-300"
        >
          {{ saveMessage }}
        </span>
        <Button variant="outline" class="min-h-[44px] sm:min-h-0" @click="resetSettings">
          <RefreshCw class="w-4 h-4" />
          <span class="hidden sm:inline">СБРОСИТЬ</span>
        </Button>
        <Button class="min-h-[44px] sm:min-h-0" @click="saveSettings">
          <Save class="w-4 h-4" />
          <span class="hidden sm:inline">СОХРАНИТЬ</span>
        </Button>
      </div>
    </div>

    <Tabs default-value="display">
      <TabsList class="w-full justify-start overflow-x-auto">
        <TabsTrigger value="display">Отображение</TabsTrigger>
        <TabsTrigger value="notifications">Уведомления</TabsTrigger>
        <TabsTrigger value="thresholds">Пороги</TabsTrigger>
        <TabsTrigger value="security">Безопасность</TabsTrigger>
        <TabsTrigger value="system">Система</TabsTrigger>
      </TabsList>

      <TabsContent value="display">
        <SettingsDisplay ref="displayRef" />
      </TabsContent>
      <TabsContent value="notifications">
        <SettingsNotifications ref="notificationsRef" />
      </TabsContent>
      <TabsContent value="thresholds">
        <SettingsThresholds ref="thresholdsRef" />
      </TabsContent>
      <TabsContent value="security">
        <SettingsSecurity ref="securityRef" />
      </TabsContent>
      <TabsContent value="system">
        <SettingsSystem />
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Save, RefreshCw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SettingsDisplay from '@/components/settings/SettingsDisplay.vue'
import SettingsNotifications from '@/components/settings/SettingsNotifications.vue'
import SettingsThresholds from '@/components/settings/SettingsThresholds.vue'
import SettingsSecurity from '@/components/settings/SettingsSecurity.vue'
import SettingsSystem from '@/components/settings/SettingsSystem.vue'

const displayRef = ref(null)
const notificationsRef = ref(null)
const thresholdsRef = ref(null)
const securityRef = ref(null)
const saveMessage = ref('')

function showMessage(text) {
  saveMessage.value = text
  setTimeout(() => {
    saveMessage.value = ''
  }, 2000)
}

function saveSettings() {
  displayRef.value?.save()
  notificationsRef.value?.save()
  thresholdsRef.value?.save()
  securityRef.value?.save()
  showMessage('НАСТРОЙКИ СОХРАНЕНЫ')
}

function resetSettings() {
  displayRef.value?.reset()
  notificationsRef.value?.reset()
  thresholdsRef.value?.reset()
  securityRef.value?.reset()
  showMessage('НАСТРОЙКИ СБРОШЕНЫ')
}
</script>
