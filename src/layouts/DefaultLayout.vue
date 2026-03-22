<template>
  <div class="flex h-screen bg-background text-foreground">
    <AppSidebar v-model:open="sidebarOpen" />
    <div class="flex flex-1 flex-col overflow-hidden">
      <AppHeader @toggle-sidebar="handleToggleSidebar" />
      <main class="flex-1 overflow-y-auto p-4 lg:p-6">
        <RouterView :key="route.fullPath" />
      </main>
      <AppFooter />
    </div>

    <CriticalAlertModal
      :show="alertsStore.showCriticalAlert"
      :alert="alertsStore.criticalAlert"
      @close="alertsStore.closeCriticalAlert()"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAlertsStore } from '@/stores/alerts'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import CriticalAlertModal from '@/components/CriticalAlertModal.vue'

const route = useRoute()
const alertsStore = useAlertsStore()
const sidebarOpen = ref(false)

onMounted(() => {
  if (!alertsStore.alerts.length) {
    alertsStore.fetchAlerts()
  }
})

function handleToggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
</script>
