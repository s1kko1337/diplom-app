# Глава 4. Реализация — материалы для написания

Документ содержит всю фактическую информацию о проекте, необходимую для
раскрытия подпунктов 4.1 – 4.3, плюс последовательность реализации для 4.4.

---

## 0. Сверка терминологии

В предварительном плане упомянуты технологии, которых в проекте нет.
Прежде чем писать — зафиксируем, что использовано **на самом деле**:

| В плане указано | В проекте реализовано |
|---|---|
| Axios | Собственный HTTP-клиент `request()` на базе `Promise` + `AbortController` (имитация задержки сети, таймаут, режим mock-backend) |
| Chart.js | **Apache ECharts 6** + обёртка `vue-echarts 8` |
| vue-grid-layout | **grid-layout-plus** (форк vue-grid-layout с поддержкой Vue 3) |
| UI-библиотека | **shadcn-vue** (копируемые компоненты, слой поверх `reka-ui`) + **Tailwind CSS 4** |
| Axios interceptors | Роль перехватчиков выполняет обёртка `request()`: единая обработка задержки, таймаута и ошибок; в сторах `sensors`/`connection` логика «удачно/неудачно» |

Все пункты подраздела 4.2–4.3 следует писать, опираясь на этот реальный стек.

---

## 1. Полный технологический стек (из `package.json`)

### Runtime-зависимости

| Пакет | Версия | Назначение |
|---|---|---|
| `vue` | 3.5.27 | Core-фреймворк, Composition API |
| `vue-router` | 5.0.1 | SPA-маршрутизация + navigation guards |
| `pinia` | 3.0.4 | State management (composition stores) |
| `@vueuse/core` | 14.2.1 | Набор composable-утилит (reactiveOmit и пр.) |
| `echarts` | 6.0.0 | Рендер графиков (line, gauge) |
| `vue-echarts` | 8.0.1 | Vue-обёртка над ECharts |
| `grid-layout-plus` | 1.1.1 | Drag-and-drop сетка виджетов |
| `tailwindcss` | 4.1.18 | Utility-first CSS |
| `@tailwindcss/vite` | 4.1.18 | Tailwind-плагин для Vite |
| `reka-ui` | 2.9.2 | Headless UI-примитивы (основа shadcn-vue) |
| `lucide-vue-next` | 0.574.0 | Набор SVG-иконок |
| `class-variance-authority` | 0.7.1 | Типобезопасные варианты Tailwind-классов |
| `clsx` | 2.1.1 | Условная сборка className |
| `tailwind-merge` | 3.5.0 | Дедупликация tailwind-классов |

### Dev-зависимости

| Пакет | Версия | Назначение |
|---|---|---|
| `vite` | 7.3.1 | Сборщик (dev-server с HMR, prod-build) |
| `@vitejs/plugin-vue` | 6.0.3 | Vite-плагин для SFC |
| `vite-plugin-vue-devtools` | 8.0.5 | Vue DevTools (отключён в prod) |
| `eslint` | 9.39.2 | Линтер (flat config) |
| `eslint-plugin-vue` | 10.7.0 | Правила для Vue SFC |
| `oxlint` | 1.42.0 | Быстрый линтер на Rust (первый проход) |
| `prettier` | 3.8.1 | Форматирование |
| `shadcn-vue` | 2.4.3 | CLI для добавления shadcn-компонентов |

**Engine:** Node.js `^20.19.0 || >=22.12.0`.

---

## 2. Подраздел 4.1 — Обоснование языка и IDE

### 2.1 JavaScript (без TypeScript)

Что нужно подчеркнуть в тексте:

