<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Отчёты</h1>
    </div>

    <Card>
      <CardContent class="flex flex-wrap items-end gap-4 p-4">
        <div class="space-y-1">
          <label class="text-xs text-muted-foreground">Тип отчёта</label>
          <Select v-model="filterType">
            <SelectTrigger class="w-56">
              <SelectValue placeholder="Все типы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="ALL">Все типы</SelectItem>
              <SelectItem value="maintenance_completion">Акт ТО</SelectItem>
              <SelectItem value="incident_report">Инцидент</SelectItem>
              <SelectItem value="shift_report">Отчёт смены</SelectItem>
              <SelectItem value="analytics_summary">Аналитическая сводка</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1">
          <label class="text-xs text-muted-foreground">Статус</label>
          <Select v-model="filterStatus">
            <SelectTrigger class="w-44">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="ALL">Все статусы</SelectItem>
              <SelectItem value="draft">Черновик</SelectItem>
              <SelectItem value="published">Опубликован</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="ghost" size="sm" @click="resetFilters">Сбросить</Button>
      </CardContent>
    </Card>

    <div v-if="store.loading" class="text-muted-foreground">Загрузка…</div>
    <div v-else-if="!filtered.length" class="text-muted-foreground">Нет отчётов</div>
    <div v-else class="grid gap-3">
      <RouterLink
        v-for="report in filtered"
        :key="report.id"
        :to="{ name: 'report-detail', params: { id: report.id } }"
        class="block rounded-lg border border-border bg-card p-4 transition hover:border-primary"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <div class="text-xs uppercase text-muted-foreground">
              {{ typeLabel(report.type) }}
            </div>
            <div class="mt-1 font-semibold">{{ report.title }}</div>
            <div class="mt-1 text-sm text-muted-foreground">{{ report.summary }}</div>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <Badge :variant="report.status === 'published' ? 'default' : 'secondary'">
              {{ statusLabel(report.status) }}
            </Badge>
            <span class="text-xs text-muted-foreground">{{ formatDate(report.createdAt) }}</span>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useReportsStore } from '@/stores/reports'

const ALL = '__all__'

const store = useReportsStore()
const filterType = ref(ALL)
const filterStatus = ref(ALL)

onMounted(() => store.fetchAll())

const filtered = computed(() =>
  store.reports.filter(
    (r) =>
      (filterType.value === ALL || r.type === filterType.value) &&
      (filterStatus.value === ALL || r.status === filterStatus.value),
  ),
)

function resetFilters() {
  filterType.value = ALL
  filterStatus.value = ALL
}

function typeLabel(t) {
  return (
    {
      maintenance_completion: 'Акт выполнения ТО',
      incident_report: 'Отчёт об инциденте',
      shift_report: 'Отчёт смены',
      analytics_summary: 'Аналитическая сводка',
    }[t] || t
  )
}

function statusLabel(s) {
  return { draft: 'Черновик', published: 'Опубликован' }[s] || s
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('ru-RU')
}
</script>
