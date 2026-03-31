<template>
  <header
    class="flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface-1 px-4"
  >
    <!-- Left side -->
    <div class="flex items-center gap-3">
      <Button v-if="isMobile" variant="ghost" size="icon-sm" @click="handleToggleSidebar">
        <Menu class="h-5 w-5" />
      </Button>
      <AppLogo v-if="isMobile" />
      <AppBreadcrumb class="hidden sm:flex" />
    </div>

    <!-- Right side -->
    <div class="flex items-center gap-2">
      <span class="metric-value text-xs text-muted-foreground hidden md:block">
        {{ timeString }}
      </span>

      <ConnectionStatus />

      <TooltipProvider :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon-sm" class="relative" @click="handleNavigateAlerts">
              <Bell class="h-4 w-4" />
              <Badge
                v-if="alertsStore.unacknowledgedCount > 0"
                variant="destructive"
                class="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
              >
                {{ alertsStore.unacknowledgedCount }}
              </Badge>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Уведомления</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <UserMenu />
    </div>
  </header>
</template>

<script setup>
import { Bell, Menu } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useClock } from '@/composables/useClock'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useAlertsStore } from '@/stores/alerts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import AppLogo from '@/components/AppLogo.vue'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import ConnectionStatus from '@/components/ConnectionStatus.vue'
import UserMenu from '@/components/layout/UserMenu.vue'

const emit = defineEmits(['toggle-sidebar'])

const router = useRouter()
const { timeString } = useClock()
const { isMobile } = useBreakpoint()
const alertsStore = useAlertsStore()

function handleToggleSidebar() {
  emit('toggle-sidebar')
}

function handleNavigateAlerts() {
  router.push({ name: 'alerts' })
}
</script>
