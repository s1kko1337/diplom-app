<template>
  <div class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1">
        <label class="text-xs text-muted-foreground">Период с</label>
        <Input
          type="date"
          :model-value="model.payload.periodFrom || ''"
          @update:model-value="setPayload('periodFrom', $event)"
        />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-muted-foreground">Период по</label>
        <Input
          type="date"
          :model-value="model.payload.periodTo || ''"
          @update:model-value="setPayload('periodTo', $event)"
        />
      </div>
    </div>

    <div class="space-y-1">
      <label class="text-xs text-muted-foreground">Заголовок *</label>
      <Input
        :model-value="model.title"
        placeholder="Сводка за ..."
        @update:model-value="set('title', $event)"
      />
    </div>

    <div class="space-y-1">
      <label class="text-xs text-muted-foreground">Краткое описание</label>
      <Textarea
        :model-value="model.summary"
        rows="2"
        @update:model-value="set('summary', $event)"
      />
    </div>

    <div class="space-y-2">
      <div class="text-xs uppercase text-muted-foreground">Метрики</div>
      <div class="grid gap-3 md:grid-cols-2">
        <div v-for="(label, key) in METRIC_LABELS" :key="key" class="space-y-1">
          <label class="text-xs text-muted-foreground">{{ label }}</label>
          <Input
            :model-value="metrics[key] ?? ''"
            @update:model-value="updateMetric(key, $event)"
          />
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-xs text-muted-foreground">Тренды</label>
        <Button type="button" size="sm" variant="outline" @click="addTrend">
          <Plus class="mr-1 size-4" />
          Добавить
        </Button>
      </div>
      <div v-if="!trends.length" class="text-xs text-muted-foreground">Трендов нет.</div>
      <div v-for="(t, i) in trends" :key="i" class="flex gap-2">
        <Select
          :model-value="t.metric || 'avgLoad'"
          @update:model-value="updateTrendMetric(i, $event)"
        >
          <SelectTrigger class="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="(label, key) in METRIC_LABELS" :key="key" :value="key">
              {{ label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Input
          :model-value="t.change || ''"
          placeholder="+3%"
          class="w-32"
          @update:model-value="updateTrendChange(i, $event)"
        />
        <Button type="button" size="icon" variant="ghost" @click="removeTrend(i)">
          <X class="size-4" />
        </Button>
      </div>
    </div>

    <div class="space-y-1">
      <label class="text-xs text-muted-foreground">Выводы</label>
      <Textarea
        :model-value="model.payload.conclusions || ''"
        rows="3"
        @update:model-value="setPayload('conclusions', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

const METRIC_LABELS = {
  avgLoad: 'Средняя загрузка, %',
  incidents: 'Инциденты',
  maintenances: 'ТО выполнено',
  downtime: 'Простой',
}

const props = defineProps({
  modelValue: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue'])

const model = computed(() => props.modelValue)
const metrics = computed(() => props.modelValue.payload.metrics || {})
const trends = computed(() => props.modelValue.payload.trends || [])

function set(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function setPayload(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    payload: { ...props.modelValue.payload, [key]: value },
  })
}

function updateMetric(key, value) {
  setPayload('metrics', { ...metrics.value, [key]: value })
}

function addTrend() {
  setPayload('trends', [...trends.value, { metric: 'avgLoad', change: '' }])
}

function updateTrendMetric(i, value) {
  const next = [...trends.value]
  next[i] = { ...next[i], metric: value }
  setPayload('trends', next)
}

function updateTrendChange(i, value) {
  const next = [...trends.value]
  next[i] = { ...next[i], change: value }
  setPayload('trends', next)
}

function removeTrend(i) {
  setPayload(
    'trends',
    trends.value.filter((_, idx) => idx !== i),
  )
}
</script>
