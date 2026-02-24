<template>
  <div class="min-h-screen bg-background text-foreground">
    <header
      class="min-h-15 bg-surface-1 border-b-2 border-border flex items-center justify-between px-4 md:px-6 gap-2"
    >
      <div class="flex items-center gap-4 md:gap-6">
        <div class="flex items-center gap-3">
          <AppLogo />
          <h1 class="text-lg hidden sm:block">Рудгормаш</h1>
        </div>

        <ConnectionStatus />
      </div>

      <div class="flex items-center gap-2 md:gap-4">
        <button
          v-if="alertsStore.hasCriticalAlerts"
          class="relative flex items-center gap-2 px-3 py-2 min-h-11 bg-status-critical-bg text-status-critical-text border-2 border-primary animate-pulse hover:opacity-80 transition-all duration-150"
          @click="alertsStore.openCriticalAlert()"
        >
          <Bell class="w-5 h-5" />
          <span class="text-sm hidden sm:inline">
            {{ alertsStore.criticalAlertCount }} КРИТИЧЕСКИХ
          </span>
        </button>

        <div class="metric-value text-sm opacity-70 hidden md:block">
          {{ timeString }}
        </div>

        <ThemeToggle />

        <div class="flex items-center gap-2 pl-2 md:pl-4 border-l-2 border-border">
          <User class="w-4 h-4 opacity-50 hidden md:block" />
          <span class="text-xs opacity-70 hidden lg:block">{{ authStore.userName }}</span>
          <button
            class="ml-1 p-2 min-w-11 min-h-11 flex items-center justify-center border border-border hover:bg-surface-2 transition-all duration-150"
            title="Выйти"
            @click="handleLogout"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>

    <div class="bg-surface-1 border-b-2 border-border px-6 py-2">
      <AppNavigation />
    </div>

    <main class="p-4 md:p-6">
      <RouterView />
    </main>

    <AppFooter />

    <CriticalAlertModal
      :show="alertsStore.showCriticalAlert"
      :alert="alertsStore.criticalAlert"
      @close="alertsStore.closeCriticalAlert()"
    />
  </div>
</template>

<script setup>
import { Bell, User, LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useClock } from '@/composables/useClock'
import { useAlertsStore } from '@/stores/alerts'
import { useAuthStore } from '@/stores/auth'
import AppLogo from '@/components/AppLogo.vue'
import AppNavigation from '@/components/AppNavigation.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import ConnectionStatus from '@/components/ConnectionStatus.vue'
import CriticalAlertModal from '@/components/CriticalAlertModal.vue'

import { onMounted } from 'vue'

const router = useRouter()
const { timeString } = useClock()
const alertsStore = useAlertsStore()
const authStore = useAuthStore()

onMounted(() => {
  if (!alertsStore.alerts.length) {
    alertsStore.fetchAlerts()
  }
})

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>
