# Фаза 1: Фундамент — Редизайн и рефакторинг Rudgormash Frontend

**Дата:** 2026-03-17
**Статус:** Утверждён
**Подход:** Эволюционный рефакторинг (поэтапная трансформация)

## Контекст

Rudgormash Frontend — система мониторинга бурового оборудования (8 станков СБШ-250МНА-32, 12 датчиков на станок). Текущая реализация: Vue 3.5, Pinia 3, Tailwind CSS 4, ECharts 6, grid-layout-plus. Бруталистский визуальный стиль (2px borders, 0px radius, uppercase заголовки).

Фаза 1 — фундамент для последующих фаз (mock-расширение, мобильное PWA, предиктивная аналитика, i18n). Всё на mock-заглушках, спроектированных для замены на реальный API без переписывания компонентов.

### Целевая аудитория

- **Основная:** инженеры за десктопом (анализ данных, отчёты)
- **Вторичная:** операторы на площадке, руководство на совещаниях

### Доменный контекст

Регламент ТО (docs/Reglament_tekhnicheskogo_obsluzhivania_burovogo_stanka.pdf) определяет:
- Цикл ТО: ЕО (ежесменно) → ТО-1 (250ч) → ТО-2 (500ч) → ТО-3 (2000ч) → ТР-1 (2500ч) → ТР-2 (5000ч) → ТР-3 (10000ч) → КР (20000ч)
- 4 подсистемы: гидравлика, электрика, механическая трансмиссия, компрессор
- Признаки неисправности: течь масла, перегрев, вибрация, аномальное давление, шум
- Формы отчётности: журнал технического состояния, акты обследований
- Трудозатраты за полный цикл (20000ч): 2632 чел·ч

---

## 1. Дизайн-система: «Industrial SaaS»

### 1.1 Визуальное направление

Чистый SaaS/dashboard-стиль (референсы: Grafana, Datadog) с промышленным характером.

### 1.2 Типографика

- **Основной шрифт:** Inter (сохраняется)
- **Метрики:** JetBrains Mono (сохраняется)
- **Заголовки:** font-weight 600 (semibold), без глобального uppercase — uppercase только для label'ов и badge'ей
- **Размеры:** текущая шкала сохраняется (h1: 2rem, h2: 1.5rem, h3: 1.25rem)

### 1.3 Геометрия

| Элемент | Было | Стало |
|---------|------|-------|
| Border-radius карточек | 0px | 6px |
| Border-radius кнопок/инпутов | 0px | 4px |
| Border-radius модалок | 0px | 8px |
| Border-width | 2px | 1px |
| Тени карточек | нет | shadow-sm |
| Clip-path на углах | да | убрать |
| Hover-трансформации translate | да | убрать, заменить на shadow + border-color |

### 1.4 Цветовая палитра

Новая палитра **расширяет** существующие CSS-переменные, не удаляя их. Все shadcn-vue-совместимые токены (`--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--ring`, `--input`, `--input-background`) **сохраняются** и обновляются для соответствия новой палитре. Миграция: обновить значения существующих переменных, добавить недостающие.

**Dark theme (основная):**