- **Стандарт веб-платформы** — JS исполняется любым современным браузером без предварительной трансляции, что уменьшает стоимость развёртывания.
- **Зрелая экосистема** — npm предоставляет все используемые библиотеки (Vue, Pinia, ECharts, Tailwind), типовые решения для SPA, утилиты сборки (Vite).
- **Единый язык клиента и серверных утилит** — весь инструментарий (сборка, линтер, форматтер, скрипты) тоже на JS/Node.js, что упрощает обслуживание проекта.
- **Динамическая типизация** — достаточна для приложения среднего размера; IDE (VS Code + Vue Language Server) обеспечивает статический анализ структуры SFC, автодополнение props/emits и диагностику ошибок без TypeScript.
- **Низкий порог входа** — проект рассчитан на поддержку сотрудником предприятия, порог обучения ниже, чем у TypeScript.

**Что упомянуть из конкретики проекта:** в `package.json` отсутствует `typescript`, все SFC используют `<script setup>` без `lang="ts"`, ESLint-конфиг `eslint-plugin-vue` настроен для JS.

### 2.2 Visual Studio Code

Что нужно подчеркнуть:

- **Встроенная поддержка Vue 3** — расширение «Vue (Official)» даёт подсветку SFC, IntelliSense для `<template>/<script>/<style>`, переход к определению компонента.
- **Интеграция с Prettier и ESLint** — форматирование по сохранению и индикация нарушений стиля прямо в редакторе.
- **Встроенный Git** — visual diff, staging по строкам, blame, история файла без выхода из IDE.
- **Расширения под стек:**
  - Tailwind CSS IntelliSense (автодополнение utility-классов, предпросмотр цвета),
  - Vite (зелёные квадратики состояния hot-reload),
  - GitLens (расширенный git-blame).
- **Кросс-платформенность** — одинаковое поведение на Windows/macOS/Linux (в нашем случае — WSL2/Ubuntu).
- **Лицензия MIT** — бесплатно для коммерческого применения.

**Скриншот:** делается открытым проектом `rudgormash-frontend`, открыт файл `src/views/ReportDetailView.vue`, виден Explorer, редактор с SFC, открытый терминал с `npm run dev`.

---

## 3. Подраздел 4.2 — Выбор frontend-технологий

### 3.1 Vue 3 + Composition API (обоснование)

Тезисы:

- **Прогрессивный фреймворк** — можно начать с одной страницы и наращивать SPA.
- **SFC (Single File Components)** — `<template>`, `<script setup>`, `<style scoped>` в одном файле, что упрощает локализацию изменений.
- **Composition API** — логика компонента собирается из composable-функций (`useXxx`), что даёт переиспользование. В проекте 9 composables: `useClock`, `useLiveData`, `useThresholdMonitor`, `useSwipe`, `useChartColors`, `useBreakpoint`, `usePermissions`, `useChartOptions`, `useTheme`.
- **Реактивность через прокси** — `ref`/`reactive` снимает необходимость ручной сигнализации об изменении.
- **Tooling** — Vite/HMR, Vue DevTools.
- **Лицензия MIT**, активное комьюнити, поддержка компанией.

### 3.2 Таблица сравнения фреймворков

| Критерий | Vue 3 | React 18 | Angular 17 |
|---|---|---|---|
| Размер рантайма (gzip) | ~34 KB | ~44 KB (react + react-dom) | ~145 KB (ядро) |
| Парадигма | Reactive + SFC | JSX + hooks | OOP + RxJS |
| Встроенный роутер | да (vue-router, офиц.) | нет (react-router — 3rd) | да (встроенный) |
| Встроенный стейт-менеджер | да (Pinia, офиц.) | нет (Redux/Zustand) | да (сервисы DI) |
| Поддержка SFC | да | нет | частично (HTML-шаблоны) |
| Использование TypeScript | опционально | опционально | обязательно |
| Кривая обучения | низкая | средняя | высокая |
| Hot Module Replacement | да (Vite) | да (CRA/Vite) | да (Angular CLI) |
| Лицензия | MIT | MIT | MIT |

### 3.3 Диаграмма сравнения (текстовое описание)

Радарная/столбчатая диаграмма по критериям (1–5 баллов):
- Порог входа: Vue 5 > React 4 > Angular 2
- Объём boilerplate: Vue 4 > React 3 > Angular 2
- Готовая экосистема (роутер/state из коробки): Vue 5, Angular 5, React 3
- Производительность: Vue ≈ React 5, Angular 4
- Скорость разработки: Vue 5 > React 4 > Angular 3

