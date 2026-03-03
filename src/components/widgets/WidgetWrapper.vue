<template>
  <div
    class="h-full bg-surface-1 border-2 border-border overflow-hidden"
    :class="editing ? 'ring-1 ring-primary/30' : ''"
  >
    <component
      :is="widgetComponent"
      v-if="widgetComponent"
      :title="widget.props?.title || ''"
      :value="currentValue"
      :sensor="sensorDef"
      :equipment="equipment"
      :equipment-id="equipmentId"
    />
    <div v-else class="h-full flex items-center justify-center text-xs opacity-30">
      НЕИЗВЕСТНЫЙ ВИДЖЕТ
    </div>

    <button
      v-if="editing"
      class="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-surface-2 border border-border hover:bg-red-500/20 hover:border-red-500 text-xs transition-all duration-150 z-10"
      @click.stop="$emit('remove')"
    >
      &times;
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSensorsStore } from '@/stores/sensors'
import { useEquipmentStore } from '@/stores/equipment'
import { getWidgetComponent } from './widgetRegistry'

const props = defineProps({
  widget: { type: Object, required: true },
  equipmentId: { type: String, required: true },
  editing: { type: Boolean, default: false },
})

defineEmits(['remove'])

const sensorsStore = useSensorsStore()
const equipmentStore = useEquipmentStore()

const widgetComponent = computed(() => getWidgetComponent(props.widget.type))

const equipment = computed(() => equipmentStore.getDetail(props.equipmentId))

const currentValue = computed(() => {
  if (!props.widget.sensorId) return null
  return sensorsStore.getSensorValue(props.equipmentId, props.widget.sensorId)
})

const sensorDef = computed(() => {
  if (!props.widget.sensorId) return null
  const defs = sensorsStore.getSensorDefs(props.equipmentId)
  return defs.find((s) => s.id === props.widget.sensorId) || null
})
</script>