| Токен | Значение | Назначение |
|-------|----------|------------|
| --background | #09090b (zinc-950) | Фон страницы |
| --foreground | #fafafa | Основной текст |
| --surface-1 | #18181b (zinc-900) | Карточки |
| --surface-2 | #27272a (zinc-800) | Hover, вложенные блоки |
| --border | #3f3f46 (zinc-700) | Границы |
| --primary | #3b82f6 (blue-500) | Акцент, активные элементы |
| --primary-foreground | #fafafa | Текст на primary |
| --card | #18181b (zinc-900) | Фон карточки (shadcn) |
| --card-foreground | #fafafa | Текст карточки (shadcn) |
| --popover | #18181b | Фон popover (shadcn) |
| --popover-foreground | #fafafa | Текст popover (shadcn) |
| --muted | #27272a (zinc-800) | Приглушённый фон (shadcn) |
| --muted-foreground | #a1a1aa (zinc-400) | Приглушённый текст (shadcn) |
| --accent | #27272a | Акцентный фон (shadcn) |
| --accent-foreground | #fafafa | Акцентный текст (shadcn) |
| --destructive | #ef4444 (red-500) | Деструктивные действия (shadcn) |
| --destructive-foreground | #fafafa | Текст деструктивных (shadcn) |
| --ring | #3b82f6 (blue-500) | Focus ring (shadcn) |
| --input | #3f3f46 (zinc-700) | Border инпутов (shadcn) |
| --input-background | #18181b | Фон инпутов (shadcn) |
| --text-primary | #fafafa | Основной текст |
| --text-secondary | #a1a1aa (zinc-400) | Вторичный текст |
| --secondary | #27272a | Вторичный фон (shadcn) |
| --secondary-foreground | #fafafa | Вторичный текст (shadcn) |
| --status-normal | #22c55e (green-500) | Статус «Работа» |
| --status-warning | #eab308 (yellow-500) | Предупреждения |
| --status-critical-bg | #ef4444 (red-500) | Фон критических алертов |
| --status-critical-text | #fafafa | Текст критических алертов |
| --chart-1 | #3b82f6 (blue-500) | Линии графиков |
| --chart-2 | #8b5cf6 (violet-500) | Линии графиков |
| --chart-3 | #06b6d4 (cyan-500) | Линии графиков |
| --chart-4 | #f59e0b (amber-500) | Линии графиков |
| --chart-5 | #ec4899 (pink-500) | Линии графиков |

**Light theme:**

| Токен | Значение |
|-------|----------|
| --background | #fafafa (zinc-50) |
| --foreground | #09090b |
| --surface-1 | #ffffff |
| --surface-2 | #f4f4f5 (zinc-100) |
| --border | #e4e4e7 (zinc-200) |
| --primary | #2563eb (blue-600) |
| --primary-foreground | #ffffff |
| --card | #ffffff |
| --card-foreground | #09090b |
| --muted | #f4f4f5 (zinc-100) |
| --muted-foreground | #71717a (zinc-500) |
| --accent | #f4f4f5 |
| --accent-foreground | #09090b |
| --destructive | #dc2626 (red-600) |
| --ring | #2563eb |
| --input | #e4e4e7 |
| --input-background | #ffffff |
| --text-primary | #09090b |
| --text-secondary | #71717a (zinc-500) |
| --popover-foreground | #09090b |
| --destructive-foreground | #ffffff |
| --secondary | #f4f4f5 (zinc-100) |
| --secondary-foreground | #09090b |

### 1.4.1 Стратегия radius-токенов

Текущий `--radius: 0px` заменяется набором токенов:

| Токен | Значение | Использование |
|-------|----------|---------------|
| --radius-sm | 4px | Кнопки, инпуты, badge |
| --radius-md | 6px | Карточки, dropdown |
| --radius-lg | 8px | Модалки, Sheet |

В `@theme inline` маппятся на Tailwind: `--radius-sm`, `--radius-md`, `--radius-lg`.

### 1.5 shadcn-vue компоненты

Задействуемые компоненты (shadcn-vue уже в devDependencies):

- **Layout:** Card, Separator, Sheet (mobile sidebar)
- **Forms:** Button, Input, Select, Switch, RadioGroup
- **Overlay:** Dialog, Tooltip, DropdownMenu
- **Data:** Table, Badge, Tabs, Breadcrumb
- **Feedback:** (кастомные, на основе shadcn-токенов)

### 1.6 Микро-анимации

| Элемент | Было | Стало |
|---------|------|-------|
| Hover карточек | translate-x/y | shadow-md + border-primary/30 |
| Кнопки active | нет | scale-[0.98] |
| Статусы | animate-pulse | статичная точка + цвет |
| Списки | TransitionGroup | enter/leave fade + translateY |
| Transitions | duration-150 | duration-200 |

