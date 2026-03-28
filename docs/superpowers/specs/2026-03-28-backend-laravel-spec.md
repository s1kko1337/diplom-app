# Бекенд Rudgormash: Laravel + PostgreSQL + Docker

**Дата:** 2026-03-28
**Статус:** Утверждён
**Стек:** Laravel 12, PHP 8.3, PostgreSQL 16, Laravel Reverb, Sanctum, Spatie Permission
**Инфраструктура:** Docker Compose (dev-first, production-ready)

---

## 1. Цели и контекст

Замена mock API фронтенда на полноценный бекенд. Фронтенд (`rudgormash-frontend`) остаётся на моках до готовности бека — переключение на реальный API отдельной задачей.

**Ключевые решения:**
- Backend-first: API-контракт рождается из бекенда
- Два отдельных репозитория: `rudgormash-frontend` и `rudgormash-backend`
- Синхронизация через API-контракт в `rudgormash-backend/docs/api-contract/`
- WebSocket (Laravel Reverb) для real-time данных датчиков
- Симулятор датчиков для демонстрации, архитектура готова к реальным источникам
- Оборудование и датчики полностью динамические (CRUD)

**Каноническая модель статусов:**
Этот бекенд-спек является source of truth. Статусы нарядов: `planned`, `in_progress`, `review`, `completed`, `cancelled` — совпадают с фронтенд-моком (`src/utils/constants.js`). Ранее созданный API-контракт (`docs/api-contract/maintenance-api.md`) использовал другие имена (`draft`, `accepted`, `rejected`) — он устарел и будет заменён новым контрактом из backend-репо.

**Типы ТО — латинские slugs в API:**
В БД и API используются латинские slugs: `EO`, `TO-1`, `TO-2`, `TO-3`, `TR-1`, `TR-2`, `TR-3`, `KR`. Кириллические метки (`ЕО`, `ТО-1`...) — только в presentation layer (фронтенд). Это безопасно для URL, query-параметров и enum-значений.

---

## 2. Инфраструктура: Docker Compose

### Сервисы

| Сервис | Образ | Порт | Назначение |
|--------|-------|------|------------|
| `app` | PHP 8.3-FPM + Laravel | — | Основное приложение |
| `nginx` | nginx:alpine | 8000 | Reverse proxy → app |
| `db` | postgres:16-alpine | 5432 | База данных |
| `redis` | redis:7-alpine | 6379 | Кэш, очереди, сессии |
| `reverb` | (тот же app-образ) | 8080 | WebSocket сервер (`artisan reverb:start`) |
| `worker` | (тот же app-образ) | — | Queue worker (`artisan queue:work`) |

### Детали

- Один `Dockerfile` для PHP (app, reverb, worker, simulator используют один образ)
- `simulator` запускается как artisan-команда в отдельном процессе или контейнере
- `.env` управляет конфигурацией (DB credentials, Reverb host/port, Sanctum stateful domains)
- `Makefile` для удобства: `make up`, `make down`, `make migrate`, `make seed`, `make fresh`, `make test`
- Volumes: `postgres_data` (БД), `redis_data` (персистентность очередей)
- Код монтируется bind-mount для hot-reload при разработке
- **CORS**: Sanctum `stateful` domains настроены в `.env` (`SANCTUM_STATEFUL_DOMAINS=localhost:5173`). Nginx проксирует CORS-заголовки для dev.

---

## 3. База данных

### Таблицы и связи

#### users
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| name | string | ФИО |
| email | string unique | |
| password | string | bcrypt |
| created_at, updated_at | timestamps | |

Связь с ролями через Spatie: `model_has_roles`, `model_has_permissions`.

#### roles (Spatie)
Предустановленные: `admin`, `engineer`, `mechanic`, `foreman`.

