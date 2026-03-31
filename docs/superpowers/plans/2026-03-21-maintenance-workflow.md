# Maintenance Workflow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full maintenance order workflow — kanban board, creation wizard, step-by-step execution wizard, master review/approval, role-based permissions. All on mock data.

**Architecture:** Extends existing maintenance module with orders CRUD. New `/maintenance` route group with 3 pages. Auth system extended with roles (engineer/mechanic/foreman) selected at login. Existing MaintenanceTab.vue gets links to the new module. No backend — all state in memory mocks.

**Tech Stack:** Vue 3.5 (Composition API), Pinia 3, Tailwind CSS 4, shadcn-vue, lucide-vue-next

**Spec:** `docs/superpowers/specs/2026-03-21-maintenance-workflow-design.md`

**Conventions (from CLAUDE.md):**
- `<script setup>` only, no Options API
- Block order: `<template>` → `<script setup>` → `<style scoped>`
- No `;` in `@click` — extract to methods
- UI text in Russian
- `npm run lint && npm run format` before each commit
- Prettier: no semicolons, single quotes, 100 char width

---

## File Structure Map

### New files to create

```
src/
├── composables/usePermissions.js              # canCreate, canExecute, canReview, canCancel
├── api/users.js                               # getUsers(), getUsersByRole()
├── api/mock/users.js                          # 4 mock users with roles
├── views/
│   ├── MaintenanceView.vue                    # Kanban board page
│   ├── MaintenanceCreateView.vue              # 3-step creation wizard
│   └── MaintenanceDetailView.vue              # Order detail + execution wizard
├── components/maintenance/
│   ├── KanbanBoard.vue                        # 4-column layout
│   ├── KanbanColumn.vue                       # Single column with card list
│   ├── OrderCard.vue                          # Order card for kanban
│   ├── OrderFilters.vue                       # Equipment/type/assignee filters
│   ├── OrderHeader.vue                        # Order detail header
│   ├── OrderSummary.vue                       # Results summary table
│   ├── StepWizard.vue                         # Step-by-step execution wizard
│   ├── StepCard.vue                           # Single step: description + status buttons + comment
│   ├── StepProgress.vue                       # Progress bar (step N of M)
│   ├── CreateStepEquipment.vue                # Creation step 1: equipment + type
│   ├── CreateStepChecklist.vue                # Creation step 2: editable checklist
│   ├── CreateStepAssign.vue                   # Creation step 3: assign mechanic + date
│   └── ReviewActions.vue                      # Master review: approve / return
```

### Files to modify

```
src/utils/constants.js                         # Add ORDER_STATUSES, STEP_STATUSES, ROLE_LABELS, ORDER_STATUS_COLORS
src/api/mock/users.js                          # New file (listed above)
src/api/auth.js                                # MOCK_USER → role-based lookup from mock/users.js
src/stores/auth.js                             # Add userId computed
src/views/LoginView.vue                        # Add role selection dropdown
src/api/mock/maintenance.js                    # Add ТР/КР checklists, MOCK_ORDERS, orders CRUD
src/api/maintenance.js                         # Add order API wrappers
src/stores/maintenance.js                      # Add orders state + actions + getProgress
src/router/index.js                            # 3 new routes
src/components/layout/sidebarMenu.js           # Add "Техобслуживание" menu item
src/components/equipment/MaintenanceTab.vue    # Add "Создать наряд" button + recent orders list
src/components/settings/SettingsSecurity.vue   # admin → ROLE_LABELS[role]
```

---

## Task 1: Constants, users mock, auth migration

**Files:**
- Modify: `src/utils/constants.js`
- Create: `src/api/mock/users.js`
- Create: `src/api/users.js`
- Modify: `src/api/auth.js`
- Modify: `src/stores/auth.js`
- Modify: `src/views/LoginView.vue`
- Modify: `src/components/settings/SettingsSecurity.vue`

- [ ] **Step 1: Add new constants to constants.js**

