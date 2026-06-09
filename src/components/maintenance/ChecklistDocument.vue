<template>
  <div class="checklist-document bg-white text-black p-8 max-w-4xl mx-auto">
    <p class="text-right text-xs italic mb-2">Приложение А</p>
    <h1 class="text-lg font-bold text-center mb-6">
      Чек-лист выполненных работ{{ titleSuffix }}
    </h1>

    <div class="space-y-1.5 text-sm mb-6">
      <p>
        Станок
        <span class="font-medium ml-1">{{ stationModel }}</span>
        зав.№
        <span class="font-medium underline decoration-dotted underline-offset-4 ml-1">
          {{ equipment?.serial || equipmentId }}
        </span>
      </p>
      <p>
        Наработка станка
        <span class="font-medium underline decoration-dotted underline-offset-4 ml-1">
          {{ equipment?.operatingHours ?? '—' }}
        </span>
        часов
      </p>
      <p>
        Дата проведения:
        <span class="font-medium underline decoration-dotted underline-offset-4 ml-1">
          {{ today }}
        </span>
      </p>
      <p>
        Исполнитель (ФИО/должность):
        <span class="font-medium underline decoration-dotted underline-offset-4 ml-1">
          {{ executorText }}
        </span>
      </p>
    </div>

    <table class="w-full border-collapse border border-black text-sm mb-6">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-black px-2 py-1.5 text-center w-10">№</th>
          <th class="border border-black px-2 py-1.5 text-left">Задача</th>
          <th class="border border-black px-2 py-1.5 text-center w-32">Отметка о выполнении</th>
          <th class="border border-black px-2 py-1.5 text-center w-32">Отметка о соответствии</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in items" :key="item.id">
          <td class="border border-black px-2 py-1.5 text-center align-top">{{ idx + 1 }}</td>
          <td class="border border-black px-2 py-1.5">
            <div>{{ item.description }}</div>
            <div v-if="item.requirement" class="text-xs text-gray-600 mt-0.5">
              {{ item.requirement }}
            </div>
          </td>
          <td class="border border-black px-2 py-1.5 text-center align-middle">
            <span class="inline-flex items-center justify-center w-5 h-5 border border-black">
              {{ item.completed ? '✓' : '' }}
            </span>
          </td>
          <td class="border border-black px-2 py-1.5 text-center align-middle">
            <span class="inline-flex items-center justify-center w-5 h-5 border border-black"></span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="space-y-6 text-sm">
      <div>
        <p class="mb-1">Замечания:</p>
        <div class="border-b border-black h-5" />
        <div class="border-b border-black h-5" />
      </div>
      <div class="flex justify-end pt-6">
        <p>
          Подпись: ________________ /
          <span class="font-medium">{{ executorName }}</span>
          /
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  equipmentId: { type: String, required: true },
  equipment: { type: Object, default: null },
  items: { type: Array, default: () => [] },
  type: { type: String, default: 'ЕО' },
  executorName: { type: String, default: '—' },
  executorPosition: { type: String, default: '' },
})

const titleSuffix = computed(() =>
  props.type === 'ЕО' ? ' по интервалу ежесменного обслуживания' : ` — ${props.type}`,
)

const stationModel = computed(
  () => props.equipment?.fullModel || props.equipment?.model || 'СБШ-250МНА-32',
)

const executorText = computed(() => {
  if (props.executorName === '—') return '—'
  return props.executorPosition
    ? `${props.executorName} / ${props.executorPosition}`
    : props.executorName
})

const today = computed(() => {
  const d = new Date()
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${d.getFullYear()}`
})
</script>

<style scoped>
.checklist-document {
  font-family: 'Inter', sans-serif;
}
</style>
