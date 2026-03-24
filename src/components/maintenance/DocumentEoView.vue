<template>
  <div class="document-eo bg-white text-black p-8 max-w-4xl mx-auto">
    <h1 class="text-xl font-bold text-center mb-6">
      Чек-лист выполненных работ по интервалу ежесменного обслуживания
    </h1>

    <div class="space-y-1 text-sm mb-6">
      <p>
        Станок СБШ-250МНА-32 зав.№
        <span class="font-medium underline decoration-dotted underline-offset-4 ml-1">
          {{ equipment?.serial || order.equipmentId }}
        </span>
      </p>
      <p>
        Наработка станка
        <span class="font-medium underline decoration-dotted underline-offset-4 ml-1">
          {{ order.operatingHoursAtStart ?? '—' }}
        </span>
        часов
      </p>
      <p>
        Дата проведения:
        <span class="font-medium ml-1">{{ formatDate(order.startedAt) }}</span>
      </p>
      <p>
        Исполнитель (ФИО/должность):
        <span class="font-medium ml-1">{{ executorText }}</span>
      </p>
    </div>

    <table class="w-full border-collapse border border-black text-sm mb-6">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-black px-2 py-1.5 text-center w-12">№</th>
          <th class="border border-black px-2 py-1.5 text-left">Задача</th>
          <th class="border border-black px-2 py-1.5 text-center w-40">Отметка о выполнении</th>
          <th class="border border-black px-2 py-1.5 text-center w-40">Отметка о соответствии</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(step, idx) in order.steps" :key="step.id">
          <td class="border border-black px-2 py-1.5 text-center">{{ idx + 1 }}</td>
          <td class="border border-black px-2 py-1.5">{{ step.description }}</td>
          <td class="border border-black px-2 py-1.5 text-center text-base">
            {{ completionMark(step.status) }}
          </td>
          <td class="border border-black px-2 py-1.5 text-center text-base">
            {{ conformityMark(step.status) }}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="space-y-4 text-sm">
      <p>
        Замечания:
        <span class="font-medium ml-1">{{ order.remarks || '—' }}</span>
      </p>
      <div class="flex justify-between pt-8">
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
  order: { type: Object, required: true },
  equipment: { type: Object, default: null },
})

const executorName = computed(() => {
  const exec = props.order.executors?.[0]
  return exec?.name || props.order.assignedTo?.name || '—'
})

const executorText = computed(() => {
  const exec = props.order.executors?.[0]
  if (exec) {
    return `${exec.name}${exec.position ? ' / ' + exec.position : ''}`
  }
  return props.order.assignedTo?.name || '—'
})

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

function completionMark(status) {
  if (status === 'passed') return '\u2713'
  if (status === 'failed') return '\u2717'
  if (status === 'skipped') return '\u2014'
  return ''
}

function conformityMark(status) {
  if (status === 'passed') return '\u2713'
  if (status === 'failed') return '\u2717'
  return ''
}
</script>

<style scoped>
.document-eo {
  font-family: 'Inter', sans-serif;
}
</style>
