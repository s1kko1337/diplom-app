# Mock Runtime — дизайн персистентной мок-системы

**Дата:** 2026-04-16
**Статус:** утверждён через brainstorming
**Автор:** S.Miko

## Цель

Превратить разрозненный mock-слой в формализованную, структурированную, расширяемую систему с персистентностью между сессиями. Демо-сценарии (пользователи, наряды, отчёты, настройки, дашборды) должны переживать F5 и изолироваться per-user.

## Контекст

Сейчас из 9 mock-файлов только `dashboards.js` использует localStorage. Остальное живёт в `let`/`const` переменных модулей и теряется при перезагрузке. Настройки в 4 компонентах `settings/*.vue` пишут напрямую в localStorage мимо API-слоя и не привязаны к пользователю. Сущность «отчёт» отсутствует. Аудит-лог обнуляется при F5. Итог: демо-сценарии нестабильны, а обновление структуры данных требует правок в 8+ разных файлах.

## Требования

### Функциональные

1. Все mock-сущности (equipment, orders, alerts, journal, audit, parts, users) персистентны через localStorage.
2. Настройки и дашборды привязаны к `userId`. Переключение пользователя даёт его собственные данные.
3. Новая сущность `report` с 4 типами: `maintenance_completion`, `incident_report`, `shift_report`, `analytics_summary`. Страница `/reports` со списком, фильтрами и детальным просмотром.
4. Авто-генерация отчёта `maintenance_completion` при закрытии наряда (`approveOrder`).
5. Логин через dropdown с выбором одного из 4 пользователей (пароль любой).
6. Кнопка «Сбросить демо» в Settings → Система + query-параметр `?demo-reset=1`.
7. Настройки компонентов `settings/*.vue` не обращаются к localStorage напрямую — только через стор.
8. Миграция существующих ключей localStorage (settings_*, theme, rudgormash_dashboards) при первом запуске после деплоя.

### Нефункциональные

- Обновление структуры сид-данных: правка одного seed-файла + бамп `schemaVersion` → автоматическое ресидирование.
- Добавление новой сущности: один `defineCollection()` + seed-файл.
- Аудит-лог без лимита размера.
- Lazy hydration: seed подгружается только при первом `read()`.

## Архитектура

### Слой Runtime (`src/api/mock/_runtime.js`)

Единственный модуль, работающий с localStorage.

**API:**

```js
defineCollection({ name, scope, schemaVersion, seed })
// name: string — имя коллекции
// scope: 'global' | 'user'
// schemaVersion: number — бамп вызывает ресидирование
// seed: () => data — фабрика начальных данных

read(name)                // → актуальные данные (массив/объект)
write(name, data)         // перезаписать коллекцию целиком
patch(name, id, fields)   // найти элемент массива по id, merge полей
remove(name, id)          // удалить элемент массива по id
append(name, item)        // добавить элемент в массив

resetCollection(name)     // удалить ключ, при следующем read → ресидирование
resetAll()                // удалить все rgm:* ключи + старые ключи миграции
```

**Ключи в localStorage:**

- Global scope: `rgm:v{schemaVersion}:{name}` → `rgm:v1:orders`
- User scope: `rgm:v{schemaVersion}:user:{userId}:{name}` → `rgm:v1:user:user-1:preferences`
- Метаданные: `rgm:meta:{name}` → `{ "schemaVersion": 1 }` (детектор бампа)

**Логика `read(name)`:**

1. Прочитать `rgm:meta:{name}`. Если версия отличается от зарегистрированной или ключа нет → удалить старые данные коллекции, записать seed, обновить meta.
2. Для `scope: 'user'` — получить `userId` из `localStorage.getItem('auth_user_id')`. Если пользователь не залогинен → вернуть результат seed (без записи).
3. Вернуть распарсенные данные.

### Слой Seed (`src/api/mock/seed/`)

Чистые данные, вынесенные из текущих mock-файлов.

