<template>
  <div class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1">
        <label class="text-xs text-muted-foreground">Оборудование</label>
        <Select :model-value="model.equipmentId || NONE" @update:model-value="setEquipment">
          <SelectTrigger>
            <SelectValue placeholder="Не указано" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="NONE">Не указано</SelectItem>
            <SelectItem v-for="eq in equipmentList" :key="eq.id" :value="eq.id">
              {{ eq.id }} — {{ eq.name || eq.model || '' }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-1">
        <label class="text-xs text-muted-foreground">Уведомление (ID)</label>
        <Input
          :model-value="model.alertId || ''"
          placeholder="A-001"
          @update:model-value="set('alertId', $event || null)"
        />
      </div>
    </div>

    <div class="space-y-1">
      <label class="text-xs text-muted-foreground">Заголовок *</label>
      <Input
        :model-value="model.title"
        placeholder="Краткое описание инцидента"
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

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1">
        <label class="text-xs text-muted-foreground">Серьёзность</label>
        <Select
          :model-value="model.payload.severity || 'warning'"
          @update:model-value="setPayload('severity', $event)"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="critical">Критический</SelectItem>
            <SelectItem value="warning">Предупреждение</SelectItem>
            <SelectItem value="info">Информация</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-1">
        <label class="text-xs text-muted-foreground">Простой</label>
        <Input
          :model-value="model.payload.downtime || ''"
          placeholder="2ч 15мин"
          @update:model-value="setPayload('downtime', $event)"
        />
      </div>
    </div>

    <div class="space-y-1">
      <label class="text-xs text-muted-foreground">Причина</label>
      <Textarea
        :model-value="model.payload.rootCause || ''"
        rows="3"
        @update:model-value="setPayload('rootCause', $event)"
      />
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-xs text-muted-foreground">Выполненные действия</label>
        <Button type="button" size="sm" variant="outline" @click="addAction">
          <Plus class="mr-1 size-4" />
          Добавить
        </Button>
      </div>
      <div v-if="!actions.length" class="text-xs text-muted-foreground">
        Список пуст. Добавьте хотя бы одно действие.
      </div>
      <div v-for="(a, i) in actions" :key="i" class="flex gap-2">
        <Input
          :model-value="a"
          placeholder="Действие"
          @update:model-value="updateAction(i, $event)"
        />
        <Button type="button" size="icon" variant="ghost" @click="removeAction(i)">
          <X class="size-4" />
        </Button>
      </div>
    </div>

    <div class="space-y-1">
      <label class="text-xs text-muted-foreground">Рекомендации</label>
      <Textarea
        :model-value="model.payload.recommendations || ''"
        rows="2"
        @update:model-value="setPayload('recommendations', $event)"
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useEquipmentStore } from '@/stores/equipment'

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
const actions = computed(() => props.modelValue.payload.actions || [])

function set(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function setPayload(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    payload: { ...props.modelValue.payload, [key]: value },
  })
}

function setEquipment(val) {
  set('equipmentId', val === NONE ? null : val)
}

function addAction() {
  setPayload('actions', [...actions.value, ''])
}

function updateAction(i, value) {
  const next = [...actions.value]
  next[i] = value
  setPayload('actions', next)
}

function removeAction(i) {
  setPayload(
    'actions',
    actions.value.filter((_, idx) => idx !== i),
  )
}
</script>