#### equipment
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| name | string | Название (БУР-12) |
| model | string | Модель (СБШ-250МНА) |
| serial | string nullable | Серийный номер |
| year | integer nullable | Год выпуска |
| status | enum | working, idle, malfunction, offline |
| operating_hours | decimal | Наработка в часах |
| last_maintenance_at | timestamp nullable | |
| last_maintenance_type | string nullable | Тип последнего ТО (TO-1, TO-2...) |
| last_maintenance_hours | decimal nullable | Наработка при последнем ТО |
| subsystem_health | jsonb | `{hydraulic, electrical, mechanical, compressor}` — 0-100 |
| created_at, updated_at | timestamps | |

**Computed fields (в `EquipmentResource`):**
- `fullModel` — `"{name} {model}"` (e.g. "Буровой станок СБШ-250МНА") — вычисляется из `name` + `model`
- `statusLabel` — человекочитаемая метка статуса (e.g. "В работе", "Неисправен") — из `EquipmentStatus` enum
- `lastMaintenance` — объект `{type, date, hours}` из колонок `last_maintenance_*`

#### equipment_specs
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| equipment_id | FK equipment | |
| label | string | Характеристика |
| value | string | Значение |

#### sensor_definitions
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| equipment_id | FK equipment | |
| type | string | Slug (temp-engine, speed, depth...) |
| label | string | Отображаемое название |
| unit | string | Единица измерения |
| min_value | decimal | Минимум шкалы |
| max_value | decimal | Максимум шкалы |
| warning_threshold | decimal nullable | Порог предупреждения |
| critical_threshold | decimal nullable | Порог критический |
| created_at, updated_at | timestamps | |

#### sensor_readings
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| sensor_definition_id | FK sensor_definitions | |
| value | decimal | Значение |
| timestamp | timestamp | Время измерения |

**Индекс:** `(sensor_definition_id, timestamp)` — основной запрос по истории.
Самая быстрорастущая таблица (~1.6M строк/день при 96 датчиках × 5с интервал).

**Стратегия хранения:**
- Artisan-команда `app:prune-sensor-readings` — удаляет raw-данные старше 30 дней
- Для долгосрочной аналитики — агрегированные данные (часовые/суточные средние) в отдельной таблице `sensor_readings_aggregated` (создаётся во второй итерации если потребуется)
- Команда добавляется в Laravel `schedule()` — ежедневный запуск

#### alerts
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| equipment_id | FK equipment | |
| sensor_definition_id | FK sensor_definitions nullable | |
| type | enum | critical, warning, info, success, maintenance |
| title | string | |
| description | text | |
| value | decimal nullable | Значение датчика при срабатывании |
| threshold | decimal nullable | Порог при срабатывании |
| acknowledged | boolean default false | |
| acknowledged_at | timestamp nullable | |
| acknowledged_by | FK users nullable | |
| timestamp | timestamp | Время алерта |
| created_at | timestamp | |

#### dashboard_configs
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| equipment_id | FK equipment | |
| user_id | FK users | |
| widgets | jsonb | Массив виджетов с layout |
| created_at, updated_at | timestamps | |

**UNIQUE:** `(equipment_id, user_id)` — одна конфигурация на пользователя per станок.

#### maintenance_orders
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| display_id | string unique | Человекочитаемый ID (ТО-001, ТР-015) |
| equipment_id | FK equipment | |
| maintenance_type_id | FK maintenance_types | Тип ТО |
| status | enum | planned, in_progress, review, completed, cancelled |
| created_by | FK users | |
| assigned_to | FK users nullable | |
| reviewed_by | FK users nullable | |
| accepted_by | jsonb nullable | `{name, position}` |
| scheduled_date | date nullable | |
| started_at | timestamp nullable | |
| completed_at | timestamp nullable | |
| reviewed_at | timestamp nullable | |
| operating_hours_at_start | decimal nullable | |
| executors | jsonb nullable | `[{name, position}]` |
| remarks | text nullable | |
| return_reason | text nullable | |
| created_at, updated_at | timestamps | |