```
seed/
├── equipment.seed.js      # 8 станков (полная копия из equipment.js)
├── orders.seed.js         # 5–6 нарядов в разных статусах
├── alerts.seed.js         # 9 уведомлений
├── journal.seed.js        # 7 записей журнала ТС
├── audit.seed.js          # 10 записей аудит-лога
├── parts.seed.js          # 9 замен запчастей
├── users.seed.js          # 4 пользователя
├── checklists.seed.js     # Чек-листы ЕО, ТО-1, ТО-2, ТО-3, ТР-1, КР
├── reports.seed.js        # 8 отчётов (по 2 каждого типа)
├── dashboards.seed.js     # Дефолтный конфиг виджетов
└── preferences.seed.js    # Дефолтные пользовательские настройки
```

**Формат:** каждый файл экспортирует `createSeed()` — фабрику, возвращающую свежую копию данных при каждом вызове. Константы не использовать — ресидирование не должно возвращать мутированный объект.

**Правило обновления демо:** правка seed-файла + бамп `schemaVersion` в соответствующем `defineCollection()`.

### Слой Mock (`src/api/mock/*.js`)

Публичный API-интерфейс mock-файлов остаётся неизменным. Внутренности заменяются на вызовы runtime.

**Пример миграции `alerts.js`:**

```js
// До
let alertsDb = [...seed]
let alertIdCounter = 10

// После
import { defineCollection, read, append } from './_runtime'
import { createSeed } from './seed/alerts.seed'

defineCollection({ name: 'alerts', scope: 'global', schemaVersion: 1, seed: createSeed })

export function getAlerts(equipmentId) {
  const data = read('alerts')
  return equipmentId ? data.filter(a => a.equipmentId === equipmentId) : [...data]
}

export function addAlert(alert) {
  const data = read('alerts')
  const nextId = computeNextId(data)
  append('alerts', { id: `alert-${nextId}`, ...alert })
}
```

**Карта миграции:**

| Mock-файл | Коллекция | Scope | Комментарий |
|-----------|-----------|-------|-------------|
| equipment.js | `equipment` | global | `equipmentDb` объект конвертируется в массив |
| alerts.js | `alerts` | global | Убрать `alertIdCounter`, вычислять из данных |
| journal.js | `journal` | global | Убрать `nextId`, вычислять |
| audit.js | `audit` | global | Без лимита |
| maintenance.js | `orders` + `checklists` | global | Две отдельные коллекции |
| parts.js | `parts` | global | — |
| dashboards.js | `dashboards` | user | Перевод scope с global на user |
| users.js | `users` | global | Read-only, но через runtime для единообразия |

`history.js` не мигрирует — генерит данные на лету, хранить нечего.

API-обёртки в `src/api/*.js` не меняются. Они продолжают оборачивать вызовы mock-функций через `request()`.

### Per-user preferences

**Новая коллекция `preferences`** (scope: user):

```js
{
  display: {
    language: 'ru', refreshRate: 5, autoUpdate: true,
    showTimestamps: false, compactMode: false
  },
  notifications: {
    criticalAlerts: true, warnings: true, infoMessages: false,
    emailNotifications: true, email: ''
  },
  thresholds: {
    maxTemp: 95, maxVibration: 1.5, maxPower: 95,
    toolWear: 70, minFuel: 25, maxPressure: 150
  },
  security: { twoFactor: true },
  theme: 'dark'
}
```

**Новые файлы:**

- `src/api/mock/preferences.js` — `getPreferences()`, `updatePreferences(section, data)`
- `src/api/preferences.js` — обёртка через `request()`
- `src/stores/preferences.js` — Pinia composition стор

**Стор `usePreferencesStore`:**

```js
defineStore('preferences', () => {
  const preferences = ref(null)
  const loading = ref(false)

  async function load() { /* api.getPreferences() */ }
  async function save(section, data) { /* api.updatePreferences(section, data) */ }
  async function reset() { /* api.resetPreferences() */ }

  const display = computed(() => preferences.value?.display ?? DEFAULTS.display)
  const notifications = computed(() => preferences.value?.notifications ?? DEFAULTS.notifications)
  const thresholds = computed(() => preferences.value?.thresholds ?? DEFAULTS.thresholds)
  const security = computed(() => preferences.value?.security ?? DEFAULTS.security)
  const theme = computed(() => preferences.value?.theme ?? 'dark')

  return { load, save, reset, display, notifications, thresholds, security, theme, loading }
})
```

