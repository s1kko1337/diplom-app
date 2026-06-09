<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl sm:text-2xl font-semibold">Обзор системы</h1>
      <Badge v-if="roleLabel" variant="outline" class="text-xs">
        {{ roleLabel }}
      </Badge>
    </div>

    <LoadingSpinner v-if="equipmentStore.loading && !equipmentStore.list.length" />

    <template v-else>
      <HomeMetricsPanel :equipment="equipmentStore.list" />

      <!-- Engineer: full operations view -->
      <template v-if="role === 'engineer' || !role">
        <CustomizableSections page-key="home-engineer" :sections="engineerSections">
          <template #dashboard>
            <HomeDashboardQuickAccess />
          </template>
          <template #equipment>
            <HomeEquipmentGrid :equipment="equipmentStore.list" />
          </template>
          <template #summary>
            <HomeMaintenanceSummary />
          </template>
          <template #operations>
            <div class="grid gap-6 lg:grid-cols-2 min-h-[50vh]">
              <HomeUpcomingMaintenance class="h-full" />
              <HomeAlertsPanel class="h-full" />
            </div>
          </template>
        </CustomizableSections>
      </template>

      <!-- Foreman: review queue focused -->
      <template v-else-if="role === 'foreman'">
        <CustomizableSections page-key="home-foreman" :sections="foremanSections">
          <template #dashboard>
            <HomeDashboardQuickAccess />
          </template>
          <template #equipment>
            <HomeEquipmentGrid :equipment="equipmentStore.list" />
          </template>
          <template #summary>
            <HomeMaintenanceSummary />
          </template>
          <template #operations>
            <div class="grid gap-6 lg:grid-cols-2 min-h-[50vh]">
              <HomeOrdersCard
                class="h-full"
                mode="review"
                title="На приёмке"
                subtitle="Наряды, ожидающие проверки мастером"
                empty-text="Нет нарядов на приёмке"
              />
              <HomeAlertsPanel class="h-full" />
            </div>
          </template>
        </CustomizableSections>
      </template>

      <!-- Mechanic: only assigned orders + alerts -->
      <template v-else-if="role === 'mechanic'">
        <div class="grid gap-6 lg:grid-cols-2 min-h-[50vh]">
          <HomeOrdersCard
            class="h-full"
            mode="assigned"
            title="Мои наряды"
            subtitle="Активные наряды, назначенные на вас"
            empty-text="У вас нет активных нарядов"
          />
          <HomeAlertsPanel class="h-full" />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useEquipmentStore } from '@/stores/equipment'
import { useMaintenanceStore } from '@/stores/maintenance'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/utils/constants'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { Badge } from '@/components/ui/badge'
import HomeMetricsPanel from '@/components/home/HomeMetricsPanel.vue'
import HomeMaintenanceSummary from '@/components/home/HomeMaintenanceSummary.vue'
import HomeUpcomingMaintenance from '@/components/home/HomeUpcomingMaintenance.vue'
import HomeEquipmentGrid from '@/components/home/HomeEquipmentGrid.vue'
import HomeAlertsPanel from '@/components/home/HomeAlertsPanel.vue'
import HomeOrdersCard from '@/components/home/HomeOrdersCard.vue'
import HomeDashboardQuickAccess from '@/components/home/HomeDashboardQuickAccess.vue'
import CustomizableSections from '@/components/customize/CustomizableSections.vue'

const equipmentStore = useEquipmentStore()
const maintenanceStore = useMaintenanceStore()
const authStore = useAuthStore()

const role = computed(() => authStore.userRole)
const roleLabel = computed(() => ROLE_LABELS[role.value] || '')

const engineerSections = [
  { id: 'dashboard', label: 'Мой дашборд (быстрый доступ)' },
  { id: 'equipment', label: 'Парк оборудования' },
  { id: 'summary', label: 'Сводка по ТО' },
  { id: 'operations', label: 'Предстоящее ТО и уведомления' },
]

const foremanSections = [
  { id: 'dashboard', label: 'Мой дашборд (быстрый доступ)' },
  { id: 'equipment', label: 'Парк оборудования' },
  { id: 'summary', label: 'Сводка по ТО' },
  { id: 'operations', label: 'Приёмка и уведомления' },
]

onMounted(async () => {
  const tasks = []
  if (!equipmentStore.list.length) tasks.push(equipmentStore.fetchList())
  if (!maintenanceStore.orders.length) tasks.push(maintenanceStore.loadOrders().catch(() => {}))
  await Promise.all(tasks)

  await Promise.all(
    equipmentStore.list
      .filter((e) => !equipmentStore.getDetail(e.id))
      .map((e) => equipmentStore.fetchById(e.id)),
  )
})
</script>
