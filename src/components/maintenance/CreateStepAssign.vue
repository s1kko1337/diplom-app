<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="space-y-2">
        <label class="text-sm font-medium">Механик</label>
        <Select :model-value="modelValue.assignedTo" @update:model-value="updateAssignedTo">
          <SelectTrigger>
            <SelectValue placeholder="Выберите механика" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="mechanic in mechanics" :key="mechanic.id" :value="mechanic.id">
              {{ mechanic.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Плановая дата</label>
        <Input
          type="date"
          :model-value="modelValue.scheduledDate || ''"
          @update:model-value="updateScheduledDate($event)"
        />
      </div>
    </div>

    <Card class="bg-muted/40">
      <CardHeader class="pb-2">
        <CardTitle class="text-sm">Сводка</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Оборудование:</span>
          <span class="font-medium">
            {{ equipment ? `${equipment.id} — ${equipment.model}` : '—' }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Тип ТО:</span>
          <span class="font-medium">{{ type || '—' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Шагов в чек-листе:</span>
          <span class="font-medium">{{ stepsCount }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Механик:</span>
          <span class="font-medium">{{ selectedMechanicName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Плановая дата:</span>
          <span class="font-medium">{{ modelValue.scheduledDate || '—' }}</span>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getUsersByRole } from '@/api/users'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  equipment: {
    type: Object,
    default: null,
  },
  type: {
    type: String,
    default: '',
  },
  stepsCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue'])

const mechanics = ref([])

const selectedMechanicName = computed(() => {
  if (!props.modelValue.assignedTo) return '—'
  return mechanics.value.find((m) => m.id === props.modelValue.assignedTo)?.name || '—'
})

function updateAssignedTo(value) {
  emit('update:modelValue', { ...props.modelValue, assignedTo: value })
}

function updateScheduledDate(value) {
  emit('update:modelValue', { ...props.modelValue, scheduledDate: value || null })
}

onMounted(async () => {
  mechanics.value = await getUsersByRole('mechanic')
})
</script>

<style scoped></style>
