<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-xs">ИСТОРИЧЕСКИЕ ДАННЫЕ ДАТЧИКОВ</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-end gap-4 mb-4">
        <div class="sm:col-span-2 lg:col-auto">
          <label class="text-xs opacity-50 mb-1 block">ДАТЧИК</label>
          <Select v-model="historySensorId">
            <SelectTrigger class="w-full lg:w-[240px]">
              <SelectValue placeholder="Выберите датчик" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="s in sensors" :key="s.id" :value="s.id">
                {{ s.label }} ({{ s.unit }})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label class="text-xs opacity-50 mb-1 block">ОТ</label>
          <Input v-model="historyFrom" type="date" class="w-full lg:w-[160px]" />
        </div>
        <div>
          <label class="text-xs opacity-50 mb-1 block">ДО</label>
          <Input v-model="historyTo" type="date" class="w-full lg:w-[160px]" />
        </div>
        <Button
          variant="outline"
          class="min-h-[44px] sm:min-h-0 sm:col-span-2 lg:col-auto"
          @click="loadHistory"
        >
          ЗАГРУЗИТЬ
        </Button>
      </div>

      <div v-if="historyLoading" class="text-center py-8 opacity-50">
        <LoadingSpinner />
      </div>
      <div v-else-if="historyData.length === 0" class="text-center py-8 text-sm opacity-40">
        НЕТ ДАННЫХ. ВЫБЕРИТЕ ДАТЧИК И ПЕРИОД
      </div>
      <div v-else>
        <ChartWidget
          :title="historyChartTitle"
          :data="historyChartData"
          :unit="historySensorUnit"
          :height="320"
        />
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getHistory } from '@/api/sensors'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ChartWidget from '@/components/ChartWidget.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const props = defineProps({
  equipmentId: { type: String, required: true },
  sensors: { type: Array, default: () => [] },
})

const historySensorId = ref('temp-engine')
const historyFrom = ref('2026-02-23')
const historyTo = ref('2026-02-24')
const historyData = ref([])
const historyLoading = ref(false)

const historySensorUnit = computed(() => {
  const s = props.sensors.find((sensor) => sensor.id === historySensorId.value)
  return s?.unit || ''
})

const historyChartTitle = computed(() => {
  const s = props.sensors.find((sensor) => sensor.id === historySensorId.value)
  return s ? `${s.label} (${s.unit})` : ''
})

const historyChartData = computed(() =>
  historyData.value.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    value: d.value,
  })),
)

async function loadHistory() {
  historyLoading.value = true
  try {
    historyData.value = await getHistory(props.equipmentId, historySensorId.value, {
      from: historyFrom.value,
      to: historyTo.value,
    })
  } finally {
    historyLoading.value = false
  }
}
</script>
