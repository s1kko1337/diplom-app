# Улучшение ТО: трекинг времени, измерения, генерация документов

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Превратить текущий простой workflow ТО в полноценную производственную систему с трекингом времени, полями измерений/материалов, и генерацией актов по формам Приложения А и журнала Приложения Б.

**Architecture:** Расширяем существующую mock-модель заказа: каждый шаг получает `startedAt`/`completedAt` (трекинг времени), опциональные `measurements[]` и `materials[]`. Добавляем отдельный mock-слой журнала тех. состояния (Приложение Б). Генерация документов — чистый фронтенд-рендеринг в print-ready HTML (window.print()). API-контракт фиксируется в отдельном файле как OpenAPI-подобная спецификация.

**Tech Stack:** Vue 3.5 (Composition API), Pinia 3, Tailwind CSS 4, Lucide icons, shadcn-vue UI компоненты (уже в проекте). JavaScript (без TypeScript). Mock API слой.

**Ключевые документы регламента (PDF):**
- Приложение А (стр. 32–35): Чек-лист ЕО + Акты ТО-1/ТО-2/ТО-3 — формы отчётной документации
- Приложение Б (стр. 36): Журнал технического состояния

---

## Файловая структура

### Новые файлы

| Файл | Ответственность |
|------|----------------|
| `docs/api-contract/maintenance-api.md` | REST API контракт для бэкенда |
| `src/components/maintenance/StepTimer.vue` | Таймер активного шага (старт/стоп, отображение длительности) |
| `src/components/maintenance/MeasurementInput.vue` | Поле измерения: описание, норма, факт, единица |
| `src/components/maintenance/MaterialInput.vue` | Поле материала: объём, марка |
| `src/components/maintenance/DocumentActView.vue` | Print-ready акт ТО (Приложение А) — полноэкранный |
| `src/components/maintenance/DocumentEoView.vue` | Print-ready чек-лист ЕО (Приложение А, стр. 32) |
| `src/components/maintenance/JournalTable.vue` | Таблица журнала тех. состояния (Приложение Б) |
| `src/views/MaintenanceDocumentView.vue` | Страница просмотра/печати акта |
| `src/views/JournalView.vue` | Страница журнала тех. состояния |
| `src/api/journal.js` | API обёртки для журнала |
| `src/api/mock/journal.js` | Mock данные журнала |
| `src/utils/formatDuration.js` | Утилита форматирования длительности (чч:мм:сс) |

### Модифицируемые файлы

| Файл | Что меняется |
|------|-------------|
| `src/api/mock/maintenance.js` | Расширение модели шагов: measurements[], materials[], startedAt/completedAt per step |
| `src/api/maintenance.js` | Новые API-функции: startStep, generateDocument |
| `src/stores/maintenance.js` | Действия: startStep, getProgress обновление, acceptedBy при approve, journal entry |
| `src/utils/constants.js` | MEASUREMENT_UNITS, MATERIAL_TYPES, DOCUMENT_TYPES |
| `src/components/maintenance/StepCard.vue` | Интеграция таймера, измерений, материалов |
| `src/components/maintenance/StepWizard.vue` | Автостарт/стоп таймера при навигации |
| `src/components/maintenance/OrderSummary.vue` | Статистика по времени, кнопка «Сформировать акт» |
| `src/components/maintenance/OrderHeader.vue` | Общее время выполнения, кнопка «Акт» для completed |
| `src/components/maintenance/ReviewActions.vue` | Кнопка «Просмотр акта» перед утверждением |
| `src/components/maintenance/CreateStepChecklist.vue` | Добавление измерений и материалов к шагам |
| `src/views/MaintenanceDetailView.vue` | Кнопка документа, роутинг на акт |
| `src/router/index.js` | Маршруты: maintenance/:id/document, journal |
| `src/components/layout/sidebarMenu.js` | Пункт «Журнал ТС» в sidebar |

---

## Расширенная модель данных

### Step (расширение)