### 1.7 Что удаляется

- Clip-path дизайн на углах карточек (MetricCard, CriticalAlertModal)
- border-2 повсюду → border (1px)
- Uppercase на h1-h4 → normal case
- font-weight 800 на заголовках → 600
- Hover translate-трансформации
- animate-pulse на статусных индикаторах (кроме критических алертов)

---

## 2. Навигация и Layout

### 2.1 DefaultLayout — новая структура

```
┌────────────────────────────────────────────────┐
│  Header (48px)                                 │
│  Logo · Breadcrumbs         Clock · Alerts · ○ │
├──────┬─────────────────────────────────────────┤
│ Side │  Main Content (scroll)                  │
│ bar  │                                         │
│ 56px │  ┌─ Page Header + Actions ────────────┐ │
│      │  │                                    │ │
│ ──── │  │  Content Area                      │ │
│ 🏠   │  │                                    │ │
│ 📊   │  └────────────────────────────────────┘ │
│ ⚙    │                                         │
│ 🔔   │  ┌─ Footer (1 строка) ───────────────┐ │
│ 📈   │  │ v2.5.0 · © 2026 Рудгормаш         │ │
│ ──── │  └────────────────────────────────────┘ │
│ 🌙 ○ │                                         │
└──────┴─────────────────────────────────────────┘
```

### 2.2 Sidebar

- **Collapsed (по умолчанию):** 56px, только иконки
- **Expanded:** 220px (по hover или кнопке-пин), иконка + текст
- **Мобильный:** Sheet (shadcn), выезжает слева по гамбургер-кнопке
- **Группировка с разделителями:**
  - Основное: Главная, Мониторинг, Оборудование
  - Аналитика: Уведомления, Аналитика
  - Система: Настройки
- **Внизу sidebar:** переключатель темы + аватар пользователя

### 2.3 Header (slim, 48px)

- **Слева:** компактный логотип + breadcrumbs
- **Справа:** часы (compact), статус подключения (точка + tooltip), кнопка уведомлений с badge-счётчиком, аватар с DropdownMenu (профиль, выход)

### 2.4 Breadcrumbs

- Автоматические из route meta + параметров
- Формат: `Главная / Оборудование / БУР-12 / Дашборд`
- Кликабельные промежуточные уровни
- На мобильных: только текущий уровень

### 2.5 Footer

- Одна строка: `v2.5.0 · © 2026 Рудгормаш`
- Ссылки (Документация, Поддержка) переносятся в sidebar или Settings

---

## 3. Рефакторинг компонентов

### 3.1 Разбивка крупных view

**EquipmentDetailView (379 → ~80 строк оркестратора):**

| Подкомпонент | Назначение | ~Строк |
|-------------|------------|--------|
| EquipmentHeader.vue | Шапка: ID, статус, наработка, кнопки | 40 |
| EquipmentMetrics.vue | 5 карточек ключевых метрик | 60 |
| EquipmentCharts.vue | Графики мощности, глубины, момента | 70 |
| EquipmentStatusBars.vue | 6 прогресс-баров | 50 |
| EquipmentSpecs.vue | Спецификации + история обслуживания | 50 |
| EquipmentParts.vue | Таблица замены деталей | 40 |
| SensorHistoryExplorer.vue | Датчик + диапазон дат + график | 60 |

**AnalyticsView (340 → ~60 строк оркестратора):**

| Подкомпонент | Назначение | ~Строк |
|-------------|------------|--------|
| AnalyticsPeriodSelector.vue | Период + экспорт | 30 |
| AnalyticsKPICards.vue | 4 KPI-карточки | 40 |
| AnalyticsCharts.vue | Bar + pie charts | 80 |
| EfficiencyTable.vue | Таблица эффективности | 60 |
| MaintenanceStats.vue | Статистика обслуживания | 50 |

**SettingsView (259 → ~50 строк оркестратора с Tabs):**

