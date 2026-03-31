<template>
  <div class="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
    <p class="text-sm font-medium">{{ material.name }}</p>

    <!-- Readonly mode -->
    <div v-if="readonly" class="flex items-center gap-4 text-sm">
      <span>
        Объём:
        {{ material.volume !== null ? `${material.volume} ${material.unit}` : 'не заполнено' }}
      </span>
      <span> Марка: {{ material.brand || 'не указана' }} </span>
    </div>

    <!-- Editable mode -->
    <div v-else class="flex items-center gap-3 flex-wrap">
      <div class="flex items-center gap-2">
        <label class="text-sm text-muted-foreground shrink-0">Объём:</label>
        <Input
          type="number"
          step="any"
          :model-value="material.volume"
          class="w-24"
          placeholder="—"
          @input="handleVolumeInput"
        />
        <span class="text-xs text-muted-foreground shrink-0">{{ material.unit }}</span>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-muted-foreground shrink-0">Марка:</label>
        <Input
          :model-value="material.brand || ''"
          class="w-48"
          placeholder="Марка / производитель"
          @input="handleBrandInput"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Input } from '@/components/ui/input'

const props = defineProps({
  material: {
    type: Object,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:material'])

function handleVolumeInput(event) {
  const raw = event.target.value
  const volume = raw === '' ? null : parseFloat(raw)
  emit('update:material', { ...props.material, volume })
}

function handleBrandInput(event) {
  const brand = event.target.value || null
  emit('update:material', { ...props.material, brand })
}
</script>

<style scoped></style>
