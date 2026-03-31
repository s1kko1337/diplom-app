<template>
  <div class="mx-auto max-w-2xl space-y-6 p-4">
    <!-- Permission check -->
    <div v-if="!canCreate" class="flex flex-col items-center gap-4 py-16 text-center">
      <p class="text-muted-foreground">Недостаточно прав для создания нарядов</p>
      <RouterLink
        :to="{ name: 'maintenance' }"
        class="text-sm text-primary underline-offset-4 hover:underline"
      >
        Вернуться к нарядам
      </RouterLink>
    </div>

    <template v-else>
      <!-- Step indicator -->
      <div class="flex items-center gap-2">
        <template v-for="(label, idx) in stepLabels" :key="idx">
          <div
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            :class="
              currentStep === idx + 1
                ? 'bg-primary text-primary-foreground'
                : currentStep > idx + 1
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
            "
          >
            {{ idx + 1 }}
          </div>
          <span
            class="text-sm"
            :class="currentStep === idx + 1 ? 'font-medium' : 'text-muted-foreground'"
          >
            {{ label }}
          </span>
          <div v-if="idx < stepLabels.length - 1" class="mx-2 h-px w-6 bg-border" />
        </template>
      </div>

      <!-- Step content -->
      <div>
        <CreateStepEquipment v-if="currentStep === 1" v-model="equipmentData" />
        <CreateStepChecklist
          v-else-if="currentStep === 2"
          :type="equipmentData.type"
          v-model="checklistData"
        />
        <CreateStepAssign
          v-else-if="currentStep === 3"
          v-model="assignData"
          :equipment="selectedEquipment"
          :type="equipmentData.type"
          :steps-count="checklistData.length"
        />
      </div>

      <!-- Navigation -->
      <div class="flex justify-between gap-3">
        <Button v-if="currentStep > 1" variant="outline" @click="goBack">Назад</Button>
        <div v-else />

        <div class="flex gap-3">
          <Button v-if="currentStep < 3" :disabled="!isCurrentStepValid" @click="goNext">
            Далее
          </Button>
          <Button
            v-if="currentStep === 3"
            :disabled="!isCurrentStepValid || creating"
            @click="handleCreate"
          >
            {{ creating ? 'Создание...' : 'Создать наряд' }}
          </Button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
import CreateStepEquipment from '@/components/maintenance/CreateStepEquipment.vue'
import CreateStepChecklist from '@/components/maintenance/CreateStepChecklist.vue'
import CreateStepAssign from '@/components/maintenance/CreateStepAssign.vue'
import { useMaintenanceStore } from '@/stores/maintenance'
import { useEquipmentStore } from '@/stores/equipment'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import { getUsersByRole } from '@/api/users'

const router = useRouter()

const maintenanceStore = useMaintenanceStore()
const equipmentStore = useEquipmentStore()
const { canCreate } = usePermissions()

const currentStep = ref(1)
const creating = ref(false)

const stepLabels = ['Оборудование', 'Чек-лист', 'Назначение']

const equipmentData = ref({ equipmentId: null, type: null })
const checklistData = ref([])
const assignData = ref({ assignedTo: null, scheduledDate: null })
const mechanics = ref([])

const selectedEquipment = computed(
  () => equipmentStore.getDetail(equipmentData.value.equipmentId) || null,
)

const isCurrentStepValid = computed(() => {
  if (currentStep.value === 1) {
    return !!(equipmentData.value.equipmentId && equipmentData.value.type)
  }
  if (currentStep.value === 2) {
    return checklistData.value.length > 0
  }
  if (currentStep.value === 3) {
    return !!assignData.value.assignedTo
  }
  return false
})

function goBack() {
  currentStep.value--
}

async function goNext() {
  if (currentStep.value === 2 && mechanics.value.length === 0) {
    mechanics.value = await getUsersByRole('mechanic')
  }
  currentStep.value++
}

async function handleCreate() {
  const authStore = useAuthStore()
  creating.value = true
  try {
    await maintenanceStore.createOrder({
      equipmentId: equipmentData.value.equipmentId,
      type: equipmentData.value.type,
      steps: checklistData.value,
      assignedTo: mechanics.value.find((m) => m.id === assignData.value.assignedTo) || null,
      scheduledDate: assignData.value.scheduledDate,
      createdBy: { id: authStore.userId, name: authStore.userName, role: authStore.userRole },
    })
    router.push({ name: 'maintenance' })
  } finally {
    creating.value = false
  }
}
</script>

<style scoped></style>
