<template>
  <div class="space-y-6">
    <LoadingSpinner v-if="equipmentStore.loading && !equipmentStore.list.length" />

    <template v-else>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl">ОБОРУДОВАНИЕ</h2>
          <div class="text-sm opacity-50 mt-1">Выберите единицу для мониторинга</div>
        </div>
        <div class="flex items-center gap-4">
          <div class="bg-surface-1 border-2 border-border px-6 py-3">
            <div class="text-xs opacity-70 mb-1">В РАБОТЕ</div>
            <div class="metric-value text-2xl">
              {{ equipmentStore.workingCount }}/{{ equipmentStore.list.length }}
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <RouterLink
          v-for="eq in equipmentStore.list"
          :key="eq.id"
          :to="{ name: 'equipment-dashboard', params: { id: eq.id } }"
          class="group block bg-surface-1 border-2 border-border p-6 hover:border-primary hover:translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="metric-value text-lg">{{ eq.id }}</div>
            <div
              class="w-3 h-3"
              :class="{
                'bg-primary animate-pulse': eq.status === 'working',
                'bg-yellow-500': eq.status === 'idle',
                'bg-red-500 animate-pulse': eq.status === 'malfunction',
                'bg-border': eq.status === 'offline',
              }"
            />
          </div>
          <div class="text-sm opacity-70 mb-2">{{ eq.fullModel || eq.model }}</div>
          <div class="flex items-center justify-between">
            <span
              class="text-xs px-2 py-1 border"
              :class="eq.status === 'working' ? 'border-primary' : 'border-border opacity-60'"
            >
              {{ STATUS_LABELS[eq.status] }}
            </span>
            <span class="text-xs opacity-40">{{ eq.serial }}</span>
          </div>
        </RouterLink>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useEquipmentStore } from '@/stores/equipment'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const equipmentStore = useEquipmentStore()

const STATUS_LABELS = {
  working: 'В РАБОТЕ',
  idle: 'ПРОСТОЙ',
  malfunction: 'НЕИСПРАВНОСТЬ',
  offline: 'ОТКЛЮЧЕНО',
}

onMounted(() => {
  if (!equipmentStore.list.length) {
    equipmentStore.fetchList()
  }
})
</script>
