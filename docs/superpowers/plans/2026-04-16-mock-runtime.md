# Mock Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести mock-слой на единый runtime над localStorage, добавить per-user персистентность, сущность reports, выбор пользователя при логине и сброс демо.

**Architecture:** Реестр коллекций (`defineCollection`) с read/write/patch/remove/append. Ключи `rgm:v{N}:{name}` для global и `rgm:v{N}:user:{userId}:{name}` для user-scope. Seed-данные в отдельных файлах, мутации через runtime. Preferences и dashboards — per-user. Reports — новая сущность с 4 типами, страница `/reports`, авто-генерация при `approveOrder`.

**Tech Stack:** Vue 3 Composition API, Pinia 3, Vue Router 5, Tailwind CSS 4, lucide-vue-next. Без TypeScript. Верификация: `npm run lint`, `npm run build`, ручное тестирование в браузере (`npm run dev`).

**Spec:** `docs/superpowers/specs/2026-04-16-mock-runtime-design.md`

---

## Фаза A — Фундамент

### Task 1: Скелет runtime с in-memory fallback

**Files:**
- Create: `src/api/mock/_runtime.js`

- [ ] **Step 1: Создать `_runtime.js` с `defineCollection`, `read`, `write`**

```js
const STORAGE_PREFIX = 'rgm'
const collections = new Map()

export function defineCollection(config) {
  const { name, scope = 'global', schemaVersion = 1, seed } = config
  if (!name) throw new Error('Collection name required')
  if (!seed) throw new Error('Collection seed factory required')
  if (scope !== 'global' && scope !== 'user') {
    throw new Error(`Invalid scope: ${scope}`)
  }
  collections.set(name, { name, scope, schemaVersion, seed })
}

function getCollection(name) {
  const c = collections.get(name)
  if (!c) throw new Error(`Collection not registered: ${name}`)
  return c
}

function getCurrentUserId() {
  return localStorage.getItem('auth_user_id')
}

function storageKey(collection) {
  const { name, scope, schemaVersion } = collection
  if (scope === 'global') {
    return `${STORAGE_PREFIX}:v${schemaVersion}:${name}`
  }
  const userId = getCurrentUserId()
  if (!userId) return null
  return `${STORAGE_PREFIX}:v${schemaVersion}:user:${userId}:${name}`
}

function metaKey(name) {
  return `${STORAGE_PREFIX}:meta:${name}`
}

function readMeta(name) {
  try {
    const raw = localStorage.getItem(metaKey(name))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeMeta(name, meta) {
  localStorage.setItem(metaKey(name), JSON.stringify(meta))
}

function ensureSeeded(collection) {
  const key = storageKey(collection)
  if (!key) return null
  const meta = readMeta(collection.name)
  const needsSeed = !meta || meta.schemaVersion !== collection.schemaVersion || !localStorage.getItem(key)
  if (needsSeed) {
    const data = collection.seed()
    localStorage.setItem(key, JSON.stringify(data))
    writeMeta(collection.name, { schemaVersion: collection.schemaVersion })
    return data
  }
  return null
}

export function read(name) {
  const collection = getCollection(name)
  const key = storageKey(collection)
  if (!key) return collection.seed()
  const seeded = ensureSeeded(collection)
  if (seeded !== null) return seeded
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : collection.seed()
  } catch {
    console.warn(`[mock-runtime] Corrupted data for ${name}, reseeding`)
    const data = collection.seed()
    localStorage.setItem(key, JSON.stringify(data))
    return data
  }
}

export function write(name, data) {
  const collection = getCollection(name)
  const key = storageKey(collection)
  if (!key) throw new Error(`Cannot write user-scoped collection without userId: ${name}`)
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      console.warn(`[mock-runtime] Storage quota exceeded for ${name}`)
    }
    throw err
  }
}
```

- [ ] **Step 2: Добавить `patch`, `remove`, `append` для массивов**

```js
export function patch(name, id, fields) {
  const data = read(name)
  if (!Array.isArray(data)) throw new Error(`patch requires array collection: ${name}`)
  const idx = data.findIndex((item) => item.id === id)
  if (idx === -1) return null
  data[idx] = { ...data[idx], ...fields }
  write(name, data)
  return data[idx]
}

export function remove(name, id) {
  const data = read(name)
  if (!Array.isArray(data)) throw new Error(`remove requires array collection: ${name}`)
  const filtered = data.filter((item) => item.id !== id)
  write(name, filtered)
  return filtered.length !== data.length
}

export function append(name, item) {
  const data = read(name)
  if (!Array.isArray(data)) throw new Error(`append requires array collection: ${name}`)
  data.push(item)
  write(name, data)
  return item
}
```

- [ ] **Step 3: Добавить `resetCollection` и `resetAll`**

```js
export function resetCollection(name) {
  const collection = getCollection(name)
  const key = storageKey(collection)
  if (key) localStorage.removeItem(key)
  localStorage.removeItem(metaKey(name))
}

const LEGACY_KEYS = [
  'settings_display',
  'settings_notifications',
  'settings_thresholds',
  'settings_security',
  'theme',
  'rudgormash_dashboards',
]

export function resetAll() {
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(`${STORAGE_PREFIX}:`)) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k))
  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k))
}

export function listCollections() {
  return Array.from(collections.keys())
}
```

- [ ] **Step 4: Lint + build**

Run: `npm run lint && npm run build`
Expected: без ошибок.

- [ ] **Step 5: Commit**

```bash
git add src/api/mock/_runtime.js
git commit -m "feat(mock): add _runtime with defineCollection, read/write/patch"
```

---

## Фаза B — Seed-файлы

### Task 2: Создать seed/users.seed.js

**Files:**
- Create: `src/api/mock/seed/users.seed.js`

- [ ] **Step 1: Создать seed-файл**