| Подкомпонент | Назначение | ~Строк |
|-------------|------------|--------|
| SettingsDisplay.vue | Тема, язык, частота обновления | 50 |
| SettingsNotifications.vue | Алерты, email | 40 |
| SettingsThresholds.vue | Пороги датчиков | 50 |
| SettingsSecurity.vue | Пользователь, 2FA, лог доступа | 40 |
| SettingsSystem.vue | Информация о системе | 30 |

**HomeView (текущие ~75 строк → расширение + декомпозиция):**

HomeView — это не рефакторинг, а **редизайн с расширением функциональности**. Текущий HomeView — простая сетка карточек оборудования. Новый HomeView добавляет метрики, графики, блок «Следующее ТО». Порядок реализации: сначала создать подкомпоненты с новым контентом, затем собрать оркестратор.

| Подкомпонент | Назначение | ~Строк |
|-------------|------------|--------|
| HomeMetricsPanel.vue | 4 статусных карточки (всего/работа/авария/простой) | 60 |
| HomeCharts.vue | Sparkline-графики температуры, вибрации | 50 |
| HomeEquipmentGrid.vue | Карточки оборудования (с датчиками) + фильтр + блок «Следующее ТО» | 80 |

### 3.2 Централизация констант

Новый файл `src/utils/constants.js`:

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

export const MAINTENANCE_SCHEDULE = {
  'ЕО':   { hours: null,  label: 'Ежесменное',          workers: 1, duration: 1 },
  'ТО-1': { hours: 250,   label: 'ТО-1',                workers: 2, duration: 4 },
  'ТО-2': { hours: 500,   label: 'ТО-2',                workers: 2, duration: 6 },
  'ТО-3': { hours: 2000,  label: 'ТО-3',                workers: 2, duration: 8 },
  'ТР-1': { hours: 2500,  label: 'Текущий ремонт 1',    workers: 3, duration: null },
  'ТР-2': { hours: 5000,  label: 'Текущий ремонт 2',    workers: 4, duration: null },
  'ТР-3': { hours: 10000, label: 'Текущий ремонт 3',    workers: 4, duration: null },
  'КР':   { hours: 20000, label: 'Капитальный ремонт',  workers: null, duration: null },
}

