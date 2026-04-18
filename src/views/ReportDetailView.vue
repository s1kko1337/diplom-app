<template>
  <div v-if="store.loading" class="text-muted-foreground">Загрузка…</div>
  <div v-else-if="!report" class="text-muted-foreground">Отчёт не найден</div>
  <div v-else class="space-y-6 print:space-y-4">
    <div class="flex items-center justify-between print:hidden">
      <RouterLink to="/reports" class="text-sm text-muted-foreground hover:text-primary">
        ← К списку
      </RouterLink>
      <div class="flex gap-2">
        <Button v-if="canEdit" variant="outline" @click="goEdit">
          <Pencil class="mr-2 size-4" />
          Редактировать
        </Button>
        <Button v-if="report.status === 'draft'" @click="publish">Опубликовать</Button>
        <Button variant="outline" @click="handlePrint">
          <Printer class="mr-2 size-4" />
          Печать
        </Button>
      </div>
    </div>

    <Card>
      <CardContent class="space-y-6 p-6">
        <div>
          <div class="text-xs uppercase text-muted-foreground">
            {{ typeLabel(report.type) }}
          </div>
          <h1 class="mt-2 text-2xl font-bold">{{ report.title }}</h1>
          <p v-if="report.summary" class="mt-3 text-muted-foreground">{{ report.summary }}</p>
        </div>

        <dl class="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <dt class="text-muted-foreground">Автор</dt>
            <dd>{{ report.createdBy?.name }} ({{ report.createdBy?.role }})</dd>
          </div>
          <div>
            <dt class="text-muted-foreground">Статус</dt>
            <dd>
              <Badge :variant="report.status === 'published' ? 'default' : 'secondary'">
                {{ statusLabel(report.status) }}
              </Badge>
            </dd>
          </div>
          <div>
            <dt class="text-muted-foreground">Создан</dt>
            <dd>{{ formatDate(report.createdAt) }}</dd>
          </div>
          <div v-if="report.publishedAt">
            <dt class="text-muted-foreground">Опубликован</dt>
            <dd>{{ formatDate(report.publishedAt) }}</dd>
          </div>
          <div v-if="report.equipmentId">
            <dt class="text-muted-foreground">Оборудование</dt>
            <dd>{{ report.equipmentId }}</dd>
          </div>
          <div v-if="report.orderId">
            <dt class="text-muted-foreground">Наряд</dt>
            <dd>{{ report.orderId }}</dd>
          </div>
          <div v-if="report.alertId">
            <dt class="text-muted-foreground">Уведомление</dt>
            <dd>{{ report.alertId }}</dd>
          </div>
        </dl>

        <div class="border-t border-border pt-6">
          <h2 class="mb-3 font-semibold">Содержимое</h2>
          <component
            :is="payloadComponent"
            v-if="payloadComponent"
            :payload="report.payload || {}"
          />
          <pre v-else class="overflow-auto rounded bg-muted p-4 text-xs">{{
            JSON.stringify(report.payload ?? {}, null, 2)
          }}</pre>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Printer, Pencil } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useReportsStore } from '@/stores/reports'
import { useAuthStore } from '@/stores/auth'
import { REPORT_TYPE_LABELS, canEditReport } from '@/utils/reportPermissions'
import MaintenancePayload from '@/components/reports/MaintenancePayload.vue'
import IncidentPayload from '@/components/reports/IncidentPayload.vue'
import ShiftPayload from '@/components/reports/ShiftPayload.vue'
import AnalyticsPayload from '@/components/reports/AnalyticsPayload.vue'

const PAYLOAD_COMPONENTS = {
  maintenance_completion: MaintenancePayload,
  incident_report: IncidentPayload,
  shift_report: ShiftPayload,
  analytics_summary: AnalyticsPayload,
}

const route = useRoute()
const router = useRouter()
const store = useReportsStore()
const auth = useAuthStore()

const report = computed(() => store.currentReport)
const payloadComponent = computed(() => PAYLOAD_COMPONENTS[report.value?.type] || null)
const canEdit = computed(() => canEditReport(auth.userRole, report.value))

onMounted(() => store.fetchById(route.params.id))

watch(
  () => route.params.id,
  (id) => {
    if (id) store.fetchById(id)
  },
)

async function publish() {
  if (report.value) await store.publish(report.value.id)
}

function handlePrint() {
  window.print()
}

function goEdit() {
  router.push({ name: 'report-edit', params: { id: report.value.id } })
}

function typeLabel(t) {
  return REPORT_TYPE_LABELS[t] || t
}

function statusLabel(s) {
  return { draft: 'Черновик', published: 'Опубликован' }[s] || s
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('ru-RU')
}
</script>
