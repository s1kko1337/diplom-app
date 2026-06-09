<template>
  <RouterLink :to="{ name: 'personal-dashboard' }" class="block">
    <Card class="transition-colors hover:border-primary hover:bg-accent/40">
      <CardContent class="flex items-center gap-4 p-4">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <LayoutDashboard class="h-5 w-5 text-primary" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-semibold">Мой дашборд</div>
          <div class="text-xs text-muted-foreground truncate">
            Настраиваемая панель мониторинга{{ roleLabel ? ` — ${roleLabel}` : '' }}
          </div>
        </div>
        <Button variant="outline" size="sm" tabindex="-1">
          Открыть
          <ArrowRight class="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { LayoutDashboard, ArrowRight } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/utils/constants'

const authStore = useAuthStore()
const roleLabel = computed(() => ROLE_LABELS[authStore.userRole] || '')
</script>