export const SUBSYSTEMS = [
  { id: 'hydraulic',   label: 'Гидравлика' },
  { id: 'electrical',  label: 'Электрика' },
  { id: 'mechanical',  label: 'Трансмиссия' },
  { id: 'compressor',  label: 'Компрессор' },
]
```

### 3.3 Замена кастомных примитивов на shadcn-vue

| Кастомный компонент | Замена |
|--------------------|--------|
| MetricCard.vue | Рефакторинг с shadcn Card |
| DataTable.vue | shadcn Table с сортировкой |
| SettingsToggle.vue | shadcn Switch |
| CriticalAlertModal.vue | shadcn Dialog + кастомная стилизация |
| AddWidgetModal.vue | shadcn Dialog + RadioGroup |
| (новый) Breadcrumb.vue | shadcn Breadcrumb |
| (новый) AppSidebar.vue | shadcn Sheet (mobile) + кастом (desktop) |

---

## 4. Редизайн страниц

### 4.1 HomeView — Операционный центр

**Структура:**
1. **Статус-панель (4 карточки):** всего станков, в работе, авария, простой
2. **Оборудование (grid):** карточки с 2-3 ключевыми датчиками прямо на карточке + фильтр/поиск
3. **Ключевые метрики:** sparkline-графики (мини-тренды температуры, вибрации)
4. **Следующее ТО:** таблица ближайших плановых обслуживаний (расчёт по наработке из регламента)

### 4.2 EquipmentDetailView — Паспорт станка

Табовая навигация (shadcn Tabs) вместо бесконечного скролла:

| Вкладка | Содержимое |
|---------|-----------|
| Обзор | 5 метрик + 6 статус-баров + графики |
| Датчики | Все 12 датчиков: live-значение, пороги, мини-график тренда 1ч |
| ТО | **НОВАЯ.** Таймлайн цикла ТО, прогресс-бар до следующего ТО, чек-лист текущего ТО (из регламента), расчёт трудозатрат |
| Детали | Таблица замены деталей (оригинал/аналог) |
| История | Sensor history explorer + журнал событий |

Вкладка «ТО» — ключевая новая функциональность, основанная на регламенте:
- Горизонтальная шкала: ЕО → ТО-1 → ТО-2 → ТО-3 → ТР-1 → ТР-2 → ТР-3 → КР
- Маркер текущей наработки (например: 4820ч)
- Прогресс-бар: «До ТР-2 осталось 180ч»
- Чек-лист: операции из таблиц 4-7 регламента с отметками выполнения
- Расчёт: трудозатраты, необходимый инструмент, материалы

### 4.3 AlertsView — Центр уведомлений

- Timeline-группировка по дням (вместо плоского списка)
- Алерты типа `maintenance` — уведомления о приближении к плановому ТО
- Inline-подтверждение для не-критических
- Критические — full-screen Dialog (shadcn)

### 4.4 AnalyticsView — Аналитический дашборд

- KPI-карточки + распределение статусов (pie chart)
- Секция «Подсистемы» — здоровье гидравлики/электрики/трансмиссии/компрессора
- Затраты на ТО — визуализация трудозатрат из методики расчёта регламента (stacked bar chart)
- Таблица эффективности с progress-барами и трендом
- Кнопка экспорта PDF (mock — клиентская генерация)

### 4.5 EquipmentDashboardView — конструктор виджетов

- Toolbar: shadcn Button группа
- Два новых типа виджетов: `maintenance-timeline` (6×4), `subsystem-health` (4×3)
- AddWidgetModal на shadcn Dialog + RadioGroup

### 4.6 Остальные страницы

- **DashboardView:** shadcn Card для карточек оборудования, адаптивная сетка
- **EquipmentListView:** shadcn Table с сортировкой, Input для поиска, Tabs для фильтров
- **SettingsView:** shadcn Tabs между секциями, Switch вместо кастомного toggle, персистенция в localStorage
- **SettingsView (вкладка «Система»):** секция «Журнал действий» — отображение последних записей из audit.js (кто подтвердил алерт, кто отметил ТО и т.п.)
- **LoginView:** обновлённая тема, shadcn Input / Button

---

## 5. Расширение mock-слоя

### 5.1 Расширение существующих данных

**equipment.js — новые статические поля у каждого станка:**

```js
{
  operatingHours: 4820,           // текущая наработка (часы), статическое значение в mock
  lastMaintenance: {
    type: 'ТО-2',                 // тип последнего выполненного ТО
    date: '2026-02-15',           // дата выполнения
    hours: 4500,                  // наработка на момент ТО
  },
  subsystemHealth: {
    hydraulic: 82,                // 0-100%, статические значения в mock
    electrical: 95,
    mechanical: 71,
    compressor: 88,
  },
}
```

**Вычисляемые данные — логика в maintenanceStore:**

`nextMaintenance` **не хранится в mock**, а вычисляется в `maintenanceStore.getNextMaintenance(equipmentId)` на основе `operatingHours` + `MAINTENANCE_SCHEDULE` из constants.js. Алгоритм: найти ближайший порог из MAINTENANCE_SCHEDULE, который больше текущей наработки, вычислить `hoursRemaining = threshold - operatingHours`. Это гарантирует консистентность с operatingHours.

```js
// maintenanceStore
function getNextMaintenance(equipmentId) {
  const equipment = equipmentStore.getDetail(equipmentId)
  const hours = equipment.operatingHours
  // Находим ближайший порог из MAINTENANCE_SCHEDULE
  const thresholds = Object.entries(MAINTENANCE_SCHEDULE)
    .filter(([_, v]) => v.hours !== null)
    .sort((a, b) => a[1].hours - b[1].hours)
  // ... вычисление ближайшего ТО
}
```
```

**alerts.js — новый тип `maintenance`:**

