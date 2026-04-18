<template>
  <div class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1">
        <label class="text-xs text-muted-foreground">Дата</label>
        <Input
          type="date"
          :model-value="model.payload.date || ''"
          @update:model-value="setPayload('date', $event)"
        />
      </div>

      <div class="space-y-1">
        <label class="text-xs text-muted-foreground">Смена</label>
        <RadioGroup
          :model-value="model.payload.shift || 'day'"
          class="flex gap-4 pt-2"
          @update:model-value="setPayload('shift', $event)"
        >
          <label class="flex items-center gap-2 text-sm">
            <RadioGroupItem value="day" />
            Дневная
          </label>
          <label class="flex items-center gap-2 text-sm">
            <RadioGroupItem value="night" />
            Ночная
          </label>
        </RadioGroup>
      </div>
    </div>

    <div class="space-y-1">
      <label class="text-xs text-muted-foreground">Заголовок *</label>
      <Input
        :model-value="model.title"
        placeholder="Отчёт смены — ..."
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
      <div class="flex items-center justify-between">
        <label class="text-xs text-muted-foreground">Состояние оборудования</label>
        <Button type="button" size="sm" variant="outline" @click="addEquipment">
          <Plus class="mr-1 size-4" />
          Добавить
        </Button>
      </div>
      <div v-if="!equipmentStatus.length" class="text-xs text-muted-foreground">
        Добавьте станок, если хотите зафиксировать его состояние.
      </div>
      <div v-for="(item, i) in equipmentStatus" :key="i" class="flex gap-2">
        <Select :model-value="item.id || NONE" @update:model-value="updateEquipmentId(i, $event)">
          <SelectTrigger class="flex-1">
            <SelectValue placeholder="Станок" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="NONE">—</SelectItem>
            <SelectItem v-for="eq in equipmentList" :key="eq.id" :value="eq.id">
              {{ eq.id }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          :model-value="item.status || 'working'"
          @update:model-value="updateEquipmentStatus(i, $event)"
        >
          <SelectTrigger class="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">
              {{ label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" size="icon" variant="ghost" @click="removeEquipment(i)">
          <X class="size-4" />
        </Button>
      </div>
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-xs text-muted-foreground">Выполненные работы</label>
        <Button type="button" size="sm" variant="outline" @click="addWork">
          <Plus class="mr-1 size-4" />
          Добавить
        </Button>
      </div>
      <div v-if="!worksCompleted.length" class="text-xs text-muted-foreground">Пока работ нет.</div>
      <div v-for="(w, i) in worksCompleted" :key="i" class="flex gap-2">
        <Input :model-value="w" @update:model-value="updateWork(i, $event)" />
        <Button type="button" size="icon" variant="ghost" @click="removeWork(i)">
          <X class="size-4" />
        </Button>
      </div>
    </div>

    <div class="space-y-1">
      <label class="text-xs text-muted-foreground">Замечания</label>
      <Textarea
        :model-value="model.payload.issues || ''"
        rows="2"
        @update:model-value="setPayload('issues', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useEquipmentStore } from '@/stores/equipment'
import { STATUS_LABELS } from '@/utils/constants'

const NONE = '__none__'

const props = defineProps({
  modelValue: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue'])

const equipmentStore = useEquipmentStore()
const equipmentList = computed(() => equipmentStore.list)

onMounted(() => {
  if (!equipmentStore.list.length) equipmentStore.fetchList()
})

const model = computed(() => props.modelValue)
const equipmentStatus = computed(() => props.modelValue.payload.equipmentStatus || [])
const worksCompleted = computed(() => props.modelValue.payload.worksCompleted || [])

function set(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function setPayload(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    payload: { ...props.modelValue.payload, [key]: value },
  })
}

function addEquipment() {
  setPayload('equipmentStatus', [...equipmentStatus.value, { id: '', status: 'working' }])
}

function updateEquipmentId(i, value) {
  const next = [...equipmentStatus.value]
  next[i] = { ...next[i], id: value === NONE ? '' : value }
  setPayload('equipmentStatus', next)
}

function updateEquipmentStatus(i, value) {
  const next = [...equipmentStatus.value]
  next[i] = { ...next[i], status: value }
  setPayload('equipmentStatus', next)
}

function removeEquipment(i) {
  setPayload(
    'equipmentStatus',
    equipmentStatus.value.filter((_, idx) => idx !== i),
  )
}

function addWork() {
  setPayload('worksCompleted', [...worksCompleted.value, ''])
}

function updateWork(i, value) {
  const next = [...worksCompleted.value]
  next[i] = value
  setPayload('worksCompleted', next)
}

function removeWork(i) {
  setPayload(
    'worksCompleted',
    worksCompleted.value.filter((_, idx) => idx !== i),
  )
}
</script>
