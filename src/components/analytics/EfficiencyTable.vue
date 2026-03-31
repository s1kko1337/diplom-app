<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-sm font-medium">Эффективность оборудования</CardTitle>
    </CardHeader>
    <CardContent class="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Оборудование</TableHead>
            <TableHead class="hidden md:table-cell">Модель</TableHead>
            <TableHead class="text-right">Эффективность</TableHead>
            <TableHead class="hidden sm:table-cell w-64">Прогресс</TableHead>
            <TableHead class="text-center">Тренд</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in rows" :key="row.id">
            <TableCell class="font-medium">{{ row.id }}</TableCell>
            <TableCell class="text-muted-foreground hidden md:table-cell">{{
              row.model
            }}</TableCell>
            <TableCell class="text-right metric-value">{{ row.efficiency }}%</TableCell>
            <TableCell class="hidden sm:table-cell">
              <div class="flex items-center gap-3">
                <div class="flex-1 h-2 rounded-full bg-muted">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="progressColor(row.efficiency)"
                    :style="{ width: row.efficiency + '%' }"
                  />
                </div>
              </div>
            </TableCell>
            <TableCell class="text-center">
              <TrendingUp v-if="row.efficiency >= 70" class="inline-block w-4 h-4 text-green-500" />
              <TrendingDown v-else class="inline-block w-4 h-4 text-red-500" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = defineProps({
  equipment: { type: Array, required: true },
})

const rows = computed(() =>
  props.equipment.map((eq) => {
    let efficiency
    if (eq.status === 'working') {
      efficiency = 85 + (eq.id.charCodeAt(eq.id.length - 1) % 11)
    } else if (eq.status === 'idle') {
      efficiency = 0
    } else {
      efficiency = 30 + (eq.id.charCodeAt(eq.id.length - 1) % 21)
    }
    return {
      id: eq.id,
      model: eq.model,
      efficiency,
    }
  }),
)

function progressColor(value) {
  if (value >= 80) return 'bg-green-500'
  if (value >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}
</script>