#### maintenance_steps
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| maintenance_order_id | FK maintenance_orders | |
| sort_order | integer | Порядок шага |
| description | text | |
| requirement | text nullable | |
| tools | text nullable | |
| status | enum | pending, in_progress, passed, failed, skipped |
| comment | text nullable | |
| started_at | timestamp nullable | |
| completed_at | timestamp nullable | |

#### step_measurements
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| maintenance_step_id | FK maintenance_steps | |
| description | string | Что измеряем |
| unit | string | Единица (мм, °C, %, БАР...) |
| norm | string | Норматив («не более 0.5», «12-15»...) |
| fact | string nullable | Фактическое значение |
| passed | boolean nullable | Соответствие норме |

#### step_materials
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| maintenance_step_id | FK maintenance_steps | |
| name | string | Название материала |
| unit | string | Единица (л, кг, шт) |
| volume | string nullable | Объём/количество |
| brand | string nullable | Марка |

#### maintenance_types
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| slug | string unique | Латинский slug (EO, TO-1, TO-2, TO-3, TR-1, TR-2, TR-3, KR) |
| label | string | Человекочитаемое название ("Ежесменное обслуживание", "Техническое обслуживание №1"...) |
| estimated_duration_minutes | integer nullable | Ориентировочная продолжительность |
| sort_order | integer default 0 | Порядок отображения |

Lookup-таблица: 8 записей, заполняется `MaintenanceTypeSeeder`. Используется как FK в `checklist_templates`, `maintenance_orders`, `maintenance_schedule`.

#### checklist_templates
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| maintenance_type_id | FK maintenance_types | Тип ТО |
| sort_order | integer | Порядок шага внутри типа |
| description | text | |
| requirement | text nullable | |
| tools | text nullable | |

#### checklist_template_measurements
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| checklist_template_id | FK checklist_templates | |
| description | string | |
| unit | string | |
| norm | string | |

#### checklist_template_materials
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| checklist_template_id | FK checklist_templates | |
| name | string | |
| unit | string | |

#### journal_entries
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| equipment_id | FK equipment | |
| maintenance_order_id | FK maintenance_orders nullable | |
| date | date | |
| time | time | |
| description | text | |
| clearance | string nullable | Допуск к эксплуатации |
| author_name | string | |
| created_at | timestamp | |

#### audit_log
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| user_id | FK users | |
| action | string | Тип действия (см. список ниже) |
| equipment_id | FK equipment nullable | |
| details | text nullable | |
| created_at | timestamp | |

**Типы action:** `login`, `logout`, `maintenance_order_created`, `maintenance_order_started`, `maintenance_order_submitted`, `maintenance_order_approved`, `maintenance_order_returned`, `maintenance_order_cancelled`, `alert_acknowledged`, `widget_added`, `widget_removed`, `settings_changed`, `equipment_created`, `equipment_updated`.

**В `AuditLogResource`:** поле `userName` вычисляется из связи `user.name`.

#### parts_replacements
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| equipment_id | FK equipment | |
| date | date | |
| part_name | string | |
| part_number | string nullable | |
| is_original | boolean default true | |
| replaced_by | string | ФИО заменившего |

#### service_history
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| equipment_id | FK equipment | |
| date | date | |
| type | string | Тип обслуживания |
| status | string | Результат |

**Lifecycle:** Запись создаётся автоматически в listener `CreateServiceHistoryEntry` при событии `OrderApproved`. Также создаётся через seeder для начальных данных. Это денормализация для быстрого отображения в карточке станка без join на `maintenance_orders`.

#### maintenance_schedule
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| equipment_id | FK equipment | |
| maintenance_type_id | FK maintenance_types | Тип ТО |
| scheduled_date | date nullable | Плановая дата |
| scheduled_hours | decimal nullable | Плановая наработка |
| status | enum | planned, overdue, completed |
| created_at, updated_at | timestamps | |

**Lifecycle:** Создаётся при добавлении оборудования (начальный план-график). Обновляется при завершении наряда соответствующего типа.

### Связи (Eloquent)

