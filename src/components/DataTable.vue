<template>
  <div class="rounded-md border border-border bg-surface-1">
    <div class="p-4 border-b border-border">
      <label class="text-xs">ЖУРНАЛ ОБОРУДОВАНИЯ</label>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <div class="flex items-center gap-2 text-xs">ID <ArrowUp class="w-3 h-3" /></div>
          </TableHead>
          <TableHead>
            <div class="text-xs">ОБОРУДОВАНИЕ</div>
          </TableHead>
          <TableHead class="text-right hidden md:table-cell">
            <div class="text-xs">ГЛУБИНА (М)</div>
          </TableHead>
          <TableHead class="text-right hidden md:table-cell">
            <div class="text-xs">СКОРОСТЬ (RPM)</div>
          </TableHead>
          <TableHead class="text-right hidden sm:table-cell">
            <div class="text-xs">ТЕМПЕРАТУРА (°C)</div>
          </TableHead>
          <TableHead>
            <div class="text-xs">СТАТУС</div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="row in data" :key="row.id">
          <TableCell class="metric-value text-sm">{{ row.id }}</TableCell>
          <TableCell class="text-sm">{{ row.equipment }}</TableCell>
          <TableCell class="metric-value text-sm text-right hidden md:table-cell">
            {{ row.depth.toFixed(1) }}
          </TableCell>
          <TableCell class="metric-value text-sm text-right hidden md:table-cell">
            {{ row.speed.toLocaleString() }}
          </TableCell>
          <TableCell class="metric-value text-sm text-right hidden sm:table-cell">
            {{ row.temperature }}
          </TableCell>
          <TableCell class="text-sm">
            <span class="inline-flex items-center gap-2">
              <span
                class="inline-block h-2 w-2 rounded-full shrink-0"
                :class="STATUS_DOT_COLORS[row.status]"
              />
              <span class="text-sm" :class="STATUS_COLORS[row.status]">
                {{ STATUS_LABELS[row.status] || row.status }}
              </span>
            </span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<script setup>
import { ArrowUp } from 'lucide-vue-next'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { STATUS_LABELS, STATUS_COLORS, STATUS_DOT_COLORS } from '@/utils/constants'

defineProps({
  data: { type: Array, required: true },
})
</script>
