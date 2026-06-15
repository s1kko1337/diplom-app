<template>
  <div class="space-y-4">
    <!-- Toolbar (скрывается, если кнопкой «Настроить» управляет родитель) -->
    <div v-if="!hideToolbar" class="flex items-center justify-end gap-2">
      <Button
        :variant="editing ? 'default' : 'outline'"
        size="sm"
        @click="editing = !editing"
      >
        <component :is="editing ? Check : SlidersHorizontal" class="w-4 h-4" />
        {{ editing ? 'Готово' : 'Настроить' }}
      </Button>
    </div>

    <!-- Edit panel: reorder / show-hide -->
    <Card v-if="editing" class="border-dashed">
      <CardContent class="p-3 space-y-1">
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="text-xs text-muted-foreground">
            Перетащите кнопками порядок и скройте ненужные блоки
          </div>
          <Button
            variant="ghost"
            size="sm"
            class="text-xs text-muted-foreground shrink-0"
            @click="handleReset"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            Сбросить
          </Button>
        </div>
        <div
          v-for="(section, idx) in orderedSections"
          :key="section.id"
          class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-surface-2"
        >
          <button
            class="p-1 rounded hover:bg-surface-1 disabled:opacity-30"
            :disabled="idx === 0"
            title="Выше"
            @click="move(section.id, -1)"
          >
            <ChevronUp class="w-4 h-4" />
          </button>
          <button
            class="p-1 rounded hover:bg-surface-1 disabled:opacity-30"
            :disabled="idx === orderedSections.length - 1"
            title="Ниже"
            @click="move(section.id, 1)"
          >
            <ChevronDown class="w-4 h-4" />
          </button>
          <span class="flex-1 text-sm" :class="{ 'opacity-40': isHidden(section.id) }">
            {{ section.label }}
          </span>
          <button
            class="p-1 rounded hover:bg-surface-1"
            :title="isHidden(section.id) ? 'Показать' : 'Скрыть'"
            @click="layoutPrefs.toggleHidden(pageKey, section.id)"
          >
            <component :is="isHidden(section.id) ? EyeOff : Eye" class="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- Sections -->
    <div class="space-y-6">
      <div v-for="section in visibleSections" :key="section.id">
        <slot :name="section.id" />
      </div>
      <div
        v-if="visibleSections.length === 0"
        class="text-center py-8 text-sm text-muted-foreground"
      >
        Все блоки скрыты. Нажмите «Настроить», чтобы вернуть их.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  SlidersHorizontal,
  Check,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useLayoutPrefsStore } from '@/stores/layoutPrefs'

const props = defineProps({
  pageKey: { type: String, required: true },
  // [{ id, label }] в порядке по умолчанию
  sections: { type: Array, required: true },
  // Скрыть встроенную кнопку «Настроить» — когда режимом управляет родитель.
  hideToolbar: { type: Boolean, default: false },
})

// Режим редактирования: локальный по умолчанию, либо контролируемый родителем
// через v-model:editing.
const editing = defineModel('editing', { type: Boolean, default: false })

const layoutPrefs = useLayoutPrefsStore()

const pagePrefs = computed(() => layoutPrefs.getPage(props.pageKey))

// Эффективный порядок: сохранённый порядок (только известные id) + новые секции в конец.
const orderedSections = computed(() => {
  const byId = new Map(props.sections.map((s) => [s.id, s]))
  const result = []
  for (const id of pagePrefs.value.order) {
    if (byId.has(id)) {
      result.push(byId.get(id))
      byId.delete(id)
    }
  }
  for (const s of props.sections) {
    if (byId.has(s.id)) result.push(s)
  }
  return result
})

const visibleSections = computed(() =>
  orderedSections.value.filter((s) => !isHidden(s.id)),
)

function isHidden(id) {
  return pagePrefs.value.hidden.includes(id)
}

function move(id, dir) {
  const order = orderedSections.value.map((s) => s.id)
  const from = order.indexOf(id)
  const to = from + dir
  if (to < 0 || to >= order.length) return
  order.splice(to, 0, order.splice(from, 1)[0])
  layoutPrefs.setOrder(props.pageKey, order)
}

function handleReset() {
  layoutPrefs.reset(props.pageKey)
}
</script>
