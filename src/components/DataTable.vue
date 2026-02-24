<template>
  <div class="bg-surface-1 border-2 border-border">
    <div class="p-4 border-b-2 border-border">
      <label class="text-xs">ЖУРНАЛ ОБОРУДОВАНИЯ</label>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border">
            <th class="text-left p-4">
              <div class="flex items-center gap-2 text-xs opacity-70">
                ID <ArrowUp class="w-3 h-3" />
              </div>
            </th>
            <th class="text-left p-4">
              <div class="text-xs opacity-70">ОБОРУДОВАНИЕ</div>
            </th>
            <th class="text-right p-4">
              <div class="text-xs opacity-70">ГЛУБИНА (М)</div>
            </th>
            <th class="text-right p-4">
              <div class="text-xs opacity-70">СКОРОСТЬ (RPM)</div>
            </th>
            <th class="text-right p-4">
              <div class="text-xs opacity-70">ТЕМПЕРАТУРА (°C)</div>
            </th>
            <th class="text-left p-4">
              <div class="text-xs opacity-70">СТАТУС</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in data"
            :key="row.id"
            class="border-b border-border hover:bg-surface-2 transition-all duration-150"
          >
            <td class="p-4 metric-value text-sm">{{ row.id }}</td>
            <td class="p-4 text-sm">{{ row.equipment }}</td>
            <td class="p-4 metric-value text-sm text-right">{{ row.depth.toFixed(1) }}</td>
            <td class="p-4 metric-value text-sm text-right">{{ row.speed.toLocaleString() }}</td>
            <td class="p-4 metric-value text-sm text-right">{{ row.temperature }}</td>
            <td class="p-4 text-sm">
              <span
                class="px-2 py-1 text-xs border"
                :class="{
                  'border-primary': row.status === 'РАБОТА',
                  'border-border opacity-50': row.status === 'ПРОСТОЙ',
                  'bg-status-critical-bg text-status-critical-text border-primary':
                    row.status === 'АВАРИЯ',
                }"
              >
                {{ row.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ArrowUp } from 'lucide-vue-next'

defineProps({
  data: { type: Array, required: true },
})
</script>
