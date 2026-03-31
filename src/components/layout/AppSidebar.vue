<template>
  <!-- Mobile: Sheet overlay sidebar -->
  <Sheet v-if="isMobile" :open="open" @update:open="handleUpdateOpen">
    <SheetContent side="left" class="w-64 p-0">
      <SheetHeader class="p-4 border-b border-border">
        <SheetTitle class="flex items-center gap-3">
          <AppLogo />
          <span class="text-base font-semibold">Рудгормаш</span>
        </SheetTitle>
        <SheetDescription class="sr-only">Навигация</SheetDescription>
      </SheetHeader>
      <nav class="flex flex-col flex-1 overflow-y-auto p-2">
        <SidebarGroup
          v-for="group in menuGroups"
          :key="group.title"
          :title="group.title"
          :items="group.items"
          :expanded="true"
          @navigate="handleMobileNavigate"
        />
      </nav>
      <div class="border-t border-border p-3">
        <div class="flex items-center gap-3">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </SheetContent>
  </Sheet>

  <!-- Desktop: Collapsible sidebar -->
  <aside
    v-else
    class="group/sidebar relative flex h-full flex-col border-r border-border bg-surface-1 transition-all duration-200"
    :class="sidebarWidth"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Logo area -->
    <div class="flex h-12 items-center gap-3 border-b border-border px-3">
      <AppLogo />
      <span
        v-if="isExpanded"
        class="text-base font-semibold truncate transition-opacity duration-200"
      >
        Рудгормаш
      </span>
    </div>

    <!-- Navigation -->
    <nav class="flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-2">
      <SidebarGroup
        v-for="group in menuGroups"
        :key="group.title"
        :title="group.title"
        :items="group.items"
        :expanded="isExpanded"
        @navigate="() => {}"
      />
    </nav>

    <!-- Bottom: pin, theme, user -->
    <div class="border-t border-border p-2">
      <div class="flex items-center" :class="isExpanded ? 'gap-2' : 'flex-col gap-2'">
        <TooltipProvider :delay-duration="300">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="ghost" size="icon-sm" @click="handleTogglePin">
                <PinOff v-if="pinned" class="h-4 w-4" />
                <Pin v-else class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {{ pinned ? 'Открепить' : 'Закрепить' }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <ThemeToggle />
        <UserMenu />
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Pin, PinOff } from 'lucide-vue-next'
import { useBreakpoint } from '@/composables/useBreakpoint'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import AppLogo from '@/components/AppLogo.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import SidebarGroup from '@/components/layout/SidebarGroup.vue'
import UserMenu from '@/components/layout/UserMenu.vue'
import { menuGroups } from '@/components/layout/sidebarMenu'

defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['update:open'])

const { isMobile } = useBreakpoint()

const pinned = ref(false)
const hovered = ref(false)

const isExpanded = computed(() => pinned.value || hovered.value)

const sidebarWidth = computed(() => (isExpanded.value ? 'w-55' : 'w-14'))

function handleMouseEnter() {
  if (!pinned.value) hovered.value = true
}

function handleMouseLeave() {
  if (!pinned.value) hovered.value = false
}

function handleTogglePin() {
  pinned.value = !pinned.value
  if (pinned.value) hovered.value = false
}

function handleUpdateOpen(value) {
  emit('update:open', value)
}

function handleMobileNavigate() {
  emit('update:open', false)
}
</script>
