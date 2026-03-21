<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div class="flex items-center gap-4">
      <RouterLink
        to="/equipment"
        class="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center border border-border hover:bg-surface-2 transition-all duration-150 rounded-md"
      >
        <ArrowLeft class="w-5 h-5" />
      </RouterLink>
      <div>
        <h2 class="text-xl sm:text-2xl">{{ equipment.id }}</h2>
        <div class="metric-value text-xs sm:text-sm opacity-50 mt-1">
          {{ equipment.fullModel }} &bull; ID: {{ equipment.serial }}
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3 sm:gap-4 flex-wrap">
      <Badge :variant="isWorking ? 'default' : 'secondary'" class="gap-2 px-4 py-2">
        <div
          class="w-2 h-2 rounded-full"
          :class="isWorking ? 'bg-primary-foreground animate-pulse' : 'bg-muted-foreground'"
        />
        <span class="text-xs">{{ equipment.statusLabel }}</span>
      </Badge>

      <div class="metric-value text-sm opacity-70 hidden sm:block">
        {{ equipment.operatingHours }} ч
      </div>

      <Button variant="outline" size="sm" class="min-h-[44px] sm:min-h-0" @click="handleToggle">
        <component :is="isPolling ? Pause : Play" class="w-4 h-4" />
        {{ isPolling ? 'ПАУЗА' : 'ОПРОС' }}
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowLeft, Pause, Play } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const props = defineProps({
  equipment: { type: Object, required: true },
  isPolling: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-polling'])

const isWorking = computed(() => props.equipment?.status === 'working')

function handleToggle() {
  emit('toggle-polling')
}
</script>