```js
{
  id: 'step-1',
  description: 'Проверить состояние тормозных механизмов',
  requirement: 'Максимальная величина отхода колодок 1.7 мм',
  tools: 'Комплект ключей, щуп измерительный',
  status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'skipped',
  comment: null,
  startedAt: null,       // NEW: ISO timestamp начала работы над шагом
  completedAt: null,
  // NEW: массив измерений (опционально)
  measurements: [
    {
      id: 'meas-1',
      description: 'Величина отхода тормозных колодок',
      unit: 'мм',
      norm: '1.7 (не более)',
      fact: null,           // заполняется исполнителем
      passed: null,         // true/false — соответствует норме
    }
  ],
  // NEW: массив использованных материалов (опционально)
  materials: [
    {
      id: 'mat-1',
      name: 'Масло трансмиссионное',
      unit: 'л',
      volume: null,         // заполняется исполнителем
      brand: null,          // заполняется исполнителем (марка)
    }
  ],
}
```

### Order (расширение)

```js
{
  ...existingFields,
  // NEW: массив исполнителей (акты показывают нескольких)
  executors: [
    { name: 'Петров С.В.', position: 'Механик' },
    { name: 'Сидоров К.М.', position: 'Электрик' },
  ],
  // NEW: кем принят
  acceptedBy: { name: 'Козлов Д.А.', position: 'Мастер' } | null,
  // NEW: общие замечания по акту
  remarks: null,
}
```

### JournalEntry (новая сущность)

```js
{
  id: 'journal-1',
  equipmentId: 'БУР-12',
  date: '2026-03-22',
  time: '07:00',
  description: 'Проведено ТО-1, наряд ТО-004',
  clearance: 'Допущен к эксплуатации',
  authorName: 'Козлов Д.А.',
  orderId: 'ТО-004',      // ссылка на наряд (опционально)
}
```

---

## Task 1: API-контракт

**Files:**
- Create: `docs/api-contract/maintenance-api.md`

- [ ] **Step 1: Написать контракт**

Полный REST API контракт, покрывающий:

**Наряды (Orders):**
```
GET    /api/maintenance/orders?equipmentId=&type=&status=&assignedTo=
GET    /api/maintenance/orders/:id
POST   /api/maintenance/orders                    { equipmentId, type, assignedTo, scheduledDate, steps[] }
PATCH  /api/maintenance/orders/:id/status          { status, operatingHours?, reviewedBy?, returnReason? }
PATCH  /api/maintenance/orders/:id/steps/:stepId   { status, comment?, completedAt?, measurements?, materials? }
POST   /api/maintenance/orders/:id/steps/:stepId/start   {}  → sets startedAt, status=in_progress
```

**Документы:**
```
GET    /api/maintenance/orders/:id/document        → { html | json для рендеринга акта }
GET    /api/maintenance/orders/:id/document/pdf     → binary PDF (будущий бэкенд)
```

**Журнал:**
```
GET    /api/journal?equipmentId=&dateFrom=&dateTo=
POST   /api/journal                                { equipmentId, description, clearance, orderId? }
```

**Чек-листы (шаблоны):**
```
GET    /api/maintenance/checklists/:type           → template steps с measurements/materials
```

Каждый эндпоинт документировать: URL, метод, request body (JSON schema), response body (JSON schema), возможные ошибки.

- [ ] **Step 2: Commit**

```bash
git add docs/api-contract/maintenance-api.md
git commit -m "docs: API contract for maintenance v2 — time tracking, measurements, documents"
```

---

## Task 2: Расширение модели данных и mock-слоя

**Files:**
- Modify: `src/utils/constants.js` — добавить новые константы
- Modify: `src/api/mock/maintenance.js` — расширить CHECKLISTS и MOCK_ORDERS
- Modify: `src/api/maintenance.js` — добавить startStep, stopStep

- [ ] **Step 1: Расширить существующие константы**

В `src/utils/constants.js`:

