<template>
  <Dialog :open="open" @update:open="(v) => !v && emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle v-if="mode === 'disconnect'">Отключить станок</DialogTitle>
        <DialogTitle v-else>Удалить станок</DialogTitle>
        <DialogDescription>
          <template v-if="mode === 'disconnect'">
            Станок <span class="metric-value font-semibold">{{ equipment?.id }}</span> будет помечен
            как отключённый и перестанет участвовать в мониторинге. Действие обратимо.
          </template>
          <template v-else>
            Станок <span class="metric-value font-semibold">{{ equipment?.id }}</span> будет удалён
            из системы безвозвратно вместе с накопленными данными. Действие необратимо.
          </template>
        </DialogDescription>
      </DialogHeader>

      <div v-if="error" class="text-xs text-status-critical">{{ error }}</div>

      <DialogFooter class="gap-2">
        <Button variant="outline" @click="emit('close')">Отмена</Button>
        <Button
          :variant="mode === 'delete' ? 'destructive' : 'default'"
          :disabled="loading"
          @click="handleConfirm"
        >
          {{
            loading ? 'Выполнение...' : mode === 'disconnect' ? 'Отключить' : 'Удалить безвозвратно'
          }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useEquipmentStore } from '@/stores/equipment'

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'disconnect' },
  equipment: { type: Object, default: null },
})
const emit = defineEmits(['close', 'done'])

const equipmentStore = useEquipmentStore()
const loading = ref(false)
const error = ref('')

watch(
  () => props.open,
  (v) => {
    if (v) error.value = ''
  },
)

async function handleConfirm() {
  if (!props.equipment) return
  error.value = ''
  loading.value = true
  try {
    if (props.mode === 'disconnect') {
      await equipmentStore.setStatus(props.equipment.id, 'offline')
    } else {
      await equipmentStore.deleteEquipment(props.equipment.id)
    }
    emit('done', { id: props.equipment.id, mode: props.mode })
    emit('close')
  } catch (e) {
    error.value = e.message || 'Операция не удалась'
  } finally {
    loading.value = false
  }
}
</script>
