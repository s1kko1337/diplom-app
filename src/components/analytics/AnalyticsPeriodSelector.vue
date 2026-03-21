<template>
  <div class="flex items-center gap-3">
    <Select :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
      <SelectTrigger class="w-44">
        <SelectValue placeholder="Период" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="p in periods" :key="p.value" :value="p.value">
          {{ p.label }}
        </SelectItem>
      </SelectContent>
    </Select>

    <Button variant="outline" @click="handleExport">
      <Download class="w-4 h-4" />
      Экспорт PDF
    </Button>
  </div>
</template>

<script setup>
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

defineProps({
  modelValue: { type: String, required: true },
})

defineEmits(['update:modelValue'])

const periods = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: '3months', label: '3 месяца' },
  { value: '6months', label: '6 месяцев' },
  { value: 'year', label: 'Год' },
]

function handleExport() {
  alert('Функция будет доступна после интеграции API')
}
</script>