### 3.4 Обоснование вспомогательных библиотек

**Pinia** (state management)
- Официальная рекомендация Vue для замены Vuex.
- Composition-синтаксис: `defineStore('name', () => { ... })` — та же парадигма, что и в компонентах.
- В проекте 9 сторов: `auth`, `equipment`, `sensors`, `alerts`, `dashboards`, `connection`, `maintenance`, `preferences`, `reports`.
- Нет мутаций и модулей — только состояние, getters (через `computed`) и actions.

**Vue Router 5** (маршрутизация)
- Официальный роутер Vue.
- Lazy-loading через dynamic import — все `component: () => import('@/views/XxxView.vue')`.
- Navigation guards реализуют `requiresAuth`, `guest` и `requiresReportCreate` (последний проверяет роль через `canCreateAnyReport`).
- История через HTML5 History API (`createWebHistory`).

**HTTP-слой** (вместо Axios)
- Поскольку бэкенд на момент написания диплома только проектируется (см. `docs/superpowers/plans/2026-03-28-backend-laravel.md`), реализована mock-прослойка.
- Все обращения идут через `src/api/client.js` — функция `request(handler, { delay, timeout })` с единой имитацией сетевой задержки (`150 мс + jitter`), таймаутом (10 с) и классом `ApiError(status, message)`.
- Роль axios-interceptors выполняют:
  - единый `request()` — централизованная обработка задержки/таймаута/ошибок,
  - `src/stores/connection.js` — приёмник успехов и сбоев (через `reportSuccess`/`reportFailure`),
  - при переходе на реальный REST-бэкенд `request()` заменяется на `fetch`/`axios`-обёртку без изменений в сторах и api-модулях.

**ECharts + vue-echarts** (вместо Chart.js)
- ECharts — open-source библиотека Apache с поддержкой Canvas и SVG, подходит для большого объёма точек.
- `vue-echarts` — тонкая Vue-обёртка, принимает опции и автоматически перерисовывает.
- Используется в виджетах: `LineChartWidget`, `GaugeWidget`, `SensorHistoryWidget`, страницах `AnalyticsView`, `DashboardView`.
- Цвета графиков берутся из CSS-переменных (composable `useChartColors`) — график меняет палитру при переключении light/dark темы.
- Composable `useChartOptions` централизованно собирает опции (axes, tooltip, grid).

**grid-layout-plus** (drag-and-drop)
- Форк vue-grid-layout с нативной поддержкой Vue 3.
- Используется в `EquipmentDashboardView` — пользователь конструирует дашборд виджетов с drag/resize.
- Ограничение: `layout` должен быть мутабельным `ref`, **нельзя** использовать `computed` — библиотека изменяет массив in-place (это отмечено в `CLAUDE.md`/Gotchas).
- Сохранение раскладки — через Pinia-стор `dashboards` с персистентностью в localStorage (per-user).

**shadcn-vue + Tailwind CSS 4** (UI)
- shadcn-vue — не рантайм-библиотека, а набор исходников, копируемых в `src/components/ui`. Это даёт полный контроль над стилями и уменьшает зависимость.
- Список используемых примитивов: `Badge`, `Breadcrumb`, `Button`, `Card`, `Dialog`, `DropdownMenu`, `Input`, `RadioGroup`, `Select`, `Separator`, `Sheet`, `Switch`, `Table`, `Tabs`, `Textarea`, `Tooltip`.
- Tailwind CSS 4 использует CSS-переменные темы (`src/assets/theme.css`), что позволяет реализовать светлую/тёмную тему без пересборки.
- `@tailwindcss/vite` встроен в pipeline сборки.

**Дополнительно:**
- `lucide-vue-next` — 500+ иконок в виде Vue-компонентов, tree-shaking-friendly.
- `@vueuse/core` — утилиты для работы с реактивными API (например, `reactiveOmit` в shadcn-компонентах).
- `class-variance-authority` + `clsx` + `tailwind-merge` — типобезопасные варианты классов в shadcn-компонентах.