Append to end of `src/utils/constants.js`:
```js
export const ORDER_STATUSES = {
  planned: 'planned',
  in_progress: 'in_progress',
  review: 'review',
  completed: 'completed',
  cancelled: 'cancelled',
}

export const ORDER_STATUS_LABELS = {
  planned: 'Запланировано',
  in_progress: 'В работе',
  review: 'На приёмке',
  completed: 'Завершено',
  cancelled: 'Отменено',
}

export const ORDER_STATUS_COLORS = {
  planned: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  review: 'bg-purple-500',
  completed: 'bg-green-500',
  cancelled: 'bg-zinc-500',
}

export const STEP_STATUSES = {
  pending: 'pending',
  passed: 'passed',
  failed: 'failed',
  skipped: 'skipped',
}

export const STEP_STATUS_LABELS = {
  pending: 'Ожидает',
  passed: 'Выполнено',
  failed: 'Не выполнено',
  skipped: 'Пропущено',
}

export const ROLE_LABELS = {
  engineer: 'Инженер',
  mechanic: 'Механик',
  foreman: 'Мастер',
}
```

- [ ] **Step 2: Create mock/users.js**

Create `src/api/mock/users.js`:
```js
export const MOCK_USERS = [
  { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
  { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
  { id: 'user-3', name: 'Сидоров К.М.', role: 'mechanic' },
  { id: 'user-4', name: 'Козлов Д.А.', role: 'foreman' },
]

export function getUsers() {
  return [...MOCK_USERS]
}

export function getUsersByRole(role) {
  return MOCK_USERS.filter((u) => u.role === role)
}

export function getUserById(id) {
  return MOCK_USERS.find((u) => u.id === id) || null
}
```

- [ ] **Step 3: Create api/users.js wrapper**

Create `src/api/users.js`:
```js
import { request } from './client'
import * as mock from './mock/users'

export function getUsers() {
  return request(() => mock.getUsers())
}

export function getUsersByRole(role) {
  return request(() => mock.getUsersByRole(role))
}
```

- [ ] **Step 4: Update api/auth.js — role-based login**

Replace `src/api/auth.js` content. Remove hardcoded `MOCK_USER`. Import from `mock/users.js`. The `login()` function receives `credentials.role` and returns the first user with that role. `getMe()` returns the last logged-in user (stored in module-level variable).

```js
import { request } from './client'
import { MOCK_USERS } from './mock/users'

let currentUser = null

export function login(credentials) {
  return request(() => {
    if (!credentials.username || !credentials.password) {
      throw new Error('Введите логин и пароль')
    }
    const role = credentials.role || 'engineer'
    const user = MOCK_USERS.find((u) => u.role === role)
    if (!user) throw new Error('Роль не найдена')
    currentUser = { ...user }
    return {
      token: 'mock-jwt-' + Date.now(),
      user: currentUser,
    }
  })
}

export function logout() {
  return request(() => {
    currentUser = null
    return { success: true }
  })
}

export function getMe() {
  return request(() => {
    if (!currentUser) {
      currentUser = { ...MOCK_USERS[0] }
    }
    return currentUser
  })
}
```

- [ ] **Step 5: Update stores/auth.js — add userId**

In `src/stores/auth.js`, add `userId` computed after `userRole`:
```js
const userId = computed(() => user.value?.id || null)
```
Add `userId` to the return object.

- [ ] **Step 6: Update LoginView.vue — add role dropdown**

In `src/views/LoginView.vue`:
- Add `role` ref initialized to `'engineer'`
- Add role selector (shadcn Select) between password field and error block
- Pass `role` in `handleLogin()` credentials: `{ username, password, role: role.value }`
- Import Select components and ROLE_LABELS
- Update hint text to mention role selection

- [ ] **Step 7: Update SettingsSecurity.vue — dynamic role label**

In `src/components/settings/SettingsSecurity.vue`, replace hardcoded `'admin'` check and `'Администратор'`/`'Пользователь'` labels with `ROLE_LABELS[authStore.userRole]` or fallback to `authStore.userRole`.

- [ ] **Step 8: Verify build, lint, format, commit**

```bash
npm run build && npm run lint && npm run format
git add src/ && git commit -m "feat: add roles system — users mock, auth migration, role selection at login"
```

---

