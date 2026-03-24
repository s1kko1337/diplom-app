<template>
  <div class="overflow-x-auto">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <p class="text-muted-foreground">Загрузка...</p>
    </div>

    <table v-else-if="entries.length" class="w-full border-collapse text-sm">
      <thead>
        <tr class="border-b border-border bg-muted/50">
          <th class="px-3 py-2 text-left font-medium">№</th>
          <th class="px-3 py-2 text-left font-medium">Дата</th>
          <th class="px-3 py-2 text-left font-medium">Время</th>
          <th class="px-3 py-2 text-left font-medium">Оборудование</th>
          <th class="px-3 py-2 text-left font-medium">Выполняемые работы</th>
          <th class="px-3 py-2 text-left font-medium">Заключение о допуске</th>
          <th class="px-3 py-2 text-left font-medium">ФИО</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(entry, index) in entries"
          :key="entry.id"
          class="border-b border-border transition-colors hover:bg-muted/30"
          :class="{ 'cursor-pointer': entry.orderId }"
          @click="handleRowClick(entry)"
        >
          <td class="px-3 py-2 text-muted-foreground">{{ index + 1 }}</td>
          <td class="px-3 py-2 whitespace-nowrap">{{ formatDateShort(entry.date) }}</td>
          <td class="px-3 py-2 whitespace-nowrap">{{ entry.time }}</td>
          <td class="px-3 py-2 whitespace-nowrap font-medium">{{ entry.equipmentId }}</td>
          <td class="px-3 py-2">
            {{ entry.description }}
            <span v-if="entry.orderId" class="ml-1 text-xs text-primary">
              → {{ entry.orderId }}
            </span>
          </td>
          <td class="px-3 py-2">
            <span
              :class="
                entry.clearance.includes('Не допущен')
                  ? 'text-red-600 dark:text-red-400'
                  : entry.clearance.includes('ограничениями')
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
              "
            >
              {{ entry.clearance }}
            </span>
          </td>
          <td class="px-3 py-2 whitespace-nowrap">{{ entry.authorName }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else class="flex items-center justify-center py-12">
      <p class="text-muted-foreground">Записи не найдены</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  entries: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()

function handleRowClick(entry) {
  if (entry.orderId) {
    router.push(`/maintenance/${entry.orderId}`)
  }
}

function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}.${month}.${year}`
}
</script>

<style scoped></style>