---

## 4. Подраздел 4.3 — Интеграция с серверной частью

### 4.1 REST API — проектируемая схема

Бэкенд на момент написания главы находится в стадии проектирования
(спецификация: `docs/superpowers/plans/2026-03-28-backend-laravel.md`).
Предполагаемый стек — **Laravel 13 + PHP 8.4 + PostgreSQL**. REST-эндпоинты
сгруппированы по доменам:

| Модуль | Эндпоинты (прогноз) |
|---|---|
| Авторизация | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Оборудование | `GET /api/equipment`, `GET /api/equipment/:id`, `GET /api/equipment/:id/sensors`, `GET /api/equipment/:id/live`, `PATCH /api/equipment/:id/status` |
| Уведомления | `GET /api/alerts`, `PATCH /api/alerts/:id/acknowledge` |
| Дашборды (per-user) | `GET /api/dashboards/:equipmentId`, `PUT /api/dashboards/:equipmentId` |
| ТО — наряды | `GET /api/maintenance/orders`, `POST /api/maintenance/orders`, `PATCH /api/maintenance/orders/:id` |
| Журнал ТС | `GET /api/journal` |
| Отчёты | `GET /api/reports`, `POST /api/reports`, `PATCH /api/reports/:id`, `POST /api/reports/:id/publish` |

Пока бэкенда нет — клиент работает с mock-слоем через тот же контракт
(см. ниже), что позволяет переключить прод-ключ без изменения кода в сторах.

### 4.2 Архитектура HTTP-слоя на клиенте

```
┌──────────────────┐
│  Vue-компонент   │
└────────┬─────────┘
         │ actions()
         ▼
┌──────────────────┐
│  Pinia-store     │  (auth, equipment, sensors, …)
└────────┬─────────┘
         │ api.getList()
         ▼
┌──────────────────┐
│ src/api/*.js     │  (обёртки, публикуемый контракт)
└────────┬─────────┘
         │ request(handler, opts)
         ▼
┌──────────────────┐
│ src/api/client.js│  (задержка, AbortController-таймаут, ApiError)
└────────┬─────────┘
         │ await handler()    — mock-режим
         │ await fetch(url)   — прод-режим (плановая замена)
         ▼
┌──────────────────┐
│ mock/* или REST  │
└──────────────────┘
```

### 4.3 Листинг ядра HTTP-клиента

`src/api/client.js`:

```js
const DEFAULT_DELAY = 150
const DEFAULT_TIMEOUT = 10000

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export async function request(
  handler,
  { delay = DEFAULT_DELAY, timeout = DEFAULT_TIMEOUT } = {},
) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    await sleep(delay + Math.random() * 100)
    if (controller.signal.aborted) {
      throw new ApiError(408, 'Превышено время ожидания запроса')
    }
    return await handler()
  } finally {
    clearTimeout(timer)
  }
}
```

**Комментарий:**
- `handler` — колбэк, инкапсулирующий конкретный запрос (сейчас — вызов mock-функции, в будущем — `fetch(url, options)`).
- `delay` имитирует сетевую латентность (150 мс + случайный джиттер до 100 мс).
- `timeout` срабатывает через `AbortController` и превращается в `ApiError(408, ...)`.
- Все API-обёртки (`src/api/equipment.js`, `src/api/reports.js`, …) вызывают `request()` — т.е. перехватчик применяется ко всем запросам автоматически.

### 4.4 Пример API-обёртки

`src/api/equipment.js`:

```js
import { request } from './client'
import { getEquipmentList as mockGetList, ... } from './mock/equipment'

export function getList() {
  return request(() => mockGetList())
}

export function getLiveData(id) {
  return request(() => mockGetLive(id), { delay: 50 })
}

export function updateStatus(id, status) {
  return request(() => mockUpdateStatus(id, status))
}
```

### 4.5 Механизм polling