## Task 2: Extend maintenance mock — checklists ТР/КР + orders CRUD

**Files:**
- Modify: `src/api/mock/maintenance.js`
- Modify: `src/api/maintenance.js`

- [ ] **Step 1: Add ТР-1..ТР-3 and КР checklists**

In `src/api/mock/maintenance.js`, add new entries to `CHECKLISTS` object (after existing ТО-3):
- `'ТР-1'`: 8 items (ревизия тормозной системы, замена подшипников вращателя, проверка гидроцилиндров подачи, ревизия пневмосистемы, проверка сварных швов мачты, замена манжет гидроцилиндров, ревизия электрошкафов, дефектация канатов)
- `'ТР-2'`: 10 items (капремонт редукторов хода, замена канатов, полная ревизия электрошкафов, замена гидрошлангов, ревизия компрессора, замена футеровки, ревизия поворотной платформы, перепрессовка пальцев гусениц, ревизия вращателя, проверка рамы)
- `'ТР-3'`: 12 items (разборка/сборка ходовой части, замена вращателя, капремонт компрессора, замена электродвигателей, полная дефектация гидросистемы, ревизия мачты с заменой секций, замена кабельного барабана, ревизия системы пылеподавления, замена опорно-поворотного устройства, капремонт лебёдки, ревизия системы охлаждения, восстановление антикоррозийного покрытия)
- `КР`: 15 items (see spec section 6)

Each item: `{ id: 'tr1-01', description, requirement, tools, completed: false }`.

- [ ] **Step 2: Add MOCK_ORDERS array and orders CRUD functions**

Add to `src/api/mock/maintenance.js`:
- `MOCK_ORDERS` — 6 orders in different statuses:
  - MO-001: planned, ТО-1, БУР-12, assigned to user-2
  - MO-002: in_progress, ТО-2, БУР-08, assigned to user-3 (some steps completed)
  - MO-003: review, ЕО, БУР-15, assigned to user-2
  - MO-004: completed, ТО-1, БУР-17, assigned to user-3, reviewed by user-4
  - MO-005: cancelled, ТО-3, БУР-03
  - MO-006: planned, ТР-1, БУР-19, assigned to user-2

- `let orders = [...MOCK_ORDERS]` (mutable in-memory copy)

Functions:
- `getOrders(filters)` — filter by equipmentId, type, assignedTo, status. Return sorted by createdAt desc.
- `getOrder(id)` — find by id
- `createOrder(data)` — generate id `MO-${Date.now()}`, create steps from checklist templates (convert `{ completed }` → `{ status: 'pending', comment: null, completedAt: null }`), push to orders array
- `updateOrderStatus(id, status, payload)` — update status, set timestamps/returnReason as needed
- `completeOrderStep(orderId, stepId, status, comment)` — update step status/comment/completedAt
- `getChecklistTemplate(type)` — returns a deep clone of `CHECKLISTS[type]` or `[]` if not found. Used by CreateStepChecklist to load template without equipmentId.

- [ ] **Step 3: Add API wrappers to api/maintenance.js**

Append new exports to `src/api/maintenance.js`:
```js
export function getOrders(filters) {
  return request(() => mock.getOrders(filters))
}

export function getOrder(id) {
  return request(() => mock.getOrder(id))
}

export function createOrder(data) {
  return request(() => mock.createOrder(data))
}

export function updateOrderStatus(id, status, payload) {
  return request(() => mock.updateOrderStatus(id, status, payload))
}

export function completeOrderStep(orderId, stepId, status, comment) {
  return request(() => mock.completeOrderStep(orderId, stepId, status, comment))
}

export function getChecklistTemplate(type) {
  return request(() => mock.getChecklistTemplate(type))
}
```

- [ ] **Step 4: Verify build, lint, format, commit**

```bash
npm run build && npm run lint && npm run format
git add src/ && git commit -m "feat: extend maintenance mock — ТР/КР checklists, orders CRUD"
```

---

## Task 3: Extend maintenance store + usePermissions composable

**Files:**
- Modify: `src/stores/maintenance.js`
- Create: `src/composables/usePermissions.js`

- [ ] **Step 1: Extend maintenance store with orders**

