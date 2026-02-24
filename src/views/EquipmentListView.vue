<template>
  <div class="space-y-6">
    <LoadingSpinner v-if="equipmentStore.loading && !equipmentStore.list.length" />

    <template v-else>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl">СПИСОК ОБОРУДОВАНИЯ</h2>
          <div class="text-sm opacity-50 mt-1">Весь парк бурового оборудования</div>
        </div>
        <div class="bg-surface-1 border-2 border-border px-6 py-3">
          <div class="text-xs opacity-70 mb-1">АКТИВНО</div>
          <div class="metric-value text-2xl">
            {{ equipmentStore.workingCount }}/{{ equipmentStore.list.length }}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex-1 relative">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ПОИСК ПО ID ИЛИ МОДЕЛИ..."
            class="w-full pl-12 pr-4 py-3 bg-surface-1 border-2 border-border text-sm"
          />
        </div>
        <button
          class="flex items-center gap-2 px-4 py-3 border-2 border-border hover:bg-surface-2 transition-all duration-150"
        >
          <Filter class="w-4 h-4" />
          <span class="text-sm">ФИЛЬТРЫ</span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-for="tab in statusTabs"
          :key="tab.key"
          class="px-4 py-2 text-sm transition-all duration-150"
          :class="
            activeTab === tab.key
              ? 'border-2 border-primary bg-surface-2'
              : 'border border-border hover:bg-surface-2'
          "
          @click="activeTab = tab.key"
        >
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <RouterLink
          v-for="item in filteredEquipment"
          :key="item.id"
          :to="{ name: 'equipment-detail', params: { id: item.id } }"
          class="cursor-pointer"
        >
          <EquipmentCard
            :name="item.id"
            :equipment-id="item.model"
            :is-active="item.status === 'working'"
            :status="item.cardStatus"
          />
        </RouterLink>
      </div>

      <div class="bg-surface-1 border-2 border-border">
        <div class="p-4 border-b-2 border-border">
          <label class="text-xs">ДЕТАЛЬНАЯ ИНФОРМАЦИЯ</label>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left p-4"><div class="text-xs opacity-70">ID</div></th>
                <th class="text-left p-4"><div class="text-xs opacity-70">МОДЕЛЬ</div></th>
                <th class="text-left p-4"><div class="text-xs opacity-70">ГОД</div></th>
                <th class="text-left p-4"><div class="text-xs opacity-70">СЕРИЙНЫЙ №</div></th>
                <th class="text-left p-4"><div class="text-xs opacity-70">СТАТУС</div></th>
                <th class="text-left p-4"><div class="text-xs opacity-70">ДЕЙСТВИЯ</div></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredEquipment"
                :key="item.id"
                class="border-b border-border hover:bg-surface-2 transition-all duration-150"
              >
                <td class="p-4 metric-value text-sm">{{ item.id }}</td>
                <td class="p-4 text-sm">{{ item.model }}</td>
                <td class="p-4 metric-value text-sm">{{ item.year }}</td>
                <td class="p-4 metric-value text-sm">{{ item.serial }}</td>
                <td class="p-4 text-sm">
                  <span
                    class="px-2 py-1 text-xs border"
                    :class="
                      item.status === 'working' ? 'border-primary' : 'border-border opacity-50'
                    "
                  >
                    {{ STATUS_LABELS[item.status] || item.status }}
                  </span>
                </td>
                <td class="p-4">
                  <RouterLink
                    :to="{ name: 'equipment-detail', params: { id: item.id } }"
                    class="px-3 py-1 border border-border hover:bg-surface-2 text-xs transition-all duration-150"
                  >
                    ДЕТАЛИ
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Filter } from 'lucide-vue-next'
import { useEquipmentStore } from '@/stores/equipment'
import EquipmentCard from '@/components/EquipmentCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const equipmentStore = useEquipmentStore()

onMounted(() => {
  if (!equipmentStore.list.length) {
    equipmentStore.fetchList()
  }
})

const searchQuery = ref('')
const activeTab = ref('all')

const STATUS_LABELS = {
  working: 'РАБОТА',
  idle: 'ПРОСТОЙ',
  malfunction: 'АВАРИЯ',
  offline: 'ОТКЛЮЧЕНО',
}

const STATUS_CARD_MAP = {
  working: 'active',
  malfunction: 'error',
  idle: 'warning',
  offline: 'warning',
}

const equipmentWithCards = computed(() =>
  equipmentStore.list.map((eq) => {
    const statusKey = STATUS_CARD_MAP[eq.status] || 'warning'
    return {
      ...eq,
      cardStatus: [
        { label: 'Модель', value: eq.model, status: statusKey },
        { label: 'Статус', value: STATUS_LABELS[eq.status] || eq.status, status: statusKey },
      ],
    }
  }),
)

const statusTabs = computed(() => [
  { key: 'all', label: 'ВСЕ', count: equipmentStore.list.length },
  { key: 'working', label: 'РАБОТА', count: equipmentStore.workingCount },
  { key: 'idle', label: 'ПРОСТОЙ', count: equipmentStore.idleCount },
  { key: 'malfunction', label: 'АВАРИЯ', count: equipmentStore.malfunctionCount },
  { key: 'offline', label: 'ОТКЛЮЧЕНО', count: equipmentStore.offlineCount },
])

const filteredEquipment = computed(() => {
  let result = equipmentWithCards.value
  if (activeTab.value !== 'all') {
    result = result.filter((e) => e.status === activeTab.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toUpperCase()
    result = result.filter(
      (e) => e.id.toUpperCase().includes(q) || e.model.toUpperCase().includes(q),
    )
  }
  return result
})
</script>