Polling нужен для «живых» данных датчиков. Реализация — в
`src/stores/sensors.js`:

```js
function startPolling(equipmentId, interval = 5000) {
  stopPolling()
  pollingEquipmentId.value = equipmentId
  pollingActive.value = true
  const { checkThresholds } = useThresholdMonitor()

  const poll = async () => {
    if (!pollingActive.value) return
    try {
      await fetchLive(equipmentId)
      checkThresholds(equipmentId)
    } catch {
      /* connection store handles status */
    }
  }

  poll()                                  // первый вызов сразу
  pollingTimer = setInterval(poll, interval)
}

function stopPolling() {
  pollingActive.value = false
  pollingEquipmentId.value = null
  if (pollingTimer) clearInterval(pollingTimer)
}
```

**Что важно упомянуть:**
- Интервал по умолчанию 5 с (настраивается через preferences).
- После каждого успешного вызова запускается `checkThresholds()` — если значение датчика превысило `thresholds.warning` или `thresholds.critical`, создаётся live-alert через `alertsStore.addLiveAlert()`.
- Дедупликация alert'ов: активные нарушения хранятся в `Map` с ключом `${equipmentId}:${sensorId}` → уровень. Новое уведомление создаётся только при **смене** уровня.
- На компоненте: `onMounted → startPolling`, `onUnmounted → stopPolling`.

### 4.6 Обработка ошибок и индикатор соединения

`src/stores/connection.js`:

```js
export const useConnectionStore = defineStore('connection', () => {
  const status = ref('connected')
  const consecutiveFailures = ref(0)

  function reportSuccess() {
    consecutiveFailures.value = 0
    status.value = 'connected'
  }

  function reportFailure() {
    consecutiveFailures.value++
    if (consecutiveFailures.value >= 3) status.value = 'disconnected'
    else                                  status.value = 'reconnecting'
  }

  return { status, reportSuccess, reportFailure, ... }
})
```

**Правила переходов:**
- 1–2 подряд неудачных запроса → статус `reconnecting` (жёлтый индикатор, анимация pulse).
- 3+ подряд → `disconnected` (красный индикатор).
- Любой успех → `connected` (зелёный, счётчик сброшен).

**Визуализация:** `src/components/ConnectionStatus.vue` в шапке приложения.
Показывает точку + текст (`ПОДКЛЮЧЕНО` / `ПЕРЕПОДКЛЮЧЕНИЕ...` / `НЕТ СВЯЗИ`).

**Глобальная обработка ошибок:**
- Класс `ApiError(status, message)` — все ошибки клиента.
- В Pinia-сторах схема: `try { ... } catch (e) { error.value = e.message }` →
  компонент показывает `v-if="store.error"`.
- Таймаут → `ApiError(408, 'Превышено время ожидания запроса')`.

### 4.7 Специфика mock-режима (runtime)

Так как бэкенд отсутствует, клиент работает с локальной персистентностью
через собственный mock-runtime (`src/api/mock/_runtime.js`). Это временное
решение, но его архитектура имитирует реальный REST-бэкенд:

- **Коллекции** (`defineCollection`) — аналог таблиц БД: `users`, `equipment`, `alerts`, `journal`, `audit`, `parts`, `orders`, `checklists`, `reports`, `dashboards`, `preferences`.
- **Scope: `global` | `user`** — глобальные коллекции vs. per-user (как `user_id`-ограничение на сервере).
- **Schema versioning** — ключи в localStorage вида `rgm:v{N}:{name}` (аналог миграций БД).
- **Seed-файлы** — `src/api/mock/seed/<name>.seed.js` с функцией `createSeed()` (начальные данные).
- **Атомарные операции** — `read`, `write`, `patch`, `append`, `prepend`, `remove`.
- **Сброс демо** — `resetAll()` или query-параметр `?demo-reset=1`.

Когда бэкенд появится, модули `src/api/*.js` переписываются с `mock*` на
`fetch(...)`, остальной код приложения меняется минимально.

---

## 5. Подраздел 4.4 — реализация по экранам (последовательность)

