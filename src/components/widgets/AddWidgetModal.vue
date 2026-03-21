<template>
  <!-- Mobile: Sheet from bottom -->
  <Sheet v-if="isMobile" :open="show" @update:open="handleOpenChange">
    <SheetContent side="bottom" class="max-h-[90vh] flex flex-col rounded-t-lg">
      <SheetHeader>
        <SheetTitle>ДОБАВИТЬ ВИДЖЕТ</SheetTitle>
        <SheetDescription class="sr-only">Выбор типа виджета</SheetDescription>
      </SheetHeader>

      <div class="space-y-4 overflow-y-auto flex-1 py-2">
        <div>
          <label class="text-xs opacity-70 mb-2 block">ТИП ВИДЖЕТА</label>
          <div class="space-y-2">
            <button
              v-for="wt in widgetTypesList"
              :key="wt.type"
              class="w-full text-left p-3 min-h-[44px] border rounded-md transition-all duration-150"
              :class="
                selectedType === wt.type
                  ? 'border-primary bg-surface-2'
                  : 'border-border hover:bg-surface-2'
              "
              @click="handleSelectType(wt.type)"
            >
              <div class="text-sm">{{ wt.label }}</div>
              <div class="text-xs opacity-50 mt-1">{{ wt.description }}</div>
            </button>
          </div>
        </div>

        <div v-if="needsSensor">
          <label class="text-xs opacity-70 mb-2 block">ДАТЧИК</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="s in sensors"
              :key="s.id"
              class="text-left p-2 min-h-[44px] border rounded-md transition-all duration-150"
              :class="
                selectedSensor === s.id
                  ? 'border-primary bg-surface-2'
                  : 'border-border hover:bg-surface-2'
              "
              @click="selectedSensor = s.id"
            >
              <div class="text-xs">{{ s.label }}</div>
              <div class="text-xs opacity-40 mt-0.5">{{ s.unit }}</div>
            </button>
          </div>
        </div>
      </div>

      <div class="flex gap-2 border-t border-border pt-4">
        <button
          class="flex-1 min-h-[44px] px-4 py-2 border border-border rounded-md text-sm hover:bg-surface-2 transition-all duration-150"
          @click="handleClose"
        >
          ОТМЕНА
        </button>
        <button
          :disabled="!canAdd"
          class="flex-1 min-h-[44px] px-4 py-2 border border-primary rounded-md text-sm hover:bg-surface-2 transition-all duration-150 disabled:opacity-30"
          @click="handleAdd"
        >
          ДОБАВИТЬ
        </button>
      </div>
    </SheetContent>
  </Sheet>

  <!-- Desktop: Dialog -->
  <Dialog v-else :open="show" @update:open="handleOpenChange">
    <DialogContent class="max-w-lg max-h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>ДОБАВИТЬ ВИДЖЕТ</DialogTitle>
      </DialogHeader>

      <div class="space-y-4 overflow-y-auto flex-1 py-2">
        <div>
          <label class="text-xs opacity-70 mb-2 block">ТИП ВИДЖЕТА</label>
          <div class="space-y-2">
            <button
              v-for="wt in widgetTypesList"
              :key="wt.type"
              class="w-full text-left p-3 min-h-[44px] border rounded-md transition-all duration-150"
              :class="
                selectedType === wt.type
                  ? 'border-primary bg-surface-2'
                  : 'border-border hover:bg-surface-2'
              "
              @click="handleSelectType(wt.type)"
            >
              <div class="text-sm">{{ wt.label }}</div>
              <div class="text-xs opacity-50 mt-1">{{ wt.description }}</div>
            </button>
          </div>
        </div>

        <div v-if="needsSensor">
          <label class="text-xs opacity-70 mb-2 block">ДАТЧИК</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="s in sensors"
              :key="s.id"
              class="text-left p-2 min-h-[44px] border rounded-md transition-all duration-150"
              :class="
                selectedSensor === s.id
                  ? 'border-primary bg-surface-2'
                  : 'border-border hover:bg-surface-2'
              "
              @click="selectedSensor = s.id"
            >
              <div class="text-xs">{{ s.label }}</div>
              <div class="text-xs opacity-40 mt-0.5">{{ s.unit }}</div>
            </button>
          </div>
        </div>
      </div>

      <DialogFooter class="border-t border-border pt-4 gap-2">
        <button
          class="px-4 py-2 min-h-[44px] border border-border rounded-md text-sm hover:bg-surface-2 transition-all duration-150"
          @click="handleClose"
        >
          ОТМЕНА
        </button>
        <button
          :disabled="!canAdd"
          class="px-4 py-2 min-h-[44px] border border-primary rounded-md text-sm hover:bg-surface-2 transition-all duration-150 disabled:opacity-30"
          @click="handleAdd"
        >
          ДОБАВИТЬ
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { getWidgetTypesList, widgetTypes } from './widgetRegistry'

defineProps({
  show: { type: Boolean, default: false },
  sensors: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'add'])

const { isMobile } = useBreakpoint()

function handleClose() {
  emit('close')
}

function handleOpenChange(open) {
  if (!open) {
    emit('close')
  }
}

const widgetTypesList = getWidgetTypesList()
const selectedType = ref(null)
const selectedSensor = ref(null)

const needsSensor = computed(() => {
  if (!selectedType.value) return false
  const wt = widgetTypesList.find((w) => w.type === selectedType.value)
  return wt?.requiresSensor !== false
})

const canAdd = computed(() => {
  if (!selectedType.value) return false
  if (needsSensor.value && !selectedSensor.value) return false
  return true
})

function handleSelectType(type) {
  selectedType.value = type
  if (!needsSensor.value) {
    selectedSensor.value = null
  }
}

function handleAdd() {
  if (!canAdd.value) return
  const wType = widgetTypes[selectedType.value]
  emit('add', {
    type: selectedType.value,
    sensorId: selectedSensor.value,
    defaultSize: wType.defaultSize,
  })
  selectedType.value = null
  selectedSensor.value = null
}
</script>
