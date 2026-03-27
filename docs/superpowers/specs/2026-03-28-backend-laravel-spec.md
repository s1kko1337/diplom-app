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

---

## 2. Инфраструктура: Docker Compose

### Сервисы

| Сервис | Образ | Порт | Назначение |
|--------|-------|------|------------|
| `app` | PHP 8.3-FPM + Laravel | — | Основное приложение |
| `nginx` | nginx:alpine | 8000 | Reverse proxy → app |
| `db` | postgres:16-alpine | 5432 | База данных |
| `reverb` | (тот же app-образ) | 8080 | WebSocket сервер (`artisan reverb:start`) |

### Детали

- Один `Dockerfile` для PHP (app, reverb, simulator используют один образ)
- `simulator` запускается как artisan-команда в отдельном процессе или контейнере
- `.env` управляет конфигурацией (DB credentials, Reverb host/port, Sanctum domain)
- `Makefile` для удобства: `make up`, `make down`, `make migrate`, `make seed`, `make fresh`, `make test`
- Volume `postgres_data` — персистентность БД между рестартами
- Код монтируется bind-mount для hot-reload при разработке

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
| subsystem_health | jsonb | `{hydraulic, electrical, mechanical, compressor}` — 0-100 |
| created_at, updated_at | timestamps | |

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
Самая быстрорастущая таблица. В будущем можно партиционировать по времени.

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
| type | enum | ЕО, ТО-1, ТО-2, ТО-3, ТР-1, ТР-2, ТР-3, КР |
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

#### checklist_templates
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | bigint PK | |
| type | enum | ЕО, ТО-1, ТО-2, ТО-3, ТР-1, ТР-2, ТР-3, КР |
| sort_order | integer | |
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
| action | string | Тип действия |
| equipment_id | FK equipment nullable | |
| details | text nullable | |
| created_at | timestamp | |

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

### Связи (Eloquent)

```
Equipment hasMany SensorDefinition
Equipment hasMany EquipmentSpec
Equipment hasMany Alert
Equipment hasMany MaintenanceOrder
Equipment hasMany JournalEntry
Equipment hasMany PartsReplacement
Equipment hasMany ServiceHistory
Equipment hasMany DashboardConfig

SensorDefinition hasMany SensorReading
SensorDefinition hasMany Alert

MaintenanceOrder belongsTo Equipment
MaintenanceOrder belongsTo User (createdBy)
MaintenanceOrder belongsTo User (assignedTo)
MaintenanceOrder belongsTo User (reviewedBy)
MaintenanceOrder hasMany MaintenanceStep

MaintenanceStep belongsTo MaintenanceOrder
MaintenanceStep hasMany StepMeasurement
MaintenanceStep hasMany StepMaterial

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
| GET | `/api/maintenance/templates` | Все шаблоны (`?type=`) | Все |
| GET | `/api/maintenance/templates/{type}` | Шаблон конкретного типа | Все |
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
| `ThresholdExceeded` | `CreateAlert`, `BroadcastAlert` | Алерт в БД + WS push |
| `OrderStatusChanged` | `LogAuditEntry` | Запись в аудит |
| `OrderApproved` | `CreateJournalEntry`, `LogAuditEntry` | Журнал тех. состояния + аудит |

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
│   │   └── ServiceHistory.php
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
│   │       └── ServiceHistoryResource.php
│   │
│   ├── Events/
│   │   ├── SensorReadingRecorded.php
│   │   ├── ThresholdExceeded.php
│   │   ├── OrderStatusChanged.php
│   │   └── OrderApproved.php
│   │
│   ├── Listeners/
│   │   ├── CheckThresholds.php
│   │   ├── CreateAlert.php
│   │   ├── BroadcastAlert.php
│   │   ├── BroadcastSensorReading.php
│   │   ├── LogAuditEntry.php
│   │   └── CreateJournalEntry.php
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
│   │   └── MaintenanceType.php
│   │
│   └── Console/Commands/
│       └── SimulateSensors.php
│
├── database/
│   ├── migrations/ (20+ миграций)
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── RoleSeeder.php
│   │   ├── UserSeeder.php
│   │   ├── EquipmentSeeder.php
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
