<template>
  <div class="space-y-4">
    <div v-for="(item, index) in modelValue" :key="item.id">
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">Шаг {{ index + 1 }}</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="space-y-1">
            <label class="text-xs text-muted-foreground">Описание</label>
            <Input
              :model-value="item.description"
              placeholder="Описание шага"
              @update:model-value="updateField(index, 'description', $event)"
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs text-muted-foreground">Требование</label>
            <Input
              :model-value="item.requirement"
              placeholder="Требование"
              @update:model-value="updateField(index, 'requirement', $event)"
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs text-muted-foreground">Инструменты</label>
            <Input
              :model-value="item.tools"
              placeholder="Необходимые инструменты"
              @update:model-value="updateField(index, 'tools', $event)"
            />
          </div>
          <!-- Measurements -->
          <div v-if="item.measurements?.length" class="space-y-2">
            <label class="text-xs text-muted-foreground">Измерения</label>
            <div
              v-for="(meas, mIdx) in item.measurements"
              :key="meas.id"
              class="flex items-end gap-2 rounded border border-border p-2"
            >
              <div class="flex-1 space-y-1">
                <Input
                  :model-value="meas.description"
                  placeholder="Описание измерения"
                  @update:model-value="updateMeasurementField(index, mIdx, 'description', $event)"
                />
              </div>
              <div class="w-24 space-y-1">
                <Select
                  :model-value="meas.unit"
                  @update:model-value="updateMeasurementField(index, mIdx, 'unit', $event)"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ед." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="u in MEASUREMENT_UNITS" :key="u" :value="u">
                      {{ u }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="w-36 space-y-1">
                <Input
                  :model-value="meas.norm"
                  placeholder="Норма"
                  @update:model-value="updateMeasurementField(index, mIdx, 'norm', $event)"
                />
              </div>
              <Button variant="destructive" size="icon-sm" @click="removeMeasurement(index, mIdx)">
                <X class="size-4" />
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" class="text-xs" @click="addMeasurement(index)">
            + Измерение
          </Button>

          <!-- Materials -->
          <div v-if="item.materials?.length" class="space-y-2">
            <label class="text-xs text-muted-foreground">Материалы</label>
            <div
              v-for="(mat, matIdx) in item.materials"
              :key="mat.id"
              class="flex items-end gap-2 rounded border border-border p-2"
            >
              <div class="flex-1 space-y-1">
                <Input
                  :model-value="mat.name"
                  placeholder="Наименование"
                  @update:model-value="updateMaterialField(index, matIdx, 'name', $event)"
                />
              </div>
              <div class="w-24 space-y-1">
                <Select
                  :model-value="mat.unit"
                  @update:model-value="updateMaterialField(index, matIdx, 'unit', $event)"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ед." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="u in MEASUREMENT_UNITS" :key="u" :value="u">
                      {{ u }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="destructive" size="icon-sm" @click="removeMaterial(index, matIdx)">
                <X class="size-4" />
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" class="text-xs" @click="addMaterial(index)">
            + Материал
          </Button>

          <div class="flex gap-2">
            <Button variant="outline" size="icon-sm" :disabled="index === 0" @click="moveUp(index)">
              <ChevronUp class="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              :disabled="index === modelValue.length - 1"
              @click="moveDown(index)"
            >
              <ChevronDown class="size-4" />
            </Button>
            <Button variant="destructive" size="icon-sm" @click="deleteStep(index)">
              <Trash2 class="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <Button variant="outline" class="w-full" @click="addStep">Добавить шаг</Button>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { ChevronUp, ChevronDown, Trash2, X } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { getChecklistTemplate } from '@/api/maintenance'
import { MEASUREMENT_UNITS } from '@/utils/constants'

const props = defineProps({
  type: {
    type: String,
    default: '',
  },
  modelValue: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

watch(
  () => props.type,
  async (newType) => {
    if (!newType) return
    const template = await getChecklistTemplate(newType)
    const steps = template.map(
      ({ id, description, requirement, tools, measurements, materials }) => ({
        id,
        description,
        requirement,
        tools,
        measurements: measurements || [],
        materials: materials || [],
      }),
    )
    emit('update:modelValue', steps)
  },
  { immediate: true },
)

function updateField(index, field, value) {
  const updated = props.modelValue.map((item, i) =>
    i === index ? { ...item, [field]: value } : item,
  )
  emit('update:modelValue', updated)
}

function moveUp(index) {
  if (index === 0) return
  const updated = [...props.modelValue]
  ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
  emit('update:modelValue', updated)
}

function moveDown(index) {
  if (index === props.modelValue.length - 1) return
  const updated = [...props.modelValue]
  ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
  emit('update:modelValue', updated)
}

function deleteStep(index) {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, i) => i !== index),
  )
}

function addStep() {
  emit('update:modelValue', [
    ...props.modelValue,
    {
      id: 'custom-' + Date.now(),
      description: '',
      requirement: '',
      tools: '',
      measurements: [],
      materials: [],
    },
  ])
}

function addMeasurement(stepIndex) {
  const updated = props.modelValue.map((item, i) => {
    if (i !== stepIndex) return item
    const measurements = [
      ...(item.measurements || []),
      { id: 'meas-' + Date.now(), description: '', unit: 'мм', norm: '', fact: null, passed: null },
    ]
    return { ...item, measurements }
  })
  emit('update:modelValue', updated)
}

function removeMeasurement(stepIndex, measIndex) {
  const updated = props.modelValue.map((item, i) => {
    if (i !== stepIndex) return item
    const measurements = item.measurements.filter((_, mi) => mi !== measIndex)
    return { ...item, measurements }
  })
  emit('update:modelValue', updated)
}

function updateMeasurementField(stepIndex, measIndex, field, value) {
  const updated = props.modelValue.map((item, i) => {
    if (i !== stepIndex) return item
    const measurements = item.measurements.map((m, mi) =>
      mi === measIndex ? { ...m, [field]: value } : m,
    )
    return { ...item, measurements }
  })
  emit('update:modelValue', updated)
}

function addMaterial(stepIndex) {
  const updated = props.modelValue.map((item, i) => {
    if (i !== stepIndex) return item
    const materials = [
      ...(item.materials || []),
      { id: 'mat-' + Date.now(), name: '', unit: 'л', volume: null, brand: null },
    ]
    return { ...item, materials }
  })
  emit('update:modelValue', updated)
}

function removeMaterial(stepIndex, matIndex) {
  const updated = props.modelValue.map((item, i) => {
    if (i !== stepIndex) return item
    const materials = item.materials.filter((_, mi) => mi !== matIndex)
    return { ...item, materials }
  })
  emit('update:modelValue', updated)
}

function updateMaterialField(stepIndex, matIndex, field, value) {
  const updated = props.modelValue.map((item, i) => {
    if (i !== stepIndex) return item
    const materials = item.materials.map((m, mi) =>
      mi === matIndex ? { ...m, [field]: value } : m,
    )
    return { ...item, materials }
  })
  emit('update:modelValue', updated)
}
</script>

<style scoped></style>