**Рефакторинг settings-компонентов:** из `SettingsDisplay.vue`, `SettingsNotifications.vue`, `SettingsThresholds.vue`, `SettingsSecurity.vue` удалить прямые `localStorage.getItem/setItem`. Читать из `usePreferencesStore()`, писать через `preferencesStore.save(section, data)`.

**`useTheme` composable:** читает `preferencesStore.theme`. `applyTheme(value)` вызывает `preferencesStore.save('theme', value)`.

### Per-user дашборды

**Смена scope коллекции `dashboards` с global на user.**

Формат данных остаётся тем же: объект `{ [equipmentId]: { widgets, layout } }`. Ключ localStorage теперь включает userId: `rgm:v1:user:{userId}:dashboards`. Каждый пользователь получает независимую раскладку. При первом открытии дашборда оборудования вызывается `getDefaultConfig(equipmentId)` как сейчас.

### Миграция существующих ключей

При инициализации runtime (единоразово, при первом `read()` каждой затронутой коллекции) выполняется проверка старых ключей:

| Старый ключ | Новая коллекция | Действие |
|-------------|-----------------|----------|
| `settings_display` | `preferences.display` | Скопировать, удалить старый |
| `settings_notifications` | `preferences.notifications` | Скопировать, удалить старый |
| `settings_thresholds` | `preferences.thresholds` | Скопировать, удалить старый |
| `settings_security` | `preferences.security` | Скопировать, удалить старый |
| `theme` | `preferences.theme` | Скопировать, удалить старый |
| `rudgormash_dashboards` | `dashboards` (user-scoped) | Скопировать в preferences текущего юзера, удалить старый |

Ключи `auth_token` и `auth_user_id` остаются без изменений — это ортогональная механика.

### Reports

**Схема:**

```js
{
  id: 'report-1',
  type: 'maintenance_completion',   // | 'incident_report' | 'shift_report' | 'analytics_summary'
  status: 'published',              // | 'draft'
  title: 'Акт выполнения ТО-2 — БУР-12',
  summary: 'Плановое ТО-2 выполнено в полном объёме…',
  createdBy: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
  equipmentId: 'bur-12',            // null для analytics_summary
  orderId: 'order-1',               // только для maintenance_completion
  alertId: 'alert-3',               // только для incident_report
  createdAt: '2026-03-10T14:30:00',
  publishedAt: '2026-03-10T15:00:00',
  payload: { /* зависит от type */ }
}
```

**Структура `payload` по типам:**

- `maintenance_completion` — снапшот наряда: шаги чек-листа, исполнители, использованные материалы, время выполнения, замечания.
- `incident_report` — описание инцидента, первопричина, принятые меры, рекомендации.
- `shift_report` — смена (день/ночь), дата, статус оборудования, выполненные работы, замечания.
- `analytics_summary` — период (from/to), ключевые метрики, тренды, выводы.

**Новые файлы:**

```
src/api/mock/seed/reports.seed.js   # 8 примеров (по 2 каждого типа)
src/api/mock/reports.js             # CRUD через runtime
src/api/reports.js                  # обёртка через request()
src/stores/reports.js               # Pinia стор
src/views/ReportsView.vue           # список + фильтры
src/views/ReportDetailView.vue      # детальный просмотр + печать
```

**Маршруты:**

```js
{ path: '/reports', name: 'reports', component: () => import('@/views/ReportsView.vue') }
{ path: '/reports/:id', name: 'report-detail', component: () => import('@/views/ReportDetailView.vue') }
```

Оба — lazy-load, `meta: { requiresAuth: true }`. Пункт «Отчёты» добавляется в сайдбар `DefaultLayout.vue` между «Аналитика» и «Настройки».

**Авто-генерация:** `useMaintenanceStore.approveOrder()` после успешного закрытия наряда вызывает `reportsStore.createReport({ type: 'maintenance_completion', orderId, equipmentId, payload })`. Отчёт создаётся в статусе `published` со снапшотом наряда.

### Логин с выбором пользователя