```
Equipment hasMany SensorDefinition
Equipment hasMany EquipmentSpec
Equipment hasMany Alert
Equipment hasMany MaintenanceOrder
Equipment hasMany JournalEntry
Equipment hasMany PartsReplacement
Equipment hasMany ServiceHistory
Equipment hasMany MaintenanceSchedule
Equipment hasMany DashboardConfig

SensorDefinition hasMany SensorReading
SensorDefinition hasMany Alert

MaintenanceOrder belongsTo Equipment
MaintenanceOrder belongsTo MaintenanceType
MaintenanceOrder belongsTo User (createdBy)
MaintenanceOrder belongsTo User (assignedTo)
MaintenanceOrder belongsTo User (reviewedBy)
MaintenanceOrder hasMany MaintenanceStep

MaintenanceStep belongsTo MaintenanceOrder
MaintenanceStep hasMany StepMeasurement
MaintenanceStep hasMany StepMaterial

MaintenanceType hasMany ChecklistTemplate
MaintenanceType hasMany MaintenanceOrder
MaintenanceType hasMany MaintenanceSchedule

ChecklistTemplate belongsTo MaintenanceType
ChecklistTemplate hasMany ChecklistTemplateMeasurement
ChecklistTemplate hasMany ChecklistTemplateMaterial

DashboardConfig belongsTo Equipment
DashboardConfig belongsTo User

User hasMany MaintenanceOrder (created)
User hasMany MaintenanceOrder (assigned)
User hasMany AuditLog
```

---

## 4. API эндпоинты

### Auth
| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| POST | `/api/auth/login` | Логин → Sanctum token | Нет |
| POST | `/api/auth/logout` | Отзыв токена | Да |
| GET | `/api/auth/me` | Текущий пользователь + роли + permissions | Да |

### Users
| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| GET | `/api/users` | Список (фильтр `?role=`) | Все |
| GET | `/api/users/{id}` | Один пользователь | Все |
| POST | `/api/users` | Создание | admin |
| PUT | `/api/users/{id}` | Обновление | admin |
| DELETE | `/api/users/{id}` | Удаление | admin |

### Equipment
| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| GET | `/api/equipment` | Список (summary) | Все |
| GET | `/api/equipment/{id}` | Полный + specs + serviceHistory | Все |
| POST | `/api/equipment` | Создание | engineer, admin |
| PUT | `/api/equipment/{id}` | Обновление | engineer, admin |
| DELETE | `/api/equipment/{id}` | Удаление | admin |

### Sensors
| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| GET | `/api/equipment/{id}/sensors` | Определения датчиков | Все |
| POST | `/api/equipment/{id}/sensors` | Добавить датчик | engineer, admin |
| PUT | `/api/sensors/{id}` | Обновить конфигурацию | engineer, admin |
| DELETE | `/api/sensors/{id}` | Удалить | admin |
| GET | `/api/equipment/{id}/sensors/live` | Последние значения (REST fallback) | Все |
| GET | `/api/sensors/{id}/history` | Временной ряд (`?from=&to=&interval=`) | Все |

### WebSocket каналы (Reverb)
| Канал | Событие | Payload |
|-------|---------|---------|
| `equipment.{id}.sensors` | `SensorReading` | `{sensorId, value, timestamp}` |
| `equipment.{id}.alerts` | `AlertCreated` | `{alert object}` |

### Alerts
| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| GET | `/api/alerts` | Список (`?equipment_id=&type=&acknowledged=`) | Все |
| POST | `/api/alerts/{id}/acknowledge` | Подтверждение | Все |
| DELETE | `/api/alerts/{id}` | Удаление | admin |

### Dashboards
| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| GET | `/api/equipment/{id}/dashboard` | Конфигурация виджетов текущего пользователя | Все |
| PUT | `/api/equipment/{id}/dashboard` | Сохранение | Владелец |
| DELETE | `/api/equipment/{id}/dashboard` | Сброс к дефолтам | Владелец |