In `src/stores/maintenance.js`, add:
- State: `orders` (ref, []), `currentOrder` (ref, null), `ordersLoading` (ref, false)
- `getProgress(order)` — computes `{ total, passed, failed, skipped, pending }` from `order.steps`
- `loadOrders(filters)` — calls `maintenanceApi.getOrders(filters)`, sets `orders.value`
- `loadOrder(id)` — calls `maintenanceApi.getOrder(id)`, sets `currentOrder.value`
- `createOrder(data)` — calls `maintenanceApi.createOrder(data)`, writes audit entry `maintenance_order_created`
- `startOrder(id)` — gets `operatingHours` from `useEquipmentStore().details[order.equipmentId]?.operatingHours`, then calls `updateOrderStatus(id, 'in_progress', { operatingHours })`, audit `maintenance_order_started`
- `completeStep(orderId, stepId, status, comment)` — calls `maintenanceApi.completeOrderStep(...)`, updates `currentOrder` locally
- `submitForReview(id)` — calls `updateOrderStatus(id, 'review')`, audit `maintenance_order_submitted`
- `approveOrder(id)` — calls `updateOrderStatus(id, 'completed', { reviewedBy })`, audit `maintenance_order_approved`
- `returnOrder(id, reason)` — calls `updateOrderStatus(id, 'in_progress', { returnReason })`, audit `maintenance_order_returned`
- `cancelOrder(id)` — calls `updateOrderStatus(id, 'cancelled')`, audit `maintenance_order_cancelled`

Import `addEntry` from `@/api/audit` for audit logging.

- [ ] **Step 2: Create usePermissions.js**

Create `src/composables/usePermissions.js`:
```js
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function usePermissions() {
  const auth = useAuthStore()

  const canCreate = computed(() => auth.userRole === 'engineer')
  const canReview = computed(() => auth.userRole === 'foreman')

  function canExecute(order) {
    return auth.userRole === 'mechanic' && order.assignedTo?.id === auth.userId
  }

  function canCancel(order) {
    return (
      auth.userRole === 'engineer' && !['completed', 'cancelled'].includes(order.status)
    )
  }

  return { canCreate, canExecute, canReview, canCancel }
}
```

- [ ] **Step 3: Verify build, lint, format, commit**

```bash
npm run build && npm run lint && npm run format
git add src/ && git commit -m "feat: extend maintenance store with orders workflow + usePermissions"
```

---

## Task 4: Routes, sidebar, MaintenanceTab integration

**Files:**
- Modify: `src/router/index.js`
- Modify: `src/components/layout/sidebarMenu.js`
- Modify: `src/components/equipment/MaintenanceTab.vue`

- [ ] **Step 1: Add 3 new routes**

In `src/router/index.js`, add inside DefaultLayout children (after `settings` route, before closing `]`):
```js
{
  path: 'maintenance',
  name: 'maintenance',
  meta: { breadcrumb: 'Техобслуживание' },
  component: () => import('@/views/MaintenanceView.vue'),
},
{
  path: 'maintenance/create',
  name: 'maintenance-create',
  meta: { breadcrumb: 'Техобслуживание / Создание' },
  component: () => import('@/views/MaintenanceCreateView.vue'),
},
{
  path: 'maintenance/:id',
  name: 'maintenance-detail',
  meta: { breadcrumb: 'Техобслуживание / :id' },
  component: () => import('@/views/MaintenanceDetailView.vue'),
},
```

- [ ] **Step 2: Add sidebar menu item**

In `src/components/layout/sidebarMenu.js`:
- Add `ClipboardCheck` to lucide imports
- Add item `{ to: '/maintenance', icon: ClipboardCheck, label: 'Техобслуживание' }` to the "Основное" group, after "Оборудование"

- [ ] **Step 3: Update MaintenanceTab.vue — add order links**

