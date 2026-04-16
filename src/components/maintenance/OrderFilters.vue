<template>
  <div class="flex flex-wrap gap-3 items-center">
    <!-- Equipment filter -->
    <Select
      :model-value="modelValue.equipmentId || ALL"
      @update:model-value="update('equipmentId', $event)"
    >
      <SelectTrigger class="w-48">
        <SelectValue placeholder="Все станки" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem :value="ALL">Все станки</SelectItem>
        <SelectItem v-for="equip in equipmentStore.list" :key="equip.id" :value="equip.id">
          {{ equip.id }} — {{ equip.model }}
        </SelectItem>
      </SelectContent>
    </Select>

    <!-- Type filter -->
    <Select :model-value="modelValue.type || ALL" @update:model-value="update('type', $event)">
      <SelectTrigger class="w-36">
        <SelectValue placeholder="Все типы" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem :value="ALL">Все типы</SelectItem>
        <SelectItem v-for="typeKey in maintenanceTypes" :key="typeKey" :value="typeKey">
          {{ typeKey }}
        </SelectItem>
      </SelectContent>
    </Select>

    <!-- Assignee filter -->
    <Select
      :model-value="modelValue.assignedTo || ALL"
      @update:model-value="update('assignedTo', $event)"
    >
      <SelectTrigger class="w-44">
        <SelectValue placeholder="Все исполнители" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem :value="ALL">Все исполнители</SelectItem>
        <SelectItem v-for="user in users" :key="user.id" :value="user.id">
          {{ user.name }}
        </SelectItem>
      </SelectContent>
    </Select>

    <!-- My orders toggle (mechanic only) -->
    <div v-if="authStore.userRole === 'mechanic'" class="flex items-center gap-2">
      <Switch :model-value="modelValue.myOnly" @update:model-value="update('myOnly', $event)" />
      <span class="text-sm">Мои наряды</span>
    </div>

    <!-- Show cancelled toggle -->
    <div class="flex items-center gap-2">
      <Switch
        :model-value="modelValue.showCancelled"
        @update:model-value="update('showCancelled', $event)"
      />
      <span class="text-sm">Показать отменённые</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useEquipmentStore } from '@/stores/equipment'
import { useAuthStore } from '@/stores/auth'
import { MAINTENANCE_SCHEDULE } from '@/utils/constants'
import { getUsers } from '@/api/users'

const ALL = '__all__'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const equipmentStore = useEquipmentStore()
const authStore = useAuthStore()

const users = ref([])
const maintenanceTypes = Object.keys(MAINTENANCE_SCHEDULE)

onMounted(async () => {
  users.value = await getUsers()
})

function update(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value === ALL ? null : value })
}
</script>