**Изменения `LoginView.vue`:**

- Добавлен `<select>` с опциями из `users.seed.js` (4 пользователя, отображается `{name} — {role}`).
- Поля «логин» и «пароль» остаются (для реалистичности демо), но mock принимает любые значения.
- Выбранный пользователь определяет `userId` при вызове `auth.login({ userId, username, password })`.

**Изменения `api/auth.js`:**

- `login({ userId })` — использует переданный `userId` для поиска пользователя в коллекции `users`.
- После успешного логина вызывается `preferencesStore.load()` для подгрузки настроек этого пользователя.

### Сброс демо

**Кнопка в `SettingsSystem.vue`:**

- Заголовок секции: «Демо-данные».
- Текст: «Сбросить все демо-данные к начальному состоянию. Настройки, наряды, отчёты, уведомления и дашборды будут удалены.»
- Кнопка «Сбросить демо» → модалка подтверждения → `runtime.resetAll()` → `location.reload()`.

**Query-параметр:** в `App.vue` на старте проверяется `route.query['demo-reset']`. Если `1` — вызов `runtime.resetAll()`, удаление параметра из URL через `router.replace()`, перезагрузка.

## Поток данных

```
Component (settings, dashboard, reports view)
     ↓
Pinia store (auth, preferences, dashboards, reports, …)
     ↓
API wrapper (api/*.js) → request() с delay/timeout
     ↓
Mock file (mock/*.js) — публичные CRUD-функции
     ↓
Runtime (_runtime.js) — read/write/patch/append
     ↓
localStorage (rgm:v1:*, rgm:v1:user:{userId}:*)
```

Аудит-записи из сторов пишутся через `useMaintenanceStore` → `api/audit.addAuditEntry()` → `mock/audit.js` → runtime. Без лимита размера.

## Обработка ошибок

- `read()` при некорректном JSON в localStorage → лог warning, fallback на seed, перезапись.
- `write()` при превышении квоты localStorage → лог warning, бросить `ApiError(507, 'Переполнение хранилища')`.
- `resetAll()` — идемпотентный, безопасный, независимо от состояния.
- `login()` с `userId`, которого нет в seed → `ApiError(404, 'Пользователь не найден')`.

## Тестирование

Ручная проверка демо-сценариев:

1. Логин как Иванов, настройка порогов → F5 → пороги сохранены.
2. Логин как Петров → свои настройки, настройки Иванова не видны.
3. Закрытие наряда → автоматически появляется отчёт в `/reports`.
4. Редактирование дашборда БУР-12 у Иванова → у Петрова тот же станок открывается с дефолтной раскладкой.
5. Создание инцидента → генерация `incident_report` (ручная через UI).
6. Нажатие «Сбросить демо» → подтверждение → всё в начальном состоянии.
7. Открытие `?demo-reset=1` → тот же эффект без UI.
8. Бамп `schemaVersion` коллекции `orders` с 1 до 2 → после F5 наряды перезаписаны из нового seed.

## Фазы реализации

- **Фаза A — Фундамент.** Runtime, seed-файлы, миграция старых ключей, кнопка сброса.
- **Фаза B — Миграция сущностей.** Equipment, orders, alerts, journal, audit, parts, users, checklists, dashboards переведены на runtime.
- **Фаза C — Preferences.** Коллекция preferences, стор, рефакторинг settings-компонентов, миграция `useTheme`.
- **Фаза D — Reports.** Сущность, коллекция, API, стор, маршруты, страницы, авто-генерация.
- **Фаза E — Логин.** Dropdown пользователей в `LoginView.vue`.
- **Фаза F — Документация.** Секция в `CLAUDE.md` с описанием runtime API и шагов «как добавить новую сущность».

## Открытые вопросы

Нет. Все ключевые решения зафиксированы в брейншторме:

- Подход — единый runtime с реестром коллекций (A).
- Объём — все фазы A-F сразу.
- Per-user — дашборды и preferences.
- Отчёты — все 4 типа.
- Логин — dropdown выбора пользователя.
- Сброс — кнопка + query-параметр.
- Аудит — без лимита.
- Reports — отдельная страница `/reports`.