Тут собрана **фактическая хронология** разработки по коммитам `git log`.
Она удобна для раздела 4.4 как «дорожная карта»: какой экран когда появился
и в каком контексте.

### Этап 0. Bootstrap проекта

| Коммит | Содержание |
|---|---|
| `1dffda3` init commit | Vite + Vue 3 шаблон |
| `2f3e998` Init true project structure | Базовая структура каталогов (`api`, `assets`, `components`, `composables`, `layouts`, `router`, `stores`, `views`) |

### Этап 1. MVP-экраны по макетам

| Коммит | Содержание |
|---|---|
| `65321ac` | Базовые экраны и компоненты по дизайн-макету |
| `2b69b60` | Build mvp — сборка работающего прототипа |

**Экраны:** Login, Home (тайлы оборудования), Dashboard, Equipment List,
Equipment Detail, Alerts, Analytics, Settings.

### Этап 2. Дизайн-система и рефакторинг (Phase 1)

| Коммит | Содержание |
|---|---|
| `2f1baa1`, `3d18eba` | Phase 1 spec + план (14 тасков) |
| `f594076` | shadcn-vue + базовые UI-компоненты |
| `efc8012` | Новая палитра, radius, типографика |
| `36f3179` | Константы + composables `useBreakpoint`, `useSwipe` |
| `2c2d620` | Новый layout (sidebar + slim header + breadcrumbs) |
| `574614a` | Применение дизайн-системы ко всем компонентам |
| `6b4e66b` | Redesign HomeView — panel, sparklines, сетка оборудования |
| `b40a428` | EquipmentDetailView — 5 вкладок, модуль ТО |
| `e51b7c4` | AnalyticsView — KPI, графики, таблицы эффективности |
| `5e7ca5d` | SettingsView — 5 вкладок, persist в localStorage, audit-log |
| `f449238` | Виджеты maintenance-timeline, subsystem-health |
| `90065b4` | Мобильная адаптивность (responsive grids, Sheet, touch) |

### Этап 3. Ролевая модель и ТО (Maintenance v1)

| Коммит | Содержание |
|---|---|
| `1818f62` | Система ролей (users mock, login с выбором роли) |
| `4f99009` | Persist user role, `getUserById` |
| `eddfb28` | Mock ТО — ТР/КР, CRUD нарядов |
| `0f8e6ee` | Store `maintenance` + composable `usePermissions` |
| `0306971` | Маршруты ТО, sidebar, вкладка в EquipmentDetail |
| `a8b3cc4` | Kanban-доска `MaintenanceView` |
| `91b6888` | 3-шаговый мастер создания наряда |
| `a037087` | Страница наряда — мастер выполнения, приёмка |

### Этап 4. ТО v2 — тайм-трекинг и документы

| Коммит | Содержание |
|---|---|
| `99becb0` | API-контракт v2 |
| `371096f` | Расширение модели (time, measurements, materials, executors) |
| `78d74eb` | Live-таймер шага |
| `31af43e` | Поля измерений и материалов на шагах |
| `8033270` | Журнал ТС (Приложение Б), авто-записи при приёмке |
| `8d98097` | Генерация актов ТО (Приложение А), печать |
| `b987465` | Статистика времени, ремарки, links на документы |

### Этап 5. Спецификация backend'а

| Коммит | Содержание |
|---|---|
| `48af4cd` | Laravel + PostgreSQL спецификация |
| `d4c2c​e5` | Нормализация maintenance_types |
| `8213e70` | План бэкенда (16 тасков) |
| `73ffce1` | Обновление до Laravel 13 + PHP 8.4 |

### Этап 6. Mock-runtime (унифицированная персистентность)

