<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div v-for="threshold in thresholds" :key="threshold.key">
      <label class="text-xs mb-2 block text-muted-foreground">{{ threshold.label }}</label>
      <Input v-model="threshold.value" type="number" :step="threshold.step || 1" />
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { Input } from '@/components/ui/input'

const STORAGE_KEY = 'settings_thresholds'

const DEFAULTS = [
  { key: 'maxTemp', label: 'МАКСИМАЛЬНАЯ ТЕМПЕРАТУРА (°C)', value: 95, step: 1 },
  { key: 'maxVibration', label: 'МАКСИМАЛЬНАЯ ВИБРАЦИЯ (мм/с)', value: 1.5, step: 0.1 },
  { key: 'maxPower', label: 'МАКСИМАЛЬНАЯ МОЩНОСТЬ (%)', value: 95, step: 1 },
  { key: 'toolWear', label: 'ИЗНОС ИНСТРУМЕНТА — ПРЕДУПРЕЖДЕНИЕ (%)', value: 70, step: 1 },
  { key: 'minFuel', label: 'МИНИМАЛЬНЫЙ УРОВЕНЬ ТОПЛИВА (%)', value: 25, step: 1 },
  { key: 'maxPressure', label: 'МАКСИМАЛЬНОЕ ДАВЛЕНИЕ (БАР)', value: 150, step: 1 },
]

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const saved = loadSaved()

const thresholds = reactive(
  DEFAULTS.map((d) => ({
    ...d,
    value: saved[d.key] ?? d.value,
  })),
)

function save() {
  const data = {}
  for (const t of thresholds) {
    data[t.key] = Number(t.value)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function reset() {
  for (const t of thresholds) {
    const def = DEFAULTS.find((d) => d.key === t.key)
    t.value = def.value
  }
}

defineExpose({ save, reset })
</script>