**Модифицировать** существующий `STEP_STATUSES` (строки 64–69) — добавить `in_progress`:
```js
export const STEP_STATUSES = {
  pending: 'pending',
  in_progress: 'in_progress',  // NEW
  passed: 'passed',
  failed: 'failed',
  skipped: 'skipped',
}
```

**Модифицировать** существующий `STEP_STATUS_LABELS` (строки 71–76) — добавить `in_progress`:
```js
export const STEP_STATUS_LABELS = {
  pending: 'Ожидает',
  in_progress: 'Выполняется',  // NEW
  passed: 'Выполнено',
  failed: 'Не выполнено',
  skipped: 'Пропущено',
}
```

**Добавить новые** экспорты (в конец файла):
```js
export const MEASUREMENT_UNITS = ['мм', 'Ом', 'МОм', 'В', 'А', 'кг', 'л', '°C', 'мм²', 'бар']

export const DOCUMENT_TYPES = {
  eo_checklist: 'Чек-лист ЕО',
  act_to1: 'Акт ТО-1',
  act_to2: 'Акт ТО-2',
  act_to3: 'Акт ТО-3',
}
```

- [ ] **Step 2: Расширить чек-листы в mock/maintenance.js**

Добавить `measurements` и `materials` к шагам, где это требуется по регламенту. Примеры:

Для ТО-1, шаг «Проверить тормоза»:
```js
measurements: [
  { id: 'meas-brake', description: 'Величина отхода тормозных колодок', unit: 'мм', norm: '1.7 (не более)', fact: null, passed: null }
]
```

Для ТО-2, шаг «Измерение заземления»:
```js
measurements: [
  { id: 'meas-ground', description: 'Сопротивление защитного заземления', unit: 'Ом', norm: '4 (не более)', fact: null, passed: null }
]
```

Для ТО-3, шаг «Заправка редукторов хода»:
```js
materials: [
  { id: 'mat-trans-oil', name: 'Масло трансмиссионное', unit: 'л', volume: null, brand: null }
]
```

Каждый шаг получает `startedAt: null` поле (дополнительно к существующему `completedAt`).

**Важно:** обновить функцию `createOrder()` (строка 839) — в шаблон шага добавить `startedAt: null`, `measurements: item.measurements || []`, `materials: item.materials || []`.

Обновить `MOCK_ORDERS` — для in_progress и completed заказов заполнить реалистичные startedAt/completedAt по шагам.

Добавить поля ко всем заказам:
- `executors: []` — для completed заказов заполнить реалистичными данными, например `[{ name: 'Петров С.В.', position: 'Механик' }]`
- `acceptedBy: null` — для completed заказов заполнить данными мастера
- `remarks: null` — для completed заказов добавить примерное замечание

**Важно:** при утверждении наряда (`approveOrder` в store) — устанавливать `acceptedBy` из данных текущего пользователя.

- [ ] **Step 3: Добавить API-функции startStep**

В `src/api/mock/maintenance.js`:
```js
export function startOrderStep(orderId, stepId) {
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Наряд не найден')
  const step = order.steps.find((s) => s.id === stepId)
  if (!step) throw new Error('Шаг не найден')
  // Идемпотентность: если уже in_progress, не перезаписываем startedAt
  if (step.status === 'in_progress') return { ...step }
  step.status = 'in_progress'
  step.startedAt = new Date().toISOString()
  return { ...step }
}
```

**Важно:** в `completeOrderStep()` (строка 873) — если `step.startedAt` null при завершении, установить `step.startedAt = step.completedAt` (fallback для прямого завершения без старта).

В `src/api/maintenance.js`:
```js
export function startStep(orderId, stepId) {
  return request(() => mockMaintenance.startOrderStep(orderId, stepId))
}
```

В `src/stores/maintenance.js`:
1. Добавить action `startStep(orderId, stepId)` — вызывает `maintenanceApi.startStep()`, обновляет `currentOrder.steps[]`
2. **Обновить `getProgress()`** — добавить подсчёт `in_progress`:
```js
in_progress: steps.filter((s) => s.status === 'in_progress').length,
```
3. **Добавить `startStep` в return-блок** store (строка 171)

