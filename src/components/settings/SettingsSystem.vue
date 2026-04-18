<template>
  <div class="space-y-8">
    <div>
      <label class="text-xs mb-4 block text-muted-foreground">ИНФОРМАЦИЯ О СИСТЕМЕ</label>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div
          v-for="info in systemInfo"
          :key="info.label"
          class="flex justify-between py-2 border-b border-border last:border-0"
        >
          <span class="text-muted-foreground">{{ info.label }}</span>
          <span class="metric-value">{{ info.value }}</span>
        </div>
      </div>
    </div>

    <div>
      <label class="text-xs mb-4 block text-muted-foreground">ДЕМО-ДАННЫЕ</label>
      <p class="text-xs text-muted-foreground mb-3">
        Сбросить все демо-данные к начальному состоянию. Настройки, наряды, отчёты, уведомления и
        дашборды будут удалены.
      </p>
      <Button variant="destructive" @click="showConfirm = true">Сбросить демо</Button>
    </div>

    <Dialog v-model:open="showConfirm">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подтверждение сброса</DialogTitle>
          <DialogDescription>
            Все демо-данные будут удалены, потребуется повторный вход. Продолжить?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showConfirm = false">Отмена</Button>
          <Button variant="destructive" @click="doReset">Сбросить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div>
      <label class="text-xs mb-4 block text-muted-foreground">ЖУРНАЛ АУДИТА</label>
      <div v-if="loading" class="text-sm text-muted-foreground py-4">Загрузка...</div>
      <div v-else-if="auditLog.length === 0" class="text-sm text-muted-foreground py-4">
        Записи отсутствуют
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="entry in auditLog"
          :key="entry.id"
          class="flex items-start gap-3 py-2 border-b border-border last:border-0 text-sm"
        >
          <span class="metric-value text-xs text-muted-foreground whitespace-nowrap shrink-0">
            {{ formatDate(entry.timestamp) }}
          </span>
          <span class="text-muted-foreground shrink-0">{{ entry.userName }}</span>
          <span class="truncate">{{ entry.details }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLog } from '@/api/audit'
import { resetAll } from '@/api/mock/_runtime'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

const systemInfo = [
  { label: 'Версия системы', value: 'v2.4.1' },
  { label: 'Дата установки', value: '2024-11-15' },
  { label: 'Последнее обновление', value: '2026-02-10' },
  { label: 'Лицензия', value: 'Корпоративная' },
  { label: 'Подключённых устройств', value: '18' },
  { label: 'Время работы системы', value: '47д 12ч 34м' },
]

const auditLog = ref([])
const loading = ref(false)
const showConfirm = ref(false)

function doReset() {
  resetAll()
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user_id')
  window.location.href = '/login'
}

function formatDate(iso) {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}.${month} ${hours}:${minutes}`
}

async function loadAuditLog() {
  loading.value = true
  try {
    auditLog.value = await getLog({ limit: 10 })
  } catch {
    auditLog.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadAuditLog)
</script>