```js
{
  type: 'maintenance',
  title: 'Приближается ТО-1',
  description: 'До планового ТО-1 осталось 42 часа наработки',
  equipmentId: 'БУР-12',
}
```

### 5.2 Новые mock-модули

**maintenance.js** — чек-листы ТО из регламента:
- Операции из таблиц 4-7: описание, требования, инструменты, статус выполнения
- Расход материалов (масла, фильтры)

Расчёт трудозатрат (из методики расчёта, стр. 18 регламента):
- За 1 ремонтный цикл (20000ч) выполняется: ТО-1 ×79, ТО-2 ×39, ТО-3 ×9, ТР-1 ×7, ТР-2 ×3, ТР-3 ×1
- Трудозатраты: ТО-1: 8 чел·ч, ТО-2: 12 чел·ч, ТО-3: 16 чел·ч, ТР-1: 32 чел·ч, ТР-2: 292 чел·ч, ТР-3: 288 чел·ч
- Итого за цикл: 632 + 468 + 144 + 224 + 876 + 288 = 2632 чел·ч
- Формула для конкретного станка: `total = Σ (трудозатраты_типа × количество_выполненных)`

**audit.js** — журнал аудита:
- Действия: `alert_acknowledged`, `maintenance_completed`, `widget_added`, `settings_changed`
- Поля: `id, action, userId, userName, equipmentId, details, timestamp`

### 5.3 Новые API-модули

| Модуль | Функции |
|--------|---------|
| src/api/maintenance.js | `getSchedule(equipmentId)`, `getChecklist(equipmentId, type)`, `completeChecklistItem(id)` |
| src/api/audit.js | `getLog({ equipmentId, userId, from, to, limit })`, `addEntry(entry)` |

### 5.4 Новый store

**maintenanceStore** (`src/stores/maintenance.js`, composition API):

| Состояние | Тип | Назначение |
|----------|-----|------------|
| schedule | ref({}) | График ТО по equipmentId |
| checklist | ref([]) | Текущий чек-лист |
| loading | ref(false) | |

| Действие | Описание |
|----------|----------|
| loadSchedule(equipmentId) | Загрузка графика ТО |
| loadChecklist(equipmentId, type) | Загрузка чек-листа |
| toggleChecklistItem(id) | Отметка выполнения операции |
| getNextMaintenance(equipmentId) | Ближайшее ТО |

### 5.5 Новые виджеты

| Тип | Размер | requiresSensor | Описание |
|-----|--------|---------------|----------|
| maintenance-timeline | 6×4 | false | Горизонтальная шкала цикла ТО с маркером наработки |
| subsystem-health | 4×3 | false | 4 прогресс-бара подсистем (зелёный > 80%, жёлтый 50-80%, красный < 50%) |

---

## 6. Мобильная адаптивность

### 6.1 Брейкпоинты

| Брейкпоинт | Диапазон | Устройство |
|-----------|----------|------------|
| xs | < 640px | Телефон |
| sm | 640-767px | Большой телефон |
| md | 768-1023px | Планшет |
| lg | 1024-1279px | Ноутбук |
| xl | 1280+ | Десктоп (основной) |

### 6.2 Адаптация по компонентам

| Компонент | xl (десктоп) | < xl (мобильный) |
|-----------|-------------|-----------------|
| Sidebar | Collapsed 56px / expanded 220px | Sheet по гамбургеру |
| Header | Лого + breadcrumbs \| часы + алерты + аватар | Гамбургер + лого \| badge + аватар |
| Карточки оборудования | 4 колонки | 1 колонка (горизонтальные) |
| Метрики | 4-5 в ряд, text-4xl | 2 в ряд, text-2xl |
| Таблицы | Полные | Card-view (каждая строка — карточка) |
| Графики | 300px, полные подписи | 200px, сокращённые подписи |
| Табы (EquipmentDetail) | Горизонтальные | overflow-x-auto (свайп) |
| Grid-layout (Dashboard) | 12 колонок, drag-and-drop | 1 колонка, drag отключён |
| Модалки | Centered Dialog | Sheet снизу, max-height 90vh |