**Примечание:** отдельный `stopStep` не нужен — завершение шага (passed/failed/skipped) через существующий `completeStep()` является остановкой. В API-контракте это будет `PATCH /orders/:id/steps/:stepId` с `status` и `completedAt`.

- [ ] **Step 4: Commit**

```bash
git add src/utils/constants.js src/api/mock/maintenance.js src/api/maintenance.js src/stores/maintenance.js
git commit -m "feat: extend maintenance model — step timing, measurements, materials, executors"
```

---

## Task 3: Таймер шага (StepTimer)

**Files:**
- Create: `src/components/maintenance/StepTimer.vue`
- Create: `src/utils/formatDuration.js`
- Modify: `src/components/maintenance/StepCard.vue` — встроить таймер

- [ ] **Step 1: Утилита форматирования**

Create `src/utils/formatDuration.js`:
```js
export function formatDuration(ms) {
  if (!ms || ms < 0) return '00:00:00'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

export function durationBetween(startIso, endIso) {
  if (!startIso) return 0
  const start = new Date(startIso).getTime()
  if (Number.isNaN(start)) return 0
  const end = endIso ? new Date(endIso).getTime() : Date.now()
  if (Number.isNaN(end)) return 0
  return Math.max(0, end - start)
}
```

- [ ] **Step 2: Компонент StepTimer**

Create `src/components/maintenance/StepTimer.vue`:

Props: `startedAt` (ISO string | null), `completedAt` (ISO string | null), `active` (boolean)

Логика:
- Если `active && startedAt && !completedAt`: показать тикающий таймер (requestAnimationFrame или setInterval 1s)
- Если `startedAt && completedAt`: показать итоговое время (статика)
- Если нет `startedAt`: ничего или "—"

UI: `<div class="metric-value text-sm">` с иконкой Timer (lucide). Зелёный цвет если тикает, обычный если завершён.

- [ ] **Step 3: Интегрировать в StepCard**

В `StepCard.vue`:
- Под описанием шага добавить `<StepTimer>` если `step.startedAt` существует
- При нажатии кнопки «Выполнено»/«Не выполнено» — передавать `completedAt` через emit

- [ ] **Step 4: Автостарт таймера в StepWizard**

В `StepWizard.vue`:
- При переходе на шаг, если `step.status === 'pending'` — вызывать `maintenanceStore.startStep(orderId, stepId)` для установки `startedAt` и перевода в `in_progress`
- При завершении шага (passed/failed/skipped) — `completedAt` устанавливается автоматически (уже есть в mock)

- [ ] **Step 5: Commit**

```bash
git add src/utils/formatDuration.js src/components/maintenance/StepTimer.vue src/components/maintenance/StepCard.vue src/components/maintenance/StepWizard.vue
git commit -m "feat: step timer — live time tracking during maintenance execution"
```

---

## Task 4: Поля измерений и материалов (MeasurementInput + MaterialInput)

> **Примечание:** Tasks 4 и 5 объединены, т.к. оба модифицируют StepCard.vue и CreateStepChecklist.vue — параллельная работа вызвала бы конфликты.

**Files:**
- Create: `src/components/maintenance/MeasurementInput.vue`
- Create: `src/components/maintenance/MaterialInput.vue`
- Modify: `src/components/maintenance/StepCard.vue` — встроить измерения и материалы
- Modify: `src/components/maintenance/CreateStepChecklist.vue` — добавить измерения и материалы при создании

- [ ] **Step 1: Компонент MeasurementInput**

Create `src/components/maintenance/MeasurementInput.vue`:

Props: `measurement` (object), `readonly` (boolean)
Emit: `update:measurement`

UI:
```
┌─────────────────────────────────────────────────┐
│ Величина отхода тормозных колодок               │
│ Норма: 1.7 мм (не более)                       │
│ Факт: [___________] мм   [Соответствует]       │
└─────────────────────────────────────────────────┘
```

