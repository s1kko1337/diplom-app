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
              :value="item.description"
              placeholder="Описание шага"
              @input="updateField(index, 'description', $event.target.value)"
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs text-muted-foreground">Требование</label>
            <Input
              :value="item.requirement"
              placeholder="Требование"
              @input="updateField(index, 'requirement', $event.target.value)"
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs text-muted-foreground">Инструменты</label>
            <Input
              :value="item.tools"
              placeholder="Необходимые инструменты"
              @input="updateField(index, 'tools', $event.target.value)"
            />
          </div>
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
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getChecklistTemplate } from '@/api/maintenance'

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
    const steps = template.map(({ id, description, requirement, tools }) => ({
      id,
      description,
      requirement,
      tools,
    }))
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
    { id: 'custom-' + Date.now(), description: '', requirement: '', tools: '' },
  ])
}
</script>

<style scoped></style>
