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
        <div class="flex items-center gap-3">
          <Card class="px-4 sm:px-6 py-3">
            <div class="text-xs text-muted-foreground mb-1">АКТИВНО</div>
            <div class="metric-value text-xl sm:text-2xl">
              {{ equipmentStore.workingCount }}/{{ equipmentStore.list.length }}
            </div>
          </Card>
          <Button @click="openCreate">
            <Plus class="w-4 h-4 mr-1" />
            Подключить станок
          </Button>
        </div>
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
        <Card
          v-for="item in filteredEquipment"
          :key="item.id"
          class="group transition-colors hover:border-primary"
        >
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <RouterLink
                :to="{ name: 'equipment-detail', params: { id: item.id } }"
                class="hover:underline"
              >
                <CardTitle class="text-lg">{{ item.id }}</CardTitle>
              </RouterLink>
              <Badge :variant="item.status === 'malfunction' ? 'destructive' : 'outline'">
                <span
                  class="inline-block h-2 w-2 rounded-full"
                  :class="STATUS_DOT_COLORS[item.status]"
                />
                {{ STATUS_LABELS[item.status] }}
              </Badge>
            </div>
            <CardDescription>{{ item.fullModel || item.model }}</CardDescription>
          </CardHeader>
          <CardContent>
            <RouterLink :to="{ name: 'equipment-detail', params: { id: item.id } }" class="block">
              <div class="grid grid-cols-3 gap-2 text-sm mb-3">
                <div>
                  <div class="text-muted-foreground text-xs">Темп.</div>
                  <div class="metric-value">{{ getSensor(item.id, 'temp-engine') }} °C</div>
                </div>
                <div>
                  <div class="text-muted-foreground text-xs">Обороты</div>
                  <div class="metric-value">{{ getSensor(item.id, 'speed') }} RPM</div>
                </div>
                <div>
                  <div class="text-muted-foreground text-xs">Глубина</div>
                  <div class="metric-value">{{ getSensor(item.id, 'depth') }} м</div>
                </div>
              </div>

              <div
                v-if="getNextMaintenance(item.id)"
                class="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3"
              >
                <WrenchIcon class="h-3.5 w-3.5 shrink-0" />
                <span>
                  Следующее ТО: {{ getNextMaintenance(item.id).type }} (через
                  {{ getNextMaintenance(item.id).hoursRemaining }} ч)
                </span>
              </div>
            </RouterLink>

            <div class="flex items-center gap-2 mt-3 pt-3 border-t">
              <Button
                v-if="item.status !== 'offline'"
                variant="outline"
                size="sm"
                class="flex-1"
                @click="openDisconnect(item)"
              >
                <PowerOff class="w-3.5 h-3.5 mr-1" />
                Отключить
              </Button>
              <Button v-else variant="outline" size="sm" class="flex-1" @click="reconnect(item)">
                <Power class="w-3.5 h-3.5 mr-1" />
                Подключить
              </Button>
              <Button variant="outline" size="sm" class="flex-1" @click="openDelete(item)">
                <Trash2 class="w-3.5 h-3.5 mr-1 text-status-critical" />
                Удалить
              </Button>
            </div>
          </CardContent>
        </Card>
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
                  <div class="flex items-center gap-2">
                    <Button variant="outline" size="sm" as-child>
                      <RouterLink :to="{ name: 'equipment-detail', params: { id: item.id } }">
                        Детали
                      </RouterLink>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      :title="item.status === 'offline' ? 'Подключить' : 'Отключить'"
                      @click="item.status === 'offline' ? reconnect(item) : openDisconnect(item)"
                    >
                      <Power v-if="item.status === 'offline'" class="w-4 h-4" />
                      <PowerOff v-else class="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Удалить"
                      @click="openDelete(item)"
                    >
                      <Trash2 class="w-4 h-4 text-status-critical" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </template>

    <EquipmentCreateDialog :open="createOpen" @close="createOpen = false" />
    <EquipmentActionsDialog
      :open="actionOpen"
      :mode="actionMode"
      :equipment="actionTarget"
      @close="actionOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, WrenchIcon, Plus, Power, PowerOff, Trash2 } from 'lucide-vue-next'
import { useEquipmentStore } from '@/stores/equipment'
import { useSensorsStore } from '@/stores/sensors'
import { useMaintenanceStore } from '@/stores/maintenance'
import { STATUS_LABELS, STATUS_COLORS, STATUS_DOT_COLORS } from '@/utils/constants'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
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
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EquipmentCreateDialog from '@/components/equipment/EquipmentCreateDialog.vue'
import EquipmentActionsDialog from '@/components/equipment/EquipmentActionsDialog.vue'

const equipmentStore = useEquipmentStore()
const sensorsStore = useSensorsStore()
const maintenanceStore = useMaintenanceStore()

onMounted(() => {
  if (!equipmentStore.list.length) {
    equipmentStore.fetchList()
  }
})

const searchQuery = ref('')
const activeTab = ref('all')

const statusTabs = computed(() => [
  { key: 'all', label: 'Все', count: equipmentStore.list.length },
  { key: 'working', label: STATUS_LABELS.working, count: equipmentStore.workingCount },
  { key: 'idle', label: STATUS_LABELS.idle, count: equipmentStore.idleCount },
  { key: 'malfunction', label: STATUS_LABELS.malfunction, count: equipmentStore.malfunctionCount },
  { key: 'offline', label: STATUS_LABELS.offline, count: equipmentStore.offlineCount },
])

const filteredEquipment = computed(() => {
  let result = equipmentStore.list
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

function getSensor(equipmentId, sensorId) {
  const live = sensorsStore.getSensorValue(equipmentId, sensorId)
  if (live !== null) return live
  const detail = equipmentStore.getDetail(equipmentId)
  if (detail?.sensors) {
    const sensor = detail.sensors.find((s) => s.id === sensorId)
    return sensor?.currentValue ?? '—'
  }
  return '—'
}

function getNextMaintenance(equipmentId) {
  return maintenanceStore.getNextMaintenance(equipmentId)
}

const createOpen = ref(false)
const actionOpen = ref(false)
const actionMode = ref('disconnect')
const actionTarget = ref(null)

function openCreate() {
  createOpen.value = true
}

function openDisconnect(item) {
  actionTarget.value = item
  actionMode.value = 'disconnect'
  actionOpen.value = true
}

function openDelete(item) {
  actionTarget.value = item
  actionMode.value = 'delete'
  actionOpen.value = true
}

async function reconnect(item) {
  try {
    await equipmentStore.setStatus(item.id, 'idle')
  } catch (e) {
    console.error(e)
  }
}
</script>
