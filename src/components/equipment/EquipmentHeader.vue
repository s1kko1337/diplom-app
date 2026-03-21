<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <RouterLink
        to="/equipment"
        class="p-3 border-2 border-border hover:bg-surface-2 transition-all duration-150 rounded-md"
      >
        <ArrowLeft class="w-5 h-5" />
      </RouterLink>
      <div>
        <h2 class="text-2xl">{{ equipment.id }}</h2>
        <div class="metric-value text-sm opacity-50 mt-1">
          {{ equipment.fullModel }} &bull; ID: {{ equipment.serial }}
        </div>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <Badge :variant="isWorking ? 'default' : 'secondary'" class="gap-2 px-4 py-2">
        <div
          class="w-2 h-2 rounded-full"
          :class="isWorking ? 'bg-primary-foreground animate-pulse' : 'bg-muted-foreground'"
        />
        <span class="text-xs">{{ equipment.statusLabel }}</span>
      </Badge>

      <div class="metric-value text-sm opacity-70">{{ equipment.operatingHours }} ч</div>

      <Button variant="outline" size="sm" @click="handleToggle">
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
