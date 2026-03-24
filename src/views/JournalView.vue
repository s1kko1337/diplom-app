<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Журнал технического состояния</h1>
      <Button variant="outline" @click="handlePrint">
        <Printer class="mr-2 size-4" />
        Печать журнала
      </Button>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="flex flex-wrap items-end gap-4 p-4">
        <div class="space-y-1">
          <label class="text-xs text-muted-foreground">Оборудование</label>
          <Select v-model="filters.equipmentId">
            <SelectTrigger class="w-44">
              <SelectValue placeholder="Все станки" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="ALL">Все станки</SelectItem>
              <SelectItem v-for="eq in equipmentIds" :key="eq" :value="eq">
                {{ eq }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1">
          <label class="text-xs text-muted-foreground">Дата с</label>
          <Input v-model="filters.dateFrom" type="date" class="w-40" />
        </div>

        <div class="space-y-1">
          <label class="text-xs text-muted-foreground">Дата по</label>
          <Input v-model="filters.dateTo" type="date" class="w-40" />
        </div>

        <Button variant="ghost" size="sm" @click="resetFilters">Сбросить</Button>
      </CardContent>
    </Card>

    <!-- Table -->
    <Card>
      <CardContent class="p-0">
        <JournalTable :entries="entries" :loading="loading" />
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Printer } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import JournalTable from '@/components/maintenance/JournalTable.vue'
import * as journalApi from '@/api/journal'

const ALL = '__all__'

const equipmentIds = [
  'БУР-03',
  'БУР-05',
  'БУР-08',
  'БУР-12',
  'БУР-15',
  'БУР-17',
  'БУР-19',
  'БУР-21',
]

const entries = ref([])
const loading = ref(false)

const filters = ref({
  equipmentId: ALL,
  dateFrom: '',
  dateTo: '',
})

async function loadEntries() {
  loading.value = true
  try {
    const apiFilters = {}
    if (filters.value.equipmentId && filters.value.equipmentId !== ALL) {
      apiFilters.equipmentId = filters.value.equipmentId
    }
    if (filters.value.dateFrom) apiFilters.dateFrom = filters.value.dateFrom
    if (filters.value.dateTo) apiFilters.dateTo = filters.value.dateTo
    entries.value = await journalApi.getEntries(apiFilters)
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.value = { equipmentId: ALL, dateFrom: '', dateTo: '' }
}

function handlePrint() {
  window.print()
}

watch(filters, loadEntries, { deep: true, immediate: true })
</script>

<style scoped></style>