### 6.3 Touch-оптимизация

- Минимальный размер кнопок: 44×44px
- Увеличенные padding на интерактивных элементах
- Swipe-жесты реализуются через нативные Pointer Events (без внешних библиотек) — простой composable `useSwipe()` с порогом 50px для dismiss и переключения табов

### 6.4 Composable useBreakpoint()

Новый composable `src/composables/useBreakpoint.js`:
- Реактивные `isMobile`, `isTablet`, `isDesktop`
- Resize listener с debounce
- Используется для: таблица ↔ card-view, grid cols (12/6/1), условный рендер тяжёлых графиков

---

## 7. Файловая структура после рефакторинга

```
src/
├── api/
│   ├── client.js
│   ├── auth.js
│   ├── equipment.js
│   ├── sensors.js
│   ├── alerts.js
│   ├── dashboards.js
│   ├── parts.js
│   ├── maintenance.js          ← НОВЫЙ
│   ├── audit.js                ← НОВЫЙ
│   └── mock/
│       ├── equipment.js        (расширен: operatingHours, subsystemHealth)
│       ├── alerts.js           (расширен: type 'maintenance')
│       ├── dashboards.js
│       ├── parts.js
│       ├── history.js
│       ├── maintenance.js      ← НОВЫЙ
│       └── audit.js            ← НОВЫЙ
├── assets/
│   ├── main.css
│   ├── theme.css               (переработан: новая палитра, radius, shadows)
│   └── fonts.css
├── components/
│   ├── layout/                 ← НОВАЯ ПАПКА
│   │   ├── AppSidebar.vue
│   │   ├── AppHeader.vue
│   │   ├── AppBreadcrumb.vue
│   │   └── AppFooter.vue       (упрощён)
│   ├── AppLogo.vue
│   ├── (AppNavigation.vue — УДАЛИТЬ, заменяется AppSidebar)
│   ├── ThemeToggle.vue
│   ├── ConnectionStatus.vue
│   ├── CriticalAlertModal.vue  (на shadcn Dialog)
│   ├── LiveDataIndicator.vue
│   ├── MetricCard.vue          (на shadcn Card)
│   ├── StatusIndicator.vue
│   ├── EquipmentCard.vue       (обновлён: датчики на карточке)
│   ├── DataTable.vue           (на shadcn Table)
│   ├── ChartWidget.vue
│   ├── LoadingSpinner.vue
│   ├── equipment/              ← НОВАЯ ПАПКА
│   │   ├── EquipmentHeader.vue
│   │   ├── EquipmentMetrics.vue
│   │   ├── EquipmentCharts.vue
│   │   ├── EquipmentStatusBars.vue
│   │   ├── EquipmentSpecs.vue
│   │   ├── EquipmentParts.vue
│   │   └── SensorHistoryExplorer.vue
│   ├── analytics/              ← НОВАЯ ПАПКА
│   │   ├── AnalyticsPeriodSelector.vue
│   │   ├── AnalyticsKPICards.vue
│   │   ├── AnalyticsCharts.vue
│   │   ├── EfficiencyTable.vue
│   │   └── MaintenanceStats.vue
│   ├── home/                   ← НОВАЯ ПАПКА
│   │   ├── HomeMetricsPanel.vue
│   │   ├── HomeCharts.vue
│   │   └── HomeEquipmentGrid.vue
│   ├── settings/               ← НОВАЯ ПАПКА
│   │   ├── SettingsDisplay.vue
│   │   ├── SettingsNotifications.vue
│   │   ├── SettingsThresholds.vue
│   │   ├── SettingsSecurity.vue
│   │   └── SettingsSystem.vue
│   ├── widgets/
│   │   ├── widgetRegistry.js   (+ 2 новых типа)
│   │   ├── WidgetWrapper.vue
│   │   ├── AddWidgetModal.vue  (на shadcn Dialog)
│   │   ├── NumericWidget.vue
│   │   ├── LineChartWidget.vue
│   │   ├── GaugeWidget.vue
│   │   ├── SensorHistoryWidget.vue
│   │   ├── InfoWidget.vue
│   │   ├── StatusWidget.vue
│   │   ├── SpecsWidget.vue
│   │   ├── ServiceHistoryWidget.vue
│   │   ├── PartsWidget.vue
│   │   ├── MaintenanceTimelineWidget.vue  ← НОВЫЙ
│   │   └── SubsystemHealthWidget.vue      ← НОВЫЙ
│   └── ui/                     (shadcn-vue компоненты)
│       ├── button/
│       ├── card/
│       ├── dialog/
│       ├── input/
│       ├── select/
│       ├── switch/
│       ├── table/
│       ├── tabs/
│       ├── badge/
│       ├── breadcrumb/
│       ├── dropdown-menu/
│       ├── tooltip/
│       ├── separator/
│       ├── sheet/
│       └── radio-group/
├── composables/
│   ├── useClock.js
│   ├── useTheme.js
│   ├── useChartColors.js       (обновлён: новая палитра)
│   ├── useLiveData.js
│   ├── useThresholdMonitor.js
│   ├── useBreakpoint.js        ← НОВЫЙ
│   └── useSwipe.js             ← НОВЫЙ (Pointer Events, порог 50px)
├── layouts/
│   ├── DefaultLayout.vue       (переработан: sidebar + slim header)
│   └── AuthLayout.vue
├── router/
│   └── index.js                (route meta для breadcrumbs)
├── stores/
│   ├── auth.js
│   ├── equipment.js
│   ├── sensors.js
│   ├── alerts.js
│   ├── dashboards.js
│   ├── connection.js
│   └── maintenance.js          ← НОВЫЙ
├── utils/
│   └── constants.js            ← НОВЫЙ
├── views/
│   ├── LoginView.vue
│   ├── HomeView.vue            (рефакторинг → оркестратор)
│   ├── DashboardView.vue       (обновлён)
│   ├── EquipmentListView.vue   (обновлён)
│   ├── EquipmentDetailView.vue (рефакторинг → оркестратор + табы)
│   ├── EquipmentDashboardView.vue (обновлён)
│   ├── AlertsView.vue          (обновлён: timeline + maintenance)
│   ├── AnalyticsView.vue       (рефакторинг → оркестратор)
│   └── SettingsView.vue        (рефакторинг → оркестратор + табы)
├── App.vue
└── main.js
```