| Коммит | Содержание |
|---|---|
| `7a70955` | Спецификация mock-runtime |
| `a73b141` | План mock-runtime (41 таск) |
| `0b02a8b` | `_runtime` + сиды `users`/`preferences`/`dashboards` |
| `d4c2ce5` | Сиды `equipment`, `alerts`, `journal`, `audit`, `parts`, `checklists`, `orders`, `reports` |
| `1e5027f` | Миграция всех mock-модулей на runtime |
| `7cb1bc2` | Per-user preferences через runtime |
| `0e93fb6` | Сущность «отчёты» (4 типа) + авто-генерация из ТО |
| `598aa2b` | Legacy-миграция, demo-reset UI + `?demo-reset=1` |
| `7f9b0d9` | Регистрация всех коллекций при бутстрапе |

### Этап 7. Отчёты — типизация и создание

| Коммит | Содержание |
|---|---|
| `c01924f` | Типизированный рендер payload для 4 типов; формы создания; ролевая модель |
| `4d74f5e` | Глобальные стили печати (только документ, без шапки/сайдбара) |

**Итого:** 73 коммита, 9 этапов работы.

---

## 6. Сводка по разделам (для 4.4)

### Список видов (`src/views/`)

| Файл | Назначение |
|---|---|
| `LoginView.vue` | Логин с выбором пользователя (4 роли) |
| `HomeView.vue` | Плитки оборудования + sparklines + метрики |
| `DashboardView.vue` | Общий мониторинг парка |
| `EquipmentListView.vue` | Табличный список 8 станков |
| `EquipmentDetailView.vue` | Детальная карточка (5 вкладок) |
| `EquipmentDashboardView.vue` | Конструктор виджетов (drag-n-drop) |
| `AlertsView.vue` | Лента уведомлений |
| `AnalyticsView.vue` | KPI, графики, эффективность |
| `SettingsView.vue` | Настройки (5 вкладок) |
| `JournalView.vue` | Журнал технического состояния (Прилож. Б) |
| `MaintenanceView.vue` | Kanban-доска нарядов ТО |
| `MaintenanceCreateView.vue` | Мастер создания наряда (3 шага) |
| `MaintenanceDetailView.vue` | Карточка наряда с мастером выполнения |
| `MaintenanceDocumentView.vue` | Печатный акт ТО (Прилож. А) |
| `ReportsView.vue` | Список отчётов с фильтрами |
| `ReportDetailView.vue` | Детали отчёта (типизированный рендер) |
| `ReportCreateView.vue` | Создание/редактирование отчёта |

### Список сторов (`src/stores/`)

| Стор | Состояние | Действия |
|---|---|---|
| `auth` | user, token, role | login, logout, fetchUser |
| `equipment` | list, details | fetchList, fetchById, createEquipment, setStatus |
| `sensors` | liveData, sensorDefs, polling | startPolling, stopPolling, fetchLive |
| `alerts` | alerts, showCritical | fetchAlerts, acknowledgeAlert, addLiveAlert |
| `dashboards` | configs per equipment | CRUD виджетов, editing toggle |
| `connection` | status, consecutiveFailures | reportSuccess, reportFailure |
| `maintenance` | orders, checklists | createOrder, approveOrder |
| `preferences` | display, notifications, thresholds, theme | load, save |
| `reports` | reports, currentReport | fetchAll, create, publish, update |

### Список composables

| Composable | Назначение |
|---|---|
| `useClock` | Текущее время с обновлением 1/сек |
| `useLiveData` | Счётчик «секунд с обновления» |
| `useThresholdMonitor` | Проверка порогов + создание alert'ов |
| `useSwipe` | Жесты свайпа (мобильные) |
| `useChartColors` | Цвета из CSS-переменных темы |
| `useBreakpoint` | Реактивный признак mobile/desktop |
| `usePermissions` | Проверки прав для ТО |
| `useChartOptions` | Сборка опций ECharts |
| `useTheme` | Light/Dark toggle через preferences |

### Список виджетов (`widgetRegistry.js`) — 11 типов

**Sensor-виджеты (`requiresSensor: true`):**
1. `numeric-indicator` — текущее значение датчика
2. `line-chart` — график во времени
3. `gauge` — круговая шкала
4. `sensor-history` — история за 24ч

