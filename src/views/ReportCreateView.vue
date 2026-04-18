<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">{{ heading }}</h1>
        <p v-if="subheading" class="text-sm text-muted-foreground">{{ subheading }}</p>
      </div>
      <RouterLink to="/reports" class="text-sm text-muted-foreground hover:text-primary">
        ← К списку
      </RouterLink>
    </div>

    <div v-if="loadingReport" class="text-muted-foreground">Загрузка…</div>

    <div v-else-if="isEdit && !editableReport" class="text-muted-foreground">
      Отчёт не найден или не может быть отредактирован
    </div>

    <div v-else-if="showTypeSelector" class="grid gap-4 md:grid-cols-3">
      <button
        v-for="t in allowedTypes"
        :key="t"
        type="button"
        class="rounded-lg border border-border bg-card p-4 text-left transition hover:border-primary"
        @click="chooseType(t)"
      >
        <div class="font-semibold">{{ REPORT_TYPE_LABELS[t] }}</div>
        <p class="mt-2 text-sm text-muted-foreground">{{ REPORT_TYPE_DESCRIPTIONS[t] }}</p>
      </button>
      <div v-if="!allowedTypes.length" class="text-muted-foreground md:col-span-3">
        Ваша роль не позволяет создавать отчёты вручную.
      </div>
    </div>

    <Card v-else-if="activeType">
      <CardContent class="space-y-6 p-6">
        <component :is="formComponent" v-model="model" />

        <div v-if="errorMessage" class="text-sm text-status-critical">{{ errorMessage }}</div>

        <div class="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" @click="cancel">Отмена</Button>
          <Button variant="outline" :disabled="saving" @click="save('draft')">
            {{ saving ? 'Сохранение…' : 'Сохранить черновик' }}
          </Button>
          <Button :disabled="saving" @click="save('published')">
            {{ saving ? 'Публикация…' : 'Опубликовать' }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import IncidentForm from '@/components/reports/IncidentForm.vue'
import ShiftForm from '@/components/reports/ShiftForm.vue'
import AnalyticsForm from '@/components/reports/AnalyticsForm.vue'
import { useReportsStore } from '@/stores/reports'
import { useAuthStore } from '@/stores/auth'
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_DESCRIPTIONS,
  allowedCreateTypes,
  canCreateReport,
} from '@/utils/reportPermissions'

const FORMS = {
  incident_report: IncidentForm,
  shift_report: ShiftForm,
  analytics_summary: AnalyticsForm,
}

const route = useRoute()
const router = useRouter()
const store = useReportsStore()
const auth = useAuthStore()

const isEdit = computed(() => route.name === 'report-edit')
const editableReport = ref(null)
const loadingReport = ref(false)
const saving = ref(false)
const errorMessage = ref('')

const activeType = ref(null)

const allowedTypes = computed(() => allowedCreateTypes(auth.userRole))

const showTypeSelector = computed(() => !isEdit.value && !activeType.value && !route.query.type)

const heading = computed(() => {
  if (isEdit.value) return 'Редактирование отчёта'
  if (activeType.value) return `Создание: ${REPORT_TYPE_LABELS[activeType.value]}`
  return 'Создание отчёта'
})

const subheading = computed(() => {
  if (isEdit.value || !showTypeSelector.value) return ''
  return 'Выберите тип отчёта для создания'
})

const formComponent = computed(() => FORMS[activeType.value] || null)

function emptyPayload(type) {
  if (type === 'incident_report') {
    return { severity: 'warning', rootCause: '', actions: [], recommendations: '', downtime: '' }
  }
  if (type === 'shift_report') {
    const today = new Date().toISOString().slice(0, 10)
    return { shift: 'day', date: today, equipmentStatus: [], worksCompleted: [], issues: '' }
  }
  if (type === 'analytics_summary') {
    return { periodFrom: '', periodTo: '', metrics: {}, trends: [], conclusions: '' }
  }
  return {}
}

function emptyModel(type) {
  return {
    title: '',
    summary: '',
    equipmentId: null,
    alertId: null,
    payload: emptyPayload(type),
  }
}

const model = ref(emptyModel(null))

function initFromReport(report) {
  model.value = {
    title: report.title || '',
    summary: report.summary || '',
    equipmentId: report.equipmentId || null,
    alertId: report.alertId || null,
    payload: { ...emptyPayload(report.type), ...report.payload },
  }
  activeType.value = report.type
}

function chooseType(t) {
  if (!canCreateReport(auth.userRole, t)) return
  activeType.value = t
  model.value = emptyModel(t)
  router.replace({ query: { ...route.query, type: t } })
}

async function loadEdit() {
  loadingReport.value = true
  try {
    await store.fetchById(route.params.id)
    const r = store.currentReport
    if (!r || r.status !== 'draft' || !canCreateReport(auth.userRole, r.type)) {
      editableReport.value = null
      return
    }
    editableReport.value = r
    initFromReport(r)
  } finally {
    loadingReport.value = false
  }
}

async function save(targetStatus) {
  errorMessage.value = ''
  if (!model.value.title.trim()) {
    errorMessage.value = 'Укажите заголовок отчёта'
    return
  }
  saving.value = true
  try {
    if (isEdit.value && editableReport.value) {
      const updated = await store.update(editableReport.value.id, {
        title: model.value.title,
        summary: model.value.summary,
        equipmentId: model.value.equipmentId,
        alertId: model.value.alertId,
        payload: model.value.payload,
      })
      if (targetStatus === 'published' && updated.status === 'draft') {
        await store.publish(updated.id)
      }
      router.push({ name: 'report-detail', params: { id: updated.id } })
      return
    }

    const base = {
      type: activeType.value,
      title: model.value.title,
      summary: model.value.summary,
      equipmentId: model.value.equipmentId,
      alertId: model.value.alertId,
      payload: model.value.payload,
      createdBy: { id: auth.userId, name: auth.userName, role: auth.userRole },
    }
    const created = await store.create(base)
    if (targetStatus === 'published') {
      await store.publish(created.id)
    }
    router.push({ name: 'report-detail', params: { id: created.id } })
  } catch (e) {
    errorMessage.value = e.message || 'Не удалось сохранить отчёт'
  } finally {
    saving.value = false
  }
}

function cancel() {
  router.push({ name: 'reports' })
}

watch(
  () => route.query.type,
  (t) => {
    if (isEdit.value) return
    if (!t) {
      activeType.value = null
      return
    }
    if (!canCreateReport(auth.userRole, t)) {
      router.replace({ name: 'reports' })
      return
    }
    if (activeType.value !== t) {
      activeType.value = t
      model.value = emptyModel(t)
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (isEdit.value) {
    loadEdit()
  }
})
</script>
