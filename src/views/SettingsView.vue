<template>
  <div class="space-y-6">
    <!-- Заголовок -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl">НАСТРОЙКИ СИСТЕМЫ</h2>
        <div class="text-sm opacity-50 mt-1">Конфигурация системы мониторинга</div>
      </div>
      <div class="flex items-center gap-4">
        <button
          class="flex items-center gap-2 px-4 py-2 border border-border hover:bg-surface-2 transition-all duration-150"
        >
          <RefreshCw class="w-4 h-4" />
          <span class="text-sm">СБРОСИТЬ</span>
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 border-2 border-primary hover:bg-surface-2 transition-all duration-150"
        >
          <Save class="w-4 h-4" />
          <span class="text-sm">СОХРАНИТЬ</span>
        </button>
      </div>
    </div>

    <!-- Отображение -->
    <div class="bg-surface-1 border-2 border-border p-6">
      <div class="flex items-center gap-3 mb-6">
        <Eye class="w-5 h-5" />
        <label class="text-xs">ОТОБРАЖЕНИЕ</label>
      </div>

      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="text-xs mb-2 block opacity-70">ТЕМА ИНТЕРФЕЙСА</label>
            <div class="flex gap-2">
              <button
                class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-all duration-150"
                :class="
                  theme === 'dark'
                    ? 'border-2 border-primary bg-surface-2'
                    : 'border border-border hover:bg-surface-2'
                "
                @click="applyTheme('dark')"
              >
                <Moon class="w-4 h-4" /> ТЁМНАЯ
              </button>
              <button
                class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-all duration-150"
                :class="
                  theme === 'light'
                    ? 'border-2 border-primary bg-surface-2'
                    : 'border border-border hover:bg-surface-2'
                "
                @click="applyTheme('light')"
              >
                <Sun class="w-4 h-4" /> СВЕТЛАЯ
              </button>
            </div>
          </div>
          <div>
            <label class="text-xs mb-2 block opacity-70">ЯЗЫК ИНТЕРФЕЙСА</label>
            <select class="w-full px-4 py-3 bg-surface-2 border border-border text-sm">
              <option>Русский</option>
              <option>English</option>
              <option>中文</option>
            </select>
          </div>
        </div>

        <div>
          <label class="text-xs mb-2 block opacity-70">ЧАСТОТА ОБНОВЛЕНИЯ ДАННЫХ</label>
          <div class="flex items-center gap-4">
            <input
              v-model="refreshRate"
              type="range"
              min="1"
              max="60"
              class="flex-1 h-2 bg-surface-2 border border-border accent-primary"
            />
            <div class="metric-value text-sm w-16 text-right">{{ refreshRate }} СЕК</div>
          </div>
        </div>

        <SettingsToggle
          label="Автоматическое обновление"
          description="Обновлять данные в реальном времени"
          :model-value="true"
        />
        <SettingsToggle
          label="Показывать метки времени"
          description="Отображать временные метки на графиках"
          :model-value="false"
        />
        <SettingsToggle
          label="Компактный режим"
          description="Уменьшить размер виджетов"
          :model-value="false"
        />
      </div>
    </div>

    <!-- Уведомления -->
    <div class="bg-surface-1 border-2 border-border p-6">
      <div class="flex items-center gap-3 mb-6">
        <Bell class="w-5 h-5" />
        <label class="text-xs">УВЕДОМЛЕНИЯ</label>
      </div>
      <div class="space-y-4">
        <SettingsToggle
          label="Критические алерты"
          description="Звуковые и визуальные уведомления"
          :model-value="true"
        />
        <SettingsToggle
          label="Предупреждения"
          description="Уведомления о превышении порогов"
          :model-value="true"
        />
        <SettingsToggle
          label="Информационные сообщения"
          description="Уведомления о плановых событиях"
          :model-value="false"
        />
        <SettingsToggle
          label="Email-уведомления"
          description="Отправлять алерты на email"
          :model-value="true"
        />
        <div>
          <label class="text-xs mb-2 block opacity-70">EMAIL ДЛЯ УВЕДОМЛЕНИЙ</label>
          <input
            type="email"
            placeholder="admin@rudgormash.ru"
            class="w-full px-4 py-3 bg-surface-2 border border-border text-sm metric-value"
          />
        </div>
      </div>
    </div>

    <!-- Пороговые значения -->
    <div class="bg-surface-1 border-2 border-border p-6">
      <div class="flex items-center gap-3 mb-6">
        <Database class="w-5 h-5" />
        <label class="text-xs">ПОРОГОВЫЕ ЗНАЧЕНИЯ</label>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="threshold in thresholds" :key="threshold.label">
          <label class="text-xs mb-2 block opacity-70">{{ threshold.label }}</label>
          <input
            type="number"
            :value="threshold.value"
            :step="threshold.step || 1"
            class="w-full px-4 py-3 bg-surface-2 border border-border text-sm metric-value"
          />
        </div>
      </div>
    </div>

    <!-- Безопасность -->
    <div class="bg-surface-1 border-2 border-border p-6">
      <div class="flex items-center gap-3 mb-6">
        <Shield class="w-5 h-5" />
        <label class="text-xs">БЕЗОПАСНОСТЬ</label>
      </div>
      <div class="space-y-6">
        <div>
          <label class="text-xs mb-2 block opacity-70">ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ</label>
          <div class="px-4 py-3 bg-surface-2 border border-border text-sm metric-value">
            ADMIN &bull; Администратор системы
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            class="px-4 py-3 border border-border hover:bg-surface-2 text-sm transition-all duration-150"
          >
            СМЕНИТЬ ПАРОЛЬ
          </button>
          <button
            class="px-4 py-3 border border-border hover:bg-surface-2 text-sm transition-all duration-150"
          >
            ЖУРНАЛ ДОСТУПА
          </button>
        </div>
        <SettingsToggle
          label="Двухфакторная аутентификация"
          description="Дополнительная защита входа"
          :model-value="true"
          class="border-t border-border"
        />
      </div>
    </div>

    <!-- Информация о системе -->
    <div class="bg-surface-1 border-2 border-border p-6">
      <label class="text-xs mb-4 block">ИНФОРМАЦИЯ О СИСТЕМЕ</label>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div
          v-for="info in systemInfo"
          :key="info.label"
          class="flex justify-between py-2 border-b border-border last:border-0"
        >
          <span class="opacity-70">{{ info.label }}</span>
          <span class="metric-value">{{ info.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Save, RefreshCw, Bell, Eye, Database, Shield, Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'
import SettingsToggle from '@/components/SettingsToggle.vue'

const { theme, applyTheme } = useTheme()
const refreshRate = ref(5)

const thresholds = [
  { label: 'МАКСИМАЛЬНАЯ ТЕМПЕРАТУРА (°C)', value: 95 },
  { label: 'МАКСИМАЛЬНАЯ ВИБРАЦИЯ (мм/с)', value: 1.5, step: 0.1 },
  { label: 'МАКСИМАЛЬНАЯ МОЩНОСТЬ (%)', value: 95 },
  { label: 'ИЗНОС ИНСТРУМЕНТА - ПРЕДУПРЕЖДЕНИЕ (%)', value: 70 },
  { label: 'МИНИМАЛЬНЫЙ УРОВЕНЬ ТОПЛИВА (%)', value: 25 },
  { label: 'МАКСИМАЛЬНОЕ ДАВЛЕНИЕ (БАР)', value: 150 },
]

const systemInfo = [
  { label: 'Версия системы', value: 'v2.4.1' },
  { label: 'Дата установки', value: '2024-11-15' },
  { label: 'Последнее обновление', value: '2026-02-10' },
  { label: 'Лицензия', value: 'Корпоративная' },
  { label: 'Подключённых устройств', value: '18' },
  { label: 'Время работы системы', value: '47д 12ч 34м' },
]
</script>

<style scoped></style>