- Input type="number" для факта
- Автоматический расчёт `passed` на основе нормы (если норма содержит "не более" → fact <= число)
- Badge зелёный/красный для passed/failed
- В readonly режиме — только текст

- [ ] **Step 2: Компонент MaterialInput**

Create `src/components/maintenance/MaterialInput.vue`:

Props: `material` (object), `readonly` (boolean)
Emit: `update:material`

UI:
```
┌─────────────────────────────────────────────────┐
│ Масло трансмиссионное                           │
│ Объём: [_____] л    Марка: [______________]     │
└─────────────────────────────────────────────────┘
```

- [ ] **Step 3: Встроить оба в StepCard**

Если `step.measurements?.length > 0`: рендерить список `<MeasurementInput>` под описанием шага.
Если `step.materials?.length > 0`: рендерить список `<MaterialInput>` после измерений.
В режиме выполнения — редактируемые. В readonly — только отображение.

При обновлении — emit наверх для сохранения в store.

- [ ] **Step 4: Добавить создание измерений/материалов при создании чек-листа**

В `CreateStepChecklist.vue` к каждому шагу добавить:
- Кнопка «+ Измерение» — добавляет measurement объект. Поля: описание, единица, норма.
- Кнопка «+ Материал» — добавляет material объект. Поля: наименование, единица.

- [ ] **Step 5: Commit**

```bash
git add src/components/maintenance/MeasurementInput.vue src/components/maintenance/MaterialInput.vue src/components/maintenance/StepCard.vue src/components/maintenance/CreateStepChecklist.vue
git commit -m "feat: measurement and material fields for maintenance steps"
```

---

## Task 5: Генерация Акта ТО (Приложение А)

**Files:**
- Create: `src/components/maintenance/DocumentActView.vue`
- Create: `src/components/maintenance/DocumentEoView.vue`
- Create: `src/views/MaintenanceDocumentView.vue`
- Modify: `src/router/index.js` — маршрут document
- Modify: `src/components/maintenance/OrderHeader.vue` — кнопка «Акт»

- [ ] **Step 1: Компонент DocumentEoView (чек-лист ЕО)**

По формату PDF стр. 32:
```
Чек-лист выполненных работ по интервалу ежесменного обслуживания

Станок СБШ-250МНА-32 зав.№ ________
Наработка станка ________ часов
Дата проведения: ________
Исполнитель (ФИО/должность): ________

| Задача | Отметка о выполнении | Отметка о соответствии |
|--------|---------------------|----------------------|
| ...    | ✓ / ✗              | ✓ / ✗               |

Замечания: ________
Подпись: ________
```

Данные берутся из `order` (completed/review):
- `equipment.serial` → заводской номер
- `order.operatingHoursAtStart` → наработка
- `order.startedAt` → дата проведения
- `order.executors[0]` → исполнитель
- `order.steps[]` → строки таблицы
- `order.remarks` → замечания

Стили: `@media print` для корректной печати. Белый фон, чёрный текст, убрать sidebar/header.

- [ ] **Step 2: Компонент DocumentActView (акт ТО-1/ТО-2/ТО-3)**

По формату PDF стр. 33–35:
```
АКТ № ТО-004
о проведении работ ТО-1
бурового станка СБШ-250МНА-32

Заводской номер станка: ________
Значение наработки: ________ часов
Дата/время начала работ: ________

Исполнители работ:
  (Должность) / (ФИО)

| Содержание работ | Отметка о выполнении | Замечания/Марки |
|-----------------|---------------------|-----------------|

Проверка показателей:
| Описание | Показатель | Норма | Факт |
|----------|-----------|-------|------|

Дата/время завершения работ: ________
Станок сдал: ________ / ________
Станок принял: ________ / ________
```

Поля measurements → таблица «Проверка показателей» с нормой/фактом.
Поля materials → в столбце «Замечания/Марки» для соответствующих шагов.

