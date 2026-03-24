<template>
  <div class="space-y-2">
    <!-- Text indicator -->
    <p class="text-sm text-muted-foreground">Шаг {{ currentStep + 1 }} из {{ steps.length }}</p>

    <!-- Dot progress bar -->
    <div class="flex items-center gap-0">
      <template v-for="(step, index) in steps" :key="index">
        <!-- Connector line (before each dot except first) -->
        <div
          v-if="index > 0"
          class="flex-1 h-0.5"
          :class="index <= currentStep ? 'bg-primary' : 'bg-muted'"
        />

        <!-- Step dot -->
        <button
          type="button"
          class="w-4 h-4 rounded-full flex-shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :class="dotClass(step, index)"
          :title="`Шаг ${index + 1}`"
          @click="emit('navigate', index)"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentStep: {
    type: Number,
    required: true,
  },
  steps: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['navigate'])

function dotClass(step, index) {
  if (index === props.currentStep) return 'bg-primary ring-2 ring-primary ring-offset-2'
  if (step.status === 'passed') return 'bg-green-500'
  if (step.status === 'failed') return 'bg-red-500'
  if (step.status === 'in_progress') return 'bg-yellow-500'
  if (step.status === 'skipped') return 'bg-zinc-400'
  return 'bg-muted-foreground/30'
}
</script>

<style scoped></style>
