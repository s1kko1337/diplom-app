<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-xs">ЗАМЕНЫ ДЕТАЛЕЙ</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="partsLoading" class="text-center py-6 opacity-50">
        <LoadingSpinner />
      </div>

      <div v-else-if="parts.length === 0" class="text-center py-6 text-sm opacity-40">
        НЕТ ДАННЫХ О ЗАМЕНАХ
      </div>

      <Table v-else>
        <TableHeader>
          <TableRow>
            <TableHead>ДАТА</TableHead>
            <TableHead>ДЕТАЛЬ</TableHead>
            <TableHead>АРТИКУЛ</TableHead>
            <TableHead>ОРИГИНАЛ</TableHead>
            <TableHead>ИСПОЛНИТЕЛЬ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="part in parts" :key="part.id">
            <TableCell class="metric-value opacity-70">{{ part.date }}</TableCell>
            <TableCell>{{ part.partName }}</TableCell>
            <TableCell class="metric-value opacity-50">{{ part.partNumber }}</TableCell>
            <TableCell>
              <Badge :variant="part.isOriginal ? 'default' : 'destructive'">
                {{ part.isOriginal ? 'ОРИГИНАЛ' : 'АНАЛОГ' }}
              </Badge>
            </TableCell>
            <TableCell class="opacity-70">{{ part.replacedBy }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getReplacements } from '@/api/parts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const props = defineProps({
  equipmentId: { type: String, required: true },
})

const parts = ref([])
const partsLoading = ref(false)

async function loadParts() {
  partsLoading.value = true
  try {
    parts.value = await getReplacements(props.equipmentId)
  } finally {
    partsLoading.value = false
  }
}

onMounted(() => {
  loadParts()
})
</script>
