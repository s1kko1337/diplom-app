<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="text-xs mb-2 block text-muted-foreground">ТЕМА ИНТЕРФЕЙСА</label>
        <div class="flex gap-2">
          <Button
            :variant="theme === 'dark' ? 'default' : 'outline'"
            class="flex-1"
            @click="handleDarkTheme"
          >
            <Moon class="w-4 h-4" />
            ТЁМНАЯ
          </Button>
          <Button
            :variant="theme === 'light' ? 'default' : 'outline'"
            class="flex-1"
            @click="handleLightTheme"
          >
            <Sun class="w-4 h-4" />
            СВЕТЛАЯ
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
import { ref } from 'vue'
import { Moon, Sun } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const STORAGE_KEY = 'settings_display'

const { theme, applyTheme } = useTheme()

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const saved = loadSaved()

const language = ref(saved.language || 'ru')
const refreshRate = ref(saved.refreshRate ?? 5)
const autoUpdate = ref(saved.autoUpdate ?? true)
const showTimestamps = ref(saved.showTimestamps ?? false)
const compactMode = ref(saved.compactMode ?? false)

function handleDarkTheme() {
  applyTheme('dark')
}

function handleLightTheme() {
  applyTheme('light')
}

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      language: language.value,
      refreshRate: refreshRate.value,
      autoUpdate: autoUpdate.value,
      showTimestamps: showTimestamps.value,
      compactMode: compactMode.value,
    }),
  )
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
