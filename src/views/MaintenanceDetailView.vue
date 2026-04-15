<template>
  <div class="container mx-auto px-4 py-6 max-w-4xl space-y-6">
    <!-- Loading state -->
    <LoadingSpinner v-if="ordersLoading" />

    <!-- Order not found -->
    <div v-else-if="!currentOrder" class="text-center py-12 text-muted-foreground">
      Наряд не найден
    </div>

    <!-- Order content -->
    <template v-else>
      <OrderHeader :order="currentOrder" />

      <div class="pt-2">
        <!-- planned status -->
        <template v-if="currentOrder.status === 'planned'">
          <!-- Assigned mechanic: start button -->
          <div v-if="canExecute(currentOrder)" class="space-y-4">
            <Button @click="handleStartOrder">Начать выполнение</Button>
          </div>
          <!-- Foreman: view steps readonly -->
          <template v-else-if="canReview">
            <OrderSummary :order="currentOrder" readonly />
          </template>
          <!-- Engineer/others: view + cancel -->
          <template v-else>
            <div class="space-y-4">
              <OrderSummary :order="currentOrder" readonly />
              <Button
                v-if="canCancel(currentOrder)"
                variant="destructive"
                @click="handleCancelOrder"
              >
                Отменить наряд
              </Button>
            </div>
          </template>
        </template>

        <!-- in_progress status -->
        <template v-else-if="currentOrder.status === 'in_progress'">
          <!-- Assigned mechanic: step wizard -->
          <div v-if="canExecute(currentOrder)">
            <StepWizard
              :order="currentOrder"
              @step-completed="handleStepCompleted"
              @submit-for-review="handleSubmitForReview"
            />
          </div>
          <!-- Foreman: view progress readonly -->
          <template v-else-if="canReview">
            <OrderSummary :order="currentOrder" readonly />
          </template>
          <!-- Engineer/others: view + cancel -->
          <template v-else>
            <div class="space-y-4">
              <OrderSummary :order="currentOrder" readonly />
              <Button
                v-if="canCancel(currentOrder)"
                variant="destructive"
                @click="handleCancelOrder"
              >
                Отменить наряд
              </Button>
            </div>
          </template>
        </template>

        <!-- review status -->
        <template v-else-if="currentOrder.status === 'review'">
          <!-- Foreman: review actions -->
          <div v-if="canReview">
            <ReviewActions :order="currentOrder" @approve="handleApprove" @return="handleReturn" />
          </div>
          <!-- Others: view readonly -->
          <template v-else>
            <OrderSummary :order="currentOrder" readonly />
          </template>
        </template>

        <!-- completed / cancelled -->
        <template v-else>
          <OrderSummary :order="currentOrder" readonly />
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { Button } from '@/components/ui/button'
import OrderHeader from '@/components/maintenance/OrderHeader.vue'
import OrderSummary from '@/components/maintenance/OrderSummary.vue'
import StepWizard from '@/components/maintenance/StepWizard.vue'
import ReviewActions from '@/components/maintenance/ReviewActions.vue'
import { useMaintenanceStore } from '@/stores/maintenance'
import { usePermissions } from '@/composables/usePermissions'

const route = useRoute()
const maintenanceStore = useMaintenanceStore()
const { currentOrder, ordersLoading } = storeToRefs(maintenanceStore)
const { canExecute, canReview, canCancel } = usePermissions()

const id = computed(() => route.params.id)

watch(
  id,
  (val) => {
    if (val) maintenanceStore.loadOrder(val)
  },
  { immediate: true },
)

async function handleStartOrder() {
  await maintenanceStore.startOrder(currentOrder.value.id)
}

async function handleCancelOrder() {
  await maintenanceStore.cancelOrder(currentOrder.value.id)
}

function handleStepCompleted() {
  // Store already updated currentOrder in-place — no reload needed.
}

async function handleSubmitForReview() {
  await maintenanceStore.submitForReview(currentOrder.value.id)
}

async function handleApprove() {
  await maintenanceStore.approveOrder(currentOrder.value.id)
}

async function handleReturn(reason) {
  await maintenanceStore.returnOrder(currentOrder.value.id, reason)
}
</script>

<style scoped></style>