In `src/components/equipment/MaintenanceTab.vue`:
- Import `usePermissions`, `useMaintenanceStore`, `RouterLink`, `Badge`, `Button`
- Load orders for this equipment on mount: `maintenanceStore.loadOrders({ equipmentId: props.equipmentId })`
- Add section after existing checklist: "Наряды ТО" header
- Show list of recent orders (last 5) with: type badge, status badge (using ORDER_STATUS_LABELS/COLORS), assignee, date. Each clickable → `/maintenance/:id`
- Add "Создать наряд" button (v-if `canCreate`) → `/maintenance/create?equipmentId=${equipmentId}`

- [ ] **Step 4: Create stub views (empty, just to make routes work)**

Create minimal stub files so the build passes:
- `src/views/MaintenanceView.vue` — template: `<div>Техобслуживание</div>`
- `src/views/MaintenanceCreateView.vue` — template: `<div>Создание наряда</div>`
- `src/views/MaintenanceDetailView.vue` — template: `<div>Наряд</div>`

All with `<script setup>` block.

- [ ] **Step 5: Verify build, lint, format, commit**

```bash
npm run build && npm run lint && npm run format
git add src/ && git commit -m "feat: add maintenance routes, sidebar item, MaintenanceTab order links"
```

---

## Task 5: Kanban board — MaintenanceView

**Files:**
- Create: `src/components/maintenance/OrderCard.vue`
- Create: `src/components/maintenance/KanbanColumn.vue`
- Create: `src/components/maintenance/KanbanBoard.vue`
- Create: `src/components/maintenance/OrderFilters.vue`
- Modify: `src/views/MaintenanceView.vue` (replace stub)

- [ ] **Step 1: Create OrderCard.vue**

Props: `order` (object). Displays:
- Type badge (e.g. "ТО-1") using shadcn Badge
- Equipment ID + model (from equipmentStore)
- Assignee name
- Date (formatted createdAt)
- Progress bar: computed from steps (passed+failed+skipped) / total, colored bar
- Status badge if cancelled (grey "Отменено")
- Entire card clickable → `router.push({ name: 'maintenance-detail', params: { id: order.id } })`

Uses shadcn Card.

- [ ] **Step 2: Create KanbanColumn.vue**

Props: `title` (string), `orders` (array), `color` (string for header accent), `limit` (number, default null — show all).
- Header: title + count badge
- List of OrderCard components
- If limit set and orders.length > limit: show first `limit` cards + "Показать все" button that sets limit to null (inline expand)
- Empty state: "Нет нарядов" in muted text

- [ ] **Step 3: Create KanbanBoard.vue**

