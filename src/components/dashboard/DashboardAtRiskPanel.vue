<template>
  <Card>
    <CardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <CardTitle class="text-sm font-medium flex items-center gap-2">
          <TriangleAlert class="w-4 h-4 text-status-warning" />
          Требуют внимания
        </CardTitle>
        <Badge variant="outline" class="text-xs">{{ atRisk.length }}</Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div
        v-if="atRisk.length === 0"
        class="flex items-center gap-2 py-4 text-sm text-status-success"
      >
        <CheckCircle2 class="w-4 h-4" />
        Все станки в пределах нормы
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <RouterLink
          v-for="m in atRisk"
          :key="m.id"
          :to="{ name: 'equipment-detail', params: { id: m.id } }"
          class="block rounded-md border p-3 transition-colors hover:border-primary"
          :class="m.worst === 'critical' ? 'border-status-critical/40' : 'border-border'"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold text-sm metric-value">{{ m.id }}</span>
            <Badge :variant="m.worst === 'critical' ? 'destructive' : 'outline'" class="text-xs">
              {{ m.worst === 'critical' ? 'Критично' : m.worst === 'warning' ? 'Внимание' : 'Близко к пределу' }}
            </Badge>
          </div>
          <ul class="space-y-1">
            <li
              v-for="f in m.flags"
              :key="f.id"
              class="flex items-center justify-between text-xs"
            >
              <span class="text-muted-foreground truncate mr-2">{{ f.label }}</span>
              <span class="metric-value font-medium" :class="levelClass(f.level)">
                {{ f.value }} {{ f.unit }}
              </span>
            </li>
          </ul>
        </RouterLink>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { TriangleAlert, CheckCircle2 } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEquipmentStore } from '@/stores/equipment'

const equipmentStore = useEquipmentStore()

// Датчики, для которых опасно НИЗКОЕ значение (порог — нижняя граница).
const LOW_IS_BAD = new Set(['oil-level'])
const LEVEL_RANK = { critical: 3, warning: 2, near: 1 }

function evalSensor(sensor) {
  const t = sensor.thresholds
  if (!t) return null
  const v = sensor.currentValue
  if (LOW_IS_BAD.has(sensor.id)) {
    if (t.critical != null && v <= t.critical) return 'critical'
    if (t.warning != null && v <= t.warning) return 'warning'
    if (t.warning != null && v <= t.warning * 1.15) return 'near'
    return null
  }
  if (t.critical != null && v >= t.critical) return 'critical'
  if (t.warning != null && v >= t.warning) return 'warning'
  if (t.warning != null && v >= t.warning * 0.9) return 'near'
  return null
}

const atRisk = computed(() => {
  const result = []
  for (const eq of equipmentStore.list) {
    if (eq.status === 'offline') continue
    const detail = equipmentStore.getDetail(eq.id)
    if (!detail?.sensors) continue

    const flags = []
    for (const sensor of detail.sensors) {
      const level = evalSensor(sensor)
      if (level) {
        flags.push({
          id: sensor.id,
          label: sensor.label,
          value: sensor.currentValue,
          unit: sensor.unit,
          level,
        })
      }
    }
    if (flags.length === 0) continue

    flags.sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level])
    const worst = flags[0].level
    result.push({ id: eq.id, status: eq.status, flags, worst, rank: LEVEL_RANK[worst] })
  }
  // Сначала самые проблемные, затем по количеству отклонений.
  return result.sort((a, b) => b.rank - a.rank || b.flags.length - a.flags.length)
})

function levelClass(level) {
  if (level === 'critical') return 'text-status-critical'
  if (level === 'warning') return 'text-status-warning'
  return 'text-muted-foreground'
}
</script>
