<template>
  <div class="mb-2">
    <div
      v-if="expanded"
      class="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
    >
      {{ title }}
    </div>
    <Separator v-else class="my-2" />

    <template v-for="item in items" :key="item.to">
      <TooltipProvider v-if="!expanded" :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              class="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors"
              :class="itemClass(item)"
              @click="handleClick(item)"
            >
              <component :is="item.icon" class="h-4 w-4 shrink-0" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{{ item.label }}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <button
        v-else
        class="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors"
        :class="itemClass(item)"
        @click="handleClick(item)"
      >
        <component :is="item.icon" class="h-4 w-4 shrink-0" />
        <span class="truncate">{{ item.label }}</span>
      </button>
    </template>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

defineProps({
  title: { type: String, required: true },
  items: { type: Array, required: true },
  expanded: { type: Boolean, default: false },
})

const emit = defineEmits(['navigate'])

const route = useRoute()
const router = useRouter()

function isActive(item) {
  if (item.exact) return route.path === item.to
  return route.path === item.to || route.path.startsWith(item.to + '/')
}

function itemClass(item) {
  return isActive(item)
    ? 'bg-accent text-accent-foreground font-medium'
    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
}

function handleClick(item) {
  router.push(item.to)
  emit('navigate')
}
</script>
