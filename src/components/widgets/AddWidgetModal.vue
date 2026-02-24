<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      @click.self="$emit('close')"
    >
      <div class="bg-surface-1 border-2 border-border w-full max-w-lg max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between p-4 border-b-2 border-border">
          <h3 class="text-sm">ДОБАВИТЬ ВИДЖЕТ</h3>
          <button
            class="p-1 border border-border hover:bg-surface-2 transition-all duration-150"
            @click="$emit('close')"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <label class="text-xs opacity-70 mb-2 block">ТИП ВИДЖЕТА</label>
            <div class="space-y-2">
              <button
                v-for="wt in widgetTypesList"
                :key="wt.type"
                class="w-full text-left p-3 border-2 transition-all duration-150"
                :class="
                  selectedType === wt.type
                    ? 'border-primary bg-surface-2'
                    : 'border-border hover:bg-surface-2'
                "
                @click="selectedType = wt.type"
              >
                <div class="text-sm">{{ wt.label }}</div>
                <div class="text-xs opacity-50 mt-1">{{ wt.description }}</div>
              </button>
            </div>
          </div>

          <div>
            <label class="text-xs opacity-70 mb-2 block">ДАТЧИК</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="s in sensors"
                :key="s.id"
                class="text-left p-2 border transition-all duration-150"
                :class="
                  selectedSensor === s.id
                    ? 'border-primary bg-surface-2'
                    : 'border-border hover:bg-surface-2'
                "
                @click="selectedSensor = s.id"
              >
                <div class="text-xs">{{ s.label }}</div>
                <div class="text-xs opacity-40 mt-0.5">{{ s.unit }}</div>
              </button>
            </div>
          </div>
        </div>

        <div class="p-4 border-t-2 border-border flex justify-end gap-2">
          <button
            class="px-4 py-2 border border-border text-sm hover:bg-surface-2 transition-all duration-150"
            @click="$emit('close')"
          >
            ОТМЕНА
          </button>
          <button
            :disabled="!selectedType || !selectedSensor"
            class="px-4 py-2 border-2 border-primary text-sm hover:bg-surface-2 transition-all duration-150 disabled:opacity-30"
            @click="handleAdd"
          >
            ДОБАВИТЬ
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'
import { getWidgetTypesList, widgetTypes } from './widgetRegistry'

const props = defineProps({
  show: { type: Boolean, default: false },
  sensors: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'add'])

function handleKeydown(e) {
  if (e.key === 'Escape' && props.show) {
    emit('close')
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))

const widgetTypesList = getWidgetTypesList()
const selectedType = ref(null)
const selectedSensor = ref(null)

function handleAdd() {
  if (!selectedType.value || !selectedSensor.value) return
  const wType = widgetTypes[selectedType.value]
  emit('add', {
    type: selectedType.value,
    sensorId: selectedSensor.value,
    defaultSize: wType.defaultSize,
  })
  selectedType.value = null
  selectedSensor.value = null
}
</script>