- [ ] **Step 3: Страница MaintenanceDocumentView**

Create `src/views/MaintenanceDocumentView.vue`:

```vue
<script setup>
const route = useRoute()
const id = computed(() => route.params.id)
// load order, determine document type (ЕО vs ТО-1/2/3 vs ТР)
// render DocumentEoView or DocumentActView
</script>
```

Кнопка «Печать» → `window.print()`
Кнопка «Назад к наряду»

- [ ] **Step 4: Маршрут и навигация**

В `router/index.js` — **ВАЖНО: расположить ПЕРЕД `maintenance/:id`** (иначе Vue Router будет матчить `document` как `:id`):
```js
{
  path: 'maintenance/:id/document',
  name: 'maintenance-document',
  meta: { breadcrumb: 'Техобслуживание / :id / Акт' },
  component: () => import('@/views/MaintenanceDocumentView.vue'),
},
// ... maintenance/create тоже перед maintenance/:id
// ... maintenance/:id — последний из maintenance-маршрутов
```

В `OrderHeader.vue` — добавить кнопку «Акт» (FileText icon) для completed и review заказов, ведущую на этот маршрут.

- [ ] **Step 5: Print CSS**

В `MaintenanceDocumentView.vue` использовать scoped print-стили (не глобальные, чтобы не ломать печать других страниц):

```vue
<style scoped>
@media print {
  :deep(.no-print) {
    display: none !important;
  }
}
</style>
```

Плюс в layout: весь хром (sidebar, header, footer) скрывать через класс `no-print`, а document content — единственный видимый блок. Реализовать через prop `printMode` или отдельный layout без хрома.

Предпочтительный подход: `MaintenanceDocumentView` использует `AuthLayout` (пустой layout без sidebar) вместо `DefaultLayout`. Или добавить маршрут вне DefaultLayout children.

- [ ] **Step 6: Commit**

```bash
git add src/components/maintenance/DocumentActView.vue src/components/maintenance/DocumentEoView.vue src/views/MaintenanceDocumentView.vue src/router/index.js src/components/maintenance/OrderHeader.vue src/assets/main.css
git commit -m "feat: document generation — printable maintenance acts (Приложение А)"
```

---

## Task 6: Журнал технического состояния (Приложение Б)

**Files:**
- Create: `src/api/mock/journal.js`
- Create: `src/api/journal.js`
- Create: `src/components/maintenance/JournalTable.vue`
- Create: `src/views/JournalView.vue`
- Modify: `src/router/index.js` — маршрут journal
- Modify: `src/components/layout/sidebarMenu.js` — пункт меню

- [ ] **Step 1: Mock данные журнала**

Create `src/api/mock/journal.js`:

```js
const MOCK_ENTRIES = [
  {
    id: 'journal-1',
    equipmentId: 'БУР-17',
    date: '2026-03-12',
    time: '17:00',
    description: 'Проведено ТО-1 (наряд ТО-004). Все работы выполнены в полном объёме.',
    clearance: 'Допущен к эксплуатации',
    authorName: 'Козлов Д.А.',
    orderId: 'ТО-004',
  },
  // ещё 5–8 записей для разных станков и дат
]
```

Функции: `getEntries(filters)`, `createEntry(data)`.

- [ ] **Step 2: API обёртки**

Create `src/api/journal.js`:
```js
import { request } from './client'
import * as mockJournal from './mock/journal'

export function getEntries(filters) {
  return request(() => mockJournal.getEntries(filters))
}

export function createEntry(data) {
  return request(() => mockJournal.createEntry(data))
}
```

- [ ] **Step 3: Компонент JournalTable**

Create `src/components/maintenance/JournalTable.vue`:

Таблица по формату Приложения Б:
```
| № записи | Дата | Время | Выполняемые работы | Заключение о допуске | ФИО | Подпись |
```

Props: `entries` (array), `loading` (boolean)

Каждая строка кликабельна — если есть `orderId`, переход на `/maintenance/:orderId`.