Props: `orders` (array), `showCancelled` (boolean — from filters.showCancelled).
- Computes 4 arrays: planned, inProgress, review, completed (+ cancelled if showCancelled)
- Responsive grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-4` with gap
- Completed column has `limit=10`
- If showCancelled: cancelled orders appended to completed column with distinct styling

- [ ] **Step 4: Create OrderFilters.vue**

Props: `modelValue` (filters object `{ equipmentId, type, assignedTo, myOnly, showCancelled }`). Emits: `update:modelValue`.
- shadcn Select for equipment (all equipment from equipmentStore)
- shadcn Select for type (all maintenance types from MAINTENANCE_SCHEDULE keys)
- shadcn Select for assignee (all users from usersApi)
- Switch "Мои наряды" (visible to mechanics, toggles `myOnly` filter)
- Switch "Показать отменённые" (toggles `showCancelled` in modelValue)

- [ ] **Step 5: Rewrite MaintenanceView.vue**

Replace stub. Page structure:
- Header: "Техобслуживание" h1 + "Создать ТО" button (v-if canCreate, links to /maintenance/create)
- OrderFilters with v-model
- KanbanBoard with filtered orders
- Loading: LoadingSpinner while ordersLoading
- Load orders on mount via maintenanceStore.loadOrders()

- [ ] **Step 6: Verify build, lint, format, commit**

```bash
npm run build && npm run lint && npm run format
git add src/ && git commit -m "feat: kanban board — MaintenanceView with filters and order cards"
```

---

## Task 6: Creation wizard — MaintenanceCreateView

**Files:**
- Create: `src/components/maintenance/CreateStepEquipment.vue`
- Create: `src/components/maintenance/CreateStepChecklist.vue`
- Create: `src/components/maintenance/CreateStepAssign.vue`
- Modify: `src/views/MaintenanceCreateView.vue` (replace stub)

- [ ] **Step 1: Create CreateStepEquipment.vue**

Props: `modelValue` (object `{ equipmentId, type }`). Emits: `update:modelValue`.
- shadcn Select for equipment (from equipmentStore.list, shows ID + model)
- shadcn Select for type (all MAINTENANCE_SCHEDULE keys)
- Info card (shown when both selected): equipment operating hours, last maintenance type/date, recommended next ТО from `maintenanceStore.getNextMaintenance()`
- Pre-fill equipmentId from `route.query.equipmentId` if present

- [ ] **Step 2: Create CreateStepChecklist.vue**

Props: `type` (string — ТО type), `modelValue` (array of step objects). Emits: `update:modelValue`.
- On mount or when type changes: call `maintenanceApi.getChecklistTemplate(type)`, strip `completed` field, emit as modelValue `[{ id, description, requirement, tools }]`. Final conversion to order-step format (`status: 'pending', comment: null, completedAt: null`) happens in `createOrder()` in the mock layer — this component only handles the editing format.
- Render each step in a Card: description (editable Input), requirement (editable Input), tools (editable Input)
- "Добавить шаг" button at bottom — appends empty step
- "Удалить" button per step (icon button, trash icon)
- Move up/down arrow buttons per step to reorder

- [ ] **Step 3: Create CreateStepAssign.vue**

Props: `modelValue` (object `{ assignedTo, scheduledDate }`), `equipment` (object), `type` (string), `stepsCount` (number). Emits: `update:modelValue`.
- shadcn Select for mechanic (users with role 'mechanic' from usersApi)
- shadcn Input type="date" for scheduled date
- Summary card: equipment, type, steps count, assigned mechanic, date

- [ ] **Step 4: Rewrite MaintenanceCreateView.vue**

Replace stub. 3-step wizard:
- Step indicator at top (1: Оборудование / 2: Чек-лист / 3: Назначение)
- "Назад" / "Далее" navigation buttons
- Step 3 has "Создать наряд" button instead of "Далее"
- On create: call `maintenanceStore.createOrder(data)`, redirect to `/maintenance`
- Permission check: if !canCreate, show "Недостаточно прав" and back link
- Read `route.query.equipmentId` to pre-fill equipment selection

- [ ] **Step 5: Verify build, lint, format, commit**

```bash
npm run build && npm run lint && npm run format
git add src/ && git commit -m "feat: creation wizard — 3-step maintenance order creation"
```

---

## Task 7: Order detail + step execution wizard

**Files:**
- Create: `src/components/maintenance/OrderHeader.vue`
- Create: `src/components/maintenance/StepProgress.vue`
- Create: `src/components/maintenance/StepCard.vue`
- Create: `src/components/maintenance/StepWizard.vue`
- Create: `src/components/maintenance/OrderSummary.vue`
- Create: `src/components/maintenance/ReviewActions.vue`
- Modify: `src/views/MaintenanceDetailView.vue` (replace stub)

- [ ] **Step 1: Create OrderHeader.vue**

Props: `order` (object).
- Back link "← Техобслуживание" → `/maintenance`
- Order ID, type badge, equipment ID
- Status badge with ORDER_STATUS_COLORS
- People: created by, assigned to, reviewed by (if exists)
- Dates: created, started, completed, reviewed
- Operating hours at start (if set)
- Return reason alert (yellow Card) if `order.returnReason` is set

- [ ] **Step 2: Create StepProgress.vue**

Props: `currentStep` (number, 0-based index), `steps` (array).
- Shows "Шаг N из M"
- Horizontal bar with dots/segments for each step, colored by status: green (passed), red (failed), grey (skipped), blue (current), muted (pending)
- Clickable dots — emit `navigate` event with step index

- [ ] **Step 3: Create StepCard.vue**

Props: `step` (object), `stepNumber` (number), `readonly` (boolean).
Emits: `complete` with `{ status, comment }`.
- Step number and description (large text)
- Requirement section
- Tools section
- If not readonly:
  - 3 action buttons: "Выполнено" (green), "Не выполнено" (red), "Пропущено" (outline)
  - Textarea for comment (required when status is 'failed', optional otherwise)
  - Current status shown as badge if already set
- If readonly:
  - Status badge, comment text (if any), completedAt timestamp

- [ ] **Step 4: Create StepWizard.vue**

Props: `order` (object).
Emits: `step-completed`, `submit-for-review`.
- State: `currentStepIndex` (ref, starts at first pending step or 0)
- StepProgress at top with navigate handler
- StepCard for current step
- Navigation: "← Назад" / "Далее →" buttons
- On step complete: call `maintenanceStore.completeStep(orderId, stepId, status, comment)`, advance to next
- Allow navigating back to change previous step statuses
- After last step or when all steps are non-pending: show OrderSummary instead of StepCard, hide wizard nav buttons (OrderSummary has its own submit button)

- [ ] **Step 5: Create OrderSummary.vue**

Props: `order` (object).
- shadcn Table: step number, description, status badge (colored), comment
- Statistics row: passed X, failed Y, skipped Z
- "Отправить на приёмку" button (emits `submit`)

- [ ] **Step 6: Create ReviewActions.vue**

Props: `order` (object).
Emits: `approve`, `return`.
- Same results table as OrderSummary (read-only)
- Statistics
- "Утвердить" button (green, emits `approve`)
- "Вернуть на доработку" button (yellow) — on click, shows textarea for return reason (required), then emits `return` with reason

- [ ] **Step 7: Rewrite MaintenanceDetailView.vue**

Replace stub. Load order by route param `id` on mount. Show:
- OrderHeader
- Body depends on status + role (see spec section 5.3 table):
  - planned + mechanic → "Начать выполнение" button
  - planned + engineer → "Отменить" button
  - in_progress + assigned mechanic → StepWizard
  - in_progress + others → OrderSummary (readonly)
  - review + foreman → ReviewActions
  - review + others → OrderSummary (readonly)
  - completed/cancelled → OrderSummary (readonly)
- Handle actions: start, cancel, submit, approve, return — call store methods, reload order
- LoadingSpinner while loading

- [ ] **Step 8: Verify build, lint, format, commit**

```bash
npm run build && npm run lint && npm run format
git add src/ && git commit -m "feat: order detail — execution wizard, review actions, step-by-step workflow"
```

---

## Task 8: Final integration and cleanup

**Files:** Multiple — cleanup pass

- [ ] **Step 1: Verify all routes navigate correctly**

Manual checklist:
1. Login with each role (engineer, mechanic, foreman)
2. Navigate to /maintenance — kanban renders
3. Create order (engineer) — wizard works, order appears on kanban
4. Start order (mechanic) — wizard execution works
5. Complete all steps, submit for review
6. Approve (foreman) — order moves to completed
7. Test return flow: foreman returns → mechanic fixes → resubmit
8. Cancel order (engineer)
9. Filters work on kanban
10. MaintenanceTab shows orders and "Создать наряд" link

- [ ] **Step 2: Run lint and fix issues**

```bash
npm run lint
```
Fix any warnings (unused imports, etc.).

- [ ] **Step 3: Run format**

```bash
npm run format
```

- [ ] **Step 4: Full build verification**

```bash
npm run build
```
Must pass with zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/ && git commit -m "chore: maintenance workflow — final integration and cleanup"
```

---

## Summary

| Task | Description | New Files | Modified Files |
|------|-------------|-----------|----------------|
| 1 | Constants, users mock, auth migration | 2 | 5 |
| 2 | Maintenance mock — ТР/КР checklists, orders CRUD | 0 | 2 |
| 3 | Maintenance store orders + usePermissions | 1 | 1 |
| 4 | Routes, sidebar, MaintenanceTab integration | 3 (stubs) | 3 |
| 5 | Kanban board — MaintenanceView | 4 | 1 |
| 6 | Creation wizard — MaintenanceCreateView | 3 | 1 |
| 7 | Order detail + execution wizard | 6 | 1 |
| 8 | Final integration and cleanup | 0 | ~3 |

**Total: ~19 new files, ~17 modified files, 8 tasks, 8 commits**
