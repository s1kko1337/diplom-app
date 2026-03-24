<template>
  <div class="document-act bg-white text-black p-8 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-xl font-bold mb-1">АКТ № {{ order.id }}</h1>
      <p class="text-base">о проведении работ {{ order.type }}</p>
      <p class="text-base">бурового станка СБШ-250МНА-32</p>
    </div>

    <!-- General info -->
    <div class="space-y-1 text-sm mb-6">
      <p>
        Заводской номер станка:
        <span class="font-medium ml-1">{{ equipment?.serial || order.equipmentId }}</span>
      </p>
      <p>
        Значение наработки:
        <span class="font-medium ml-1">{{ order.operatingHoursAtStart ?? '—' }}</span>
        часов
      </p>
      <p>
        Дата/время начала работ:
        <span class="font-medium ml-1">{{ formatDateTime(order.startedAt) }}</span>
      </p>
    </div>

    <!-- Executors -->
    <div v-if="order.executors?.length" class="text-sm mb-6">
      <p class="font-medium mb-1">Исполнители работ:</p>
      <ul class="ml-4 space-y-0.5">
        <li v-for="exec in order.executors" :key="exec.name">
          {{ exec.position || 'Механик' }} / {{ exec.name }}
        </li>
      </ul>
    </div>

    <!-- Steps table -->
    <h2 class="text-sm font-bold mb-2">Содержание работ</h2>
    <table class="w-full border-collapse border border-black text-sm mb-6">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-black px-2 py-1.5 text-center w-10">№</th>
          <th class="border border-black px-2 py-1.5 text-left">Содержание работ</th>
          <th class="border border-black px-2 py-1.5 text-center w-36">Отметка о выполнении</th>
          <th class="border border-black px-2 py-1.5 text-left w-44">Замечания</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(step, idx) in order.steps" :key="step.id">
          <td class="border border-black px-2 py-1.5 text-center">{{ idx + 1 }}</td>
          <td class="border border-black px-2 py-1.5">{{ step.description }}</td>
          <td class="border border-black px-2 py-1.5 text-center text-base">
            {{ completionMark(step.status) }}
          </td>
          <td class="border border-black px-2 py-1.5 text-xs">{{ step.comment || '' }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Measurements table -->
    <template v-if="allMeasurements.length">
      <h2 class="text-sm font-bold mb-2">Проверка показателей</h2>
      <table class="w-full border-collapse border border-black text-sm mb-6">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-black px-2 py-1.5 text-center w-10">№</th>
            <th class="border border-black px-2 py-1.5 text-left">Описание</th>
            <th class="border border-black px-2 py-1.5 text-center w-24">Показатель</th>
            <th class="border border-black px-2 py-1.5 text-center w-28">Норма</th>
            <th class="border border-black px-2 py-1.5 text-center w-20">Факт</th>
            <th class="border border-black px-2 py-1.5 text-center w-28">Соответствие</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(m, idx) in allMeasurements" :key="m.id">
            <td class="border border-black px-2 py-1.5 text-center">{{ idx + 1 }}</td>
            <td class="border border-black px-2 py-1.5">{{ m.description }}</td>
            <td class="border border-black px-2 py-1.5 text-center">{{ m.unit }}</td>
            <td class="border border-black px-2 py-1.5 text-center">{{ m.norm || '—' }}</td>
            <td class="border border-black px-2 py-1.5 text-center">{{ m.fact ?? '—' }}</td>
            <td class="border border-black px-2 py-1.5 text-center">
              {{ conformityLabel(m.passed) }}
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <!-- Materials table -->
    <template v-if="allMaterials.length">
      <h2 class="text-sm font-bold mb-2">Использованные материалы</h2>
      <table class="w-full border-collapse border border-black text-sm mb-6">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-black px-2 py-1.5 text-center w-10">№</th>
            <th class="border border-black px-2 py-1.5 text-left">Наименование</th>
            <th class="border border-black px-2 py-1.5 text-center w-24">Единица</th>
            <th class="border border-black px-2 py-1.5 text-center w-20">Объём</th>
            <th class="border border-black px-2 py-1.5 text-left w-36">Марка</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(mat, idx) in allMaterials" :key="mat.id">
            <td class="border border-black px-2 py-1.5 text-center">{{ idx + 1 }}</td>
            <td class="border border-black px-2 py-1.5">{{ mat.name }}</td>
            <td class="border border-black px-2 py-1.5 text-center">{{ mat.unit || '—' }}</td>
            <td class="border border-black px-2 py-1.5 text-center">{{ mat.volume ?? '—' }}</td>
            <td class="border border-black px-2 py-1.5">{{ mat.brand || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </template>

    <!-- Footer -->
    <div class="space-y-2 text-sm mt-8">
      <p v-if="order.remarks" class="mb-4">
        <span class="font-medium">Замечания:</span> {{ order.remarks }}
      </p>

      <p>
        Дата/время завершения работ:
        <span class="font-medium ml-1">{{ formatDateTime(order.completedAt) }}</span>
      </p>

      <div class="flex justify-between pt-8">
        <p>
          Станок сдал: ________________ /
          <span class="font-medium">{{ handoverName }}</span>
          /
        </p>
        <p>
          Станок принял: ________________ /
          <span class="font-medium">{{ acceptedName }}</span>
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

const allMeasurements = computed(() => {
  const result = []
  for (const step of props.order.steps || []) {
    for (const m of step.measurements || []) {
      result.push(m)
    }
  }
  return result
})

const allMaterials = computed(() => {
  const result = []
  for (const step of props.order.steps || []) {
    for (const mat of step.materials || []) {
      result.push(mat)
    }
  }
  return result
})

const handoverName = computed(() => {
  const exec = props.order.executors?.[0]
  return exec?.name || props.order.assignedTo?.name || '________'
})

const acceptedName = computed(() => {
  return props.order.acceptedBy?.name || props.order.reviewedBy?.name || '________'
})

function formatDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}.${month}.${year} ${hours}:${minutes}`
}

function completionMark(status) {
  if (status === 'passed') return '\u2713'
  if (status === 'failed') return '\u2717'
  if (status === 'skipped') return '\u2014'
  return ''
}

function conformityLabel(passed) {
  if (passed === true) return 'Соответствует'
  if (passed === false) return 'Не соответствует'
  return '—'
}
</script>

<style scoped>
.document-act {
  font-family: 'Inter', sans-serif;
}
</style>
