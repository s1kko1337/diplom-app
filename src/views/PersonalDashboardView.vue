<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-3">
          <h2 class="text-xl sm:text-2xl font-semibold">Мой дашборд</h2>
          <Badge v-if="roleLabel" variant="outline" class="text-xs">{{ roleLabel }}</Badge>
        </div>
        <div class="text-xs sm:text-sm text-muted-foreground mt-1">
          Персональная панель мониторинга
        </div>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-xs text-muted-foreground">ИСТОЧНИК:</label>
        <Select v-model="sourceEquipmentId">
          <SelectTrigger class="w-[200px] h-9">
            <SelectValue placeholder="Выберите оборудование" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="eq in equipmentStore.list" :key="eq.id" :value="eq.id">
              {{ eq.id }} — {{ eq.model }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <LoadingSpinner v-if="!sourceEquipmentId" />
    <DashboardCanvas
      v-else
      :key="configKey"
      :config-key="configKey"
      :data-equipment-id="sourceEquipmentId"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useEquipmentStore } from '@/stores/equipment'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/utils/constants'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import DashboardCanvas from '@/components/dashboard/DashboardCanvas.vue'

const equipmentStore = useEquipmentStore()
const authStore = useAuthStore()

const role = computed(() => authStore.userRole || 'guest')
const roleLabel = computed(() => ROLE_LABELS[authStore.userRole] || '')
const configKey = computed(() => `role:${role.value}`)

const sourceStorageKey = computed(() => `personal-dashboard-source:${role.value}`)
const sourceEquipmentId = ref('')

watch(sourceEquipmentId, (id) => {
  if (id) localStorage.setItem(sourceStorageKey.value, id)
})

onMounted(async () => {
  if (!equipmentStore.list.length) {
    await equipmentStore.fetchList()
  }
  const saved = localStorage.getItem(sourceStorageKey.value)
  const exists = saved && equipmentStore.list.some((e) => e.id === saved)
  sourceEquipmentId.value = exists ? saved : equipmentStore.list[0]?.id || ''
})
</script>
