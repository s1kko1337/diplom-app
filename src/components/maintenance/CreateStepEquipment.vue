<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="space-y-2">
        <label class="text-sm font-medium">Оборудование</label>
        <Select :model-value="modelValue.equipmentId" @update:model-value="updateEquipmentId">
          <SelectTrigger>
            <SelectValue placeholder="Выберите оборудование" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="e in equipmentStore.list" :key="e.id" :value="e.id">
              {{ e.id }} — {{ e.model }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Тип ТО</label>
        <Select :model-value="modelValue.type" @update:model-value="updateType">
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип ТО" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="typeKey in maintenanceTypes" :key="typeKey" :value="typeKey">
              {{ typeKey }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <Card v-if="modelValue.equipmentId && modelValue.type" class="bg-muted/40">
      <CardHeader class="pb-2">
        <CardTitle class="text-sm">Информация об оборудовании</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Наработка:</span>
          <span class="font-medium">{{ operatingHours }} ч</span>
        </div>
        <template v-if="nextMaintenance">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Следующее ТО:</span>
            <span class="font-medium">{{ nextMaintenance.type }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Осталось часов:</span>
            <span class="font-medium">{{ nextMaintenance.hoursRemaining }} ч</span>
          </div>
        </template>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEquipmentStore } from '@/stores/equipment'
import { useMaintenanceStore } from '@/stores/maintenance'
import { MAINTENANCE_SCHEDULE } from '@/utils/constants'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const route = useRoute()
const equipmentStore = useEquipmentStore()
const maintenanceStore = useMaintenanceStore()

const maintenanceTypes = Object.keys(MAINTENANCE_SCHEDULE)

const operatingHours = computed(
  () => equipmentStore.getDetail(props.modelValue.equipmentId)?.operatingHours ?? '—',
)

const nextMaintenance = computed(() =>
  props.modelValue.equipmentId
    ? maintenanceStore.getNextMaintenance(props.modelValue.equipmentId)
    : null,
)

function updateEquipmentId(value) {
  emit('update:modelValue', { ...props.modelValue, equipmentId: value })
}

function updateType(value) {
  emit('update:modelValue', { ...props.modelValue, type: value })
}

onMounted(async () => {
  if (equipmentStore.list.length === 0) {
    await equipmentStore.fetchList()
  }
  if (route.query.equipmentId) {
    emit('update:modelValue', {
      ...props.modelValue,
      equipmentId: route.query.equipmentId,
    })
    if (!equipmentStore.getDetail(route.query.equipmentId)) {
      await equipmentStore.fetchById(route.query.equipmentId)
    }
  }
})
</script>

<style scoped></style>
