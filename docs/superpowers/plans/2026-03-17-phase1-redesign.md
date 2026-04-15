# Phase 1: Foundation Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Rudgormash Frontend from brutalist style to Industrial SaaS design with sidebar navigation, shadcn-vue components, component decomposition, maintenance module, and mobile adaptivity.

**Architecture:** Evolutionary refactoring — file-by-file transformation of the existing Vue 3.5 codebase. New shadcn-vue design system applied through theme.css updates and component replacements. Large views decomposed into focused subcomponents. New maintenance module built on mock data derived from the official ТО regulation document.

**Tech Stack:** Vue 3.5 (Composition API), Pinia 3, Tailwind CSS 4, shadcn-vue, ECharts 6, grid-layout-plus, lucide-vue-next

**Spec:** `docs/superpowers/specs/2026-03-17-phase1-redesign-design.md`

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
├── utils/constants.js                          # STATUS_LABELS, STATUS_COLORS, MAINTENANCE_SCHEDULE, SUBSYSTEMS
├── composables/useBreakpoint.js                # Reactive breakpoint detection
├── composables/useSwipe.js                     # Touch swipe via Pointer Events
├── stores/maintenance.js                       # Maintenance schedule, checklists
├── api/maintenance.js                          # Mock API for maintenance
├── api/audit.js                                # Mock API for audit log
├── api/mock/maintenance.js                     # Checklists, schedules from regulation
├── api/mock/audit.js                           # Audit log mock data
├── components/layout/AppSidebar.vue            # Sidebar navigation (collapsed/expanded/mobile)
├── components/layout/AppHeader.vue             # Slim 48px header with breadcrumbs
├── components/layout/AppBreadcrumb.vue         # Auto breadcrumbs from route meta
├── components/layout/AppFooter.vue             # Minimal single-line footer
├── components/equipment/EquipmentHeader.vue    # Equipment ID, status, hours
├── components/equipment/EquipmentMetrics.vue   # 5 metric cards
├── components/equipment/EquipmentCharts.vue    # Power, depth, torque charts
├── components/equipment/EquipmentStatusBars.vue # 6 progress bars
├── components/equipment/EquipmentSpecs.vue     # Specs + service history
├── components/equipment/EquipmentParts.vue     # Parts table
├── components/equipment/SensorHistoryExplorer.vue # Sensor + date + chart
├── components/analytics/AnalyticsPeriodSelector.vue
├── components/analytics/AnalyticsKPICards.vue
├── components/analytics/AnalyticsCharts.vue
├── components/analytics/EfficiencyTable.vue
├── components/analytics/MaintenanceStats.vue
├── components/home/HomeMetricsPanel.vue        # Status cards
├── components/home/HomeCharts.vue              # Sparkline charts
├── components/home/HomeEquipmentGrid.vue       # Equipment cards + next ТО
├── components/settings/SettingsDisplay.vue
├── components/settings/SettingsNotifications.vue
├── components/settings/SettingsThresholds.vue
├── components/settings/SettingsSecurity.vue
├── components/settings/SettingsSystem.vue      # Includes audit log
├── components/widgets/MaintenanceTimelineWidget.vue  # ТО cycle timeline
├── components/widgets/SubsystemHealthWidget.vue      # 4 subsystem bars
└── components/ui/                              # shadcn-vue generated components
```

### Files to modify

```
src/assets/theme.css                    # New palette, radius tokens, shadows, typography
src/layouts/DefaultLayout.vue           # Sidebar + slim header
src/router/index.js                     # Route meta for breadcrumbs
src/api/mock/equipment.js               # Add operatingHours, subsystemHealth, lastMaintenance
src/api/mock/alerts.js                  # Add maintenance alert type
src/components/widgets/widgetRegistry.js # Register 2 new widget types
src/views/HomeView.vue                  # Redesign → orchestrator
src/views/EquipmentDetailView.vue       # Decompose → orchestrator with tabs
src/views/AnalyticsView.vue             # Decompose → orchestrator
src/views/SettingsView.vue              # Decompose → orchestrator with tabs
src/views/DashboardView.vue             # Visual update
src/views/EquipmentListView.vue         # Visual update
src/views/AlertsView.vue                # Timeline grouping + maintenance alerts
src/views/EquipmentDashboardView.vue    # Toolbar update
src/views/LoginView.vue                 # Visual update
src/composables/useChartColors.js       # New chart palette
src/components/MetricCard.vue           # shadcn Card integration
src/components/DataTable.vue            # shadcn Table
src/components/CriticalAlertModal.vue   # shadcn Dialog
src/components/widgets/AddWidgetModal.vue # shadcn Dialog + RadioGroup
```

### Files to delete

```
src/components/AppNavigation.vue        # Replaced by AppSidebar (Task 5)
src/components/AppFooter.vue            # Replaced by layout/AppFooter.vue (Task 5)
src/components/SettingsToggle.vue       # Replaced by shadcn Switch (Task 10, after SettingsView refactoring)
```

---

## Task 1: Initialize shadcn-vue and generate base components

**Files:**

- Create: `components.json` (auto-generated by shadcn init)
- Create: `src/components/ui/*` (generated components)
- Modify: `src/assets/theme.css` (shadcn will update CSS variables)

- [ ]  **Step 1: Initialize shadcn-vue**

Run from project root:

```bash
npx shadcn-vue@latest init
```

When prompted:

- Style: Default
- Base color: Zinc
- CSS file: `src/assets/theme.css`
- Import alias: `@`
- Components alias: `@/components/ui`

- [ ]  **Step 2: Add required shadcn components**

```bash
npx shadcn-vue@latest add button card dialog input select switch table tabs badge breadcrumb dropdown-menu tooltip separator sheet radio-group
```

- [ ]  **Step 3: Verify components were generated**

Check that `src/components/ui/` now contains subdirectories for each component. Run:

```bash
ls src/components/ui/
```

Expected: `badge/ breadcrumb/ button/ card/ dialog/ dropdown-menu/ input/ radio-group/ select/ separator/ sheet/ switch/ table/ tabs/ tooltip/`

- [ ]  **Step 4: Verify build still works**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ]  **Step 5: Commit**

```bash
git add -A && npm run lint && npm run format
git add -A
git commit -m "feat: initialize shadcn-vue and add base UI components"
```

---

## Task 2: Update design system — theme.css

**Files:**

- Modify: `src/assets/theme.css` (197 lines → updated palette, radius, typography)
- Modify: `src/composables/useChartColors.js` (24 lines → new chart colors)

- [ ]  **Step 1: Update CSS variables in `:root` (light theme)**

In `src/assets/theme.css`, replace the `:root` block (lines 3-49) with updated values. Key changes:

- `--background: #fafafa` (keep)
- `--foreground: #09090b` (keep)
- `--surface-1: #ffffff` (keep)
- `--surface-2: #f4f4f5` (was `#f0f0f0`)
- `--border: #e4e4e7` (was `rgba(0,0,0,0.15)`)
- `--primary: #2563eb` (was `#0a0a0a`)
- `--primary-foreground: #ffffff`
- `--muted: #f4f4f5`
- `--muted-foreground: #71717a`
- `--accent: #f4f4f5`
- `--accent-foreground: #09090b`
- `--destructive: #dc2626`
- `--ring: #2563eb`
- `--input: #e4e4e7`
- `--input-background: #ffffff`
- `--status-normal: #22c55e` (was `#2ECC71`)
- `--status-warning: #eab308` (was `#F39C12`)
- `--status-critical-bg: #ef4444` (keep name, update value)
- `--status-critical-text: #ffffff` (keep)
- `--chart-1: #2563eb` (blue)
- `--chart-2: #7c3aed` (violet)
- `--chart-3: #0891b2` (cyan)
- `--chart-4: #d97706` (amber)
- `--chart-5: #db2777` (pink)
- Add: `--radius-sm: 4px; --radius-md: 6px; --radius-lg: 8px;`
- Remove: `--radius: 0px`

- [ ]  **Step 2: Update CSS variables in `.dark` block**

Update `.dark` block (lines 51-88) with dark palette from spec section 1.4:

- `--background: #09090b`
- `--foreground: #fafafa`
- `--surface-1: #18181b`
- `--surface-2: #27272a`
- `--border: #3f3f46`
- `--primary: #3b82f6`
- `--primary-foreground: #fafafa`
- `--card: #18181b; --card-foreground: #fafafa`
- `--muted: #27272a; --muted-foreground: #a1a1aa`
- `--accent: #27272a; --accent-foreground: #fafafa`
- `--destructive: #ef4444; --destructive-foreground: #fafafa`
- `--ring: #3b82f6`
- `--input: #3f3f46; --input-background: #18181b`
- `--status-normal: #22c55e`
- `--status-warning: #eab308`
- `--status-critical-bg: #ef4444; --status-critical-text: #fafafa`
- Chart colors: `#3b82f6, #8b5cf6, #06b6d4, #f59e0b, #ec4899`

- [ ]  **Step 3: Update `@theme inline` block**

Update the `@theme inline` block (lines 90-125) to include new radius tokens:

```css
--radius-sm: var(--radius-sm);
--radius-md: var(--radius-md);
--radius-lg: var(--radius-lg);
```

Remove old `--radius-none: 0px;`

- [ ]  **Step 4: Update `@layer base` typography**

In the `@layer base` block (lines 127-197):

- Change `h1, h2, h3, h4` from `font-weight: var(--font-weight-bold)` (800) to `font-weight: 600`
- Remove `text-transform: uppercase` from h1-h4 (keep it only on `.label` and badge elements)
- Change `border-width` references from `2px` to `1px` in base styles

- [ ]  **Step 5: Update useChartColors.js**

In `src/composables/useChartColors.js`, update the color values to match new palette:

```js
const colors = computed(() => {
  const isDark = theme.value === 'dark'
  return {
    foreground: isDark ? '#FAFAFA' : '#09090B',
    background: isDark ? '#09090B' : '#FAFAFA',
    surface1: isDark ? '#18181B' : '#FFFFFF',
    surface2: isDark ? '#27272A' : '#F4F4F5',
    border: isDark ? '#3F3F46' : '#E4E4E7',
    chart1: isDark ? '#3B82F6' : '#2563EB',
    chart2: isDark ? '#8B5CF6' : '#7C3AED',
    chart3: isDark ? '#06B6D4' : '#0891B2',
    chart4: isDark ? '#F59E0B' : '#D97706',
    chart5: isDark ? '#EC4899' : '#DB2777',
  }
})
```

- [ ]  **Step 6: Verify build and visual check**

```bash
npm run build
```

Expected: Build succeeds. Run `npm run dev` and visually verify the new palette is applied.

- [ ]  **Step 7: Lint, format, commit**

```bash
npm run lint && npm run format && git add -A && git commit -m "feat: update design system — new palette, radius tokens, typography"
```

---

## Task 3: Create shared constants and new composables

**Files:**

- Create: `src/utils/constants.js`
- Create: `src/composables/useBreakpoint.js`
- Create: `src/composables/useSwipe.js`

- [ ]  **Step 1: Create constants.js**

Create `src/utils/constants.js`:

```js
export const STATUS_LABELS = {
  working: 'Работа',
  idle: 'Простой',
  malfunction: 'Авария',
  offline: 'Отключён',
}

export const STATUS_COLORS = {
  working: 'text-green-500',
  idle: 'text-yellow-500',
  malfunction: 'text-red-500',
  offline: 'text-muted-foreground',
}

export const STATUS_DOT_COLORS = {
  working: 'bg-green-500',
  idle: 'bg-yellow-500',
  malfunction: 'bg-red-500',
  offline: 'bg-zinc-500',
}

export const MAINTENANCE_SCHEDULE = {
  'ЕО': { hours: null, label: 'Ежесменное', workers: 1, duration: 1, laborCost: 1 },
  'ТО-1': { hours: 250, label: 'ТО-1', workers: 2, duration: 4, laborCost: 8 },
  'ТО-2': { hours: 500, label: 'ТО-2', workers: 2, duration: 6, laborCost: 12 },
  'ТО-3': { hours: 2000, label: 'ТО-3', workers: 2, duration: 8, laborCost: 16 },
  'ТР-1': { hours: 2500, label: 'Текущий ремонт 1', workers: 3, duration: null, laborCost: 32 },
  'ТР-2': { hours: 5000, label: 'Текущий ремонт 2', workers: 4, duration: null, laborCost: 292 },
  'ТР-3': { hours: 10000, label: 'Текущий ремонт 3', workers: 4, duration: null, laborCost: 288 },
  'КР': { hours: 20000, label: 'Капитальный ремонт', workers: null, duration: null, laborCost: null },
}

export const SUBSYSTEMS = [
  { id: 'hydraulic', label: 'Гидравлика' },
  { id: 'electrical', label: 'Электрика' },
  { id: 'mechanical', label: 'Трансмиссия' },
  { id: 'compressor', label: 'Компрессор' },
]
```

- [ ]  **Step 2: Create useBreakpoint.js**

Create `src/composables/useBreakpoint.js`:

```js
import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useBreakpoint() {
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1280)
  let timer = null

  function onResize() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      width.value = window.innerWidth
    }, 100)
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
    clearTimeout(timer)
  })

  const isMobile = computed(() => width.value < 768)
  const isTablet = computed(() => width.value >= 768 && width.value < 1024)
  const isDesktop = computed(() => width.value >= 1024)

  return { width, isMobile, isTablet, isDesktop }
}
```

- [ ]  **Step 3: Create useSwipe.js**

Create `src/composables/useSwipe.js`:

```js
import { onMounted, onUnmounted } from 'vue'

export function useSwipe(elementRef, { onSwipeLeft, onSwipeRight, threshold = 50 } = {}) {
  let startX = 0
  let startY = 0

  function onPointerDown(e) {
    startX = e.clientX
    startY = e.clientY
  }

  function onPointerUp(e) {
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (Math.abs(dx) < threshold || Math.abs(dy) > Math.abs(dx)) return
    if (dx < 0 && onSwipeLeft) onSwipeLeft()
    if (dx > 0 && onSwipeRight) onSwipeRight()
  }

  onMounted(() => {
    const el = elementRef.value
    if (!el) return
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointerup', onPointerUp)
  })

  onUnmounted(() => {
    const el = elementRef.value
    if (!el) return
    el.removeEventListener('pointerdown', onPointerDown)
    el.removeEventListener('pointerup', onPointerUp)
  })
}
```

- [ ]  **Step 4: Lint, format, commit**

```bash
npm run lint && npm run format && git add -A && git commit -m "feat: add shared constants and useBreakpoint/useSwipe composables"
```

---

## Task 4: Create maintenance mock data and API

**Files:**

- Create: `src/api/mock/maintenance.js`
- Create: `src/api/mock/audit.js`
- Create: `src/api/maintenance.js`
- Create: `src/api/audit.js`
- Create: `src/stores/maintenance.js`
- Modify: `src/api/mock/equipment.js` (add operatingHours, subsystemHealth, lastMaintenance)
- Modify: `src/api/mock/alerts.js` (add maintenance alert type)

- [ ]  **Step 1: Create mock maintenance data**

Create `src/api/mock/maintenance.js` with:

- Checklists for ЕО, ТО-1, ТО-2, ТО-3 (from regulation tables 4-7)
- Each item: `{ id, description, requirement, tools, completed: false }`
- `getSchedule(equipmentId)` — returns maintenance timeline
- `getChecklist(equipmentId, type)` — returns operations list
- `completeChecklistItem(equipmentId, itemId)` — toggles item

Checklist entries sourced from regulation document:

- ЕО: журнал тех.состояния, проверка инструмента, течи масла, контрольно-измерительные приборы, уровень масла, изоляция кабелей, заземление, тормоза
- ТО-1 (9 items): крепления трубопроводов, опоры мачты, гусеничные ленты, смазка, уровень масла редукторов, электроаппаратура, тормоза, канаты, крепления проводов
- ТО-2 (7 items): металлоконструкции, заземление, очистка шкафов, изоляция электродвигателей, радиаторы, фильтры, смазка
- ТО-3 (4 items): замена масла редукторов хода, редуктор вращателя, гидросистема, смазка

- [ ]  **Step 2: Create mock audit data**

Create `src/api/mock/audit.js`:

```js
const MOCK_AUDIT_LOG = [
  {
    id: 'AUD-001',
    action: 'alert_acknowledged',
    userId: 'user-1',
    userName: 'Иванов А.П.',
    equipmentId: 'БУР-03',
    details: 'Подтверждено: Температура двигателя 95°C',
    timestamp: '2026-03-17T14:35:00',
  },
  // 8-10 more entries covering: maintenance_completed, widget_added, settings_changed, login, logout
]

export function getAuditLog({ equipmentId, limit = 20 } = {}) {
  let log = [...MOCK_AUDIT_LOG]
  if (equipmentId) log = log.filter((e) => e.equipmentId === equipmentId)
  return log.slice(0, limit)
}

export function addAuditEntry(entry) {
  MOCK_AUDIT_LOG.unshift({ ...entry, id: `AUD-${Date.now()}`, timestamp: new Date().toISOString() })
}
```

- [ ]  **Step 3: Extend equipment mock data**

In `src/api/mock/equipment.js`, add to each of the 8 rigs:

```js
operatingHours: 4820,  // varies per rig: 4820, 12350, 1200, 8900, 320, 15600, 6700, 2100
lastMaintenance: {
  type: 'ТО-2',
  date: '2026-02-15',
  hours: 4500,
},
subsystemHealth: {
  hydraulic: 82,    // varies per rig
  electrical: 95,
  mechanical: 71,
  compressor: 88,
},
```

Values should vary realistically: working rigs have high hours, idle/offline have low. БУР-03 (malfunction) should have poor subsystem health.

- [ ]  **Step 4: Add maintenance alerts to mock**

In `src/api/mock/alerts.js`, add 2-3 alerts with `type: 'maintenance'`:

```js
{
  id: 'A-007',
  type: 'maintenance',
  title: 'Приближается ТО-1',
  description: 'До планового ТО-1 осталось 42 часа наработки',
  equipmentId: 'БУР-12',
  sensorId: null,
  value: null,
  threshold: null,
  timestamp: '2026-03-17T08:00:00',
  acknowledged: false,
}
```

- [ ]  **Step 5: Create API wrapper modules**

Create `src/api/maintenance.js`:

```js
import { request } from './client'
import * as mock from './mock/maintenance'

export function getSchedule(equipmentId) {
  return request(() => mock.getSchedule(equipmentId))
}

export function getChecklist(equipmentId, type) {
  return request(() => mock.getChecklist(equipmentId, type))
}

export function completeChecklistItem(equipmentId, itemId) {
  return request(() => mock.completeChecklistItem(equipmentId, itemId))
}
```

Create `src/api/audit.js`:

```js
import { request } from './client'
import * as mock from './mock/audit'

export function getLog(params) {
  return request(() => mock.getAuditLog(params))
}

export function addEntry(entry) {
  return request(() => mock.addAuditEntry(entry))
}
```

- [ ]  **Step 6: Create maintenance store**

Create `src/stores/maintenance.js`:

```js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { MAINTENANCE_SCHEDULE } from '@/utils/constants'
import * as maintenanceApi from '@/api/maintenance'
import { useEquipmentStore } from './equipment'

export const useMaintenanceStore = defineStore('maintenance', () => {
  const schedule = ref({})
  const checklist = ref([])
  const loading = ref(false)

  async function loadSchedule(equipmentId) {
    loading.value = true
    try {
      schedule.value[equipmentId] = await maintenanceApi.getSchedule(equipmentId)
    } finally {
      loading.value = false
    }
  }

  async function loadChecklist(equipmentId, type) {
    loading.value = true
    try {
      checklist.value = await maintenanceApi.getChecklist(equipmentId, type)
    } finally {
      loading.value = false
    }
  }

  async function toggleChecklistItem(equipmentId, itemId) {
    await maintenanceApi.completeChecklistItem(equipmentId, itemId)
    const item = checklist.value.find((i) => i.id === itemId)
    if (item) item.completed = !item.completed
  }

  function getNextMaintenance(equipmentId) {
    const equipmentStore = useEquipmentStore()
    const equipment = equipmentStore.getDetail(equipmentId)
    if (!equipment) return null
    const hours = equipment.operatingHours
    const thresholds = Object.entries(MAINTENANCE_SCHEDULE)
      .filter(([, v]) => v.hours !== null)
      .map(([key, v]) => ({ type: key, ...v }))
      .sort((a, b) => a.hours - b.hours)
    // Find next threshold after current hours (modulo full cycle)
    const cycleHours = hours % 20000
    const next = thresholds.find((t) => t.hours > cycleHours)
    if (!next) return { type: 'КР', hoursRemaining: 20000 - cycleHours }
    return { type: next.type, hoursRemaining: next.hours - cycleHours, label: next.label }
  }

  return { schedule, checklist, loading, loadSchedule, loadChecklist, toggleChecklistItem, getNextMaintenance }
})
```

- [ ]  **Step 7: Lint, format, commit**

```bash
npm run lint && npm run format && git add -A && git commit -m "feat: add maintenance module — mock data, API, store, audit log"
```

---

## Task 5: Build new layout — Sidebar + Header + Breadcrumbs

**Files:**

- Create: `src/components/layout/AppSidebar.vue`
- Create: `src/components/layout/AppHeader.vue`
- Create: `src/components/layout/AppBreadcrumb.vue`
- Create: `src/components/layout/AppFooter.vue`
- Modify: `src/layouts/DefaultLayout.vue` (95 lines → new structure)
- Modify: `src/router/index.js` (add route meta for breadcrumbs)
- Delete: `src/components/AppNavigation.vue` (37 lines)
- Delete: `src/components/AppFooter.vue` (19 lines)

- [ ]  **Step 1: Add breadcrumb meta to routes**

In `src/router/index.js`, add `meta.breadcrumb` to each route inside the DefaultLayout children (lines 27-65). Example:

```js
{
  path: '',
  name: 'home',
  meta: { breadcrumb: 'Главная' },
  component: () => import('@/views/HomeView.vue'),
},
{
  path: 'equipment',
  name: 'equipment',
  meta: { breadcrumb: 'Оборудование' },
  component: () => import('@/views/EquipmentListView.vue'),
},
{
  path: 'equipment/:id',
  name: 'equipment-detail',
  meta: { breadcrumb: 'Оборудование / :id' },
  component: () => import('@/views/EquipmentDetailView.vue'),
},
// Same for all other routes...
```

- [ ]  **Step 2: Create AppBreadcrumb.vue**

Create `src/components/layout/AppBreadcrumb.vue`:

- Uses `useRoute()` to read `meta.breadcrumb`
- Replaces `:id` params with actual route param values
- Splits by `/` to create breadcrumb segments
- Each segment (except last) links to parent route
- Uses shadcn Breadcrumb components

- [ ]  **Step 3: Create AppSidebar.vue**

Create `src/components/layout/AppSidebar.vue`:

- Desktop: collapsed (56px, icons only) by default, expanded (220px) on hover or pin-button click
- Mobile (`isMobile` from useBreakpoint): hidden, triggered by header hamburger via `v-model:open` prop
- Menu items grouped with Separator: Основное (Главная, Мониторинг, Оборудование), Аналитика (Уведомления, Аналитика), Система (Настройки)
- Icons from lucide-vue-next: Home, LayoutDashboard, Server, Bell, BarChart3, Settings
- Active state via `useRoute()` — highlight matching route
- Bottom: ThemeToggle + user avatar with DropdownMenu (Профиль, Выход)
- Mobile mode: uses shadcn Sheet (side="left")

- [ ]  **Step 4: Create AppHeader.vue**

Create `src/components/layout/AppHeader.vue`:

- Height: 48px (`h-12`)
- Left: hamburger button (mobile only, emits `toggle-sidebar`), AppLogo (compact), AppBreadcrumb
- Right: useClock (compact `text-xs`), ConnectionStatus, alerts button with Badge count, user avatar with DropdownMenu
- Uses shadcn Button, Badge, DropdownMenu, Tooltip

- [ ]  **Step 5: Create layout/AppFooter.vue**

Create `src/components/layout/AppFooter.vue`:

- Single line: `v2.5.0 · © 2026 Рудгормаш`
- `border-t` separator, `py-2 px-4`, `text-xs text-muted-foreground`

- [ ]  **Step 6: Rewrite DefaultLayout.vue**

Replace `src/layouts/DefaultLayout.vue` content with new structure:

```
<div class="flex h-screen">
  <AppSidebar v-model:open="sidebarOpen" />
  <div class="flex flex-1 flex-col overflow-hidden">
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <main class="flex-1 overflow-y-auto p-4 lg:p-6">
      <RouterView />
    </main>
    <AppFooter />
  </div>
  <CriticalAlertModal ... />
</div>
```

- [ ]  **Step 7: Delete old navigation and footer**

```bash
rm src/components/AppNavigation.vue src/components/AppFooter.vue
```

Update any remaining imports (grep for `AppNavigation` and `AppFooter` across all files).

- [ ]  **Step 8: Verify build and navigation**

```bash
npm run build
```

Run `npm run dev` and verify: sidebar renders, all 8 routes navigate correctly, breadcrumbs update, mobile hamburger works.

- [ ]  **Step 9: Lint, format, commit**

```bash
npm run lint && npm run format && git add -A && git commit -m "feat: new layout — sidebar navigation, slim header, breadcrumbs"
```

---

## Task 6: Update visual style across existing components

Apply the new design system to all existing components: border-radius, border-width, shadows, hover effects, typography.

**Files to modify:** All components in `src/components/` (excluding `ui/` and `layout/`)

- [ ]  **Step 1: Update MetricCard.vue**

In `src/components/MetricCard.vue`:

- Replace `border-2` → `border`
- Add `rounded-md shadow-sm` (uses --radius-md = 6px)
- Remove clip-path polygon styles
- Replace hover `translate-x-[2px] translate-y-[-2px]` → `hover:shadow-md hover:border-primary/30`
- Use shadcn Card as base if appropriate

- [ ]  **Step 2: Update EquipmentCard.vue**

In `src/components/EquipmentCard.vue`:

- Replace `border-2` → `border`
- Add `rounded-md shadow-sm`
- Remove hover translate transforms → `hover:shadow-md`

- [ ]  **Step 3: Update DataTable.vue**

In `src/components/DataTable.vue`:

- Replace manual table styling with shadcn Table component
- Keep Russian headers and status badge logic
- Add `rounded-md` wrapper

- [ ]  **Step 4: Update ConnectionStatus.vue**

In `src/components/ConnectionStatus.vue`:

- Remove `animate-pulse` from status dots (keep only for critical)
- Update border classes

- [ ]  **Step 5: Update CriticalAlertModal.vue**

In `src/components/CriticalAlertModal.vue`:

- Replace manual Teleport + overlay with shadcn Dialog
- Keep critical color scheme and content
- Remove clip-path corner accent
- Add `rounded-lg` to dialog content

- [ ]  **Step 6: Update LoadingSpinner.vue**

In `src/components/LoadingSpinner.vue`:

- Update border colors to use new tokens
- Add `rounded-full` to spinner elements

- [ ]  **Step 7: Update StatusIndicator.vue, LiveDataIndicator.vue, ChartWidget.vue**

Apply same pattern: `border-2` → `border`, add `rounded-md`, remove old hover effects.

- [ ]  **Step 8: Do NOT delete SettingsToggle.vue yet**

SettingsToggle.vue is still imported by SettingsView.vue. It will be deleted in Task 10 when SettingsView is refactored to use shadcn Switch. Deleting it here would break the build.

- [ ]  **Step 9: Verify build**

```bash
npm run build
```

- [ ]  **Step 10: Lint, format, commit**

```bash
npm run lint && npm run format && git add -A && git commit -m "feat: apply new design system to all existing components"
```

---

## Task 7: Decompose and redesign HomeView

**Files:**

- Create: `src/components/home/HomeMetricsPanel.vue`
- Create: `src/components/home/HomeCharts.vue`
- Create: `src/components/home/HomeEquipmentGrid.vue`
- Modify: `src/views/HomeView.vue` (75 lines → orchestrator)

- [ ]  **Step 1: Create HomeMetricsPanel.vue**

4 status cards: total rigs, working, malfunction, idle/offline. Uses shadcn Card + Badge. Each card shows count with colored dot.

- [ ]  **Step 2: Create HomeCharts.vue**

Sparkline-style mini charts for temperature and vibration trends. Small height (80px), no axis labels, simple line with area fill. Uses ECharts via vue-echarts.

- [ ]  **Step 3: Create HomeEquipmentGrid.vue**

Equipment cards grid (responsive: 1/2/3/4 cols). Each card shows: equipment ID, model, status dot+label, 2-3 key sensor values (temp, speed, depth), link to detail. Also includes "Следующее ТО" block using `useMaintenanceStore().getNextMaintenance()`. Search input and status filter dropdown at top.

- [ ]  **Step 4: Rewrite HomeView.vue as orchestrator**

```vue
<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">Обзор системы</h1>
    <HomeMetricsPanel :equipment="equipmentStore.list" />
    <HomeCharts :equipment-id="firstWorkingId" />
    <HomeEquipmentGrid :equipment="equipmentStore.list" />
  </div>
</template>
```

- [ ]  **Step 5: Verify build and navigation**

```bash
npm run build && npm run dev
```

Check HomeView renders all 3 sections.

- [ ]  **Step 6: Lint, format, commit**

```bash
npm run lint && npm run format && git add -A && git commit -m "feat: redesign HomeView — metrics panel, sparklines, equipment grid with next ТО"
```

---

## Task 8: Decompose EquipmentDetailView with tabs

**Files:**

- Create: `src/components/equipment/EquipmentHeader.vue`
- Create: `src/components/equipment/EquipmentMetrics.vue`
- Create: `src/components/equipment/EquipmentCharts.vue`
- Create: `src/components/equipment/EquipmentStatusBars.vue`
- Create: `src/components/equipment/EquipmentSpecs.vue`
- Create: `src/components/equipment/EquipmentParts.vue`
- Create: `src/components/equipment/SensorHistoryExplorer.vue`
- Create: `src/components/equipment/EquipmentSensors.vue`
- Modify: `src/views/EquipmentDetailView.vue` (379 lines → ~80 lines orchestrator with shadcn Tabs)

- [ ]  **Step 1: Create EquipmentHeader.vue**

Props: `equipment`, `isPolling`. Shows: back button (← Оборудование), equipment ID + model, status badge, operating hours (`equipment.operatingHours` ч), play/pause buttons for polling.

- [ ]  **Step 2: Create EquipmentMetrics.vue**

Props: `equipmentId`. 5 MetricCard components: speed, depth, temperature, pressure, uptime. Gets live values from `useSensorsStore().getSensorValue()`.

- [ ]  **Step 3: Create EquipmentCharts.vue**

Props: `equipmentId`. 3 ChartWidget components: power, depth, torque. Generates mock chart data internally.

- [ ]  **Step 4: Create EquipmentStatusBars.vue**

Props: `equipmentId`. 6 StatusIndicator bars: engine load, fuel rate, tool wear, oil level, hydraulic pressure, hydraulic temp. Gets values from sensors store.

- [ ]  **Step 5: Create EquipmentSpecs.vue**

Props: `equipment`. Two-column layout: specs table (left) + service history timeline (right). Reuses logic from current SpecsWidget and ServiceHistoryWidget.

- [ ]  **Step 6: Create EquipmentParts.vue**

Props: `equipmentId`. Async loads parts via `getReplacements()`. Shows table with part name, date, person, original/analog badge. Uses shadcn Table + Badge.

- [ ]  **Step 7: Create SensorHistoryExplorer.vue**

Props: `equipmentId`, `sensors` (definitions). Select dropdown for sensor, date range inputs, fetch button, LineChartWidget for results. Calls `getHistory()` API.

- [ ]  **Step 8: Create EquipmentSensors.vue**

Props: `equipmentId`, `sensors` (definitions array). Displays all 12 sensors in a responsive grid (2-3 columns). Each sensor card shows: label, live value (from sensorsStore), unit, threshold indicators (warning/critical), mini sparkline chart (last 1 hour, generated mock data). Uses shadcn Card + Badge for threshold status.

- [ ]  **Step 9: Rewrite EquipmentDetailView.vue as tab orchestrator**

Uses shadcn Tabs with 5 tabs:

- **Обзор:** EquipmentMetrics + EquipmentStatusBars + EquipmentCharts
- **Датчики:** EquipmentSensors — all 12 sensors with live values, thresholds, mini sparklines
- **ТО:** Maintenance timeline (new, uses maintenanceStore), progress bar to next ТО, checklist
- **Детали:** EquipmentParts
- **История:** SensorHistoryExplorer + EquipmentSpecs

The ТО tab is new functionality (not just refactoring). It shows:

- Horizontal scale: ЕО → ТО-1 → ... → КР with current hours marker
- Progress bar: "До ТР-2 осталось 180ч"
- Checklist from maintenanceStore with toggle checkboxes

- [ ]  **Step 10: Verify all tabs render and navigate**

```bash
npm run build && npm run dev
```

Navigate to any equipment detail, check all 5 tabs.

- [ ]  **Step 11: Lint, format, commit**

```bash
npm run lint && npm run format && git add -A && git commit -m "feat: decompose EquipmentDetailView — 5 tabs including new ТО module"
```

---

## Task 9: Decompose AnalyticsView

**Files:**

- Create: `src/components/analytics/AnalyticsPeriodSelector.vue`
- Create: `src/components/analytics/AnalyticsKPICards.vue`
- Create: `src/components/analytics/AnalyticsCharts.vue`
- Create: `src/components/analytics/EfficiencyTable.vue`
- Create: `src/components/analytics/MaintenanceStats.vue`
- Modify: `src/views/AnalyticsView.vue` (340 lines → ~60 lines orchestrator)

- [ ]  **Step 1: Create AnalyticsPeriodSelector.vue**

Props: `modelValue` (period string). Emits: `update:modelValue`. shadcn Select with options: Неделя, Месяц, 3 месяца, 6 месяцев, Год. Export PDF button (mock — shows toast/alert "Функция будет доступна после интеграции API").

- [ ]  **Step 2: Create AnalyticsKPICards.vue**

Props: `equipment` (list). 4 MetricCard: total count, working count, avg efficiency (computed), malfunction count.

- [ ]  **Step 3: Create AnalyticsCharts.vue**

Props: `equipment`, `period`. Two-column layout:

- Left: Bar chart — monthly productivity (depth)
- Right: Pie chart — status distribution + Subsystem health bars (4 bars from SUBSYSTEMS constant, computed avg from equipment data)

- [ ]  **Step 4: Create EfficiencyTable.vue**

Props: `equipment`. shadcn Table with columns: Equipment ID, Model, Efficiency %, Progress bar, Trend arrow. Efficiency computed from status (working=85-95%, idle=0%, malfunction=30-50%).

- [ ]  **Step 5: Create MaintenanceStats.vue**

3 cards: Плановых ТО (count from mock), Внеплановых ремонтов, Трудозатраты (stacked bar chart from MAINTENANCE_SCHEDULE laborCost values: ТО-1×79 + ТО-2×39 + ТО-3×9 + ТР-1×7 + ТР-2×3 + ТР-3×1 = 2632 чел·ч).

- [ ]  **Step 6: Rewrite AnalyticsView.vue as orchestrator**

```vue
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Аналитика</h1>
      <AnalyticsPeriodSelector v-model="period" />
    </div>
    <AnalyticsKPICards :equipment="equipmentStore.list" />
    <AnalyticsCharts :equipment="equipmentStore.list" :period="period" />
    <EfficiencyTable :equipment="equipmentStore.list" />
    <MaintenanceStats />
  </div>
</template>
```

- [ ]  **Step 7: Verify build**

```bash
npm run build && npm run dev
```

- [ ]  **Step 8: Lint, format, commit**

```bash
npm run lint && npm run format && git add -A && git commit -m "feat: decompose AnalyticsView — KPI, charts, efficiency table, maintenance stats"
```

---

## Task 10: Decompose SettingsView with tabs

**Files:**

- Create: `src/components/settings/SettingsDisplay.vue`
- Create: `src/components/settings/SettingsNotifications.vue`
- Create: `src/components/settings/SettingsThresholds.vue`
- Create: `src/components/settings/SettingsSecurity.vue`
- Create: `src/components/settings/SettingsSystem.vue`
- Modify: `src/views/SettingsView.vue` (259 lines → ~50 lines orchestrator)

- [ ]  **Step 1: Create SettingsDisplay.vue**

Theme toggle (dark/light buttons), language select (shadcn Select), refresh rate slider, auto-update toggle (shadcn Switch), show timestamps toggle, compact mode toggle. All settings persisted to localStorage.

- [ ]  **Step 2: Create SettingsNotifications.vue**

Toggles (shadcn Switch) for: critical alerts, warnings, info messages, email notifications. Email input field (shadcn Input). Persist to localStorage.

- [ ]  **Step 3: Create SettingsThresholds.vue**

6 threshold inputs from regulation: max temperature, vibration, power, tool wear, fuel level, pressure. shadcn Input with type="number" and step values. Persist to localStorage.

- [ ]  **Step 4: Create SettingsSecurity.vue**

Current user display (from authStore), role badge. Change password button (mock). Access log button (mock). 2FA toggle (shadcn Switch).

- [ ]  **Step 5: Create SettingsSystem.vue**

System info (6 items: version, install date, last update, license, device count, uptime). Audit log section: loads last 10 entries from `audit.getLog()`, displays in a compact list (timestamp, userName, action, details).

- [ ]  **Step 6: Delete SettingsToggle.vue**

```bash
rm src/components/SettingsToggle.vue
```

Now safe to delete — all toggle usages are replaced by shadcn Switch in the subcomponents above.

- [ ]  **Step 7: Rewrite SettingsView.vue with Tabs**

Uses shadcn Tabs:

- Отображение (SettingsDisplay)
- Уведомления (SettingsNotifications)
- Пороги (SettingsThresholds)
- Безопасность (SettingsSecurity)
- Система (SettingsSystem)

Save/reset buttons in header. Save persists all tabs to localStorage.

- [ ]  **Step 8: Verify build**

```bash
npm run build && npm run dev
```

- [ ]  **Step 9: Lint, format, commit**

```bash
npm run lint && npm run format && git add -A && git commit -m "feat: decompose SettingsView — 5 tabs with localStorage persistence and audit log"
```

---

## Task 11: Update remaining views — DashboardView, EquipmentListView, AlertsView, LoginView

**Files:**

- Modify: `src/views/DashboardView.vue`
- Modify: `src/views/EquipmentListView.vue`
- Modify: `src/views/AlertsView.vue`
- Modify: `src/views/LoginView.vue`
- Modify: `src/views/EquipmentDashboardView.vue`

- [ ]  **Step 1: Update DashboardView.vue**

- Replace `border-2` → `border`, add `rounded-md shadow-sm`
- Use shadcn Card for equipment cards
- Use STATUS_LABELS/STATUS_COLORS from constants.js (remove local duplicates)
- Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

- [ ]  **Step 2: Update EquipmentListView.vue**

- Replace manual table with shadcn Table
- Search: shadcn Input
- Filter tabs: shadcn Tabs
- Use STATUS_LABELS from constants.js (remove local duplicates)
- Add `rounded-md shadow-sm` to cards

- [ ]  **Step 3: Update AlertsView.vue**

- Timeline grouping by day: group alerts by date, render date headers
- Add support for `type: 'maintenance'` alerts (icon: Wrench from lucide, blue badge)
- Inline acknowledge: shadcn Button instead of separate action row
- Use shadcn Card for alert items, Badge for type labels
- Remove old TransitionGroup animation, add simpler fade transition

- [ ]  **Step 4: Update LoginView.vue**

- shadcn Input for username/password
- shadcn Button for submit
- Add `rounded-md` to form container
- Update colors to new palette

- [ ]  **Step 5: Update EquipmentDashboardView.vue**

- Toolbar: shadcn Button group (Настроить / Сохранить / Сбросить / + Виджет)
- Update AddWidgetModal to use shadcn Dialog + RadioGroup
- Add `rounded-md` to widget wrappers

- [ ]  **Step 6: Verify all routes render correctly**

```bash
npm run build && npm run dev
```

Navigate through all 8+ routes.

- [ ]  **Step 7: Lint, format, commit**

```bash
npm run lint && npm run format && git add -A && git commit -m "feat: update all remaining views — Dashboard, EquipmentList, Alerts, Login, EquipmentDashboard"
```

---

## Task 12: Add new widget types

**Files:**

- Create: `src/components/widgets/MaintenanceTimelineWidget.vue`
- Create: `src/components/widgets/SubsystemHealthWidget.vue`
- Modify: `src/components/widgets/widgetRegistry.js` (add 2 entries before line 67)

- [ ]  **Step 1: Create MaintenanceTimelineWidget.vue**

Props: `title`, `equipment`, `equipmentId`. Size: 6×4.

- Horizontal timeline bar showing ЕО → ТО-1 → ТО-2 → ТО-3 → ТР-1 → ТР-2 → ТР-3 → КР
- Marker at current operating hours position
- Highlight next upcoming ТО
- Uses MAINTENANCE_SCHEDULE from constants.js
- Uses maintenanceStore.getNextMaintenance()

- [ ]  **Step 2: Create SubsystemHealthWidget.vue**

Props: `title`, `equipment`, `equipmentId`. Size: 4×3.

- 4 horizontal progress bars: hydraulic, electrical, mechanical, compressor
- Labels from SUBSYSTEMS constant
- Color: green (>80%), yellow (50-80%), red (<50%)
- Values from equipment.subsystemHealth

- [ ]  **Step 3: Register in widgetRegistry.js**

Add at the end of the `widgetTypes` object in `src/components/widgets/widgetRegistry.js` (before the closing brace):

```js
'maintenance-timeline': {
  component: defineAsyncComponent(() => import('./MaintenanceTimelineWidget.vue')),
  label: 'Цикл ТО',
  description: 'Таймлайн технического обслуживания',
  defaultSize: { w: 6, h: 4 },
  requiresSensor: false,
},
'subsystem-health': {
  component: defineAsyncComponent(() => import('./SubsystemHealthWidget.vue')),
  label: 'Здоровье подсистем',
  description: 'Состояние подсистем оборудования',
  defaultSize: { w: 4, h: 3 },
  requiresSensor: false,
},
```

- [ ]  **Step 4: Verify widgets render in dashboard editor**

```bash
npm run build && npm run dev
```

Navigate to any equipment dashboard, enter edit mode, add both new widget types.

- [ ]  **Step 5: Lint, format, commit**

```bash
npm run lint && npm run format && git add -A && git commit -m "feat: add maintenance-timeline and subsystem-health widgets"
```

---

## Task 13: Mobile adaptivity pass

**Files:** Multiple components across the project

- [ ]  **Step 1: Update AppSidebar for mobile**

Ensure Sheet mode works on `< 1024px`. Hamburger button visible in AppHeader on mobile. Sidebar collapsed on desktop, Sheet on mobile.

- [ ]  **Step 2: Update grid layouts**

Across all views, ensure responsive grids:

- MetricCards: `grid-cols-2 lg:grid-cols-4`
- Equipment cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Analytics columns: `grid-cols-1 lg:grid-cols-2`

- [ ]  **Step 3: Update tables for mobile**

In DataTable.vue and all shadcn Table usages: hide secondary columns on mobile (`hidden md:table-cell`). Consider adding `useBreakpoint()` to switch to card-view on `isMobile`.

- [ ]  **Step 4: Update modals for mobile**

CriticalAlertModal and AddWidgetModal: on `isMobile`, use Sheet (bottom) instead of centered Dialog. Max height 90vh, scrollable content.

- [ ]  **Step 5: Update EquipmentDashboardView grid for mobile**

On `isMobile`: set grid-layout-plus cols to 1, disable drag-and-drop, widgets stretch to full width.

- [ ]  **Step 6: Ensure touch targets ≥ 44×44px**

Verify all buttons and interactive elements have `min-h-[44px] min-w-[44px]` or equivalent padding.

- [ ]  **Step 7: Test on mobile viewport**

In browser DevTools, test at 375px, 768px, 1024px, 1280px widths. Verify all routes.

- [ ]  **Step 8: Lint, format, commit**

```bash
npm run lint && npm run format && git add -A && git commit -m "feat: mobile adaptivity — responsive grids, Sheet modals, touch targets"
```

---

## Task 14: Final integration and cleanup

- [ ]  **Step 1: Remove all duplicate STATUS_LABELS**

Grep for `STATUS_LABELS` or equivalent inline objects across views. Replace with import from `@/utils/constants`:

```bash
# Search for duplicates
grep -rn "working.*Работа\|idle.*Простой\|malfunction.*Авария" src/views/
```

Replace all occurrences with `import { STATUS_LABELS } from '@/utils/constants'`.

- [ ]  **Step 2: Remove unused imports**

Run linter to catch unused imports:

```bash
npm run lint
```

Fix all warnings.

- [ ]  **Step 3: Verify all routes and features**

Manual walkthrough:

1. Login → Home (metrics, charts, equipment grid, next ТО)
2. Dashboard → equipment cards with status
3. Equipment list → search, filter, detail link
4. Equipment detail → all 5 tabs (Обзор, Датчики, ТО, Детали, История)
5. Equipment dashboard → add/remove widgets including new types
6. Alerts → timeline grouping, maintenance alerts, acknowledge
7. Analytics → KPIs, charts, efficiency, maintenance stats
8. Settings → all 5 tabs, audit log in System tab
9. Theme toggle (dark ↔ light)
10. Mobile viewport (sidebar → Sheet, responsive grids)

- [ ]  **Step 4: Full build verification**

```bash
npm run lint && npm run format && npm run build
```

All must pass with zero errors.

- [ ]  **Step 5: Final commit**

```bash
git add -A && git commit -m "chore: cleanup — remove duplicates, fix lint, final integration"
```

---

## Summary


| Task | Description                       | New Files   | Modified Files  |
| ---- | --------------------------------- | ----------- | --------------- |
| 1    | shadcn-vue init + components      | ~15 ui dirs | components.json |
| 2    | Design system (theme.css)         | 0           | 2               |
| 3    | Constants + composables           | 3           | 0               |
| 4    | Maintenance module                | 6           | 2               |
| 5    | Layout (sidebar + header)         | 4           | 2 (+2 deleted)  |
| 6    | Visual update existing components | 0           | ~10             |
| 7    | HomeView redesign                 | 3           | 1               |
| 8    | EquipmentDetailView decompose     | 7           | 1               |
| 9    | AnalyticsView decompose           | 5           | 1               |
| 10   | SettingsView decompose            | 5           | 1               |
| 11   | Remaining views update            | 0           | 5               |
| 12   | New widgets                       | 2           | 1               |
| 13   | Mobile adaptivity                 | 0           | ~8              |
| 14   | Cleanup + integration             | 0           | ~5              |

**Total: ~50 new files, ~40 modified files, 3 deleted files, 14 tasks, 14 commits**
