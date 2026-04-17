<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div v-for="meta in METADATA" :key="meta.key">
      <label class="text-xs mb-2 block text-muted-foreground">{{ meta.label }}</label>
      <Input v-model="values[meta.key]" type="number" :step="meta.step" />
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { usePreferencesStore } from '@/stores/preferences'
import { Input } from '@/components/ui/input'

const METADATA = [
  { key: 'maxTemp', label: 'МАКСИМАЛЬНАЯ ТЕМПЕРАТУРА (°C)', step: 1 },
  { key: 'maxVibration', label: 'МАКСИМАЛЬНАЯ ВИБРАЦИЯ (мм/с)', step: 0.1 },
  { key: 'maxPower', label: 'МАКСИМАЛЬНАЯ МОЩНОСТЬ (%)', step: 1 },
  { key: 'toolWear', label: 'ИЗНОС ИНСТРУМЕНТА — ПРЕДУПРЕЖДЕНИЕ (%)', step: 1 },
  { key: 'minFuel', label: 'МИНИМАЛЬНЫЙ УРОВЕНЬ ТОПЛИВА (%)', step: 1 },
  { key: 'maxPressure', label: 'МАКСИМАЛЬНОЕ ДАВЛЕНИЕ (БАР)', step: 1 },
]

const preferences = usePreferencesStore()

const values = reactive({ ...preferences.thresholds })

watch(
  () => preferences.thresholds,
  (val) => {
    for (const key of Object.keys(val)) {
      values[key] = val[key]
    }
  },
  { deep: true },
)

async function save() {
  const data = {}
  for (const meta of METADATA) {
    data[meta.key] = Number(values[meta.key])
  }
  await preferences.save('thresholds', data)
}

function reset() {
  const defaults = {
    maxTemp: 95,
    maxVibration: 1.5,
    maxPower: 95,
    toolWear: 70,
    minFuel: 25,
    maxPressure: 150,
  }
  for (const key of Object.keys(defaults)) {
    values[key] = defaults[key]
  }
}

defineExpose({ save, reset })
</script>
