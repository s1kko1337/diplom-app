<template>
  <div class="space-y-4">
    <!-- Wizard view -->
    <template v-if="!showSummary">
      <!-- Progress bar -->
      <StepProgress
        :current-step="currentStepIndex"
        :steps="order.steps"
        @navigate="currentStepIndex = $event"
      />

      <!-- Current step card -->
      <StepCard
        v-if="currentStep"
        :step="currentStep"
        :step-number="currentStepIndex + 1"
        :readonly="false"
        @complete="handleStepComplete"
        @update:step="handleStepUpdate"
      />

      <!-- Navigation buttons -->
      <div class="flex gap-2">
        <Button v-if="currentStepIndex > 0" variant="outline" @click="currentStepIndex--">
          ← Назад
        </Button>
        <Button v-if="currentStepIndex < order.steps.length - 1" @click="currentStepIndex++">
          Далее →
        </Button>
      </div>
    </template>

    <!-- Summary view -->
    <template v-else>
      <OrderSummary :order="order" @submit="handleSubmitForReview" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import StepProgress from './StepProgress.vue'
import StepCard from './StepCard.vue'
import OrderSummary from './OrderSummary.vue'
import { useMaintenanceStore } from '@/stores/maintenance'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['step-completed', 'submit-for-review'])

const maintenanceStore = useMaintenanceStore()

const initialIndex = props.order.steps.findIndex(
  (s) => s.status === 'pending' || s.status === 'in_progress',
)
const currentStepIndex = ref(initialIndex >= 0 ? initialIndex : 0)
const showSummary = ref(false)

const currentStep = computed(() => props.order.steps[currentStepIndex.value])

async function autoStartStep() {
  const step = currentStep.value
  if (step && step.status === 'pending') {
    await maintenanceStore.startStep(props.order.id, step.id)
  }
}

watch(
  currentStepIndex,
  () => {
    autoStartStep().catch(() => {})
  },
  { immediate: true },
)

async function handleStepComplete({ status, comment }) {
  const step = currentStep.value
  await maintenanceStore.completeStep(props.order.id, step.id, status, comment)
  emit('step-completed')

  // Check if all steps are done
  const allDone = props.order.steps.every(
    (s) => s.status !== 'pending' && s.status !== 'in_progress',
  )
  if (allDone) {
    showSummary.value = true
    return
  }

  // Advance to next pending step
  const nextPending = props.order.steps.findIndex(
    (s, idx) => idx > currentStepIndex.value && s.status === 'pending',
  )
  if (nextPending !== -1) {
    currentStepIndex.value = nextPending
  } else if (currentStepIndex.value < props.order.steps.length - 1) {
    currentStepIndex.value++
  }
}

function handleStepUpdate(updatedStep) {
  if (!maintenanceStore.currentOrder) return
  const idx = maintenanceStore.currentOrder.steps.findIndex((s) => s.id === updatedStep.id)
  if (idx !== -1) {
    maintenanceStore.currentOrder.steps[idx] = { ...updatedStep }
  }
}

function handleSubmitForReview() {
  emit('submit-for-review')
}
</script>

<style scoped></style>