**Info-виджеты (`requiresSensor: false`):**
5. `info` — модель, SN, год
6. `status` — текущий статус
7. `specs` — тех. характеристики
8. `service-history` — история ТО
9. `parts` — замены запчастей
10. `maintenance-timeline` — таймлайн ТО
11. `subsystem-health` — здоровье подсистем

### Пользователи (4 мок-пользователя)

| ID | Имя | Роль |
|---|---|---|
| user-1 | Иванов А.П. | engineer (инженер) |
| user-2 | Петров С.В. | mechanic (механик) |
| user-3 | Сидоров К.М. | mechanic |
| user-4 | Козлов Д.А. | foreman (мастер) |

### Роли и доступ

| Роль | Доступ к экранам |
|---|---|
| engineer | всё, создание отчётов всех типов, журнал, аналитика |
| mechanic | ТО, инцидент-отчёты |
| foreman | всё кроме редактирования оборудования |

---

## 7. Полезные файлы и точки входа (ссылки для главы)

| Что описываем | Файл |
|---|---|
| Точка входа | `src/main.js` |
| Корневой компонент | `src/App.vue` |
| Роутинг + guards | `src/router/index.js` |
| HTTP-клиент | `src/api/client.js` |
| Mock-runtime | `src/api/mock/_runtime.js` |
| Polling | `src/stores/sensors.js` |
| Connection status | `src/stores/connection.js` + `src/components/ConnectionStatus.vue` |
| Threshold monitor | `src/composables/useThresholdMonitor.js` |
| Тема | `src/assets/theme.css` + `src/composables/useTheme.js` |
| Стили печати | `src/assets/print.css` |
| Реестр виджетов | `src/components/widgets/widgetRegistry.js` |
| Права на отчёты | `src/utils/reportPermissions.js` |
| Layout | `src/layouts/DefaultLayout.vue`, `AuthLayout.vue` |
| Sidebar | `src/components/layout/AppSidebar.vue` + `sidebarMenu.js` |

---

## 8. Чек-лист что написать в 4.1–4.3

### 4.1 Язык и IDE
- [ ] Обоснование JavaScript (кросс-платформенность, экосистема, стандарт веба, достаточность динамической типизации для SPA среднего размера)
- [ ] Обоснование VS Code (встроенная поддержка Vue, Prettier, Git, расширения, кросс-платформенность, лицензия MIT)
- [ ] Скриншот VS Code с открытым проектом (рекомендуется: `src/views/ReportDetailView.vue` или `src/stores/sensors.js` + Explorer + Terminal с `npm run dev`)

### 4.2 Frontend-технологии
- [ ] Сравнение Vue 3 / React 18 / Angular 17 (табл. 3.2)
- [ ] Диаграмма сравнения (разд. 3.3)
- [ ] Обоснование Vue 3 + Composition API + SFC
- [ ] Обоснование Pinia (9 сторов)
- [ ] Обоснование Vue Router 5 (lazy-load, guards)
- [ ] Обоснование ECharts (вместо Chart.js) + grid-layout-plus (вместо vue-grid-layout)
- [ ] Обоснование shadcn-vue + Tailwind CSS 4

### 4.3 Интеграция с backend
- [ ] Описание REST API (табл. из 4.1)
- [ ] Схема HTTP-слоя (схема из 4.2)
- [ ] Листинг `request()` (4.3)
- [ ] Пример API-обёртки (4.4)
- [ ] Polling (4.5 с листингом `startPolling`)
- [ ] Connection store (4.6 с листингом `reportSuccess/reportFailure`)
- [ ] Скриншот индикатора соединения (зелёный/жёлтый/красный)
- [ ] Упоминание mock-runtime как текущей заглушки (4.7)

---

**Итоговый объём проекта (для аннотации):**
- 17 представлений (views)
- 9 Pinia-сторов
- 9 composables
- 11 типов виджетов
- 4 типа отчётов
- 8 станков (мок), 12 датчиков на каждом
- 73 коммита за период разработки
- ~26 000+ строк исходного кода Vue/JS
