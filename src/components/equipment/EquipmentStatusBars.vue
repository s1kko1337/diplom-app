<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    <StatusIndicator
      label="ЗАГРУЗКА ДВИГАТЕЛЯ"
      :value="getSensorNum('engine-load')"
      :max="100"
      status="normal"
    />
    <StatusIndicator
      label="РАСХОД ТОПЛИВА"
      :value="getSensorNum('fuel-rate')"
      :max="25"
      unit="Л/Ч"
      status="normal"
    />
    <StatusIndicator
      label="ИЗНОС ДОЛОТА"
      :value="getSensorNum('tool-wear')"
      :max="100"
      :status="getSensorNum('tool-wear') >= 70 ? 'warning' : 'normal'"
    />
    <StatusIndicator
      label="УРОВЕНЬ МАСЛА"
      :value="getSensorNum('oil-level')"
      :max="100"
      status="normal"
    />
    <StatusIndicator
      label="ДАВЛЕНИЕ ГИДРОСИСТЕМЫ"
      :value="getSensorNum('pressure')"
      :max="150"
      unit="БАР"
      status="normal"
    />
    <StatusIndicator
      label="ТЕМПЕРАТУРА ГИДРОМАСЛА"
      :value="getSensorNum('oil-temp')"
      :max="80"
      unit="°C"
      status="normal"
    />
  </div>
</template>

<script setup>
import { useSensorsStore } from '@/stores/sensors'
import { useEquipmentStore } from '@/stores/equipment'
import StatusIndicator from '@/components/StatusIndicator.vue'

const props = defineProps({
  equipmentId: { type: String, required: true },
})

const sensorsStore = useSensorsStore()
const equipmentStore = useEquipmentStore()

function getSensorNum(sensorId) {
  const live = sensorsStore.getSensorValue(props.equipmentId, sensorId)
  if (live !== null) return live
  const equipment = equipmentStore.getDetail(props.equipmentId)
  const sensor = equipment?.sensors?.find((s) => s.id === sensorId)
  return sensor?.currentValue ?? 0
}
</script>