- [ ] **Step 4: Страница JournalView**

Create `src/views/JournalView.vue`:

- Заголовок «Журнал технического состояния»
- Фильтры: оборудование (Select), период (date from/to)
- `<JournalTable :entries="filteredEntries" />`
- Кнопка «Печать журнала» → window.print()

- [ ] **Step 5: Маршрут и sidebar**

В `router/index.js`:
```js
{
  path: 'journal',
  name: 'journal',
  meta: { breadcrumb: 'Журнал ТС' },
  component: () => import('@/views/JournalView.vue'),
}
```

В `sidebarMenu.js` — добавить в группу «Основное»:
```js
{ to: '/journal', icon: BookOpen, label: 'Журнал ТС' }
```

- [ ] **Step 6: Авто-создание записи при утверждении наряда**

В `src/stores/maintenance.js` → `approveOrder()`:
После утверждения — вызвать `journalApi.createEntry()` с данными из наряда.
Также устанавливать `order.acceptedBy` из текущего пользователя (мастер).

- [ ] **Step 7: Commit**

```bash
git add src/api/mock/journal.js src/api/journal.js src/components/maintenance/JournalTable.vue src/views/JournalView.vue src/router/index.js src/components/layout/sidebarMenu.js src/stores/maintenance.js
git commit -m "feat: technical condition journal (Приложение Б) — auto-entries on order approval"
```

---

## Task 7: Интеграция, статистика времени, поле замечаний

**Files:**
- Modify: `src/components/maintenance/OrderSummary.vue` — добавить сводку по времени, поле замечаний
- Modify: `src/components/maintenance/ReviewActions.vue` — ссылка на акт
- Modify: `src/views/MaintenanceDetailView.vue` — кнопка документа для completed

- [ ] **Step 1: Сводка по времени в OrderSummary**

В `OrderSummary.vue` добавить секцию:
```
📊 Статистика выполнения:
  Общее время: 4ч 23м
  Среднее время на шаг: 29м
  Самый долгий шаг: «Смазка узлов» — 1ч 12м
```

Данные вычисляются из `step.startedAt` / `step.completedAt`.

- [ ] **Step 2: Ссылка на акт в ReviewActions**

В `ReviewActions.vue` — добавить кнопку «Предварительный просмотр акта» (RouterLink на `/maintenance/:id/document`).

Мастер может просмотреть акт перед утверждением.

- [ ] **Step 3: Кнопка «Акт» для завершённых нарядов**

В `MaintenanceDetailView.vue` — для completed/review заказов показать кнопку «Просмотреть акт» в шапке.

- [ ] **Step 4: Поле «Замечания» в OrderSummary**

Перед кнопкой «Отправить на приёмку» — добавить `<Textarea>` для `order.remarks`. Механик может записать общие замечания по результатам ТО. Значение сохраняется в store/mock.

- [ ] **Step 5: lint + format + build**

```bash
npm run lint && npm run format && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/components/maintenance/OrderSummary.vue src/components/maintenance/ReviewActions.vue src/views/MaintenanceDetailView.vue
git commit -m "feat: time statistics, remarks field, document links, integration polish"
```

---

## Порядок зависимостей

```
Task 1 (контракт)                    — независимый
Task 2 (модель)                      — независимый
Task 3 (таймер)                      — зависит от Task 2
Task 4 (измерения + материалы)       — зависит от Task 2
Task 5 (акт Приложение А)            — зависит от Task 2, 4
Task 6 (журнал Приложение Б)         — зависит от Task 2
Task 7 (интеграция)                  — зависит от Task 3, 5, 6
```

Параллельно: Task 1 ∥ Task 2, затем Task 3 ∥ Task 4 ∥ Task 6, затем Task 5, затем Task 7.

**Нумерация сдвинулась:** Tasks 4+5 объединены → старый Task 6 стал Task 5, старый Task 7 стал Task 6, старый Task 8 стал Task 7.
