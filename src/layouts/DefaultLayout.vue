<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Топбар -->
    <header
      class="h-15 bg-surface-1 border-b-2 border-border flex items-center justify-between px-6"
    >
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-3">
          <AppLogo />
          <h1 class="text-lg">Рудгормаш</h1>
        </div>

        <div class="flex items-center gap-2 px-3 py-1 border border-border">
          <div class="w-2 h-2 bg-primary animate-pulse" />
          <span class="text-xs opacity-70">СИСТЕМА АКТИВНА</span>
        </div>

        <LiveDataIndicator label="ДАННЫЕ" :update-interval="5000" />
      </div>

      <div class="flex items-center gap-4">
        <button
          v-if="alertsStore.hasCriticalAlerts"
          class="relative flex items-center gap-2 px-4 py-2 bg-status-critical-bg text-status-critical-text border-2 border-primary animate-pulse hover:opacity-80 transition-all duration-150"
          @click="alertsStore.openCriticalAlert()"
        >
          <Bell class="w-5 h-5" />
          <span class="text-sm">{{ alertsStore.criticalAlertCount }} КРИТИЧЕСКИХ</span>
        </button>

        <div class="metric-value text-sm opacity-70">
          {{ timeString() }}
        </div>

        <ThemeToggle />
      </div>
    </header>

    <!-- Навигация -->
    <div class="bg-surface-1 border-b-2 border-border px-6 py-2">
      <AppNavigation />
    </div>

    <!-- Контент -->
    <main class="p-6">
      <RouterView />
    </main>

    <AppFooter />

    <!-- Модальное окно критического алерта -->
    <CriticalAlertModal
      :show="alertsStore.showCriticalAlert"
      :alert="alertsStore.criticalAlert"
      @close="alertsStore.closeCriticalAlert()"
    />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { Bell } from 'lucide-vue-next'
import { useClock } from '@/composables/useClock'
import { useAlertsStore } from '@/stores/alerts'
import AppLogo from '@/components/AppLogo.vue'
import AppNavigation from '@/components/AppNavigation.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import LiveDataIndicator from '@/components/LiveDataIndicator.vue'
import CriticalAlertModal from '@/components/CriticalAlertModal.vue'

const { timeString } = useClock()
const alertsStore = useAlertsStore()
</script>

<style scoped></style>