### Maintenance Orders
| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| GET | `/api/maintenance/orders` | Список (`?equipment_id=&type=&status=&assigned_to=`) | Все |
| GET | `/api/maintenance/orders/{id}` | Наряд + шаги + измерения + материалы | Все |
| POST | `/api/maintenance/orders` | Создание | engineer |
| PATCH | `/api/maintenance/orders/{id}/status` | Переход статуса | По policy |
| DELETE | `/api/maintenance/orders/{id}` | Удаление черновика | admin |

### Maintenance Steps
| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| POST | `/api/maintenance/orders/{id}/steps/{stepId}/start` | Начать шаг | assigned mechanic |
| PATCH | `/api/maintenance/orders/{id}/steps/{stepId}` | Завершить шаг | assigned mechanic |

**Request body для завершения шага:**
```json
{
  "status": "passed|failed|skipped",
  "comment": "optional",
  "measurements": [
    {"id": 1, "fact": "0.3", "passed": true}
  ],
  "materials": [
    {"id": 1, "volume": "5", "brand": "Лукойл"}
  ]
}
```

### Checklist Templates
| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| GET | `/api/maintenance/templates` | Все шаблоны (`?type=EO`) | Все |
| GET | `/api/maintenance/templates/{typeSlug}` | Шаблон по slug типа (e.g. `TO-1`) | Все |
| GET | `/api/maintenance/types` | Список типов ТО (maintenance_types) | Все |
| POST | `/api/maintenance/templates` | Создать | engineer, admin |
| PUT | `/api/maintenance/templates/{id}` | Обновить | engineer, admin |

### Documents
| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| GET | `/api/maintenance/orders/{id}/document` | Данные для акта (JSON) | Все |

### Journal
| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| GET | `/api/journal` | Записи (`?equipment_id=&date_from=&date_to=`) | Все |
| POST | `/api/journal` | Создать запись | foreman, engineer, admin |

### Parts
| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| GET | `/api/equipment/{id}/parts` | Замены запчастей | Все |
| POST | `/api/equipment/{id}/parts` | Добавить замену | engineer, admin |

### Audit
| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| GET | `/api/audit` | Лог действий (`?equipment_id=&limit=`) | admin, engineer |

### Schedule
| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| GET | `/api/equipment/{id}/schedule` | План-график ТО | Все |

**Итого: ~35 эндпоинтов + 2 WebSocket канала.**

### Пагинация
Все collection-эндпоинты (orders, alerts, journal, audit, parts, equipment) поддерживают offset-пагинацию: `?page=1&per_page=20`. Используется Laravel `paginate()` — стандартный формат ответа.

### Формат ответов (JSON envelope)
Используется стандартный формат Laravel `JsonResource`:
- Единичный объект: `{ "data": { ... } }`
- Коллекция с пагинацией: `{ "data": [...], "meta": { "current_page", "last_page", "per_page", "total" }, "links": { "first", "last", "prev", "next" } }`

### Сериализация связей
API Resources раскрывают FK в объекты:
- `MaintenanceOrderResource`: `createdBy`, `assignedTo`, `reviewedBy` → `{ id, name }` (+ `role` для `createdBy`). `type` → slug из `maintenanceType.slug`. Request-ы принимают `created_by_id`, `assigned_to_id` (числовые ID), `type` как slug строку.
- `AuditLogResource`: `userName` вычисляется из `user.name`
- `EquipmentResource`: `lastMaintenance` → `{ type, date, hours }` из колонок `last_maintenance_*`
- `ChecklistTemplateResource`: включает `type` (slug) и `typeLabel` из связи `maintenanceType`

---

## 5. Сервисный слой

### MaintenanceService

State machine нарядов:
```
planned ──→ in_progress ──→ review ──→ completed
    │                         │
    ↓                         ↓
 cancelled              in_progress (возврат)
```

