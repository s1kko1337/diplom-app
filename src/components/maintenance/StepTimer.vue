<template>
  <div v-if="startedAt" class="flex items-center gap-1.5">
    <Timer
      :size="14"
      :class="active && !completedAt ? 'text-green-500' : 'text-muted-foreground'"
    />
    <span
      class="metric-value text-sm"
      :class="active && !completedAt ? 'text-green-500' : 'text-muted-foreground'"
    >
      {{ display }}
    </span>
  </div>
  <div v-else class="flex items-center gap-1.5 text-muted-foreground">
    <Timer :size="14" />
    <span class="metric-value text-sm">&mdash;</span>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { Timer } from 'lucide-vue-next'
import { formatDuration, durationBetween } from '@/utils/formatDuration'

const props = defineProps({
  startedAt: {
    type: String,
    default: null,
  },
  completedAt: {
    type: String,
    default: null,
  },
  active: {
    type: Boolean,
    default: false,
  },
})

const display = ref('00:00:00')
let intervalId = null

function updateDisplay() {
  display.value = formatDuration(durationBetween(props.startedAt, props.completedAt))
}

function startTicking() {
  stopTicking()
  updateDisplay()
  if (props.active && props.startedAt && !props.completedAt) {
    intervalId = setInterval(updateDisplay, 1000)
  }
}

function stopTicking() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

watch(
  () => [props.startedAt, props.completedAt, props.active],
  () => {
    startTicking()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  stopTicking()
})
</script>

<style scoped></style>
