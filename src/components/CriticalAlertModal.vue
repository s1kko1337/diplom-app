<template>
  <!-- Mobile: Sheet from bottom -->
  <Sheet v-if="isMobile" :open="show" @update:open="handleOpenChange">
    <SheetContent
      side="bottom"
      class="max-h-[90vh] overflow-y-auto bg-status-critical-solid-bg text-status-critical-solid-text border-status-critical-solid-text/30 animate-pulse rounded-t-lg"
      data-testid="critical-alert-modal"
    >
      <SheetHeader>
        <SheetTitle class="text-2xl text-status-critical-solid-text">
          &#9888; КРИТИЧЕСКОЕ УВЕДОМЛЕНИЕ
        </SheetTitle>
        <SheetDescription class="metric-value text-sm text-status-critical-solid-text/70">
          {{ timestamp }}
        </SheetDescription>
      </SheetHeader>

      <div class="space-y-6 py-4">
        <div>
          <label class="text-xs mb-2 block opacity-70">ОБОРУДОВАНИЕ</label>
          <div class="text-xl metric-value">{{ alert.equipment }}</div>
        </div>

        <div>
          <label class="text-xs mb-2 block opacity-70">ОПИСАНИЕ ПРОБЛЕМЫ</label>
          <div class="text-lg">{{ alert.title }}</div>
          <div class="mt-3 text-base opacity-80">{{ alert.description }}</div>
        </div>
      </div>

      <div class="flex flex-col gap-3 pt-6 border-t border-current">
        <button
          class="w-full min-h-[44px] px-6 py-3 border border-current rounded-md hover:bg-status-critical-solid-text hover:text-status-critical-solid-bg transition-all duration-150"
          @click="handleClose"
        >
          <span class="text-sm">ПОДТВЕРДИТЬ И ЗАКРЫТЬ</span>
        </button>

        <button
          class="w-full min-h-[44px] px-6 py-3 bg-status-critical-solid-text text-status-critical-solid-bg border border-current rounded-md hover:opacity-80 transition-all duration-150"
        >
          <span class="text-sm">ЭКСТРЕННАЯ ОСТАНОВКА</span>
        </button>
      </div>
    </SheetContent>
  </Sheet>

  <!-- Desktop: Dialog -->
  <Dialog v-else :open="show" @update:open="handleOpenChange">
    <DialogContent
      class="max-w-2xl bg-status-critical-solid-bg text-status-critical-solid-text border-status-critical-solid-text/30 animate-pulse rounded-lg"
      data-testid="critical-alert-modal"
    >
      <DialogHeader>
        <DialogTitle class="text-3xl text-status-critical-solid-text">
          &#9888; КРИТИЧЕСКОЕ УВЕДОМЛЕНИЕ
        </DialogTitle>
        <DialogDescription class="metric-value text-sm text-status-critical-solid-text/70">
          {{ timestamp }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <div>
          <label class="text-xs mb-2 block opacity-70">ОБОРУДОВАНИЕ</label>
          <div class="text-2xl metric-value">{{ alert.equipment }}</div>
        </div>

        <div>
          <label class="text-xs mb-2 block opacity-70">ОПИСАНИЕ ПРОБЛЕМЫ</label>
          <div class="text-xl">{{ alert.title }}</div>
          <div class="mt-3 text-base opacity-80">{{ alert.description }}</div>
        </div>
      </div>

      <DialogFooter class="pt-6 border-t border-current gap-4">
        <button
          class="flex-1 min-h-[44px] px-6 py-4 border border-current rounded-md hover:bg-status-critical-solid-text hover:text-status-critical-solid-bg transition-all duration-150"
          @click="handleClose"
        >
          <span class="text-sm">ПОДТВЕРДИТЬ И ЗАКРЫТЬ</span>
        </button>

        <button
          class="flex-1 min-h-[44px] px-6 py-4 bg-status-critical-solid-text text-status-critical-solid-bg border border-current rounded-md hover:opacity-80 transition-all duration-150"
        >
          <span class="text-sm">ЭКСТРЕННАЯ ОСТАНОВКА</span>
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

const props = defineProps({
  show: { type: Boolean, default: false },
  alert: { type: Object, required: true },
})

const emit = defineEmits(['close'])

const { isMobile } = useBreakpoint()
const timestamp = ref('')

function handleClose() {
  emit('close')
}

function handleOpenChange(open) {
  if (!open) {
    emit('close')
  }
}

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      timestamp.value = new Date().toLocaleString('ru-RU')
    }
  },
)
</script>