**Методы:**
- `createOrder(data)` — валидация типа, копирование шагов из `checklist_templates` (с measurements/materials), назначение исполнителя, генерация `display_id`
- `transitionStatus(order, newStatus, payload)` — проверка допустимости перехода + побочные эффекты:
  - `→ in_progress`: `started_at`, `operating_hours_at_start`
  - `→ review`: проверка что нет pending/in_progress шагов
  - `→ completed`: `accepted_by`, dispatch `OrderApproved` event
  - `→ cancelled`: dispatch `OrderStatusChanged`
  - возврат `→ in_progress`: `return_reason`, сброс failed-шагов в pending
- `startStep(order, step)` — идемпотентность (повторный вызов не меняет `started_at`)
- `completeStep(order, step, data)` — валидация, сохранение measurements/materials, `completed_at`

### SensorService
- `recordReading(sensorDefinition, value)` — запись в `sensor_readings`, dispatch `SensorReadingRecorded`
- `getLatestReadings(equipment)` — последние значения всех датчиков (subquery: max timestamp per sensor)
- `getHistory(sensor, from, to, interval)` — агрегация AVG для прореживания при больших интервалах

### AlertService
- `checkThresholds(sensorDefinition, value)` — сравнение с warning/critical порогами
- `createAlert(data)` — дедупликация: не создавать дубль если уже есть неподтверждённый алерт по тому же `sensor_definition_id` + `type`
- `acknowledge(alert, user)` — `acknowledged = true`, `acknowledged_at`, `acknowledged_by`

### SimulatorService
Artisan-команда `app:simulate-sensors`:
- Цикл: для каждого станка со статусом `working`/`idle` → для каждого датчика → генерация значения с дрифтом → `SensorService::recordReading()`
- Broadcast через Reverb автоматически (через event listener)
- Интервал: 5 секунд (настраивается через аргумент)
- Graceful shutdown через SIGTERM

### DocumentService
- `generateAct(order)` — собирает JSON: станок, шаги с результатами, измерения, материалы, исполнители, подписи
- Фронт рендерит в print-ready HTML (как сейчас)

### AuditService
- `log(action, user, details, equipmentId?)` — единая точка записи

---

## 6. Events & Listeners

| Event | Listener(s) | Что делает |
|-------|-------------|------------|
| `SensorReadingRecorded` | `CheckThresholds`, `BroadcastSensorReading` | Проверка порогов + WS push |
| `ThresholdExceeded` | `BroadcastAlert` | WS push (алерт уже создан в `AlertService::checkThresholds()` → `createAlert()`) |
| `OrderStatusChanged` | `LogAuditEntry` | Запись в аудит |
| `OrderApproved` | `CreateJournalEntry`, `CreateServiceHistoryEntry`, `LogAuditEntry` | Журнал + история обслуживания + аудит |

**Поток алертов:** `CheckThresholds` listener вызывает `AlertService::checkThresholds()`, который при превышении порога создаёт алерт через `createAlert()` и dispatch `ThresholdExceeded`. Отдельный `CreateAlert` listener не нужен — алерт уже в БД.

**Очереди:** Listeners `BroadcastSensorReading`, `CheckThresholds`, `BroadcastAlert` реализуют `ShouldQueue` и обрабатываются через Redis-очередь (сервис `worker`). Это не блокирует симулятор и HTTP-запросы.

---

## 7. Авторизация

### Sanctum
- Token-based auth для SPA
- `POST /api/auth/login` → возвращает plain-text token
- Все защищённые endpoints через `auth:sanctum` middleware
- Token передаётся в `Authorization: Bearer {token}`

### Spatie Permission

**Роли:**
| Роль | Описание |
|------|----------|
| admin | Полный доступ, управление пользователями |
| engineer | Создание нарядов, управление оборудованием и шаблонами |
| mechanic | Выполнение назначенных нарядов |
| foreman | Приёмка нарядов, запись в журнал |

**Policies:**
| Policy | Правила |
|--------|---------|
| `EquipmentPolicy` | view: все; create/update: engineer, admin; delete: admin |
| `MaintenanceOrderPolicy` | view: все; create: engineer; execute: assigned mechanic; review: foreman; cancel: engineer, admin |
| `AlertPolicy` | view: все; acknowledge: все |
| `UserPolicy` | CRUD: admin |
| `DashboardPolicy` | view/update: владелец конфигурации |

