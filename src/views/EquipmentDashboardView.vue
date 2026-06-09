<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3 sm:gap-4">
        <Button variant="outline" size="icon" class="min-h-[44px] min-w-[44px]" as-child>
          <RouterLink :to="`/equipment/${equipmentId}`">
            <ArrowLeft class="w-5 h-5" />
          </RouterLink>
        </Button>
        <div>
          <h2 class="text-xl sm:text-2xl font-semibold">{{ equipmentId }}</h2>
          <div class="text-xs sm:text-sm text-muted-foreground mt-1">Панель мониторинга</div>
        </div>
      </div>
    </div>

    <DashboardCanvas :config-key="equipmentId" :data-equipment-id="equipmentId" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useEquipmentStore } from '@/stores/equipment'
import { Button } from '@/components/ui/button'
import DashboardCanvas from '@/components/dashboard/DashboardCanvas.vue'

const route = useRoute()
const equipmentStore = useEquipmentStore()

const equipmentId = computed(() => route.params.id)

onMounted(() => {
  equipmentStore.fetchById(equipmentId.value)
})
</script>
