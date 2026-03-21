<template>
  <div class="space-y-6">
    <LoadingSpinner v-if="equipmentStore.loading && !equipmentStore.list.length" />

    <template v-else>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl sm:text-2xl font-semibold">Список оборудования</h2>
          <div class="text-xs sm:text-sm text-muted-foreground mt-1">
            Весь парк бурового оборудования
          </div>
        </div>
        <Card class="px-4 sm:px-6 py-3">
          <div class="text-xs text-muted-foreground mb-1">АКТИВНО</div>
          <div class="metric-value text-xl sm:text-2xl">
            {{ equipmentStore.workingCount }}/{{ equipmentStore.list.length }}
          </div>
        </Card>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по ID или модели..."
            class="pl-10"
          />
        </div>
      </div>

      <Tabs v-model="activeTab" default-value="all">
        <TabsList>
          <TabsTrigger v-for="tab in statusTabs" :key="tab.key" :value="tab.key">
            {{ tab.label }} ({{ tab.count }})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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

      <Card class="hidden sm:block">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium">Детальная информация</CardTitle>
        </CardHeader>
        <CardContent class="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Модель</TableHead>
                <TableHead class="hidden md:table-cell">Год</TableHead>
                <TableHead class="hidden md:table-cell">Серийный №</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead class="hidden sm:table-cell">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in filteredEquipment" :key="item.id">
                <TableCell class="metric-value text-sm">{{ item.id }}</TableCell>
                <TableCell class="text-sm">{{ item.model }}</TableCell>
                <TableCell class="metric-value text-sm hidden md:table-cell">{{
                  item.year
                }}</TableCell>
                <TableCell class="metric-value text-sm hidden md:table-cell">{{
                  item.serial
                }}</TableCell>
                <TableCell>
                  <Badge
                    :variant="item.status === 'working' ? 'default' : 'outline'"
                    :class="STATUS_COLORS[item.status]"
                  >
                    <span
                      class="inline-block h-1.5 w-1.5 rounded-full"
                      :class="STATUS_DOT_COLORS[item.status]"
                    />
                    {{ STATUS_LABELS[item.status] || item.status }}
                  </Badge>
                </TableCell>
                <TableCell class="hidden sm:table-cell">
                  <Button variant="outline" size="sm" as-child>
                    <RouterLink :to="{ name: 'equipment-detail', params: { id: item.id } }">
                      Детали
                    </RouterLink>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search } from 'lucide-vue-next'
import { useEquipmentStore } from '@/stores/equipment'
import { STATUS_LABELS, STATUS_COLORS, STATUS_DOT_COLORS } from '@/utils/constants'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
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
  { key: 'all', label: 'Все', count: equipmentStore.list.length },
  { key: 'working', label: 'Работа', count: equipmentStore.workingCount },
  { key: 'idle', label: 'Простой', count: equipmentStore.idleCount },
  { key: 'malfunction', label: 'Авария', count: equipmentStore.malfunctionCount },
  { key: 'offline', label: 'Отключено', count: equipmentStore.offlineCount },
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