---

## 8. Структура проекта

```
rudgormash-backend/
├── docker/
│   ├── nginx/default.conf
│   └── php/Dockerfile
├── docker-compose.yml
├── Makefile
│
├── app/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Equipment.php
│   │   ├── EquipmentSpec.php
│   │   ├── SensorDefinition.php
│   │   ├── SensorReading.php
│   │   ├── Alert.php
│   │   ├── DashboardConfig.php
│   │   ├── MaintenanceOrder.php
│   │   ├── MaintenanceStep.php
│   │   ├── StepMeasurement.php
│   │   ├── StepMaterial.php
│   │   ├── ChecklistTemplate.php
│   │   ├── ChecklistTemplateMeasurement.php
│   │   ├── ChecklistTemplateMaterial.php
│   │   ├── JournalEntry.php
│   │   ├── AuditLog.php
│   │   ├── PartsReplacement.php
│   │   ├── ServiceHistory.php
│   │   ├── MaintenanceSchedule.php
│   │   └── MaintenanceType.php
│   │
│   ├── Services/
│   │   ├── MaintenanceService.php
│   │   ├── SensorService.php
│   │   ├── AlertService.php
│   │   ├── SimulatorService.php
│   │   ├── DocumentService.php
│   │   └── AuditService.php
│   │
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── UserController.php
│   │   │   ├── EquipmentController.php
│   │   │   ├── SensorController.php
│   │   │   ├── AlertController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── MaintenanceOrderController.php
│   │   │   ├── MaintenanceStepController.php
│   │   │   ├── ChecklistTemplateController.php
│   │   │   ├── DocumentController.php
│   │   │   ├── JournalController.php
│   │   │   ├── PartsController.php
│   │   │   ├── ScheduleController.php
│   │   │   └── AuditController.php
│   │   │
│   │   ├── Requests/
│   │   │   ├── Auth/LoginRequest.php
│   │   │   ├── Equipment/
│   │   │   │   ├── StoreEquipmentRequest.php
│   │   │   │   └── UpdateEquipmentRequest.php
│   │   │   ├── Maintenance/
│   │   │   │   ├── StoreOrderRequest.php
│   │   │   │   ├── TransitionStatusRequest.php
│   │   │   │   └── CompleteStepRequest.php
│   │   │   └── Sensor/StoreSensorRequest.php
│   │   │
│   │   └── Resources/
│   │       ├── UserResource.php
│   │       ├── EquipmentResource.php
│   │       ├── EquipmentListResource.php
│   │       ├── SensorDefinitionResource.php
│   │       ├── SensorReadingResource.php
│   │       ├── AlertResource.php
│   │       ├── DashboardConfigResource.php
│   │       ├── MaintenanceOrderResource.php
│   │       ├── MaintenanceOrderListResource.php
│   │       ├── MaintenanceStepResource.php
│   │       ├── StepMeasurementResource.php
│   │       ├── StepMaterialResource.php
│   │       ├── ChecklistTemplateResource.php
│   │       ├── JournalEntryResource.php
│   │       ├── AuditLogResource.php
│   │       ├── PartsReplacementResource.php
│   │       ├── ServiceHistoryResource.php
│   │       ├── MaintenanceScheduleResource.php
│   │       └── MaintenanceTypeResource.php
│   │
│   ├── Events/
│   │   ├── SensorReadingRecorded.php
│   │   ├── ThresholdExceeded.php
│   │   ├── OrderStatusChanged.php
│   │   └── OrderApproved.php
│   │
│   ├── Listeners/
│   │   ├── CheckThresholds.php
│   │   ├── BroadcastAlert.php
│   │   ├── BroadcastSensorReading.php
│   │   ├── LogAuditEntry.php
│   │   ├── CreateJournalEntry.php
│   │   └── CreateServiceHistoryEntry.php
│   │
│   ├── Policies/
│   │   ├── EquipmentPolicy.php
│   │   ├── MaintenanceOrderPolicy.php
│   │   ├── AlertPolicy.php
│   │   ├── UserPolicy.php
│   │   └── DashboardPolicy.php
│   │
│   ├── Enums/
│   │   ├── EquipmentStatus.php
│   │   ├── OrderStatus.php
│   │   ├── StepStatus.php
│   │   ├── AlertType.php
│   │   └── ScheduleStatus.php
│   │
│   └── Console/Commands/
│       ├── SimulateSensors.php
│       └── PruneSensorReadings.php
│
├── database/
│   ├── migrations/ (20+ миграций)
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── RoleSeeder.php
│   │   ├── UserSeeder.php
│   │   ├── EquipmentSeeder.php
│   │   ├── MaintenanceTypeSeeder.php
│   │   ├── ChecklistTemplateSeeder.php
│   │   ├── MaintenanceOrderSeeder.php
│   │   └── AlertSeeder.php
│   └── factories/
│       ├── EquipmentFactory.php
│       ├── MaintenanceOrderFactory.php
│       ├── AlertFactory.php
│       └── JournalEntryFactory.php
│
├── routes/
│   ├── api.php
│   └── channels.php (Reverb channel authorization)
│
└── docs/
    └── api-contract/
        └── api-contract.md
```