---

## 8. Что НЕ входит в Фазу 1

- Реальный бэкенд / WebSocket (Фаза 2)
- RBAC — ролевая модель (Фаза 2)
- Push-уведомления / Telegram (Фаза 2)
- PWA / Service Worker / оффлайн (Фаза 3)
- Предиктивная аналитика / ML (Фаза 4)
- vue-i18n / многоязычность (Фаза 4)

---

## 9. Критерии завершённости Фазы 1

1. Все view-компоненты разбиты на подкомпоненты (ни один view > 100 строк)
2. Дизайн-система полностью применена (новые цвета, radius, shadows, typography)
3. Sidebar-навигация с breadcrumbs работает на всех маршрутах
4. shadcn-vue компоненты интегрированы (Button, Card, Dialog, Table, Tabs, Switch, Input, Badge, Sheet, DropdownMenu, Tooltip, Breadcrumb, Select, RadioGroup, Separator)
5. Новые mock-данные: наработка, здоровье подсистем, чек-листы ТО, журнал аудита
6. Новые виджеты: maintenance-timeline, subsystem-health
7. maintenanceStore работает с mock API
8. Вкладка «ТО» в EquipmentDetailView показывает цикл обслуживания из регламента
9. Мобильная адаптивность: sidebar → Sheet, таблицы → card-view, grid → 1 колонка
10. `npm run lint && npm run format` проходит без ошибок
11. `npm run build` собирается успешно
