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
        <Select :model-value="material.brand || ''" @update:model-value="handleBrandSelect">
          <SelectTrigger class="w-64">
            <SelectValue placeholder="Выберите марку (по регламенту)" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup v-for="group in brandGroups" :key="group.key">
              <SelectLabel>{{ group.label }}</SelectLabel>
              <SelectItem v-for="brand in group.items" :key="brand" :value="brand">
                {{ brand }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from '@/components/ui/select'
import { getMaterialBrandGroups } from '@/utils/constants'

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

const brandGroups = computed(() => getMaterialBrandGroups(props.material))

function handleVolumeInput(event) {
  const raw = event.target.value
  const volume = raw === '' ? null : parseFloat(raw)
  emit('update:material', { ...props.material, volume })
}

function handleBrandSelect(value) {
  emit('update:material', { ...props.material, brand: value || null })
}
</script>

<style scoped></style>
