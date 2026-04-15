<template>
  <Dialog :open="open" @update:open="(v) => !v && emit('close')">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Подключить новый станок</DialogTitle>
        <DialogDescription>
          Создаёт запись о новом буровом станке и подключает его к системе мониторинга
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <label class="text-xs">ID станка *</label>
          <Input v-model="form.id" placeholder="БУР-99" required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs">Модель</label>
            <Input v-model="form.model" placeholder="СБШ-250МНА" />
          </div>
          <div class="space-y-2">
            <label class="text-xs">Серийный номер</label>
            <Input v-model="form.serial" placeholder="SN-2026-099" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs">Год выпуска</label>
            <Input v-model.number="form.year" type="number" :placeholder="currentYear" />
          </div>
          <div class="space-y-2">
            <label class="text-xs">Наработка, ч</label>
            <Input v-model.number="form.operatingHours" type="number" placeholder="0" />
          </div>
        </div>

        <div v-if="error" class="text-xs text-status-critical">{{ error }}</div>

        <DialogFooter class="gap-2">
          <Button type="button" variant="outline" @click="emit('close')">Отмена</Button>
          <Button type="submit" :disabled="loading">
            {{ loading ? 'Подключение...' : 'Подключить' }}
          </Button>
        </DialogFooter>
      </form>
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEquipmentStore } from '@/stores/equipment'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'created'])

const equipmentStore = useEquipmentStore()
const currentYear = new Date().getFullYear()

const form = ref({
  id: '',
  model: '',
  serial: '',
  year: currentYear,
  operatingHours: 0,
})
const loading = ref(false)
const error = ref('')

watch(
  () => props.open,
  (v) => {
    if (v) {
      form.value = { id: '', model: '', serial: '', year: currentYear, operatingHours: 0 }
      error.value = ''
    }
  },
)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const created = await equipmentStore.createEquipment({ ...form.value })
    emit('created', created)
    emit('close')
  } catch (e) {
    error.value = e.message || 'Не удалось подключить станок'
  } finally {
    loading.value = false
  }
}
</script>