---

## 9. Seeders и демо-данные

### RoleSeeder
Роли: admin, engineer, mechanic, foreman.

### UserSeeder
Фиксированные пользователи (совпадают с mock):
- Иванов А.П. — engineer
- Петров С.В. — mechanic
- Сидоров К.М. — mechanic
- Козлов Д.А. — foreman
- admin@rudgormash.ru — admin

### EquipmentSeeder
8 станков с полными данными: specs, 12 датчиков на каждый (type, label, unit, min, max, thresholds).

### MaintenanceTypeSeeder
8 типов ТО:
| slug | label |
|------|-------|
| EO | Ежесменное обслуживание |
| TO-1 | Техническое обслуживание №1 |
| TO-2 | Техническое обслуживание №2 |
| TO-3 | Техническое обслуживание №3 |
| TR-1 | Текущий ремонт №1 |
| TR-2 | Текущий ремонт №2 |
| TR-3 | Текущий ремонт №3 |
| KR | Капитальный ремонт |

### ChecklistTemplateSeeder
Шаблоны для всех 8 типов (ЕО, ТО-1..3, ТР-1..3, КР) с measurements и materials.

### MaintenanceOrderSeeder
7 нарядов в разных статусах (как в mock):
- planned, in_progress (частично выполнен), review, completed, cancelled.

### AlertSeeder
Набор алертов разных типов для демонстрации.

### Factories
Для генерации рандомных данных в произвольном количестве при тестировании.

---

## 10. Тестирование

| Уровень | Что тестируем | Инструмент |
|---------|--------------|------------|
| Unit | Сервисы (state machine, threshold logic, дедупликация) | PHPUnit + Mockery |
| Feature | Endpoints (request → response, auth, validation) | Laravel HTTP tests |
| Integration | Полные сценарии (создание → шаги → review → approve → журнал) | Laravel HTTP tests + DB assertions |

**Фокус на feature-тестах.** Каждый endpoint: happy path + auth + validation errors.

---

## 11. Рабочий процесс

### API-контракт
- Живёт в `rudgormash-backend/docs/api-contract/`
- Markdown с JSON-блоками (не OpenAPI)
- Обновляется при каждом изменении эндпоинтов

### Порядок разработки
1. Docker + инфраструктура
2. Миграции + модели + связи
3. Seeders + factories
4. Сервисы с бизнес-логикой
5. Контроллеры + Form Requests + Resources
6. Events/Listeners
7. WebSocket (Reverb + симулятор)
8. API-контракт

### Агентная разработка
- Backend-репо — основная рабочая директория Claude Code
- Frontend-репо — дополнительная (reference для mock-данных)
- Subagent-driven: независимые задачи параллельно, зависимые — последовательно