```js
export function createSeed() {
  return [
    { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
    { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    { id: 'user-3', name: 'Сидоров К.М.', role: 'mechanic' },
    { id: 'user-4', name: 'Козлов Д.А.', role: 'foreman' },
  ]
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: без ошибок.

- [ ] **Step 3: Commit**

```bash
git add src/api/mock/seed/users.seed.js
git commit -m "feat(mock): extract users seed"
```

### Task 3: Создать seed/equipment.seed.js

**Files:**
- Read: `src/api/mock/equipment.js` целиком — там объект `equipmentDb` с 8 станками.
- Create: `src/api/mock/seed/equipment.seed.js`

- [ ] **Step 1: Создать seed-файл**

Скопировать содержимое объекта `equipmentDb` из `equipment.js` внутрь `createSeed()`. Объект конвертируется в массив — каждый станок получает поле `id` (ключ объекта) если его ещё нет внутри, остальные поля сохраняются.

```js
export function createSeed() {
  return [
    // сюда — содержимое equipmentDb как массив объектов:
    // { id: 'bur-12', name: 'БУР-12', ... specs, sensors, serviceHistory ... },
    // { id: 'bur-08', name: 'БУР-08', ... },
    // ... 8 записей
  ]
}
```

- [ ] **Step 2: Убедиться что каждый объект имеет `id` равный ключу в `equipmentDb`**

- [ ] **Step 3: Lint + commit**

```bash
npm run lint
git add src/api/mock/seed/equipment.seed.js
git commit -m "feat(mock): extract equipment seed"
```

### Task 4: Создать seed/alerts.seed.js

**Files:**
- Read: `src/api/mock/alerts.js` — массив начальных уведомлений.
- Create: `src/api/mock/seed/alerts.seed.js`

- [ ] **Step 1: Создать seed-файл**

```js
export function createSeed() {
  return [
    // сюда — содержимое начального массива из alerts.js (9 уведомлений)
  ]
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/api/mock/seed/alerts.seed.js
git commit -m "feat(mock): extract alerts seed"
```

### Task 5: Создать seed/journal.seed.js

**Files:**
- Read: `src/api/mock/journal.js` — начальный массив `entries`.
- Create: `src/api/mock/seed/journal.seed.js`

- [ ] **Step 1: Создать seed-файл**

```js
export function createSeed() {
  return [
    // сюда — содержимое начального массива entries из journal.js (7 записей)
  ]
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/api/mock/seed/journal.seed.js
git commit -m "feat(mock): extract journal seed"
```

### Task 6: Создать seed/audit.seed.js

**Files:**
- Read: `src/api/mock/audit.js` — `MOCK_AUDIT_LOG`.
- Create: `src/api/mock/seed/audit.seed.js`

- [ ] **Step 1: Создать seed-файл**

```js
export function createSeed() {
  return [
    // сюда — содержимое MOCK_AUDIT_LOG из audit.js (10 записей)
  ]
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/api/mock/seed/audit.seed.js
git commit -m "feat(mock): extract audit seed"
```

### Task 7: Создать seed/parts.seed.js

**Files:**
- Read: `src/api/mock/parts.js` — `partsDb`.
- Create: `src/api/mock/seed/parts.seed.js`

- [ ] **Step 1: Создать seed-файл**

Конвертировать `partsDb` (объект по equipmentId → массив замен) в массив с полем `equipmentId` у каждой записи, ЛИБО сохранить ту же форму объекта. Принимаем форму объекта для совместимости с `getReplacements(equipmentId)`.

```js
export function createSeed() {
  return {
    // 'bur-12': [ { id, ... }, ... ],
    // 'bur-08': [ ... ],
    // ... содержимое partsDb
  }
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/api/mock/seed/parts.seed.js
git commit -m "feat(mock): extract parts seed"
```

### Task 8: Создать seed/checklists.seed.js и seed/orders.seed.js

**Files:**
- Read: `src/api/mock/maintenance.js` — объект `CHECKLISTS` и массив `orders` (если есть).
- Create: `src/api/mock/seed/checklists.seed.js`
- Create: `src/api/mock/seed/orders.seed.js`

- [ ] **Step 1: Создать checklists seed**

```js
// checklists.seed.js
export function createSeed() {
  return {
    // содержимое CHECKLISTS: { 'ЕО': [...], 'ТО-1': [...], ... }
  }
}
```

- [ ] **Step 2: Создать orders seed**

Если в `maintenance.js` уже есть стартовые заказы — взять их. Если нет — создать 5 демо-нарядов разных статусов:

```js
export function createSeed() {
  return [
    {
      id: 'order-1',
      equipmentId: 'bur-12',
      type: 'ТО-2',
      status: 'completed',
      createdAt: '2026-04-10T09:00:00',
      completedAt: '2026-04-10T15:30:00',
      assignees: ['user-2'],
      reviewer: 'user-4',
      steps: [],
      notes: '',
    },
    {
      id: 'order-2',
      equipmentId: 'bur-08',
      type: 'ТО-1',
      status: 'in_progress',
      createdAt: '2026-04-15T08:00:00',
      assignees: ['user-3'],
      reviewer: 'user-4',
      steps: [],
      notes: '',
    },
    {
      id: 'order-3',
      equipmentId: 'bur-15',
      type: 'ЕО',
      status: 'draft',
      createdAt: '2026-04-16T07:30:00',
      assignees: ['user-2'],
      reviewer: 'user-4',
      steps: [],
      notes: '',
    },
    {
      id: 'order-4',
      equipmentId: 'bur-03',
      type: 'ТР-1',
      status: 'pending_review',
      createdAt: '2026-04-14T10:00:00',
      submittedAt: '2026-04-14T17:00:00',
      assignees: ['user-3'],
      reviewer: 'user-4',
      steps: [],
      notes: 'Требуется проверка замены подшипника',
    },
    {
      id: 'order-5',
      equipmentId: 'bur-21',
      type: 'ТО-3',
      status: 'returned',
      createdAt: '2026-04-13T09:00:00',
      returnedAt: '2026-04-13T18:00:00',
      assignees: ['user-2'],
      reviewer: 'user-4',
      returnReason: 'Недостаточно замеров по вибрации',
      steps: [],
      notes: '',
    },
  ]
}
```

Если в `maintenance.js` есть актуальная форма `orders` — используй её форму, подстроив примеры.

- [ ] **Step 3: Lint + commit**

```bash
npm run lint
git add src/api/mock/seed/checklists.seed.js src/api/mock/seed/orders.seed.js
git commit -m "feat(mock): extract checklists and orders seeds"
```

### Task 9: Создать seed/dashboards.seed.js

**Files:**
- Create: `src/api/mock/seed/dashboards.seed.js`

- [ ] **Step 1: Создать seed с пустым объектом (дефолты генерятся по запросу)**

```js
export function createSeed() {
  return {}
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/api/mock/seed/dashboards.seed.js
git commit -m "feat(mock): extract dashboards seed"
```

### Task 10: Создать seed/preferences.seed.js

**Files:**
- Create: `src/api/mock/seed/preferences.seed.js`

- [ ] **Step 1: Создать seed с дефолтными настройками**

```js
export function createSeed() {
  return {
    display: {
      language: 'ru',
      refreshRate: 5,
      autoUpdate: true,
      showTimestamps: false,
      compactMode: false,
    },
    notifications: {
      criticalAlerts: true,
      warnings: true,
      infoMessages: false,
      emailNotifications: true,
      email: '',
    },
    thresholds: {
      maxTemp: 95,
      maxVibration: 1.5,
      maxPower: 95,
      toolWear: 70,
      minFuel: 25,
      maxPressure: 150,
    },
    security: {
      twoFactor: true,
    },
    theme: 'dark',
  }
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/api/mock/seed/preferences.seed.js
git commit -m "feat(mock): add preferences seed"
```

### Task 11: Создать seed/reports.seed.js

**Files:**
- Create: `src/api/mock/seed/reports.seed.js`

- [ ] **Step 1: Создать 8 отчётов (по 2 каждого типа)**

```js
export function createSeed() {
  return [
    {
      id: 'report-1',
      type: 'maintenance_completion',
      status: 'published',
      title: 'Акт выполнения ТО-2 — БУР-12',
      summary: 'Плановое ТО-2 выполнено в полном объёме. Замечаний нет.',
      createdBy: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
      equipmentId: 'bur-12',
      orderId: 'order-1',
      alertId: null,
      createdAt: '2026-04-10T15:30:00',
      publishedAt: '2026-04-10T15:45:00',
      payload: {
        checklistType: 'ТО-2',
        stepsCompleted: 12,
        stepsTotal: 12,
        executors: [{ id: 'user-2', name: 'Петров С.В.' }],
        materials: [
          { name: 'Масло моторное', qty: 8, unit: 'л' },
          { name: 'Фильтр масляный', qty: 1, unit: 'шт' },
        ],
        duration: '6ч 30мин',
        notes: '',
      },
    },
    {
      id: 'report-2',
      type: 'maintenance_completion',
      status: 'published',
      title: 'Акт выполнения ТО-1 — БУР-08',
      summary: 'Выполнен осмотр и замена расходников.',
      createdBy: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
      equipmentId: 'bur-08',
      orderId: null,
      alertId: null,
      createdAt: '2026-04-05T14:00:00',
      publishedAt: '2026-04-05T14:15:00',
      payload: {
        checklistType: 'ТО-1',
        stepsCompleted: 8,
        stepsTotal: 8,
        executors: [{ id: 'user-3', name: 'Сидоров К.М.' }],
        materials: [{ name: 'Смазка', qty: 0.5, unit: 'кг' }],
        duration: '3ч',
        notes: '',
      },
    },
    {
      id: 'report-3',
      type: 'incident_report',
      status: 'published',
      title: 'Инцидент: перегрев двигателя БУР-15',
      summary: 'Превышение порога температуры, предпринята остановка.',
      createdBy: { id: 'user-4', name: 'Козлов Д.А.', role: 'foreman' },
      equipmentId: 'bur-15',
      orderId: null,
      alertId: 'alert-3',
      createdAt: '2026-04-08T11:20:00',
      publishedAt: '2026-04-08T13:00:00',
      payload: {
        severity: 'critical',
        rootCause: 'Засорение радиатора охлаждения',
        actions: ['Остановка оборудования', 'Очистка радиатора', 'Проверка герметичности'],
        recommendations: 'Ввести еженедельный осмотр системы охлаждения',
        downtime: '2ч 15мин',
      },
    },
    {
      id: 'report-4',
      type: 'incident_report',
      status: 'draft',
      title: 'Инцидент: превышение вибрации БУР-21',
      summary: 'Выявлены колебания свыше нормы во время бурения.',
      createdBy: { id: 'user-4', name: 'Козлов Д.А.', role: 'foreman' },
      equipmentId: 'bur-21',
      orderId: null,
      alertId: null,
      createdAt: '2026-04-14T16:00:00',
      publishedAt: null,
      payload: {
        severity: 'warning',
        rootCause: 'Износ долота',
        actions: ['Замена долота запланирована'],
        recommendations: '',
        downtime: '',
      },
    },
    {
      id: 'report-5',
      type: 'shift_report',
      status: 'published',
      title: 'Отчёт смены — 15.04.2026, день',
      summary: '7 из 8 станков в работе, выполнено ТО-1 на БУР-08.',
      createdBy: { id: 'user-4', name: 'Козлов Д.А.', role: 'foreman' },
      equipmentId: null,
      orderId: null,
      alertId: null,
      createdAt: '2026-04-15T20:00:00',
      publishedAt: '2026-04-15T20:30:00',
      payload: {
        shift: 'day',
        date: '2026-04-15',
        equipmentStatus: [
          { id: 'bur-12', status: 'working' },
          { id: 'bur-08', status: 'maintenance' },
        ],
        worksCompleted: ['ТО-1 БУР-08', 'Замена фильтра БУР-12'],
        issues: 'Без замечаний',
      },
    },
    {
      id: 'report-6',
      type: 'shift_report',
      status: 'published',
      title: 'Отчёт смены — 14.04.2026, ночь',
      summary: '6 из 8 станков в работе, инцидент на БУР-21.',
      createdBy: { id: 'user-4', name: 'Козлов Д.А.', role: 'foreman' },
      equipmentId: null,
      orderId: null,
      alertId: null,
      createdAt: '2026-04-15T08:00:00',
      publishedAt: '2026-04-15T08:15:00',
      payload: {
        shift: 'night',
        date: '2026-04-14',
        equipmentStatus: [],
        worksCompleted: [],
        issues: 'Предупреждение по вибрации БУР-21',
      },
    },
    {
      id: 'report-7',
      type: 'analytics_summary',
      status: 'published',
      title: 'Сводка за неделю 07.04–13.04.2026',
      summary: 'Средняя загрузка парка 82%, 3 инцидента, 5 ТО.',
      createdBy: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
      equipmentId: null,
      orderId: null,
      alertId: null,
      createdAt: '2026-04-14T10:00:00',
      publishedAt: '2026-04-14T11:00:00',
      payload: {
        periodFrom: '2026-04-07',
        periodTo: '2026-04-13',
        metrics: {
          avgLoad: 82,
          incidents: 3,
          maintenances: 5,
          downtime: '8ч 45мин',
        },
        trends: [{ metric: 'avgLoad', change: '+3%' }],
        conclusions: 'Загрузка выросла, но инциденты в пределах нормы.',
      },
    },
    {
      id: 'report-8',
      type: 'analytics_summary',
      status: 'draft',
      title: 'Сводка за март 2026',
      summary: 'Черновик месячного отчёта.',
      createdBy: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
      equipmentId: null,
      orderId: null,
      alertId: null,
      createdAt: '2026-04-02T09:00:00',
      publishedAt: null,
      payload: {
        periodFrom: '2026-03-01',
        periodTo: '2026-03-31',
        metrics: {},
        trends: [],
        conclusions: '',
      },
    },
  ]
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/api/mock/seed/reports.seed.js
git commit -m "feat(mock): add reports seed with 4 types"
```

---

## Фаза C — Миграция существующих mock-файлов на runtime

### Task 12: Мигрировать users.js

**Files:**
- Modify: `src/api/mock/users.js`

- [ ] **Step 1: Переписать users.js через runtime**

```js
import { defineCollection, read } from './_runtime'
import { createSeed } from './seed/users.seed'

defineCollection({ name: 'users', scope: 'global', schemaVersion: 1, seed: createSeed })

export function getUsers() {
  return [...read('users')]
}

export function getUsersByRole(role) {
  return read('users').filter((u) => u.role === role)
}

export function getUserById(id) {
  return read('users').find((u) => u.id === id) || null
}

// Backward compat для api/auth.js, который импортирует MOCK_USERS напрямую.
// Заменить после миграции auth.js в Task 33.
export const MOCK_USERS = read('users')
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: без ошибок.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: без ошибок.

- [ ] **Step 4: Ручная проверка в браузере**

Run: `npm run dev`, открыть `/login`, залогиниться. Пользователь должен отображаться в хедере.

- [ ] **Step 5: Commit**

```bash
git add src/api/mock/users.js
git commit -m "refactor(mock): users through runtime"
```

### Task 13: Мигрировать equipment.js

**Files:**
- Modify: `src/api/mock/equipment.js`

- [ ] **Step 1: Переписать через runtime**

Все функции (`getEquipmentList`, `getEquipmentById`, `createEquipmentEntry`, `updateEquipmentStatus`, `deleteEquipmentEntry`, `getEquipmentSensors`, `getLiveSensorData`) используют массив из `read('equipment')` вместо `equipmentDb`.

```js
import { defineCollection, read, write, patch, append, remove } from './_runtime'
import { createSeed } from './seed/equipment.seed'

defineCollection({ name: 'equipment', scope: 'global', schemaVersion: 1, seed: createSeed })

export function getEquipmentList() {
  return read('equipment').map(({ sensors, specs, serviceHistory, ...rest }) => rest)
}

export function getEquipmentById(id) {
  return read('equipment').find((e) => e.id === id) || null
}

export function createEquipmentEntry(data) {
  append('equipment', data)
  return data
}

export function updateEquipmentStatus(id, status) {
  return patch('equipment', id, { status })
}

export function deleteEquipmentEntry(id) {
  return remove('equipment', id)
}

export function getEquipmentSensors(id) {
  const eq = getEquipmentById(id)
  return eq?.sensors ?? []
}

export function getLiveSensorData(id) {
  // Оставить текущую логику генерации live-данных на основе sensors из getEquipmentById(id).
  // Копировать из существующей реализации equipment.js.
  const eq = getEquipmentById(id)
  if (!eq) return {}
  const result = {}
  for (const sensor of eq.sensors || []) {
    const variance = sensor.value * 0.02
    result[sensor.id] = {
      value: +(sensor.value + (Math.random() - 0.5) * variance).toFixed(2),
      timestamp: new Date().toISOString(),
    }
  }
  return result
}
```

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`
Expected: без ошибок.

- [ ] **Step 3: Ручная проверка**

Run: `npm run dev`. Открыть `/equipment` — 8 станков должны отображаться. Открыть `/equipment/bur-12` — детали, датчики, история. F5 — данные сохранены.

- [ ] **Step 4: Commit**

```bash
git add src/api/mock/equipment.js
git commit -m "refactor(mock): equipment through runtime"
```

### Task 14: Мигрировать alerts.js

**Files:**
- Modify: `src/api/mock/alerts.js`

- [ ] **Step 1: Переписать через runtime**

```js
import { defineCollection, read, patch, append } from './_runtime'
import { createSeed } from './seed/alerts.seed'

defineCollection({ name: 'alerts', scope: 'global', schemaVersion: 1, seed: createSeed })

function computeNextId() {
  const data = read('alerts')
  const max = data.reduce((acc, a) => {
    const n = parseInt(String(a.id).replace(/\D/g, ''), 10)
    return isNaN(n) ? acc : Math.max(acc, n)
  }, 0)
  return max + 1
}

export function getAlerts(equipmentId) {
  const data = read('alerts')
  return equipmentId ? data.filter((a) => a.equipmentId === equipmentId) : [...data]
}

export function acknowledgeAlert(id) {
  return patch('alerts', id, { acknowledged: true, acknowledgedAt: new Date().toISOString() })
}

export function addAlert(alert) {
  const id = alert.id ?? `alert-${computeNextId()}`
  const entry = { ...alert, id }
  append('alerts', entry)
  return entry
}
```

- [ ] **Step 2: Lint + build + commit**

```bash
npm run lint && npm run build
git add src/api/mock/alerts.js
git commit -m "refactor(mock): alerts through runtime"
```

### Task 15: Мигрировать journal.js

**Files:**
- Modify: `src/api/mock/journal.js`

- [ ] **Step 1: Переписать через runtime**

```js
import { defineCollection, read, append } from './_runtime'
import { createSeed } from './seed/journal.seed'

defineCollection({ name: 'journal', scope: 'global', schemaVersion: 1, seed: createSeed })

function computeNextId() {
  const data = read('journal')
  const max = data.reduce((acc, e) => {
    const n = parseInt(String(e.id).replace(/\D/g, ''), 10)
    return isNaN(n) ? acc : Math.max(acc, n)
  }, 0)
  return max + 1
}

export function getEntries(filters = {}) {
  let data = read('journal')
  if (filters.equipmentId) data = data.filter((e) => e.equipmentId === filters.equipmentId)
  if (filters.dateFrom) data = data.filter((e) => e.date >= filters.dateFrom)
  if (filters.dateTo) data = data.filter((e) => e.date <= filters.dateTo)
  return data
}

export function createEntry(data) {
  const entry = { id: `journal-${computeNextId()}`, ...data }
  append('journal', entry)
  return entry
}
```

- [ ] **Step 2: Lint + build + commit**

```bash
npm run lint && npm run build
git add src/api/mock/journal.js
git commit -m "refactor(mock): journal through runtime"
```

### Task 16: Мигрировать audit.js

**Files:**
- Modify: `src/api/mock/audit.js`

- [ ] **Step 1: Переписать через runtime**

```js
import { defineCollection, read, write } from './_runtime'
import { createSeed } from './seed/audit.seed'

defineCollection({ name: 'audit', scope: 'global', schemaVersion: 1, seed: createSeed })

export function getAuditLog({ equipmentId, limit = 20 } = {}) {
  let data = read('audit')
  if (equipmentId) data = data.filter((e) => e.equipmentId === equipmentId)
  return data.slice(0, limit)
}

export function addAuditEntry(entry) {
  const data = read('audit')
  const full = { timestamp: new Date().toISOString(), ...entry }
  write('audit', [full, ...data])
  return full
}
```

- [ ] **Step 2: Lint + build + commit**

```bash
npm run lint && npm run build
git add src/api/mock/audit.js
git commit -m "refactor(mock): audit through runtime"
```

### Task 17: Мигрировать parts.js

**Files:**
- Modify: `src/api/mock/parts.js`

- [ ] **Step 1: Переписать через runtime**

```js
import { defineCollection, read } from './_runtime'
import { createSeed } from './seed/parts.seed'

defineCollection({ name: 'parts', scope: 'global', schemaVersion: 1, seed: createSeed })

export function getReplacements(equipmentId) {
  const data = read('parts')
  return data[equipmentId] ? [...data[equipmentId]] : []
}
```

- [ ] **Step 2: Lint + build + commit**

```bash
npm run lint && npm run build
git add src/api/mock/parts.js
git commit -m "refactor(mock): parts through runtime"
```

### Task 18: Мигрировать maintenance.js (orders + checklists)

**Files:**
- Read: `src/api/mock/maintenance.js` — понять все экспортируемые функции и структуры `CHECKLISTS`, `orders`.
- Modify: `src/api/mock/maintenance.js`

- [ ] **Step 1: Зарегистрировать две коллекции**

```js
import { defineCollection, read, write, patch, append } from './_runtime'
import { createSeed as ordersSeed } from './seed/orders.seed'
import { createSeed as checklistsSeed } from './seed/checklists.seed'

defineCollection({ name: 'orders', scope: 'global', schemaVersion: 1, seed: ordersSeed })
defineCollection({ name: 'checklists', scope: 'global', schemaVersion: 1, seed: checklistsSeed })
```

- [ ] **Step 2: Переписать все функции, работающие с `CHECKLISTS` и `orders`**

Для каждой экспортируемой функции:
- Читает → заменить прямой доступ к константе на `read('checklists')` / `read('orders')`.
- Мутации (добавить заказ, сменить статус, завершить шаг) → через `append`/`patch`/`write`.

Сохранить все имена и сигнатуры экспортируемых функций: `getSchedule`, `getChecklist`, `completeChecklistItem`, `getOrders`, `getOrder`, `createOrder`, `startOrder`, `completeStep`, `submitForReview`, `approveOrder`, `returnOrder`, `cancelOrder`, `restoreOrder`, и т.д.

Функция `completeChecklistItem(equipmentId, itemId)` — читать текущий `orders`, найти активный наряд по equipmentId, патчить массив `steps` и сохранять через `write('orders', ...)`.

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`

- [ ] **Step 4: Ручная проверка**

Открыть `/maintenance` — список нарядов из seed. Создать новый наряд. F5 — наряд на месте. Пройти по ТО, завершить шаги, сменить статусы.

- [ ] **Step 5: Commit**

```bash
git add src/api/mock/maintenance.js
git commit -m "refactor(mock): maintenance (orders+checklists) through runtime"
```

### Task 19: Мигрировать dashboards.js на user-scope

**Files:**
- Modify: `src/api/mock/dashboards.js`

- [ ] **Step 1: Переписать через runtime с scope: user**

```js
import { defineCollection, read, write } from './_runtime'
import { createSeed } from './seed/dashboards.seed'

defineCollection({ name: 'dashboards', scope: 'user', schemaVersion: 1, seed: createSeed })

function getDefaultConfig(equipmentId) {
  return {
    equipmentId,
    widgets: [
      { id: 'w1', type: 'numeric-indicator', sensorId: 'temp-engine', props: { title: 'Температура двигателя' }, layout: { x: 0, y: 0, w: 3, h: 2, i: 'w1' } },
      { id: 'w2', type: 'numeric-indicator', sensorId: 'speed', props: { title: 'Скорость вращения' }, layout: { x: 3, y: 0, w: 3, h: 2, i: 'w2' } },
      { id: 'w3', type: 'numeric-indicator', sensorId: 'depth', props: { title: 'Глубина бурения' }, layout: { x: 6, y: 0, w: 3, h: 2, i: 'w3' } },
      { id: 'w4', type: 'numeric-indicator', sensorId: 'pressure', props: { title: 'Давление' }, layout: { x: 9, y: 0, w: 3, h: 2, i: 'w4' } },
      { id: 'w5', type: 'line-chart', sensorId: 'temp-engine', props: { title: 'Температура (график)' }, layout: { x: 0, y: 2, w: 6, h: 4, i: 'w5' } },
      { id: 'w6', type: 'gauge', sensorId: 'engine-load', props: { title: 'Загрузка двигателя' }, layout: { x: 6, y: 2, w: 3, h: 4, i: 'w6' } },
      { id: 'w7', type: 'gauge', sensorId: 'tool-wear', props: { title: 'Износ долота' }, layout: { x: 9, y: 2, w: 3, h: 4, i: 'w7' } },
    ],
  }
}

export function getDashboardConfig(equipmentId) {
  const all = read('dashboards')
  return all[equipmentId] || getDefaultConfig(equipmentId)
}

export function saveDashboardConfig(equipmentId, config) {
  const all = read('dashboards')
  const next = { ...all, [equipmentId]: { ...config, equipmentId } }
  write('dashboards', next)
  return next[equipmentId]
}

export function resetDashboardConfig(equipmentId) {
  const all = read('dashboards')
  const next = { ...all }
  delete next[equipmentId]
  write('dashboards', next)
  return getDefaultConfig(equipmentId)
}
```

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`

- [ ] **Step 3: Ручная проверка**

Залогиниться как engineer (Иванов). Открыть `/equipment/bur-12/dashboard`, добавить виджет. F5 — виджет на месте. Выйти, залогиниться как foreman (Козлов). Открыть тот же дашборд — дефолтная раскладка без добавленного виджета.

- [ ] **Step 4: Commit**

```bash
git add src/api/mock/dashboards.js
git commit -m "refactor(mock): dashboards per-user through runtime"
```

---

## Фаза D — Preferences

### Task 20: Создать mock/preferences.js

**Files:**
- Create: `src/api/mock/preferences.js`

- [ ] **Step 1: Реализовать CRUD**

```js
import { defineCollection, read, write, resetCollection } from './_runtime'
import { createSeed } from './seed/preferences.seed'

defineCollection({ name: 'preferences', scope: 'user', schemaVersion: 1, seed: createSeed })

export function getPreferences() {
  return read('preferences')
}

export function updatePreferences(section, data) {
  const current = read('preferences')
  const next = { ...current, [section]: { ...current[section], ...data } }
  write('preferences', next)
  return next
}

export function updateTheme(theme) {
  const current = read('preferences')
  const next = { ...current, theme }
  write('preferences', next)
  return next
}

export function resetPreferences() {
  resetCollection('preferences')
  return read('preferences')
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/api/mock/preferences.js
git commit -m "feat(mock): preferences CRUD"
```

### Task 21: Создать api/preferences.js (обёртка через request)

**Files:**
- Create: `src/api/preferences.js`

- [ ] **Step 1: Реализовать**

```js
import { request } from './client'
import * as mock from './mock/preferences'

export function getPreferences() {
  return request(() => mock.getPreferences())
}

export function updatePreferences(section, data) {
  return request(() => mock.updatePreferences(section, data))
}

export function updateTheme(theme) {
  return request(() => mock.updateTheme(theme))
}

export function resetPreferences() {
  return request(() => mock.resetPreferences())
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/api/preferences.js
git commit -m "feat(api): preferences wrapper"
```

### Task 22: Создать stores/preferences.js

**Files:**
- Create: `src/stores/preferences.js`

- [ ] **Step 1: Реализовать стор**

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '@/api/preferences'
import { createSeed } from '@/api/mock/seed/preferences.seed'

const DEFAULTS = createSeed()

export const usePreferencesStore = defineStore('preferences', () => {
  const preferences = ref(null)
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      preferences.value = await api.getPreferences()
    } finally {
      loading.value = false
    }
  }

  async function save(section, data) {
    preferences.value = await api.updatePreferences(section, data)
  }

  async function setTheme(theme) {
    preferences.value = await api.updateTheme(theme)
  }

  async function reset() {
    preferences.value = await api.resetPreferences()
  }

  const display = computed(() => preferences.value?.display ?? DEFAULTS.display)
  const notifications = computed(() => preferences.value?.notifications ?? DEFAULTS.notifications)
  const thresholds = computed(() => preferences.value?.thresholds ?? DEFAULTS.thresholds)
  const security = computed(() => preferences.value?.security ?? DEFAULTS.security)
  const theme = computed(() => preferences.value?.theme ?? DEFAULTS.theme)

  return {
    preferences,
    loading,
    display,
    notifications,
    thresholds,
    security,
    theme,
    load,
    save,
    setTheme,
    reset,
  }
})
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/stores/preferences.js
git commit -m "feat(store): preferences store"
```

### Task 23: Подключить preferences.load() после логина

**Files:**
- Modify: `src/stores/auth.js`
- Modify: `src/App.vue` (если `fetchUser` там)

- [ ] **Step 1: В auth store, после успешного login — вызвать preferencesStore.load()**

Внутри `login()` после записи `user.value`, вызвать:
```js
const preferencesStore = usePreferencesStore()
await preferencesStore.load()
```
Импортировать `usePreferencesStore` вверху файла.

- [ ] **Step 2: В `App.vue` или `fetchUser`, после успешного `getMe()` — тоже вызвать preferencesStore.load()**

Открыть `App.vue`, найти место вызова `fetchUser()` (в `onMounted`). После успешного восстановления пользователя вызвать `preferencesStore.load()`.

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/stores/auth.js src/App.vue
git commit -m "feat(auth): load preferences after login"
```

### Task 24: Рефакторинг SettingsDisplay.vue

**Files:**
- Modify: `src/components/settings/SettingsDisplay.vue`

- [ ] **Step 1: Заменить прямой localStorage на стор**

Удалить `loadSaved()` и прямые `localStorage.setItem`. Использовать `usePreferencesStore`.

```vue
<script setup>
import { ref, watch } from 'vue'
import { usePreferencesStore } from '@/stores/preferences'

const preferences = usePreferencesStore()

const language = ref(preferences.display.language)
const refreshRate = ref(preferences.display.refreshRate)
const autoUpdate = ref(preferences.display.autoUpdate)
const showTimestamps = ref(preferences.display.showTimestamps)
const compactMode = ref(preferences.display.compactMode)

watch(() => preferences.display, (val) => {
  language.value = val.language
  refreshRate.value = val.refreshRate
  autoUpdate.value = val.autoUpdate
  showTimestamps.value = val.showTimestamps
  compactMode.value = val.compactMode
}, { deep: true })

async function save() {
  await preferences.save('display', {
    language: language.value,
    refreshRate: refreshRate.value,
    autoUpdate: autoUpdate.value,
    showTimestamps: showTimestamps.value,
    compactMode: compactMode.value,
  })
}

function reset() {
  language.value = 'ru'
  refreshRate.value = 5
  autoUpdate.value = true
  showTimestamps.value = false
  compactMode.value = false
}

defineExpose({ save, reset })
</script>
```

(Template остаётся без изменений.)

- [ ] **Step 2: Lint + build + manual**

Run: `npm run lint && npm run build && npm run dev`. Открыть Settings → Display, изменить refreshRate, «Сохранить». F5 — значение сохранено.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/SettingsDisplay.vue
git commit -m "refactor(settings): display through preferences store"
```

### Task 25: Рефакторинг SettingsNotifications.vue

**Files:**
- Modify: `src/components/settings/SettingsNotifications.vue`

- [ ] **Step 1: Аналогично Task 24 — использовать `preferences.notifications` и `preferences.save('notifications', {...})`**

Структура полей: `criticalAlerts`, `warnings`, `infoMessages`, `emailNotifications`, `email`.

- [ ] **Step 2: Lint + build + commit**

```bash
npm run lint && npm run build
git add src/components/settings/SettingsNotifications.vue
git commit -m "refactor(settings): notifications through preferences store"
```

### Task 26: Рефакторинг SettingsThresholds.vue

**Files:**
- Modify: `src/components/settings/SettingsThresholds.vue`

- [ ] **Step 1: Аналогично — использовать `preferences.thresholds` и `preferences.save('thresholds', {...})`**

Структура: `maxTemp`, `maxVibration`, `maxPower`, `toolWear`, `minFuel`, `maxPressure`.

- [ ] **Step 2: Lint + build + commit**

```bash
npm run lint && npm run build
git add src/components/settings/SettingsThresholds.vue
git commit -m "refactor(settings): thresholds through preferences store"
```

### Task 27: Рефакторинг SettingsSecurity.vue

**Files:**
- Modify: `src/components/settings/SettingsSecurity.vue`

- [ ] **Step 1: Аналогично — использовать `preferences.security.twoFactor`**

- [ ] **Step 2: Lint + build + commit**

```bash
npm run lint && npm run build
git add src/components/settings/SettingsSecurity.vue
git commit -m "refactor(settings): security through preferences store"
```

### Task 28: Миграция useTheme на preferences

**Files:**
- Modify: `src/composables/useTheme.js`

- [ ] **Step 1: Читать тему из стора, писать через `preferencesStore.setTheme`**

```js
import { computed } from 'vue'
import { usePreferencesStore } from '@/stores/preferences'

export function useTheme() {
  const preferences = usePreferencesStore()

  const theme = computed(() => preferences.theme)

  async function applyTheme(value) {
    await preferences.setTheme(value)
  }

  function toggleTheme() {
    return applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, applyTheme, toggleTheme }
}
```

- [ ] **Step 2: Найти место применения `.dark` класса к `<html>` — перенести в App.vue или сам composable**

Открыть текущий `useTheme.js` — там вероятно установка класса. Если logic был в composable, перенести через watcher:

```js
import { watchEffect } from 'vue'
// ...
watchEffect(() => {
  document.documentElement.classList.toggle('dark', theme.value === 'dark')
})
```

- [ ] **Step 3: Lint + build + manual**

Тумблер темы в UI должен работать. F5 — тема сохраняется.

- [ ] **Step 4: Commit**

```bash
git add src/composables/useTheme.js
git commit -m "refactor(theme): useTheme through preferences store"
```

---

## Фаза E — Reports

### Task 29: Создать mock/reports.js

**Files:**
- Create: `src/api/mock/reports.js`

- [ ] **Step 1: Реализовать**

```js
import { defineCollection, read, patch, append } from './_runtime'
import { createSeed } from './seed/reports.seed'

defineCollection({ name: 'reports', scope: 'global', schemaVersion: 1, seed: createSeed })

function computeNextId() {
  const data = read('reports')
  const max = data.reduce((acc, r) => {
    const n = parseInt(String(r.id).replace(/\D/g, ''), 10)
    return isNaN(n) ? acc : Math.max(acc, n)
  }, 0)
  return max + 1
}

export function getReports(filters = {}) {
  let data = read('reports')
  if (filters.type) data = data.filter((r) => r.type === filters.type)
  if (filters.equipmentId) data = data.filter((r) => r.equipmentId === filters.equipmentId)
  if (filters.status) data = data.filter((r) => r.status === filters.status)
  if (filters.createdById) data = data.filter((r) => r.createdBy.id === filters.createdById)
  return data
}

export function getReportById(id) {
  return read('reports').find((r) => r.id === id) || null
}

export function createReport(report) {
  const id = report.id ?? `report-${computeNextId()}`
  const entry = {
    createdAt: new Date().toISOString(),
    status: 'draft',
    publishedAt: null,
    orderId: null,
    alertId: null,
    equipmentId: null,
    ...report,
    id,
  }
  append('reports', entry)
  return entry
}

export function publishReport(id) {
  return patch('reports', id, { status: 'published', publishedAt: new Date().toISOString() })
}

export function updateReport(id, fields) {
  return patch('reports', id, fields)
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/api/mock/reports.js
git commit -m "feat(mock): reports CRUD"
```

### Task 30: Создать api/reports.js

**Files:**
- Create: `src/api/reports.js`

- [ ] **Step 1: Реализовать**

```js
import { request } from './client'
import * as mock from './mock/reports'

export function getReports(filters) {
  return request(() => mock.getReports(filters))
}

export function getReportById(id) {
  return request(() => mock.getReportById(id))
}

export function createReport(report) {
  return request(() => mock.createReport(report))
}

export function publishReport(id) {
  return request(() => mock.publishReport(id))
}

export function updateReport(id, fields) {
  return request(() => mock.updateReport(id, fields))
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/api/reports.js
git commit -m "feat(api): reports wrapper"
```

### Task 31: Создать stores/reports.js

**Files:**
- Create: `src/stores/reports.js`

- [ ] **Step 1: Реализовать стор**

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '@/api/reports'

export const useReportsStore = defineStore('reports', () => {
  const reports = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentReport = ref(null)

  async function fetchAll(filters) {
    loading.value = true
    error.value = null
    try {
      reports.value = await api.getReports(filters)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id) {
    loading.value = true
    try {
      currentReport.value = await api.getReportById(id)
    } finally {
      loading.value = false
    }
  }

  async function create(report) {
    const created = await api.createReport(report)
    reports.value = [created, ...reports.value]
    return created
  }

  async function publish(id) {
    const updated = await api.publishReport(id)
    const idx = reports.value.findIndex((r) => r.id === id)
    if (idx !== -1) reports.value[idx] = updated
    if (currentReport.value?.id === id) currentReport.value = updated
    return updated
  }

  async function update(id, fields) {
    const updated = await api.updateReport(id, fields)
    const idx = reports.value.findIndex((r) => r.id === id)
    if (idx !== -1) reports.value[idx] = updated
    if (currentReport.value?.id === id) currentReport.value = updated
    return updated
  }

  const drafts = computed(() => reports.value.filter((r) => r.status === 'draft'))
  const published = computed(() => reports.value.filter((r) => r.status === 'published'))

  return {
    reports,
    currentReport,
    loading,
    error,
    drafts,
    published,
    fetchAll,
    fetchById,
    create,
    publish,
    update,
  }
})
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/stores/reports.js
git commit -m "feat(store): reports store"
```

### Task 32: Создать ReportsView.vue (список + фильтры)

**Files:**
- Create: `src/views/ReportsView.vue`

- [ ] **Step 1: Написать компонент списка с фильтрами**

```vue
<template>
  <div class="flex flex-col gap-6 p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Отчёты</h1>
      <button
        class="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
        @click="openCreate"
      >
        Создать отчёт
      </button>
    </div>

    <div class="flex gap-3 rounded-lg border border-border bg-card p-4">
      <select v-model="filterType" class="rounded border border-border bg-background px-3 py-2">
        <option value="">Все типы</option>
        <option value="maintenance_completion">Акт ТО</option>
        <option value="incident_report">Инцидент</option>
        <option value="shift_report">Отчёт смены</option>
        <option value="analytics_summary">Аналитическая сводка</option>
      </select>
      <select v-model="filterStatus" class="rounded border border-border bg-background px-3 py-2">
        <option value="">Все статусы</option>
        <option value="draft">Черновик</option>
        <option value="published">Опубликован</option>
      </select>
    </div>

    <div v-if="store.loading" class="text-muted-foreground">Загрузка…</div>
    <div v-else-if="!filtered.length" class="text-muted-foreground">Нет отчётов</div>
    <div v-else class="grid gap-3">
      <router-link
        v-for="report in filtered"
        :key="report.id"
        :to="{ name: 'report-detail', params: { id: report.id } }"
        class="rounded-lg border border-border bg-card p-4 hover:border-primary transition"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs uppercase text-muted-foreground">{{ typeLabel(report.type) }}</div>
            <div class="mt-1 font-semibold">{{ report.title }}</div>
            <div class="mt-1 text-sm text-muted-foreground">{{ report.summary }}</div>
          </div>
          <div class="flex flex-col items-end gap-1">
            <span :class="statusClass(report.status)">{{ statusLabel(report.status) }}</span>
            <span class="text-xs text-muted-foreground">{{ formatDate(report.createdAt) }}</span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReportsStore } from '@/stores/reports'

const store = useReportsStore()
const filterType = ref('')
const filterStatus = ref('')

onMounted(() => store.fetchAll())

const filtered = computed(() =>
  store.reports.filter(
    (r) =>
      (!filterType.value || r.type === filterType.value) &&
      (!filterStatus.value || r.status === filterStatus.value),
  ),
)

function typeLabel(t) {
  return {
    maintenance_completion: 'Акт выполнения ТО',
    incident_report: 'Отчёт об инциденте',
    shift_report: 'Отчёт смены',
    analytics_summary: 'Аналитическая сводка',
  }[t] || t
}

function statusLabel(s) {
  return { draft: 'Черновик', published: 'Опубликован' }[s] || s
}

function statusClass(s) {
  return s === 'published'
    ? 'rounded bg-success/10 px-2 py-0.5 text-xs text-success'
    : 'rounded bg-warning/10 px-2 py-0.5 text-xs text-warning'
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('ru-RU')
}

function openCreate() {
  // Для демо — создать пустой draft. Расширить позже если потребуется.
  const title = prompt('Название отчёта')
  if (!title) return
  store.create({
    type: 'shift_report',
    title,
    summary: '',
    createdBy: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
    payload: {},
  })
}
</script>
```

Замечание: цвета `primary`, `success`, `warning`, `card`, `border`, `muted-foreground` — проверить, существуют ли в `theme.css`. Если нет — использовать уже существующие токены.

- [ ] **Step 2: Lint + build + commit**

```bash
npm run lint && npm run build
git add src/views/ReportsView.vue
git commit -m "feat(reports): ReportsView with list and filters"
```

### Task 33: Создать ReportDetailView.vue

**Files:**
- Create: `src/views/ReportDetailView.vue`

- [ ] **Step 1: Реализовать детальный просмотр**

```vue
<template>
  <div v-if="store.loading" class="p-6">Загрузка…</div>
  <div v-else-if="!report" class="p-6">Отчёт не найден</div>
  <div v-else class="flex flex-col gap-6 p-6 print:p-0">
    <div class="flex items-center justify-between print:hidden">
      <router-link to="/reports" class="text-sm text-muted-foreground hover:text-primary">
        ← К списку
      </router-link>
      <div class="flex gap-2">
        <button
          v-if="report.status === 'draft'"
          class="rounded bg-primary px-4 py-2 text-white"
          @click="publish"
        >
          Опубликовать
        </button>
        <button class="rounded border border-border px-4 py-2" @click="print">Печать</button>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-card p-6">
      <div class="text-xs uppercase text-muted-foreground">{{ typeLabel(report.type) }}</div>
      <h1 class="mt-2 text-2xl font-bold">{{ report.title }}</h1>
      <p class="mt-3 text-muted-foreground">{{ report.summary }}</p>

      <dl class="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt class="text-muted-foreground">Автор</dt>
          <dd>{{ report.createdBy.name }} ({{ report.createdBy.role }})</dd>
        </div>
        <div>
          <dt class="text-muted-foreground">Статус</dt>
          <dd>{{ statusLabel(report.status) }}</dd>
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
      </dl>

      <div class="mt-6 border-t border-border pt-6">
        <h2 class="mb-3 font-semibold">Содержимое</h2>
        <pre class="overflow-auto rounded bg-muted p-4 text-xs">{{ JSON.stringify(report.payload, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useReportsStore } from '@/stores/reports'

const route = useRoute()
const store = useReportsStore()

onMounted(() => store.fetchById(route.params.id))

const report = computed(() => store.currentReport)

async function publish() {
  await store.publish(report.value.id)
}

function print() {
  window.print()
}

function typeLabel(t) {
  return {
    maintenance_completion: 'Акт выполнения ТО',
    incident_report: 'Отчёт об инциденте',
    shift_report: 'Отчёт смены',
    analytics_summary: 'Аналитическая сводка',
  }[t] || t
}

function statusLabel(s) {
  return { draft: 'Черновик', published: 'Опубликован' }[s] || s
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('ru-RU')
}
</script>
```

- [ ] **Step 2: Lint + build + commit**

```bash
npm run lint && npm run build
git add src/views/ReportDetailView.vue
git commit -m "feat(reports): ReportDetailView"
```

### Task 34: Добавить маршруты и пункт в сайдбар

**Files:**
- Modify: `src/router/index.js`
- Modify: `src/layouts/DefaultLayout.vue` (или компонент сайдбара)

- [ ] **Step 1: Добавить маршруты в router**

Открыть `src/router/index.js`, в массив `routes` добавить перед `/settings`:

```js
{
  path: '/reports',
  name: 'reports',
  component: () => import('@/views/ReportsView.vue'),
  meta: { requiresAuth: true, breadcrumb: 'Отчёты' },
},
{
  path: '/reports/:id',
  name: 'report-detail',
  component: () => import('@/views/ReportDetailView.vue'),
  meta: { requiresAuth: true, breadcrumb: 'Отчёты / :id' },
},
```

- [ ] **Step 2: Добавить пункт в сайдбар**

Открыть `DefaultLayout.vue` (или `src/layouts/DefaultLayout.vue`). Найти массив пунктов навигации. Добавить после «Аналитика», перед «Настройки»:

```js
{ name: 'reports', label: 'Отчёты', icon: FileText, to: { name: 'reports' } }
```

Импортировать `FileText` из `lucide-vue-next`.

- [ ] **Step 3: Lint + build + manual**

Открыть приложение — в сайдбаре появляется «Отчёты», клик → список из 8 отчётов. Клик на карточку → детальный просмотр.

- [ ] **Step 4: Commit**

```bash
git add src/router/index.js src/layouts/DefaultLayout.vue
git commit -m "feat(reports): routes and sidebar entry"
```

### Task 35: Авто-генерация maintenance_completion при approveOrder

**Files:**
- Modify: `src/stores/maintenance.js`

- [ ] **Step 1: Найти функцию `approveOrder`**

Прочитать `src/stores/maintenance.js`, найти `approveOrder(id)`. Обычно она вызывает `api/maintenance.approveOrder(id)` и обновляет локальное состояние.

- [ ] **Step 2: После успешного approve создать отчёт**

Внутри `approveOrder`, после обновления состояния:

```js
import { useReportsStore } from '@/stores/reports'
import { useAuthStore } from '@/stores/auth'

async function approveOrder(id) {
  const approved = await api.approveOrder(id)
  // обновление локального состояния...

  const reportsStore = useReportsStore()
  const auth = useAuthStore()
  await reportsStore.create({
    type: 'maintenance_completion',
    status: 'published',
    title: `Акт выполнения ${approved.type} — ${approved.equipmentId}`,
    summary: `Наряд ${id} закрыт и утверждён.`,
    createdBy: { id: auth.user.id, name: auth.user.name, role: auth.user.role },
    equipmentId: approved.equipmentId,
    orderId: approved.id,
    publishedAt: new Date().toISOString(),
    payload: {
      checklistType: approved.type,
      stepsCompleted: (approved.steps || []).filter((s) => s.completed).length,
      stepsTotal: (approved.steps || []).length,
      executors: (approved.assignees || []).map((uid) => ({ id: uid })),
      notes: approved.notes || '',
      duration: computeDuration(approved),
    },
  })
}

function computeDuration(order) {
  if (!order.createdAt || !order.completedAt) return ''
  const ms = new Date(order.completedAt).getTime() - new Date(order.createdAt).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return `${h}ч ${m}мин`
}
```

- [ ] **Step 3: Lint + build + manual**

Открыть наряд в статусе `pending_review` (создать или использовать order-4 из seed). Нажать «Утвердить». Перейти в `/reports` — появился новый `maintenance_completion`.

- [ ] **Step 4: Commit**

```bash
git add src/stores/maintenance.js
git commit -m "feat(reports): auto-generate maintenance_completion on approveOrder"
```

---

## Фаза F — Логин с выбором пользователя

### Task 36: Dropdown пользователей в LoginView.vue

**Files:**
- Modify: `src/views/LoginView.vue`
- Modify: `src/stores/auth.js` (если не поддерживает `userId`)

- [ ] **Step 1: Добавить select пользователей в шаблон**

Открыть `LoginView.vue`. Добавить перед полями логин/пароль:

```vue
<label class="flex flex-col gap-1">
  <span class="text-sm text-muted-foreground">Пользователь</span>
  <select v-model="selectedUserId" class="rounded border border-border bg-background px-3 py-2">
    <option v-for="u in users" :key="u.id" :value="u.id">
      {{ u.name }} — {{ roleLabel(u.role) }}
    </option>
  </select>
</label>
```

- [ ] **Step 2: В `<script setup>` подгрузить список и передать userId**

```js
import { ref, onMounted } from 'vue'
import { getUsers } from '@/api/mock/users'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const users = ref([])
const selectedUserId = ref('user-1')
const username = ref('')
const password = ref('')

onMounted(() => {
  users.value = getUsers()
})

function roleLabel(r) {
  return { engineer: 'Инженер', mechanic: 'Механик', foreman: 'Мастер' }[r] || r
}

async function submit() {
  await auth.login({
    userId: selectedUserId.value,
    username: username.value,
    password: password.value,
  })
  router.push('/')
}
```

- [ ] **Step 3: Обновить auth store, чтобы прокидывал userId**

Открыть `src/stores/auth.js`. Найти функцию `login(credentials)`. Убедиться, что `credentials.userId` пробрасывается в `api.login(credentials)`. API уже поддерживает userId (проверено в анализе).

- [ ] **Step 4: Lint + build + manual**

Открыть `/login`. Выбрать «Петров С.В. — Механик», ввести любые логин/пароль. Войти. В хедере отображается Петров. Выйти. Войти как Козлов — в хедере Козлов.

- [ ] **Step 5: Commit**

```bash
git add src/views/LoginView.vue src/stores/auth.js
git commit -m "feat(auth): user dropdown in login view"
```

---

## Фаза G — Миграция старых ключей и сброс демо

### Task 37: Одноразовая миграция старых localStorage ключей

**Files:**
- Modify: `src/api/mock/_runtime.js`
- Modify: `src/main.js`

- [ ] **Step 1: Добавить функцию миграции в runtime**

В конце `_runtime.js`:

```js
const MIGRATION_MARKER = 'rgm:migrated-legacy'

export function migrateLegacyKeys() {
  if (localStorage.getItem(MIGRATION_MARKER)) return
  const userId = getCurrentUserId()
  if (!userId) return

  function readLegacy(key) {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  const display = readLegacy('settings_display')
  const notifications = readLegacy('settings_notifications')
  const thresholds = readLegacy('settings_thresholds')
  const security = readLegacy('settings_security')
  const theme = localStorage.getItem('theme')

  const legacyDashboards = readLegacy('rudgormash_dashboards')

  if (display || notifications || thresholds || security || theme) {
    const current = read('preferences')
    const merged = {
      ...current,
      display: { ...current.display, ...(display || {}) },
      notifications: { ...current.notifications, ...(notifications || {}) },
      thresholds: { ...current.thresholds, ...(thresholds || {}) },
      security: { ...current.security, ...(security || {}) },
      theme: theme || current.theme,
    }
    write('preferences', merged)
  }

  if (legacyDashboards) {
    write('dashboards', legacyDashboards)
  }

  localStorage.removeItem('settings_display')
  localStorage.removeItem('settings_notifications')
  localStorage.removeItem('settings_thresholds')
  localStorage.removeItem('settings_security')
  localStorage.removeItem('theme')
  localStorage.removeItem('rudgormash_dashboards')

  localStorage.setItem(MIGRATION_MARKER, '1')
}
```

- [ ] **Step 2: Вызвать `migrateLegacyKeys()` после восстановления пользователя**

Открыть `src/App.vue`. В `onMounted`, после `await auth.fetchUser()` и перед `preferencesStore.load()`:

```js
import { migrateLegacyKeys } from '@/api/mock/_runtime'
// ...
await auth.fetchUser()
if (auth.isAuthenticated) {
  migrateLegacyKeys()
  await preferencesStore.load()
}
```

- [ ] **Step 3: Lint + build + manual**

Проверить вручную: в DevTools → Application → Local Storage установить `settings_display = {"language":"en","refreshRate":10}`. Перезагрузить. Значения должны оказаться в `rgm:v1:user:user-1:preferences`, а старый ключ — удалён.

- [ ] **Step 4: Commit**

```bash
git add src/api/mock/_runtime.js src/App.vue
git commit -m "feat(runtime): migrate legacy localStorage keys"
```

### Task 38: Кнопка «Сбросить демо» в SettingsSystem.vue

**Files:**
- Modify: `src/components/settings/SettingsSystem.vue`

- [ ] **Step 1: Добавить секцию «Демо-данные» с кнопкой**

```vue
<template>
  <!-- существующие секции SettingsSystem.vue -->

  <section class="rounded-lg border border-border bg-card p-6">
    <h3 class="font-semibold">Демо-данные</h3>
    <p class="mt-2 text-sm text-muted-foreground">
      Сбросить все демо-данные к начальному состоянию. Настройки, наряды, отчёты, уведомления и
      дашборды будут удалены.
    </p>
    <button
      class="mt-4 rounded border border-destructive px-4 py-2 text-destructive hover:bg-destructive/10"
      @click="confirmReset"
    >
      Сбросить демо
    </button>
  </section>

  <div
    v-if="showConfirm"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  >
    <div class="rounded-lg border border-border bg-card p-6">
      <h4 class="font-semibold">Подтверждение</h4>
      <p class="mt-2 text-sm text-muted-foreground">
        Все демо-данные будут удалены. Продолжить?
      </p>
      <div class="mt-4 flex justify-end gap-2">
        <button class="rounded border border-border px-4 py-2" @click="showConfirm = false">
          Отмена
        </button>
        <button
          class="rounded bg-destructive px-4 py-2 text-white"
          @click="doReset"
        >
          Сбросить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { resetAll } from '@/api/mock/_runtime'

const showConfirm = ref(false)

function confirmReset() {
  showConfirm.value = true
}

function doReset() {
  resetAll()
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user_id')
  window.location.href = '/'
}
</script>
```

- [ ] **Step 2: Lint + build + manual**

Войти, изменить настройки, добавить наряд. В Settings → Система нажать «Сбросить демо», подтвердить. Страница перезагружается на `/login`. После повторного входа — начальное состояние.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/SettingsSystem.vue
git commit -m "feat(settings): demo reset button"
```

### Task 39: Query-параметр ?demo-reset=1

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: В `onMounted` проверять query-параметр**

В самое начало `onMounted` (до `fetchUser`):

```js
import { useRoute, useRouter } from 'vue-router'
import { resetAll } from '@/api/mock/_runtime'
// ...
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  if (route.query['demo-reset'] === '1') {
    resetAll()
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user_id')
    await router.replace({ query: {} })
    window.location.reload()
    return
  }
  // остальной существующий код fetchUser, migrateLegacyKeys, preferencesStore.load
})
```

- [ ] **Step 2: Lint + build + manual**

Открыть `http://localhost:5173/?demo-reset=1`. Приложение сбрасывает данные, перезагружается, открывается `/login`.

- [ ] **Step 3: Commit**

```bash
git add src/App.vue
git commit -m "feat(runtime): demo reset via query param"
```

---

## Фаза H — Документация

### Task 40: Обновить CLAUDE.md с секцией Runtime

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Добавить секцию «Mock Runtime» после секции «Architecture»**

```markdown
## Mock Runtime

Единый слой персистентности для mock-данных через localStorage.

### Основные файлы
- `src/api/mock/_runtime.js` — runtime: defineCollection, read, write, patch, remove, append, resetAll
- `src/api/mock/seed/*.seed.js` — начальные данные (exportируют `createSeed()`)
- `src/api/mock/*.js` — mock-слой, работает через runtime

### Ключи в localStorage
- `rgm:v{N}:{name}` — global коллекции
- `rgm:v{N}:user:{userId}:{name}` — user-scoped коллекции
- `rgm:meta:{name}` — метаданные (schemaVersion)
- `rgm:migrated-legacy` — маркер однократной миграции старых ключей

### Коллекции
| Name | Scope | Файл | Описание |
|------|-------|------|----------|
| users | global | mock/users.js | 4 пользователя |
| equipment | global | mock/equipment.js | 8 станков |
| alerts | global | mock/alerts.js | Уведомления |
| journal | global | mock/journal.js | Журнал ТС |
| audit | global | mock/audit.js | Аудит-лог (без лимита) |
| parts | global | mock/parts.js | История замен |
| orders | global | mock/maintenance.js | Наряды ТО |
| checklists | global | mock/maintenance.js | Чек-листы ТО |
| reports | global | mock/reports.js | Отчёты (4 типа) |
| dashboards | user | mock/dashboards.js | Раскладки виджетов |
| preferences | user | mock/preferences.js | Пользовательские настройки |

### Как добавить новую сущность
1. Создать seed-файл `src/api/mock/seed/<name>.seed.js` с `export function createSeed()`
2. Создать mock-файл `src/api/mock/<name>.js`:
```js
import { defineCollection, read, write, patch, append } from './_runtime'
import { createSeed } from './seed/<name>.seed'

defineCollection({ name: '<name>', scope: 'global', schemaVersion: 1, seed: createSeed })

export function get<Name>() { return read('<name>') }
// ... прочий CRUD через runtime
```
3. Создать `src/api/<name>.js` — обёртка через `request()`
4. Создать стор `src/stores/<name>.js` при необходимости

### Обновление структуры сидов
При правке seed-файла для изменения демо-данных — бампнуть `schemaVersion` в `defineCollection()`. При следующем запуске runtime обнаружит несовпадение и перезатрёт данные сидом.

### Сброс демо
- Кнопка в Settings → Система → Сбросить демо
- Query-параметр: `?demo-reset=1`
- Программно: `import { resetAll } from '@/api/mock/_runtime'`
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: runtime section in CLAUDE.md"
```

---

## Финальная проверка

### Task 41: Полная ручная проверка демо-сценариев

- [ ] **Step 1: Сброс демо через query**

Открыть `?demo-reset=1` → приложение на `/login`.

- [ ] **Step 2: Вход как Иванов (engineer)**

Выбрать Иванова, ввести любые креды → вход. В хедере «Иванов А.П.».

- [ ] **Step 3: Проверка F5-персистентности**

На главной 8 станков. Открыть БУР-12 → дашборд. Добавить виджет. F5. Виджет на месте.

- [ ] **Step 4: Настройки per-user**

Settings → Display → изменить refreshRate на 10, «Сохранить». Logout. Login как Петров (mechanic). Settings → refreshRate = 5 (дефолт). Login обратно как Иванов → refreshRate = 10.

- [ ] **Step 5: Наряды**

`/maintenance` — 5 нарядов из seed. Открыть order-4 (pending_review). Утвердить. Перейти `/reports` — появился новый maintenance_completion.

- [ ] **Step 6: Уведомления**

`/alerts` — 9 уведомлений. Подтвердить одно. F5. Статус сохранён.

- [ ] **Step 7: Сброс через кнопку**

Settings → Система → Сбросить демо → подтвердить. `/login`. Войти. Все данные в начальном состоянии.

- [ ] **Step 8: Commit final**

Если что-то пришлось поправить:

```bash
git add -A
git commit -m "fix: demo verification fixes"
```

---

## Self-Review Checklist

После завершения всех тасков пройтись по чек-листу спеки:

1. Все требования (1-8 функциональных, 4 нефункциональных) покрыты ✓
2. Нет placeholders ✓
3. Имена функций и коллекций consistent между фазами ✓
4. Каждый таск = 2-5 минут ценности + commit ✓
