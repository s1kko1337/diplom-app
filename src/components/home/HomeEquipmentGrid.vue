<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row gap-3">
      <Input v-model="search" placeholder="Поиск по ID или модели..." class="sm:max-w-xs" />
      <Select v-model="statusFilter">
        <SelectTrigger class="sm:w-48">
          <SelectValue placeholder="Все статусы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="working">Работа</SelectItem>
          <SelectItem value="idle">Простой</SelectItem>
          <SelectItem value="malfunction">Авария</SelectItem>
          <SelectItem value="offline">Отключён</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <Card
        v-for="eq in filteredEquipment"
        :key="eq.id"
        class="group transition-colors hover:border-primary"
      >
        <RouterLink :to="{ name: 'equipment-detail', params: { id: eq.id } }" class="block">
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <CardTitle class="text-lg">{{ eq.id }}</CardTitle>
              <Badge :variant="eq.status === 'malfunction' ? 'destructive' : 'outline'">
                <span
                  class="inline-block h-2 w-2 rounded-full"
                  :class="STATUS_DOT_COLORS[eq.status]"
                />
                {{ STATUS_LABELS[eq.status] }}
              </Badge>
            </div>
            <CardDescription>{{ eq.fullModel || eq.model }}</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-3 gap-2 text-sm mb-3">
              <div>
                <div class="text-muted-foreground text-xs">Темп.</div>
                <div class="metric-value">{{ getSensor(eq.id, 'temp-engine') }} °C</div>
              </div>
              <div>
                <div class="text-muted-foreground text-xs">Обороты</div>
                <div class="metric-value">{{ getSensor(eq.id, 'speed') }} RPM</div>
              </div>
              <div>
                <div class="text-muted-foreground text-xs">Глубина</div>
                <div class="metric-value">{{ getSensor(eq.id, 'depth') }} м</div>
              </div>
            </div>

            <div
              v-if="getNextMaintenance(eq.id)"
              class="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3"
            >
              <WrenchIcon class="h-3.5 w-3.5 shrink-0" />
              <span>
                Следующее ТО: {{ getNextMaintenance(eq.id).type }} (через
                {{ getNextMaintenance(eq.id).hoursRemaining }} ч)
              </span>
            </div>
          </CardContent>
        </RouterLink>
      </Card>
    </div>

    <div v-if="filteredEquipment.length === 0" class="text-center text-muted-foreground py-8">
      Оборудование не найдено
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { WrenchIcon } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSensorsStore } from '@/stores/sensors'
import { useMaintenanceStore } from '@/stores/maintenance'
import { useEquipmentStore } from '@/stores/equipment'
import { STATUS_LABELS, STATUS_DOT_COLORS } from '@/utils/constants'

const props = defineProps({
  equipment: { type: Array, default: () => [] },
})

const sensorsStore = useSensorsStore()
const maintenanceStore = useMaintenanceStore()
const equipmentStore = useEquipmentStore()

const search = ref('')
const statusFilter = ref('all')

const filteredEquipment = computed(() => {
  let list = props.equipment

  if (statusFilter.value !== 'all') {
    list = list.filter((eq) => eq.status === statusFilter.value)
  }

  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (eq) =>
        eq.id.toLowerCase().includes(q) ||
        (eq.fullModel || eq.model || '').toLowerCase().includes(q),
    )
  }

  return list
})

function getSensor(equipmentId, sensorId) {
  const live = sensorsStore.getSensorValue(equipmentId, sensorId)
  if (live !== null) return live

  const detail = equipmentStore.getDetail(equipmentId)
  if (detail?.sensors) {
    const sensor = detail.sensors.find((s) => s.id === sensorId)
    return sensor?.currentValue ?? '—'
  }
  return '—'
}

function getNextMaintenance(equipmentId) {
  return maintenanceStore.getNextMaintenance(equipmentId)
}
</script>
