<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="text-xs mb-2 block text-muted-foreground">ТЕМА ИНТЕРФЕЙСА</label>
        <div class="grid grid-cols-2 gap-2">
          <Button
            v-for="t in themes"
            :key="t.value"
            :variant="theme === t.value ? 'default' : 'outline'"
            :title="t.description"
            :aria-pressed="theme === t.value"
            class="justify-start"
            @click="applyTheme(t.value)"
          >
            <component :is="t.icon" class="w-4 h-4" />
            {{ t.label }}
          </Button>
        </div>
      </div>
      <div>
        <label class="text-xs mb-2 block text-muted-foreground">ЯЗЫК ИНТЕРФЕЙСА</label>
        <Select v-model="language">
          <SelectTrigger>
            <SelectValue placeholder="Выберите язык" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ru">Русский</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="zh">中文</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div>
      <label class="text-xs mb-2 block text-muted-foreground">ЧАСТОТА ОБНОВЛЕНИЯ ДАННЫХ</label>
      <div class="flex items-center gap-4">
        <input
          v-model="refreshRate"
          type="range"
          min="1"
          max="60"
          class="flex-1 h-2 bg-muted accent-primary"
        />
        <div class="metric-value text-sm w-16 text-right">{{ refreshRate }} СЕК</div>
      </div>
    </div>

    <div class="flex items-center justify-between py-3 border-b border-border">
      <div>
        <div class="text-sm mb-1">Автоматическое обновление</div>
        <div class="text-xs text-muted-foreground">Обновлять данные в реальном времени</div>
      </div>
      <Switch v-model="autoUpdate" />
    </div>

    <div class="flex items-center justify-between py-3 border-b border-border">
      <div>
        <div class="text-sm mb-1">Показывать метки времени</div>
        <div class="text-xs text-muted-foreground">Отображать временные метки на графиках</div>
      </div>
      <Switch v-model="showTimestamps" />
    </div>

    <div class="flex items-center justify-between py-3">
      <div>
        <div class="text-sm mb-1">Компактный режим</div>
        <div class="text-xs text-muted-foreground">Уменьшить размер виджетов</div>
      </div>
      <Switch v-model="compactMode" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { usePreferencesStore } from '@/stores/preferences'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const preferences = usePreferencesStore()
const { theme, themes, applyTheme } = useTheme()

const language = ref(preferences.display.language)
const refreshRate = ref(preferences.display.refreshRate)
const autoUpdate = ref(preferences.display.autoUpdate)
const showTimestamps = ref(preferences.display.showTimestamps)
const compactMode = ref(preferences.display.compactMode)

watch(
  () => preferences.display,
  (val) => {
    language.value = val.language
    refreshRate.value = val.refreshRate
    autoUpdate.value = val.autoUpdate
    showTimestamps.value = val.showTimestamps
    compactMode.value = val.compactMode
  },
  { deep: true },
)

async function save() {
  await preferences.save('display', {
    language: language.value,
    refreshRate: refreshRate.value,
    autoUpdate: autoUpdate.value,
    showTimestamps: showTimestamps.value,
    compactMode: compactMode.value,
  })
}

function reset() {
  language.value = 'ru'
  refreshRate.value = 5
  autoUpdate.value = true
  showTimestamps.value = false
  compactMode.value = false
  applyTheme('dark')
}

defineExpose({ save, reset })
</script>
