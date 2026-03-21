<template>
  <div class="space-y-6">
    <!-- Horizontal maintenance scale -->
    <Card>
      <CardHeader>
        <CardTitle class="text-xs">ГРАФИК ОБСЛУЖИВАНИЯ</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="relative">
          <!-- Scale labels -->
          <div class="flex justify-between text-xs metric-value mb-2">
            <span
              v-for="step in scaleSteps"
              :key="step.type"
              class="text-center"
              :class="{ 'text-primary font-bold': isCurrentStep(step) }"
            >
              {{ step.type }}
              <div class="opacity-50">{{ step.hours ? step.hours + 'ч' : '' }}</div>
            </span>
          </div>
          <!-- Progress bar -->
          <div class="relative h-3 bg-surface-2 border border-border rounded-full">
            <div
              class="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300"
              :style="{ width: scaleProgress + '%' }"
            />
            <!-- Current position marker -->
            <div
              class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background shadow-md"
              :style="{ left: `calc(${scaleProgress}% - 8px)` }"
            />
          </div>
          <div class="mt-2 text-xs opacity-50 metric-value text-center">
            Наработка: {{ equipment.operatingHours }} ч
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Next maintenance progress -->
    <Card v-if="nextMaintenance">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="text-xs">СЛЕДУЮЩЕЕ ОБСЛУЖИВАНИЕ</CardTitle>
          <Badge variant="outline">{{ nextMaintenance.type }}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="opacity-70"> До {{ nextMaintenance.type }} осталось </span>
            <span class="metric-value font-bold">{{ nextMaintenance.hoursRemaining }} ч</span>
          </div>
          <div class="relative h-3 bg-surface-2 border border-border rounded-full">
            <div
              class="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
              :class="nextProgressClass"
              :style="{ width: nextProgress + '%' }"
            />
          </div>
          <div class="flex justify-between text-xs opacity-50 metric-value">
            <span>0%</span>
            <span>{{ nextProgress.toFixed(0) }}% выполнено</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Upcoming scheduled maintenance -->
    <Card v-if="scheduleItems.length > 0">
      <CardHeader>
        <CardTitle class="text-xs">ЗАПЛАНИРОВАННЫЕ РАБОТЫ</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div
            v-for="item in scheduleItems"
            :key="item.scheduledDate + item.type"
            class="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <div class="flex items-center gap-3">
              <Badge :variant="item.status === 'overdue' ? 'destructive' : 'outline'">
                {{ item.type }}
              </Badge>
              <span class="text-sm">{{ item.scheduledDate }}</span>
            </div>
            <span class="metric-value text-sm opacity-50">{{ item.scheduledHours }} ч</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Checklist -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="text-xs">ЧЕКЛИСТ ОБСЛУЖИВАНИЯ</CardTitle>
          <div class="flex items-center gap-2">
            <label class="text-xs opacity-50">ТИП:</label>
            <Select v-model="selectedChecklistType">
              <SelectTrigger class="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="t in checklistTypes" :key="t" :value="t">
                  {{ t }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="maintenanceStore.loading" class="text-center py-6 opacity-50">
          <LoadingSpinner />
        </div>
        <div
          v-else-if="maintenanceStore.checklist.length === 0"
          class="text-center py-6 text-sm opacity-40"
        >
          ВЫБЕРИТЕ ТИП ОБСЛУЖИВАНИЯ
        </div>
        <div v-else class="space-y-2">
          <div class="flex items-center justify-between mb-3 text-xs opacity-50">
            <span>Выполнено: {{ completedCount }} / {{ maintenanceStore.checklist.length }}</span>
            <span class="metric-value">{{ completedPercent }}%</span>
          </div>
          <div class="relative h-2 bg-surface-2 border border-border rounded-full mb-4">
            <div
              class="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300"
              :style="{ width: completedPercent + '%' }"
            />
          </div>
          <div
            v-for="item in maintenanceStore.checklist"
            :key="item.id"
            class="flex items-start gap-3 py-3 border-b border-border last:border-0"
          >
            <input
              type="checkbox"
              :checked="item.completed"
              class="mt-1 w-4 h-4 accent-primary cursor-pointer"
              @change="handleToggleItem(item.id)"
            />
            <div class="flex-1">
              <div class="text-sm" :class="{ 'line-through opacity-50': item.completed }">
                {{ item.description }}
              </div>
              <div class="text-xs opacity-50 mt-1">{{ item.requirement }}</div>
              <div v-if="item.tools" class="text-xs opacity-40 mt-0.5 metric-value">
                {{ item.tools }}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useMaintenanceStore } from '@/stores/maintenance'
import { MAINTENANCE_SCHEDULE } from '@/utils/constants'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const props = defineProps({
  equipmentId: { type: String, required: true },
  equipment: { type: Object, required: true },
})

const maintenanceStore = useMaintenanceStore()

const selectedChecklistType = ref('ЕО')
const checklistTypes = Object.keys(MAINTENANCE_SCHEDULE)

// Maintenance scale
const scaleSteps = computed(() => {
  return Object.entries(MAINTENANCE_SCHEDULE).map(([type, data]) => ({
    type,
    hours: data.hours,
  }))
})

const scaleProgress = computed(() => {
  const hours = props.equipment.operatingHours || 0
  const cycleHours = hours % 20000
  return Math.min((cycleHours / 20000) * 100, 100)
})

function isCurrentStep(step) {
  if (!step.hours) return false
  const hours = props.equipment.operatingHours || 0
  const cycleHours = hours % 20000
  const sortedSteps = scaleSteps.value
    .filter((s) => s.hours !== null)
    .sort((a, b) => a.hours - b.hours)
  const nextStep = sortedSteps.find((s) => s.hours > cycleHours)
  const prevStep = sortedSteps.filter((s) => s.hours <= cycleHours).pop()
  return step.type === prevStep?.type || step.type === nextStep?.type
}

// Next maintenance
const nextMaintenance = computed(() => maintenanceStore.getNextMaintenance(props.equipmentId))

const nextProgress = computed(() => {
  if (!nextMaintenance.value) return 0
  const total = nextMaintenance.value.hoursRemaining
  // Estimate progress as how far we are toward the next threshold
  const scheduleEntry = MAINTENANCE_SCHEDULE[nextMaintenance.value.type]
  if (!scheduleEntry?.hours) return 0
  const passed = scheduleEntry.hours - total
  return Math.min((passed / scheduleEntry.hours) * 100, 100)
})

const nextProgressClass = computed(() => {
  if (nextMaintenance.value && nextMaintenance.value.hoursRemaining < 100) {
    return 'bg-status-critical-bg'
  }
  if (nextMaintenance.value && nextMaintenance.value.hoursRemaining < 300) {
    return 'bg-primary opacity-80'
  }
  return 'bg-primary'
})

// Schedule
const scheduleItems = ref([])

// Checklist
const completedCount = computed(() => maintenanceStore.checklist.filter((i) => i.completed).length)

const completedPercent = computed(() => {
  if (maintenanceStore.checklist.length === 0) return 0
  return Math.round((completedCount.value / maintenanceStore.checklist.length) * 100)
})

function handleToggleItem(itemId) {
  maintenanceStore.toggleChecklistItem(props.equipmentId, itemId)
}

watch(
  selectedChecklistType,
  (type) => {
    if (type) {
      maintenanceStore.loadChecklist(props.equipmentId, type)
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await maintenanceStore.loadSchedule(props.equipmentId)
  scheduleItems.value = maintenanceStore.schedule[props.equipmentId] || []
})
</script>
