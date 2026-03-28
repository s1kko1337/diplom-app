# Rudgormash Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full Laravel API backend replacing the frontend mock layer — covering auth, equipment, sensors (real-time via WebSocket), alerts, dashboards, maintenance orders with step-level execution, document generation, journal, audit log, and parts tracking.

**Architecture:** Laravel 12 with service layer pattern — thin controllers delegate to service classes for business logic. Sanctum for API token auth, Spatie Permission for RBAC. Laravel Reverb for WebSocket broadcasting of sensor readings and alerts. Sensor simulator as artisan command. PostgreSQL 16 for storage, Redis for queues/cache.

**Tech Stack:** Laravel 12, PHP 8.3, PostgreSQL 16, Redis 7, Laravel Reverb, Sanctum, Spatie Permission, Docker Compose

**Spec:** `docs/superpowers/specs/2026-03-28-backend-laravel-spec.md` in `rudgormash-frontend` repo

**Working directory:** `~/projects/rudgormash-backend` (новый репозиторий)

**Reference data:** Mock data from `~/projects/rudgormash-frontend/src/api/mock/` — seeders должны воспроизводить эти данные

---

## Файловая структура

### Инфраструктура
| Файл | Ответственность |
|------|----------------|
| `docker/php/Dockerfile` | PHP 8.3-FPM образ с extensions (pdo_pgsql, redis, pcntl) |
| `docker-compose.yml` | 6 сервисов: app, nginx, db, redis, reverb, worker |
| `docker/nginx/default.conf` | Nginx → PHP-FPM проксирование |
| `Makefile` | Команды: up, down, migrate, seed, fresh, test, shell |
| `.env.example` | Шаблон конфигурации |

### Enums
| Файл | Ответственность |
|------|----------------|
| `app/Enums/EquipmentStatus.php` | working, idle, malfunction, offline + labels |
| `app/Enums/OrderStatus.php` | planned, in_progress, review, completed, cancelled |
| `app/Enums/StepStatus.php` | pending, in_progress, passed, failed, skipped |
| `app/Enums/AlertType.php` | critical, warning, info, success, maintenance |
| `app/Enums/ScheduleStatus.php` | planned, overdue, completed |

### Models (20 файлов)
| Файл | Ответственность |
|------|----------------|
| `app/Models/User.php` | HasRoles (Spatie), HasApiTokens (Sanctum) |
| `app/Models/Equipment.php` | hasMany: sensors, specs, alerts, orders, parts, serviceHistory, schedule, dashboards |
| `app/Models/EquipmentSpec.php` | belongsTo Equipment |
| `app/Models/SensorDefinition.php` | belongsTo Equipment, hasMany readings/alerts |
| `app/Models/SensorReading.php` | belongsTo SensorDefinition |
| `app/Models/Alert.php` | belongsTo Equipment, SensorDefinition, User (acknowledgedBy) |
| `app/Models/DashboardConfig.php` | belongsTo Equipment, User. UNIQUE(equipment_id, user_id) |
| `app/Models/MaintenanceType.php` | Lookup: slug, label, estimated_duration. hasMany templates, orders, schedules |
| `app/Models/MaintenanceOrder.php` | belongsTo Equipment, MaintenanceType, Users (created/assigned/reviewed). hasMany steps |
| `app/Models/MaintenanceStep.php` | belongsTo MaintenanceOrder. hasMany measurements, materials |
| `app/Models/StepMeasurement.php` | belongsTo MaintenanceStep |
| `app/Models/StepMaterial.php` | belongsTo MaintenanceStep |
| `app/Models/ChecklistTemplate.php` | belongsTo MaintenanceType. hasMany template measurements/materials |
| `app/Models/ChecklistTemplateMeasurement.php` | belongsTo ChecklistTemplate |
| `app/Models/ChecklistTemplateMaterial.php` | belongsTo ChecklistTemplate |
| `app/Models/JournalEntry.php` | belongsTo Equipment, MaintenanceOrder (nullable) |
| `app/Models/AuditLog.php` | belongsTo User, Equipment (nullable) |
| `app/Models/PartsReplacement.php` | belongsTo Equipment |
| `app/Models/ServiceHistory.php` | belongsTo Equipment |
| `app/Models/MaintenanceSchedule.php` | belongsTo Equipment, MaintenanceType |

### Services (6 файлов)
| Файл | Ответственность |
|------|----------------|
| `app/Services/MaintenanceService.php` | State machine нарядов, создание из шаблона, переходы статусов, start/complete step |
| `app/Services/SensorService.php` | recordReading, getLatestReadings, getHistory с агрегацией |
| `app/Services/AlertService.php` | checkThresholds, createAlert с дедупликацией, acknowledge |
| `app/Services/SimulatorService.php` | Генерация реалистичных данных с дрифтом |
| `app/Services/DocumentService.php` | Генерация JSON акта ТО |
| `app/Services/AuditService.php` | log() — единая точка записи аудита |

### Controllers (14 файлов) — все в `app/Http/Controllers/Api/`
| Файл | Эндпоинты |
|------|-----------|
| `AuthController.php` | login, logout, me |
| `UserController.php` | index, show, store, update, destroy |
| `EquipmentController.php` | index, show, store, update, destroy |
| `SensorController.php` | index, store, update, destroy, live, history |
| `AlertController.php` | index, acknowledge, destroy |
| `DashboardController.php` | show, update, destroy |
| `MaintenanceOrderController.php` | index, show, store, transitionStatus, destroy |
| `MaintenanceStepController.php` | start, complete |
| `ChecklistTemplateController.php` | index, show, store, update + types |
| `DocumentController.php` | show |
| `JournalController.php` | index, store |
| `PartsController.php` | index, store |
| `ScheduleController.php` | index |
| `AuditController.php` | index |

### Resources (18 файлов) — все в `app/Http/Resources/`
### Requests (7 файлов) — все в `app/Http/Requests/`
### Policies (5 файлов) — все в `app/Policies/`
### Events (4 файла) + Listeners (6 файлов)
### Seeders (8 файлов) + Factories (4 файла)
### Artisan Commands (2 файла)

Подробности по каждому файлу — в соответствующих задачах ниже.

---

## Порядок зависимостей

```
Task 1 (Infrastructure)
  ↓
Task 2 (Enums + Migrations)
  ↓
Task 3 (Models)
  ↓
Task 4 (Auth + Users)     Task 5 (Seeders)
  ↓                          ↓
Task 6 (Equipment API)    Task 7 (Sensors API)
  ↓                          ↓
Task 8 (Alerts API)       Task 9 (Dashboards API)
  ↓
Task 10 (Maintenance Types + Templates)
  ↓
Task 11 (Maintenance Orders)
  ↓
Task 12 (Maintenance Steps)
  ↓
Task 13 (Documents + Journal + Audit + Parts + Schedule)
  ↓
Task 14 (Events & Listeners)
  ↓
Task 15 (WebSocket + Simulator)
  ↓
Task 16 (API Contract)
```

---

## Task 1: Инфраструктура — Docker + Laravel + пакеты

**Files:**
- Create: `docker/php/Dockerfile`
- Create: `docker/nginx/default.conf`
- Create: `docker-compose.yml`
- Create: `Makefile`
- Modify: `.env.example`

- [ ] **Step 1: Создать директорию проекта и инициализировать git**

```bash
mkdir -p ~/projects/rudgormash-backend && cd ~/projects/rudgormash-backend
git init
```

- [ ] **Step 2: Создать Dockerfile**

Create `docker/php/Dockerfile`:
```dockerfile
FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    postgresql-dev \
    linux-headers \
    $PHPIZE_DEPS \
    && docker-php-ext-install pdo pdo_pgsql pcntl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-interaction --no-dev --optimize-autoloader || true

EXPOSE 9000
CMD ["php-fpm"]
```

- [ ] **Step 3: Создать nginx config**

Create `docker/nginx/default.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /var/www/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass app:9000;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

- [ ] **Step 4: Создать docker-compose.yml**

Create `docker-compose.yml`:
```yaml
services:
  app:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    volumes:
      - .:/var/www
    depends_on:
      - db
      - redis
    environment:
      - APP_ENV=local

  nginx:
    image: nginx:alpine
    ports:
      - "8000:80"
    volumes:
      - .:/var/www
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: rudgormash
      POSTGRES_USER: rudgormash
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  reverb:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    command: php artisan reverb:start --host=0.0.0.0 --port=8080
    ports:
      - "8080:8080"
    volumes:
      - .:/var/www
    depends_on:
      - app
      - redis

  worker:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    command: php artisan queue:work redis --sleep=3 --tries=3
    volumes:
      - .:/var/www
    depends_on:
      - app
      - redis

volumes:
  postgres_data:
  redis_data:
```

- [ ] **Step 5: Создать Makefile**

Create `Makefile`:
```makefile
.PHONY: up down build migrate seed fresh test shell artisan

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build --no-cache

migrate:
	docker compose exec app php artisan migrate

seed:
	docker compose exec app php artisan db:seed

fresh:
	docker compose exec app php artisan migrate:fresh --seed

test:
	docker compose exec app php artisan test

shell:
	docker compose exec app sh

artisan:
	docker compose exec app php artisan $(filter-out $@,$(MAKECMDGOALS))

composer:
	docker compose exec app composer $(filter-out $@,$(MAKECMDGOALS))
```

- [ ] **Step 6: Установить Laravel через composer**

```bash
cd ~/projects/rudgormash-backend
docker run --rm -v $(pwd):/app -w /app composer:2 create-project laravel/laravel . --prefer-dist
```

- [ ] **Step 7: Настроить .env для Docker**

Edit `.env`:
```
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=rudgormash
DB_USERNAME=rudgormash
DB_PASSWORD=secret

CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
REDIS_HOST=redis

BROADCAST_CONNECTION=reverb
REVERB_APP_ID=rudgormash
REVERB_APP_KEY=rudgormash-key
REVERB_APP_SECRET=rudgormash-secret
REVERB_HOST=reverb
REVERB_PORT=8080
REVERB_SCHEME=http

SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:8000
```

- [ ] **Step 8: Установить пакеты**

```bash
make up
make composer require laravel/sanctum laravel/reverb spatie/laravel-permission
make composer require --dev mockery/mockery
```

- [ ] **Step 9: Опубликовать конфигурации пакетов**

```bash
make artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
make artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
make artisan install:broadcasting
```

- [ ] **Step 10: Проверить что контейнеры работают**

```bash
make up
docker compose ps
# Expected: 6 services running
make artisan --version
# Expected: Laravel Framework 12.x.x
```

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: docker + laravel + sanctum + spatie + reverb"
```

---

## Task 2: Enums и миграции

**Files:**
- Create: `app/Enums/EquipmentStatus.php`
- Create: `app/Enums/OrderStatus.php`
- Create: `app/Enums/StepStatus.php`
- Create: `app/Enums/AlertType.php`
- Create: `app/Enums/ScheduleStatus.php`
- Create: 20+ migration files

- [ ] **Step 1: Создать PHP enums**

Create `app/Enums/EquipmentStatus.php`:
```php
<?php

namespace App\Enums;

enum EquipmentStatus: string
{
    case Working = 'working';
    case Idle = 'idle';
    case Malfunction = 'malfunction';
    case Offline = 'offline';

    public function label(): string
    {
        return match ($this) {
            self::Working => 'В работе',
            self::Idle => 'Простой',
            self::Malfunction => 'Неисправность',
            self::Offline => 'Отключён',
        };
    }
}
```

Create `app/Enums/OrderStatus.php`:
```php
<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Planned = 'planned';
    case InProgress = 'in_progress';
    case Review = 'review';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Planned => 'Запланировано',
            self::InProgress => 'В работе',
            self::Review => 'На приёмке',
            self::Completed => 'Завершено',
            self::Cancelled => 'Отменено',
        };
    }
}
```

Create `app/Enums/StepStatus.php`:
```php
<?php

namespace App\Enums;

enum StepStatus: string
{
    case Pending = 'pending';
    case InProgress = 'in_progress';
    case Passed = 'passed';
    case Failed = 'failed';
    case Skipped = 'skipped';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Ожидает',
            self::InProgress => 'Выполняется',
            self::Passed => 'Выполнено',
            self::Failed => 'Не выполнено',
            self::Skipped => 'Пропущено',
        };
    }
}
```

Create `app/Enums/AlertType.php`:
```php
<?php

namespace App\Enums;

enum AlertType: string
{
    case Critical = 'critical';
    case Warning = 'warning';
    case Info = 'info';
    case Success = 'success';
    case Maintenance = 'maintenance';
}
```

Create `app/Enums/ScheduleStatus.php`:
```php
<?php

namespace App\Enums;

enum ScheduleStatus: string
{
    case Planned = 'planned';
    case Overdue = 'overdue';
    case Completed = 'completed';
}
```

- [ ] **Step 2: Создать миграции — core tables**

```bash
make artisan make:migration create_equipment_table
make artisan make:migration create_equipment_specs_table
make artisan make:migration create_sensor_definitions_table
make artisan make:migration create_sensor_readings_table
make artisan make:migration create_alerts_table
make artisan make:migration create_dashboard_configs_table
make artisan make:migration create_maintenance_types_table
make artisan make:migration create_maintenance_orders_table
make artisan make:migration create_maintenance_steps_table
make artisan make:migration create_step_measurements_table
make artisan make:migration create_step_materials_table
make artisan make:migration create_checklist_templates_table
make artisan make:migration create_checklist_template_measurements_table
make artisan make:migration create_checklist_template_materials_table
make artisan make:migration create_journal_entries_table
make artisan make:migration create_audit_logs_table
make artisan make:migration create_parts_replacements_table
make artisan make:migration create_service_history_table
make artisan make:migration create_maintenance_schedules_table
```

- [ ] **Step 3: Реализовать миграции**

`create_equipment_table`:
```php
Schema::create('equipment', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('model');
    $table->string('serial')->nullable();
    $table->integer('year')->nullable();
    $table->string('status')->default('idle');
    $table->decimal('operating_hours', 10, 1)->default(0);
    $table->timestamp('last_maintenance_at')->nullable();
    $table->string('last_maintenance_type')->nullable();
    $table->decimal('last_maintenance_hours', 10, 1)->nullable();
    $table->jsonb('subsystem_health')->default('{}');
    $table->timestamps();
});
```

`create_equipment_specs_table`:
```php
Schema::create('equipment_specs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('equipment_id')->constrained('equipment')->cascadeOnDelete();
    $table->string('label');
    $table->string('value');
});
```

`create_sensor_definitions_table`:
```php
Schema::create('sensor_definitions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('equipment_id')->constrained('equipment')->cascadeOnDelete();
    $table->string('type');
    $table->string('label');
    $table->string('unit');
    $table->decimal('min_value', 10, 2);
    $table->decimal('max_value', 10, 2);
    $table->decimal('warning_threshold', 10, 2)->nullable();
    $table->decimal('critical_threshold', 10, 2)->nullable();
    $table->timestamps();
});
```

`create_sensor_readings_table`:
```php
Schema::create('sensor_readings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('sensor_definition_id')->constrained()->cascadeOnDelete();
    $table->decimal('value', 10, 2);
    $table->timestamp('timestamp');
    $table->index(['sensor_definition_id', 'timestamp']);
});
```

`create_alerts_table`:
```php
Schema::create('alerts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('equipment_id')->constrained('equipment')->cascadeOnDelete();
    $table->foreignId('sensor_definition_id')->nullable()->constrained()->nullOnDelete();
    $table->string('type');
    $table->string('title');
    $table->text('description');
    $table->decimal('value', 10, 2)->nullable();
    $table->decimal('threshold', 10, 2)->nullable();
    $table->boolean('acknowledged')->default(false);
    $table->timestamp('acknowledged_at')->nullable();
    $table->foreignId('acknowledged_by')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamp('timestamp');
    $table->timestamp('created_at')->useCurrent();
});
```

`create_dashboard_configs_table`:
```php
Schema::create('dashboard_configs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('equipment_id')->constrained('equipment')->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->jsonb('widgets')->default('[]');
    $table->timestamps();
    $table->unique(['equipment_id', 'user_id']);
});
```

`create_maintenance_types_table`:
```php
Schema::create('maintenance_types', function (Blueprint $table) {
    $table->id();
    $table->string('slug')->unique();
    $table->string('label');
    $table->integer('estimated_duration_minutes')->nullable();
    $table->integer('sort_order')->default(0);
});
```

`create_maintenance_orders_table`:
```php
Schema::create('maintenance_orders', function (Blueprint $table) {
    $table->id();
    $table->string('display_id')->unique();
    $table->foreignId('equipment_id')->constrained('equipment')->cascadeOnDelete();
    $table->foreignId('maintenance_type_id')->constrained();
    $table->string('status')->default('planned');
    $table->foreignId('created_by')->constrained('users');
    $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
    $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
    $table->jsonb('accepted_by')->nullable();
    $table->date('scheduled_date')->nullable();
    $table->timestamp('started_at')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->timestamp('reviewed_at')->nullable();
    $table->decimal('operating_hours_at_start', 10, 1)->nullable();
    $table->jsonb('executors')->nullable();
    $table->text('remarks')->nullable();
    $table->text('return_reason')->nullable();
    $table->timestamps();
});
```

`create_maintenance_steps_table`:
```php
Schema::create('maintenance_steps', function (Blueprint $table) {
    $table->id();
    $table->foreignId('maintenance_order_id')->constrained()->cascadeOnDelete();
    $table->integer('sort_order');
    $table->text('description');
    $table->text('requirement')->nullable();
    $table->text('tools')->nullable();
    $table->string('status')->default('pending');
    $table->text('comment')->nullable();
    $table->timestamp('started_at')->nullable();
    $table->timestamp('completed_at')->nullable();
});
```

`create_step_measurements_table`:
```php
Schema::create('step_measurements', function (Blueprint $table) {
    $table->id();
    $table->foreignId('maintenance_step_id')->constrained()->cascadeOnDelete();
    $table->string('description');
    $table->string('unit');
    $table->string('norm');
    $table->string('fact')->nullable();
    $table->boolean('passed')->nullable();
});
```

`create_step_materials_table`:
```php
Schema::create('step_materials', function (Blueprint $table) {
    $table->id();
    $table->foreignId('maintenance_step_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('unit');
    $table->string('volume')->nullable();
    $table->string('brand')->nullable();
});
```

`create_checklist_templates_table`:
```php
Schema::create('checklist_templates', function (Blueprint $table) {
    $table->id();
    $table->foreignId('maintenance_type_id')->constrained();
    $table->integer('sort_order');
    $table->text('description');
    $table->text('requirement')->nullable();
    $table->text('tools')->nullable();
});
```

`create_checklist_template_measurements_table`:
```php
Schema::create('checklist_template_measurements', function (Blueprint $table) {
    $table->id();
    $table->foreignId('checklist_template_id')->constrained()->cascadeOnDelete();
    $table->string('description');
    $table->string('unit');
    $table->string('norm');
});
```

`create_checklist_template_materials_table`:
```php
Schema::create('checklist_template_materials', function (Blueprint $table) {
    $table->id();
    $table->foreignId('checklist_template_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('unit');
});
```

`create_journal_entries_table`:
```php
Schema::create('journal_entries', function (Blueprint $table) {
    $table->id();
    $table->foreignId('equipment_id')->constrained('equipment')->cascadeOnDelete();
    $table->foreignId('maintenance_order_id')->nullable()->constrained()->nullOnDelete();
    $table->date('date');
    $table->time('time');
    $table->text('description');
    $table->string('clearance')->nullable();
    $table->string('author_name');
    $table->timestamp('created_at')->useCurrent();
});
```

`create_audit_logs_table`:
```php
Schema::create('audit_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('action');
    $table->foreignId('equipment_id')->nullable()->constrained('equipment')->nullOnDelete();
    $table->text('details')->nullable();
    $table->timestamp('created_at')->useCurrent();
});
```

`create_parts_replacements_table`:
```php
Schema::create('parts_replacements', function (Blueprint $table) {
    $table->id();
    $table->foreignId('equipment_id')->constrained('equipment')->cascadeOnDelete();
    $table->date('date');
    $table->string('part_name');
    $table->string('part_number')->nullable();
    $table->boolean('is_original')->default(true);
    $table->string('replaced_by');
});
```

`create_service_history_table`:
```php
Schema::create('service_history', function (Blueprint $table) {
    $table->id();
    $table->foreignId('equipment_id')->constrained('equipment')->cascadeOnDelete();
    $table->date('date');
    $table->string('type');
    $table->string('status');
});
```

`create_maintenance_schedules_table`:
```php
Schema::create('maintenance_schedules', function (Blueprint $table) {
    $table->id();
    $table->foreignId('equipment_id')->constrained('equipment')->cascadeOnDelete();
    $table->foreignId('maintenance_type_id')->constrained();
    $table->date('scheduled_date')->nullable();
    $table->decimal('scheduled_hours', 10, 1)->nullable();
    $table->string('status')->default('planned');
    $table->timestamps();
});
```

- [ ] **Step 4: Запустить миграции**

```bash
make migrate
# Expected: all migrations run successfully, 0 errors
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: enums and database migrations — 20 tables"
```

---

## Task 3: Eloquent модели

**Files:**
- Create: 20 model files in `app/Models/`

- [ ] **Step 1: Создать все модели**

Создать каждую модель с relationships, casts, fillable. Ключевые модели:

`app/Models/Equipment.php`:
```php
<?php

namespace App\Models;

use App\Enums\EquipmentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipment extends Model
{
    protected $table = 'equipment';

    protected $fillable = [
        'name', 'model', 'serial', 'year', 'status',
        'operating_hours', 'last_maintenance_at',
        'last_maintenance_type', 'last_maintenance_hours',
        'subsystem_health',
    ];

    protected function casts(): array
    {
        return [
            'status' => EquipmentStatus::class,
            'operating_hours' => 'decimal:1',
            'last_maintenance_at' => 'datetime',
            'last_maintenance_hours' => 'decimal:1',
            'subsystem_health' => 'array',
        ];
    }

    public function specs(): HasMany
    {
        return $this->hasMany(EquipmentSpec::class);
    }

    public function sensorDefinitions(): HasMany
    {
        return $this->hasMany(SensorDefinition::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    public function maintenanceOrders(): HasMany
    {
        return $this->hasMany(MaintenanceOrder::class);
    }

    public function journalEntries(): HasMany
    {
        return $this->hasMany(JournalEntry::class);
    }

    public function partsReplacements(): HasMany
    {
        return $this->hasMany(PartsReplacement::class);
    }

    public function serviceHistory(): HasMany
    {
        return $this->hasMany(ServiceHistory::class);
    }

    public function maintenanceSchedules(): HasMany
    {
        return $this->hasMany(MaintenanceSchedule::class);
    }

    public function dashboardConfigs(): HasMany
    {
        return $this->hasMany(DashboardConfig::class);
    }
}
```

`app/Models/MaintenanceOrder.php`:
```php
<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MaintenanceOrder extends Model
{
    protected $fillable = [
        'display_id', 'equipment_id', 'maintenance_type_id', 'status',
        'created_by', 'assigned_to', 'reviewed_by', 'accepted_by',
        'scheduled_date', 'started_at', 'completed_at', 'reviewed_at',
        'operating_hours_at_start', 'executors', 'remarks', 'return_reason',
    ];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'accepted_by' => 'array',
            'executors' => 'array',
            'scheduled_date' => 'date',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'operating_hours_at_start' => 'decimal:1',
        ];
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function maintenanceType(): BelongsTo
    {
        return $this->belongsTo(MaintenanceType::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(MaintenanceStep::class)->orderBy('sort_order');
    }
}
```

`app/Models/MaintenanceStep.php`:
```php
<?php

namespace App\Models;

use App\Enums\StepStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MaintenanceStep extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'maintenance_order_id', 'sort_order', 'description',
        'requirement', 'tools', 'status', 'comment',
        'started_at', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => StepStatus::class,
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(MaintenanceOrder::class, 'maintenance_order_id');
    }

    public function measurements(): HasMany
    {
        return $this->hasMany(StepMeasurement::class);
    }

    public function materials(): HasMany
    {
        return $this->hasMany(StepMaterial::class);
    }
}
```

`app/Models/SensorDefinition.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SensorDefinition extends Model
{
    protected $fillable = [
        'equipment_id', 'type', 'label', 'unit',
        'min_value', 'max_value',
        'warning_threshold', 'critical_threshold',
    ];

    protected function casts(): array
    {
        return [
            'min_value' => 'decimal:2',
            'max_value' => 'decimal:2',
            'warning_threshold' => 'decimal:2',
            'critical_threshold' => 'decimal:2',
        ];
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function readings(): HasMany
    {
        return $this->hasMany(SensorReading::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }
}
```

`app/Models/Alert.php`:
```php
<?php

namespace App\Models;

use App\Enums\AlertType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'equipment_id', 'sensor_definition_id', 'type',
        'title', 'description', 'value', 'threshold',
        'acknowledged', 'acknowledged_at', 'acknowledged_by',
        'timestamp', 'created_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => AlertType::class,
            'acknowledged' => 'boolean',
            'acknowledged_at' => 'datetime',
            'timestamp' => 'datetime',
            'created_at' => 'datetime',
            'value' => 'decimal:2',
            'threshold' => 'decimal:2',
        ];
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function sensorDefinition(): BelongsTo
    {
        return $this->belongsTo(SensorDefinition::class);
    }

    public function acknowledgedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }
}
```

Остальные модели (простые) — `SensorReading`, `EquipmentSpec`, `DashboardConfig`, `MaintenanceType`, `StepMeasurement`, `StepMaterial`, `ChecklistTemplate`, `ChecklistTemplateMeasurement`, `ChecklistTemplateMaterial`, `JournalEntry`, `AuditLog`, `PartsReplacement`, `ServiceHistory`, `MaintenanceSchedule` — создать по тому же паттерну: fillable, casts, relationships согласно спеку. Каждая модель — отдельный файл.

`app/Models/MaintenanceType.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MaintenanceType extends Model
{
    public $timestamps = false;

    protected $fillable = ['slug', 'label', 'estimated_duration_minutes', 'sort_order'];

    public function checklistTemplates(): HasMany
    {
        return $this->hasMany(ChecklistTemplate::class)->orderBy('sort_order');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(MaintenanceOrder::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(MaintenanceSchedule::class);
    }
}
```

`app/Models/User.php` — модифицировать существующий:
```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasRoles, Notifiable;

    protected $fillable = ['name', 'email', 'password'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
```

- [ ] **Step 2: Проверить что миграции проходят с моделями**

```bash
make fresh
# Expected: migrate:fresh succeeds, no errors
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: eloquent models with relationships and casts"
```

---

## Task 4: Auth + Users API

**Files:**
- Create: `app/Http/Controllers/Api/AuthController.php`
- Create: `app/Http/Controllers/Api/UserController.php`
- Create: `app/Http/Requests/Auth/LoginRequest.php`
- Create: `app/Http/Resources/UserResource.php`
- Create: `app/Policies/UserPolicy.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/AuthTest.php`
- Create: `tests/Feature/UserTest.php`

- [ ] **Step 1: Создать LoginRequest**

`app/Http/Requests/Auth/LoginRequest.php`:
```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
```

- [ ] **Step 2: Создать UserResource**

`app/Http/Resources/UserResource.php`:
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->roles->first()?->name,
            'permissions' => $this->getAllPermissions()->pluck('name'),
            'created_at' => $this->created_at,
        ];
    }
}
```

- [ ] **Step 3: Создать AuthController**

`app/Http/Controllers/Api/AuthController.php`:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Неверный логин или пароль'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'OK']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()),
        ]);
    }
}
```

- [ ] **Step 4: Создать UserPolicy и UserController**

`app/Policies/UserPolicy.php`:
```php
<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, User $model): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, User $model): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, User $model): bool
    {
        return $user->hasRole('admin') && $user->id !== $model->id;
    }
}
```

`app/Http/Controllers/Api/UserController.php`:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->role($request->input('role'));
        }

        return UserResource::collection($query->paginate($request->input('per_page', 20)));
    }

    public function show(User $user)
    {
        return new UserResource($user);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        return response()->json(new UserResource($user), 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,' . $user->id],
            'password' => ['sometimes', 'string', 'min:8'],
            'role' => ['sometimes', 'string', 'exists:roles,name'],
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update(collect($validated)->except('role')->toArray());

        if (isset($validated['role'])) {
            $user->syncRoles([$validated['role']]);
        }

        return response()->json(new UserResource($user->fresh()));
    }

    public function destroy(User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $user->delete();

        return response()->json(null, 204);
    }
}
```

- [ ] **Step 5: Настроить маршруты**

`routes/api.php`:
```php
<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::apiResource('users', UserController::class);
});
```

- [ ] **Step 6: Написать feature-тесты для Auth**

`tests/Feature/AuthTest.php`:
```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_login_returns_token(): void
    {
        $user = User::factory()->create(['password' => bcrypt('password')]);
        $user->assignRole('engineer');

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $user = User::factory()->create(['password' => bcrypt('password')]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong',
        ]);

        $response->assertStatus(401);
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create();
        $user->assignRole('mechanic');

        $response = $this->actingAs($user)->getJson('/api/auth/me');

        $response->assertOk()
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/logout');

        $response->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_unauthenticated_request_returns_401(): void
    {
        $this->getJson('/api/auth/me')->assertStatus(401);
    }
}
```

- [ ] **Step 7: Создать RoleSeeder (нужен для тестов)**

`database/seeders/RoleSeeder.php`:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['admin', 'engineer', 'mechanic', 'foreman'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }
    }
}
```

- [ ] **Step 8: Запустить тесты**

```bash
make test -- --filter=AuthTest
# Expected: 5 tests, 5 passed
```

- [ ] **Step 9: Написать feature-тесты для Users**

`tests/Feature/UserTest.php`:
```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_list_users(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        User::factory()->count(3)->create()->each(fn ($u) => $u->assignRole('mechanic'));

        $response = $this->actingAs($admin)->getJson('/api/users');

        $response->assertOk()
            ->assertJsonCount(4, 'data');
    }

    public function test_filter_users_by_role(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        User::factory()->count(2)->create()->each(fn ($u) => $u->assignRole('mechanic'));
        User::factory()->create()->assignRole('engineer');

        $response = $this->actingAs($admin)->getJson('/api/users?role=mechanic');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_create_user(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->postJson('/api/users', [
            'name' => 'Тестов Т.Т.',
            'email' => 'test@rudgormash.ru',
            'password' => 'password123',
            'role' => 'mechanic',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('name', 'Тестов Т.Т.');
    }

    public function test_non_admin_cannot_create_user(): void
    {
        $engineer = User::factory()->create();
        $engineer->assignRole('engineer');

        $response = $this->actingAs($engineer)->postJson('/api/users', [
            'name' => 'Test',
            'email' => 'test@test.ru',
            'password' => 'password123',
            'role' => 'mechanic',
        ]);

        $response->assertStatus(403);
    }
}
```

- [ ] **Step 10: Запустить все тесты**

```bash
make test
# Expected: all pass
```

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: auth (sanctum) + users API with RBAC"
```

---

## Task 5: Seeders и Factories

**Files:**
- Create: `database/seeders/UserSeeder.php`
- Create: `database/seeders/MaintenanceTypeSeeder.php`
- Create: `database/seeders/EquipmentSeeder.php`
- Create: `database/seeders/ChecklistTemplateSeeder.php`
- Create: `database/seeders/MaintenanceOrderSeeder.php`
- Create: `database/seeders/AlertSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`
- Create: `database/factories/EquipmentFactory.php`
- Create: `database/factories/MaintenanceOrderFactory.php`
- Create: `database/factories/AlertFactory.php`
- Create: `database/factories/JournalEntryFactory.php`

- [ ] **Step 1: UserSeeder**

`database/seeders/UserSeeder.php`:
```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Иванов А.П.', 'email' => 'ivanov@rudgormash.ru', 'role' => 'engineer'],
            ['name' => 'Петров С.В.', 'email' => 'petrov@rudgormash.ru', 'role' => 'mechanic'],
            ['name' => 'Сидоров К.М.', 'email' => 'sidorov@rudgormash.ru', 'role' => 'mechanic'],
            ['name' => 'Козлов Д.А.', 'email' => 'kozlov@rudgormash.ru', 'role' => 'foreman'],
            ['name' => 'Администратор', 'email' => 'admin@rudgormash.ru', 'role' => 'admin'],
        ];

        foreach ($users as $data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('password'),
            ]);
            $user->assignRole($data['role']);
        }
    }
}
```

- [ ] **Step 2: MaintenanceTypeSeeder**

`database/seeders/MaintenanceTypeSeeder.php`:
```php
<?php

namespace Database\Seeders;

use App\Models\MaintenanceType;
use Illuminate\Database\Seeder;

class MaintenanceTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['slug' => 'EO', 'label' => 'Ежесменное обслуживание', 'estimated_duration_minutes' => 60, 'sort_order' => 1],
            ['slug' => 'TO-1', 'label' => 'Техническое обслуживание №1', 'estimated_duration_minutes' => 240, 'sort_order' => 2],
            ['slug' => 'TO-2', 'label' => 'Техническое обслуживание №2', 'estimated_duration_minutes' => 360, 'sort_order' => 3],
            ['slug' => 'TO-3', 'label' => 'Техническое обслуживание №3', 'estimated_duration_minutes' => 480, 'sort_order' => 4],
            ['slug' => 'TR-1', 'label' => 'Текущий ремонт №1', 'estimated_duration_minutes' => null, 'sort_order' => 5],
            ['slug' => 'TR-2', 'label' => 'Текущий ремонт №2', 'estimated_duration_minutes' => null, 'sort_order' => 6],
            ['slug' => 'TR-3', 'label' => 'Текущий ремонт №3', 'estimated_duration_minutes' => null, 'sort_order' => 7],
            ['slug' => 'KR', 'label' => 'Капитальный ремонт', 'estimated_duration_minutes' => null, 'sort_order' => 8],
        ];

        foreach ($types as $type) {
            MaintenanceType::create($type);
        }
    }
}
```

- [ ] **Step 3: EquipmentSeeder**

`database/seeders/EquipmentSeeder.php` — создать 8 станков с данными из фронтенд-мока (`rudgormash-frontend/src/api/mock/equipment.js`). Каждый станок с:
- specs (7 характеристик)
- 12 sensor_definitions (type, label, unit, min, max, warning_threshold, critical_threshold)
- serviceHistory записи
- partsReplacements (для БУР-12, БУР-08, БУР-03, БУР-05, БУР-19 — данные из `rudgormash-frontend/src/api/mock/parts.js`)

Данные 8 станков (из mock):
```
БУР-12: СБШ-250МНА, E-2024-012, 2023, working, 4820h
БУР-08: СБШ-250МНА, E-2024-008, 2023, working, 12350h
БУР-15: DML-1200, E-2024-015, 2022, idle, 1200h
БУР-03: СБШ-320, E-2024-003, 2024, malfunction, 8900h
БУР-21: DML-1200, E-2024-021, 2024, working, 320h
БУР-17: СБШ-250МНА, E-2024-017, 2023, working, 6700h
БУР-05: DML-1200, E-2024-005, 2022, offline, 15600h
БУР-19: СБШ-320, E-2024-019, 2024, working, 2100h
```

12 sensor definitions (одинаковые для всех, как в `createSensors()`):
```
temp-engine: Температура двигателя, °C, 0-120, warning=80, critical=95
speed: Скорость вращения, RPM, 0-3000, warning=2600, critical=2800
depth: Глубина бурения, м, 0-300, warning=250, critical=290
pressure: Давление, БАР, 0-150, warning=130, critical=145
vibration: Вибрация, мм/с, 0-3, warning=1.5, critical=2.5
power: Мощность, %, 0-100, warning=90, critical=95
torque: Крутящий момент, Нм, 0-600, warning=450, critical=550
fuel-rate: Расход топлива, Л/Ч, 0-30, warning=22, critical=27
tool-wear: Износ долота, %, 0-100, warning=70, critical=90
oil-level: Уровень масла, %, 0-100, warning=30, critical=15
oil-temp: Температура гидромасла, °C, 0-80, warning=65, critical=75
engine-load: Загрузка двигателя, %, 0-100, warning=90, critical=97
```

- [ ] **Step 4: ChecklistTemplateSeeder**

Все 8 типов ТО с шагами, measurements, materials из фронтенд-мока (`rudgormash-frontend/src/api/mock/maintenance.js`, объект `CHECKLISTS`). Пример для ТО-1:

```php
$to1 = MaintenanceType::where('slug', 'TO-1')->first();
$templates = [
    ['sort_order' => 1, 'description' => 'Проверить крепления трубопроводов и рукавов гидросистемы', 'requirement' => 'Затяжка соединений, отсутствие подтёков', 'tools' => 'Набор ключей, динамометрический ключ'],
    // ... все 9 шагов TO-1
];
foreach ($templates as $t) {
    $tpl = $to1->checklistTemplates()->create($t);
    // для to1-07: measurement 'Величина отхода тормозных колодок', мм, '1.7 (не более)'
    // для to1-08: measurement 'Износ каната', %, '10 (не более)'
}
```

Аналогично для всех 8 типов. ТО-2 имеет measurements (ground, insulation) и materials (grease). ТО-3 — materials (oils).

- [ ] **Step 5: MaintenanceOrderSeeder + AlertSeeder**

7 нарядов в разных статусах. AlertSeeder — набор демо-алертов. Данные из фронтенд-мока.

- [ ] **Step 6: DatabaseSeeder и factories**

`database/seeders/DatabaseSeeder.php`:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            MaintenanceTypeSeeder::class,
            EquipmentSeeder::class,
            ChecklistTemplateSeeder::class,
            MaintenanceOrderSeeder::class,
            AlertSeeder::class,
        ]);
    }
}
```

Factories: `EquipmentFactory`, `MaintenanceOrderFactory`, `AlertFactory`, `JournalEntryFactory` — для генерации рандомных данных в тестах.

- [ ] **Step 7: Запустить полный seed**

```bash
make fresh
# Expected: migrate:fresh + db:seed succeed, data populated
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: seeders with demo data matching frontend mocks"
```

---

## Task 6: Equipment API

**Files:**
- Create: `app/Http/Controllers/Api/EquipmentController.php`
- Create: `app/Http/Resources/EquipmentResource.php`
- Create: `app/Http/Resources/EquipmentListResource.php`
- Create: `app/Http/Requests/Equipment/StoreEquipmentRequest.php`
- Create: `app/Http/Requests/Equipment/UpdateEquipmentRequest.php`
- Create: `app/Policies/EquipmentPolicy.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/EquipmentTest.php`

- [ ] **Step 1: Resources**

`EquipmentListResource` — summary без sensors/specs:
```php
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'model' => $this->model,
        'fullModel' => "Буровой станок {$this->model}",
        'serial' => $this->serial,
        'year' => $this->year,
        'status' => $this->status->value,
        'statusLabel' => $this->status->label(),
        'operatingHours' => $this->operating_hours,
        'lastMaintenance' => $this->last_maintenance_at ? [
            'type' => $this->last_maintenance_type,
            'date' => $this->last_maintenance_at->toDateString(),
            'hours' => $this->last_maintenance_hours,
        ] : null,
        'subsystemHealth' => $this->subsystem_health,
    ];
}
```

`EquipmentResource` — полная: + specs, serviceHistory, sensors.

- [ ] **Step 2: Policy**

`EquipmentPolicy`: view — все; create/update — engineer, admin; delete — admin.

- [ ] **Step 3: Controller + Routes**

Standard apiResource controller с `EquipmentListResource::collection` для index, `EquipmentResource` для show.

Route: `Route::apiResource('equipment', EquipmentController::class);`

- [ ] **Step 4: Feature tests**

Тесты: index возвращает список, show возвращает полные данные, engineer может создавать, mechanic не может, admin может удалять.

- [ ] **Step 5: Запустить тесты**

```bash
make test -- --filter=EquipmentTest
# Expected: all pass
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: equipment CRUD API with resources and policies"
```

---

## Task 7: Sensors API

**Files:**
- Create: `app/Http/Controllers/Api/SensorController.php`
- Create: `app/Http/Resources/SensorDefinitionResource.php`
- Create: `app/Http/Resources/SensorReadingResource.php`
- Create: `app/Services/SensorService.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/SensorTest.php`

- [ ] **Step 1: SensorService**

`app/Services/SensorService.php`:
```php
<?php

namespace App\Services;

use App\Events\SensorReadingRecorded;
use App\Models\SensorDefinition;
use App\Models\SensorReading;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SensorService
{
    public function recordReading(SensorDefinition $sensor, float $value): SensorReading
    {
        $reading = SensorReading::create([
            'sensor_definition_id' => $sensor->id,
            'value' => $value,
            'timestamp' => now(),
        ]);

        event(new SensorReadingRecorded($sensor, $reading));

        return $reading;
    }

    public function getLatestReadings(int $equipmentId): Collection
    {
        return SensorReading::select('sensor_readings.*')
            ->join(
                DB::raw('(SELECT sensor_definition_id, MAX(timestamp) as max_ts FROM sensor_readings sr JOIN sensor_definitions sd ON sr.sensor_definition_id = sd.id WHERE sd.equipment_id = ? GROUP BY sensor_definition_id) latest'),
                fn ($join) => $join->on('sensor_readings.sensor_definition_id', '=', 'latest.sensor_definition_id')
                    ->on('sensor_readings.timestamp', '=', 'latest.max_ts')
            )
            ->addBinding($equipmentId, 'join')
            ->with('sensorDefinition')
            ->get();
    }

    public function getHistory(int $sensorId, ?string $from, ?string $to, int $intervalMinutes = 5): Collection
    {
        $query = SensorReading::where('sensor_definition_id', $sensorId)
            ->orderBy('timestamp');

        if ($from) {
            $query->where('timestamp', '>=', $from);
        }
        if ($to) {
            $query->where('timestamp', '<=', $to);
        }

        if ($intervalMinutes > 5) {
            return $query->select(
                DB::raw("date_trunc('hour', timestamp) + (EXTRACT(minute FROM timestamp)::int / {$intervalMinutes}) * interval '{$intervalMinutes} minutes' as bucket"),
                DB::raw('AVG(value) as value'),
                DB::raw('MIN(timestamp) as timestamp')
            )
                ->groupBy('bucket')
                ->orderBy('bucket')
                ->get();
        }

        return $query->get();
    }
}
```

- [ ] **Step 2: Controller**

Endpoints: `GET /equipment/{id}/sensors`, `POST /equipment/{id}/sensors`, `PUT /sensors/{id}`, `DELETE /sensors/{id}`, `GET /equipment/{id}/sensors/live`, `GET /sensors/{id}/history`.

- [ ] **Step 3: Routes**

```php
Route::get('equipment/{equipment}/sensors', [SensorController::class, 'index']);
Route::post('equipment/{equipment}/sensors', [SensorController::class, 'store']);
Route::put('sensors/{sensorDefinition}', [SensorController::class, 'update']);
Route::delete('sensors/{sensorDefinition}', [SensorController::class, 'destroy']);
Route::get('equipment/{equipment}/sensors/live', [SensorController::class, 'live']);
Route::get('sensors/{sensorDefinition}/history', [SensorController::class, 'history']);
```

- [ ] **Step 4: Tests**

Тесты: получение определений, live data (пустой + с readings), history с фильтрами.

- [ ] **Step 5: Запустить тесты и commit**

```bash
make test -- --filter=SensorTest
git add -A && git commit -m "feat: sensors API with SensorService — CRUD, live, history"
```

---

## Task 8: Alerts API

**Files:**
- Create: `app/Http/Controllers/Api/AlertController.php`
- Create: `app/Http/Resources/AlertResource.php`
- Create: `app/Services/AlertService.php`
- Create: `app/Policies/AlertPolicy.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/AlertTest.php`
- Create: `tests/Unit/AlertServiceTest.php`

- [ ] **Step 1: AlertService**

`app/Services/AlertService.php`:
```php
<?php

namespace App\Services;

use App\Enums\AlertType;
use App\Events\ThresholdExceeded;
use App\Models\Alert;
use App\Models\SensorDefinition;
use App\Models\User;

class AlertService
{
    public function checkThresholds(SensorDefinition $sensor, float $value): ?Alert
    {
        $type = null;

        if ($sensor->critical_threshold !== null) {
            $isCritical = $sensor->critical_threshold > $sensor->warning_threshold
                ? $value >= $sensor->critical_threshold
                : $value <= $sensor->critical_threshold;

            if ($isCritical) {
                $type = AlertType::Critical;
            }
        }

        if ($type === null && $sensor->warning_threshold !== null) {
            $isWarning = $sensor->warning_threshold > ($sensor->max_value / 2)
                ? $value >= $sensor->warning_threshold
                : $value <= $sensor->warning_threshold;

            if ($isWarning) {
                $type = AlertType::Warning;
            }
        }

        if ($type === null) {
            return null;
        }

        return $this->createAlert([
            'equipment_id' => $sensor->equipment_id,
            'sensor_definition_id' => $sensor->id,
            'type' => $type,
            'title' => $type === AlertType::Critical
                ? "КРИТИЧЕСКОЕ: {$sensor->label}"
                : "Предупреждение: {$sensor->label}",
            'description' => "{$sensor->label} = {$value} {$sensor->unit} (порог: " .
                ($type === AlertType::Critical ? $sensor->critical_threshold : $sensor->warning_threshold) .
                " {$sensor->unit})",
            'value' => $value,
            'threshold' => $type === AlertType::Critical
                ? $sensor->critical_threshold
                : $sensor->warning_threshold,
        ]);
    }

    public function createAlert(array $data): ?Alert
    {
        // Deduplication: don't create if unacknowledged alert exists for same sensor + type
        $exists = Alert::where('equipment_id', $data['equipment_id'])
            ->where('sensor_definition_id', $data['sensor_definition_id'] ?? null)
            ->where('type', $data['type'] instanceof AlertType ? $data['type']->value : $data['type'])
            ->where('acknowledged', false)
            ->exists();

        if ($exists) {
            return null;
        }

        $alert = Alert::create([
            ...$data,
            'timestamp' => now(),
            'created_at' => now(),
        ]);

        event(new ThresholdExceeded($alert));

        return $alert;
    }

    public function acknowledge(Alert $alert, User $user): Alert
    {
        $alert->update([
            'acknowledged' => true,
            'acknowledged_at' => now(),
            'acknowledged_by' => $user->id,
        ]);

        return $alert->fresh();
    }
}
```

- [ ] **Step 2: Controller, Resource, Policy, Routes**

Standard patterns: `GET /alerts` with filters (equipment_id, type, acknowledged), `POST /alerts/{id}/acknowledge`, `DELETE /alerts/{id}` (admin only).

- [ ] **Step 3: Unit tests для AlertService**

Тесты: `checkThresholds` создаёт critical alert, warning alert, returns null when below threshold, deduplication works.

- [ ] **Step 4: Feature tests**

Тесты: list alerts, filter by equipment, acknowledge, admin can delete.

- [ ] **Step 5: Запустить тесты и commit**

```bash
make test -- --filter=Alert
git add -A && git commit -m "feat: alerts API with AlertService — thresholds, dedup, acknowledge"
```

---

## Task 9: Dashboards API

**Files:**
- Create: `app/Http/Controllers/Api/DashboardController.php`
- Create: `app/Http/Resources/DashboardConfigResource.php`
- Create: `app/Policies/DashboardPolicy.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/DashboardTest.php`

- [ ] **Step 1: Controller + Policy + Resource + Routes**

`GET /equipment/{id}/dashboard` — upsert or return existing. `PUT /equipment/{id}/dashboard` — save widgets jsonb. `DELETE /equipment/{id}/dashboard` — delete config (reset to defaults).

Policy: owner only for update/delete.

- [ ] **Step 2: Tests**

Тесты: get creates default config, put saves widgets, delete removes config, other user can't modify.

- [ ] **Step 3: Запустить тесты и commit**

```bash
make test -- --filter=DashboardTest
git add -A && git commit -m "feat: dashboard config API — per user per equipment"
```

---

## Task 10: Maintenance Types + Templates API

**Files:**
- Create: `app/Http/Controllers/Api/ChecklistTemplateController.php`
- Create: `app/Http/Resources/MaintenanceTypeResource.php`
- Create: `app/Http/Resources/ChecklistTemplateResource.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/ChecklistTemplateTest.php`

- [ ] **Step 1: Resources**

`MaintenanceTypeResource`: id, slug, label, estimated_duration_minutes, sort_order.
`ChecklistTemplateResource`: id, type (slug from relation), typeLabel, sort_order, description, requirement, tools, measurements, materials.

- [ ] **Step 2: Controller**

`GET /maintenance/types` — list MaintenanceType.
`GET /maintenance/templates?type=TO-1` — filter by slug.
`GET /maintenance/templates/{typeSlug}` — get templates for a type by slug.
`POST /maintenance/templates` — create (engineer/admin).
`PUT /maintenance/templates/{id}` — update.

- [ ] **Step 3: Tests and commit**

```bash
make test -- --filter=ChecklistTemplateTest
git add -A && git commit -m "feat: maintenance types and checklist templates API"
```

---

## Task 11: Maintenance Orders API

**Files:**
- Create: `app/Services/MaintenanceService.php`
- Create: `app/Http/Controllers/Api/MaintenanceOrderController.php`
- Create: `app/Http/Resources/MaintenanceOrderResource.php`
- Create: `app/Http/Resources/MaintenanceOrderListResource.php`
- Create: `app/Http/Resources/MaintenanceStepResource.php`
- Create: `app/Http/Resources/StepMeasurementResource.php`
- Create: `app/Http/Resources/StepMaterialResource.php`
- Create: `app/Http/Requests/Maintenance/StoreOrderRequest.php`
- Create: `app/Http/Requests/Maintenance/TransitionStatusRequest.php`
- Create: `app/Policies/MaintenanceOrderPolicy.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/MaintenanceOrderTest.php`
- Create: `tests/Unit/MaintenanceServiceTest.php`

- [ ] **Step 1: MaintenanceService**

`app/Services/MaintenanceService.php`:
```php
<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\StepStatus;
use App\Events\OrderApproved;
use App\Events\OrderStatusChanged;
use App\Models\MaintenanceOrder;
use App\Models\MaintenanceStep;
use App\Models\MaintenanceType;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class MaintenanceService
{
    private const TRANSITIONS = [
        'planned' => ['in_progress', 'cancelled'],
        'in_progress' => ['review', 'cancelled'],
        'review' => ['completed', 'in_progress'],
        'completed' => [],
        'cancelled' => [],
    ];

    public function createOrder(array $data, User $creator): MaintenanceOrder
    {
        $type = MaintenanceType::where('slug', $data['type'])->firstOrFail();
        $displayId = $this->generateDisplayId($type);

        return DB::transaction(function () use ($data, $creator, $type, $displayId) {
            $order = MaintenanceOrder::create([
                'display_id' => $displayId,
                'equipment_id' => $data['equipment_id'],
                'maintenance_type_id' => $type->id,
                'status' => OrderStatus::Planned,
                'created_by' => $creator->id,
                'assigned_to' => $data['assigned_to'] ?? null,
                'scheduled_date' => $data['scheduled_date'] ?? null,
                'executors' => $data['executors'] ?? null,
            ]);

            $this->copyTemplateSteps($order, $type);

            return $order->load('steps.measurements', 'steps.materials');
        });
    }

    public function transitionStatus(MaintenanceOrder $order, string $newStatus, array $payload = []): MaintenanceOrder
    {
        $currentStatus = $order->status->value;
        $allowed = self::TRANSITIONS[$currentStatus] ?? [];

        if (!in_array($newStatus, $allowed)) {
            throw new InvalidArgumentException(
                "Недопустимый переход: {$currentStatus} → {$newStatus}"
            );
        }

        return DB::transaction(function () use ($order, $newStatus, $payload) {
            switch ($newStatus) {
                case 'in_progress':
                    if ($order->status === OrderStatus::Review) {
                        // Return from review
                        $order->update([
                            'status' => OrderStatus::InProgress,
                            'return_reason' => $payload['reason'] ?? null,
                            'reviewed_by' => null,
                            'reviewed_at' => null,
                        ]);
                        // Reset failed steps to pending
                        $order->steps()
                            ->where('status', StepStatus::Failed)
                            ->update(['status' => StepStatus::Pending, 'started_at' => null, 'completed_at' => null]);
                    } else {
                        // Start order
                        $order->update([
                            'status' => OrderStatus::InProgress,
                            'started_at' => now(),
                            'operating_hours_at_start' => $payload['operating_hours'] ?? $order->equipment->operating_hours,
                        ]);
                    }
                    break;

                case 'review':
                    $hasUnfinished = $order->steps()
                        ->whereIn('status', [StepStatus::Pending, StepStatus::InProgress])
                        ->exists();
                    if ($hasUnfinished) {
                        throw new InvalidArgumentException('Не все шаги завершены');
                    }
                    $order->update(['status' => OrderStatus::Review]);
                    break;

                case 'completed':
                    $order->update([
                        'status' => OrderStatus::Completed,
                        'completed_at' => now(),
                        'reviewed_at' => now(),
                        'reviewed_by' => $payload['reviewed_by'] ?? null,
                        'accepted_by' => $payload['accepted_by'] ?? null,
                    ]);
                    event(new OrderApproved($order));
                    break;

                case 'cancelled':
                    $order->update(['status' => OrderStatus::Cancelled]);
                    break;
            }

            event(new OrderStatusChanged($order, $newStatus));

            return $order->fresh();
        });
    }

    public function startStep(MaintenanceOrder $order, MaintenanceStep $step): MaintenanceStep
    {
        if ($step->status !== StepStatus::Pending) {
            return $step; // Idempotent
        }

        $step->update([
            'status' => StepStatus::InProgress,
            'started_at' => now(),
        ]);

        return $step->fresh();
    }

    public function completeStep(MaintenanceOrder $order, MaintenanceStep $step, array $data): MaintenanceStep
    {
        $step->update([
            'status' => StepStatus::from($data['status']),
            'comment' => $data['comment'] ?? null,
            'completed_at' => now(),
            'started_at' => $step->started_at ?? now(), // Fallback if not started
        ]);

        if (!empty($data['measurements'])) {
            foreach ($data['measurements'] as $m) {
                $step->measurements()->where('id', $m['id'])->update([
                    'fact' => $m['fact'] ?? null,
                    'passed' => $m['passed'] ?? null,
                ]);
            }
        }

        if (!empty($data['materials'])) {
            foreach ($data['materials'] as $m) {
                $step->materials()->where('id', $m['id'])->update([
                    'volume' => $m['volume'] ?? null,
                    'brand' => $m['brand'] ?? null,
                ]);
            }
        }

        return $step->fresh()->load('measurements', 'materials');
    }

    private function copyTemplateSteps(MaintenanceOrder $order, MaintenanceType $type): void
    {
        $templates = $type->checklistTemplates()->with('measurements', 'materials')->get();

        foreach ($templates as $template) {
            $step = $order->steps()->create([
                'sort_order' => $template->sort_order,
                'description' => $template->description,
                'requirement' => $template->requirement,
                'tools' => $template->tools,
                'status' => StepStatus::Pending,
            ]);

            foreach ($template->measurements as $m) {
                $step->measurements()->create([
                    'description' => $m->description,
                    'unit' => $m->unit,
                    'norm' => $m->norm,
                ]);
            }

            foreach ($template->materials as $m) {
                $step->materials()->create([
                    'name' => $m->name,
                    'unit' => $m->unit,
                ]);
            }
        }
    }

    private function generateDisplayId(MaintenanceType $type): string
    {
        $prefix = str_replace('-', '', $type->slug);
        $count = MaintenanceOrder::where('maintenance_type_id', $type->id)->count() + 1;

        return $prefix . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
    }
}
```

- [ ] **Step 2: Requests**

`StoreOrderRequest`: equipment_id (required, exists), type (required, exists in maintenance_types.slug), assigned_to (nullable, exists:users), scheduled_date (nullable, date), executors (nullable, array).

`TransitionStatusRequest`: status (required, in:in_progress,review,completed,cancelled), reason (nullable string), operating_hours (nullable numeric), reviewed_by (nullable, exists:users), accepted_by (nullable, array).

- [ ] **Step 3: Resources**

`MaintenanceOrderListResource`: id, display_id, equipment (name), type (slug + label), status, assignee (name), scheduled_date, created_at.

`MaintenanceOrderResource`: full — equipment, type, creator, assignee, reviewer, steps with measurements/materials, timestamps, remarks.

`MaintenanceStepResource`, `StepMeasurementResource`, `StepMaterialResource`.

- [ ] **Step 4: Policy**

view: все. create: engineer. transitionStatus: depends on transition (mechanic starts/submits their own, foreman approves, engineer/admin cancels). delete: admin (planned only).

- [ ] **Step 5: Controller + Routes**

```php
Route::prefix('maintenance')->group(function () {
    Route::get('orders', [MaintenanceOrderController::class, 'index']);
    Route::post('orders', [MaintenanceOrderController::class, 'store']);
    Route::get('orders/{maintenanceOrder}', [MaintenanceOrderController::class, 'show']);
    Route::patch('orders/{maintenanceOrder}/status', [MaintenanceOrderController::class, 'transitionStatus']);
    Route::delete('orders/{maintenanceOrder}', [MaintenanceOrderController::class, 'destroy']);
});
```

- [ ] **Step 6: Unit tests для MaintenanceService**

Тесты state machine:
- createOrder copies steps from template with measurements/materials
- planned → in_progress sets started_at
- in_progress → review fails if steps incomplete
- in_progress → review succeeds when all steps done
- review → completed dispatches OrderApproved
- review → in_progress (return) resets failed steps
- invalid transition throws exception
- startStep is idempotent
- completeStep saves measurements and materials

- [ ] **Step 7: Feature tests**

Тесты endpoints: list with filters, create order, get order with steps, transition status, delete planned.

- [ ] **Step 8: Запустить тесты и commit**

```bash
make test -- --filter=Maintenance
git add -A && git commit -m "feat: maintenance orders API with MaintenanceService state machine"
```

---

## Task 12: Maintenance Steps API

**Files:**
- Create: `app/Http/Controllers/Api/MaintenanceStepController.php`
- Create: `app/Http/Requests/Maintenance/CompleteStepRequest.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/MaintenanceStepTest.php`

- [ ] **Step 1: CompleteStepRequest**

```php
public function rules(): array
{
    return [
        'status' => ['required', 'in:passed,failed,skipped'],
        'comment' => ['nullable', 'string'],
        'measurements' => ['nullable', 'array'],
        'measurements.*.id' => ['required', 'integer', 'exists:step_measurements,id'],
        'measurements.*.fact' => ['nullable', 'string'],
        'measurements.*.passed' => ['nullable', 'boolean'],
        'materials' => ['nullable', 'array'],
        'materials.*.id' => ['required', 'integer', 'exists:step_materials,id'],
        'materials.*.volume' => ['nullable', 'string'],
        'materials.*.brand' => ['nullable', 'string'],
    ];
}
```

- [ ] **Step 2: Controller**

```php
Route::post('maintenance/orders/{maintenanceOrder}/steps/{maintenanceStep}/start', [MaintenanceStepController::class, 'start']);
Route::patch('maintenance/orders/{maintenanceOrder}/steps/{maintenanceStep}', [MaintenanceStepController::class, 'complete']);
```

Controller calls `maintenanceService->startStep()` and `maintenanceService->completeStep()`.

- [ ] **Step 3: Tests**

Тесты: start step, complete step with measurements, complete step skipped, idempotent start.

- [ ] **Step 4: Запустить тесты и commit**

```bash
make test -- --filter=MaintenanceStepTest
git add -A && git commit -m "feat: maintenance steps API — start, complete with measurements/materials"
```

---

## Task 13: Documents + Journal + Audit + Parts + Schedule APIs

**Files:**
- Create: `app/Services/DocumentService.php`
- Create: `app/Services/AuditService.php`
- Create: `app/Http/Controllers/Api/DocumentController.php`
- Create: `app/Http/Controllers/Api/JournalController.php`
- Create: `app/Http/Controllers/Api/AuditController.php`
- Create: `app/Http/Controllers/Api/PartsController.php`
- Create: `app/Http/Controllers/Api/ScheduleController.php`
- Create: Resources for each
- Modify: `routes/api.php`
- Create: `tests/Feature/DocumentTest.php`
- Create: `tests/Feature/JournalTest.php`
- Create: `tests/Feature/AuditTest.php`
- Create: `tests/Feature/PartsTest.php`
- Create: `tests/Feature/ScheduleTest.php`

- [ ] **Step 1: DocumentService**

`app/Services/DocumentService.php`:
```php
<?php

namespace App\Services;

use App\Models\MaintenanceOrder;

class DocumentService
{
    public function generateAct(MaintenanceOrder $order): array
    {
        $order->load([
            'equipment', 'maintenanceType', 'creator', 'assignee', 'reviewer',
            'steps.measurements', 'steps.materials',
        ]);

        return [
            'order' => [
                'id' => $order->display_id,
                'type' => $order->maintenanceType->slug,
                'typeLabel' => $order->maintenanceType->label,
                'status' => $order->status->value,
                'startedAt' => $order->started_at?->toISOString(),
                'completedAt' => $order->completed_at?->toISOString(),
                'operatingHoursAtStart' => $order->operating_hours_at_start,
                'remarks' => $order->remarks,
            ],
            'equipment' => [
                'name' => $order->equipment->name,
                'model' => $order->equipment->model,
                'serial' => $order->equipment->serial,
            ],
            'executors' => $order->executors ?? [],
            'acceptedBy' => $order->accepted_by,
            'steps' => $order->steps->map(fn ($step) => [
                'description' => $step->description,
                'status' => $step->status->value,
                'comment' => $step->comment,
                'measurements' => $step->measurements->map(fn ($m) => [
                    'description' => $m->description,
                    'unit' => $m->unit,
                    'norm' => $m->norm,
                    'fact' => $m->fact,
                    'passed' => $m->passed,
                ])->toArray(),
                'materials' => $step->materials->map(fn ($m) => [
                    'name' => $m->name,
                    'unit' => $m->unit,
                    'volume' => $m->volume,
                    'brand' => $m->brand,
                ])->toArray(),
            ])->toArray(),
        ];
    }
}
```

- [ ] **Step 2: AuditService**

`app/Services/AuditService.php`:
```php
<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;

class AuditService
{
    public function log(string $action, User $user, ?string $details = null, ?int $equipmentId = null): AuditLog
    {
        return AuditLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'equipment_id' => $equipmentId,
            'details' => $details,
        ]);
    }
}
```

- [ ] **Step 3: Controllers + Resources + Routes**

`DocumentController`: `GET /maintenance/orders/{id}/document` → `DocumentService::generateAct()`.

`JournalController`: `GET /journal` (filters: equipment_id, date_from, date_to), `POST /journal`. Resource: JournalEntryResource.

`AuditController`: `GET /audit` (filters: equipment_id, limit). Resource: AuditLogResource (includes userName from user relation).

`PartsController`: `GET /equipment/{id}/parts`, `POST /equipment/{id}/parts`. Resource: PartsReplacementResource.

`ScheduleController`: `GET /equipment/{id}/schedule`. Resource: MaintenanceScheduleResource.

Routes:
```php
Route::get('maintenance/orders/{maintenanceOrder}/document', [DocumentController::class, 'show']);
Route::get('journal', [JournalController::class, 'index']);
Route::post('journal', [JournalController::class, 'store']);
Route::get('audit', [AuditController::class, 'index']);
Route::get('equipment/{equipment}/parts', [PartsController::class, 'index']);
Route::post('equipment/{equipment}/parts', [PartsController::class, 'store']);
Route::get('equipment/{equipment}/schedule', [ScheduleController::class, 'index']);
```

- [ ] **Step 4: Feature tests для каждого домена**

Минимум по 2-3 теста на контроллер: happy path + auth/validation.

- [ ] **Step 5: Запустить тесты и commit**

```bash
make test
git add -A && git commit -m "feat: documents, journal, audit, parts, schedule APIs"
```

---

## Task 14: Events & Listeners

**Files:**
- Create: `app/Events/SensorReadingRecorded.php`
- Create: `app/Events/ThresholdExceeded.php`
- Create: `app/Events/OrderStatusChanged.php`
- Create: `app/Events/OrderApproved.php`
- Create: `app/Listeners/CheckThresholds.php`
- Create: `app/Listeners/BroadcastAlert.php`
- Create: `app/Listeners/BroadcastSensorReading.php`
- Create: `app/Listeners/LogAuditEntry.php`
- Create: `app/Listeners/CreateJournalEntry.php`
- Create: `app/Listeners/CreateServiceHistoryEntry.php`
- Modify: `app/Providers/AppServiceProvider.php`
- Create: `tests/Feature/EventListenerTest.php`

- [ ] **Step 1: Events**

`app/Events/SensorReadingRecorded.php`:
```php
<?php

namespace App\Events;

use App\Models\SensorDefinition;
use App\Models\SensorReading;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SensorReadingRecorded
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public SensorDefinition $sensor,
        public SensorReading $reading,
    ) {}
}
```

`app/Events/ThresholdExceeded.php`:
```php
<?php

namespace App\Events;

use App\Models\Alert;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ThresholdExceeded
{
    use Dispatchable, SerializesModels;

    public function __construct(public Alert $alert) {}
}
```

`app/Events/OrderStatusChanged.php`:
```php
<?php

namespace App\Events;

use App\Models\MaintenanceOrder;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public MaintenanceOrder $order,
        public string $newStatus,
    ) {}
}
```

`app/Events/OrderApproved.php`:
```php
<?php

namespace App\Events;

use App\Models\MaintenanceOrder;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderApproved
{
    use Dispatchable, SerializesModels;

    public function __construct(public MaintenanceOrder $order) {}
}
```

- [ ] **Step 2: Listeners**

`CheckThresholds` — calls `AlertService::checkThresholds()` (который сам создаёт алерт через `createAlert()`). Implements `ShouldQueue`.

`BroadcastSensorReading` — broadcasts on channel `equipment.{id}.sensors`. Implements `ShouldQueue`.

`BroadcastAlert` — broadcasts on channel `equipment.{id}.alerts`. Implements `ShouldQueue`.

`LogAuditEntry` — calls `AuditService::log()` for order status changes.

`CreateJournalEntry` — on OrderApproved: creates journal entry with description, clearance, author.

`CreateServiceHistoryEntry` — on OrderApproved: creates service_history record.

**Нет `CreateAlert` listener** — алерт создаётся внутри `AlertService::checkThresholds()` → `createAlert()`. Отдельный listener не нужен.

- [ ] **Step 3: Register event→listener mapping**

Laravel 12 не создаёт `EventServiceProvider` по умолчанию. Зарегистрировать mapping в `AppServiceProvider::boot()` или через атрибуты на listener-классах (`#[AsListener(SensorReadingRecorded::class)]`).

Mapping:
```php
// В boot() AppServiceProvider или через Event::listen():
use Illuminate\Support\Facades\Event;

// SensorReadingRecorded → CheckThresholds, BroadcastSensorReading
Event::listen(SensorReadingRecorded::class, CheckThresholds::class);
Event::listen(SensorReadingRecorded::class, BroadcastSensorReading::class);

// ThresholdExceeded → BroadcastAlert (alert уже создан в AlertService::createAlert)
// НЕ добавлять CreateAlert — алерт создаётся в AlertService::checkThresholds() → createAlert()
Event::listen(ThresholdExceeded::class, BroadcastAlert::class);

// OrderStatusChanged → LogAuditEntry
Event::listen(OrderStatusChanged::class, LogAuditEntry::class);

// OrderApproved → CreateJournalEntry, CreateServiceHistoryEntry, LogAuditEntry
Event::listen(OrderApproved::class, CreateJournalEntry::class);
Event::listen(OrderApproved::class, CreateServiceHistoryEntry::class);
Event::listen(OrderApproved::class, LogAuditEntry::class);
```

**ВАЖНО:** `CreateAlert` listener НЕ слушает `ThresholdExceeded`. Поток: `CheckThresholds` → `AlertService::checkThresholds()` → `createAlert()` создаёт алерт + dispatch `ThresholdExceeded` → `BroadcastAlert` только пушит в WS. Файл `CreateAlert` listener **не создаётся**.
```

- [ ] **Step 4: Tests**

Test: OrderApproved creates journal + serviceHistory + audit entries. SensorReadingRecorded with threshold value creates alert.

- [ ] **Step 5: Запустить тесты и commit**

```bash
make test -- --filter=EventListener
git add -A && git commit -m "feat: events and listeners — threshold alerts, audit, journal auto-creation"
```

---

## Task 15: WebSocket + Sensor Simulator

**Files:**
- Create: `app/Console/Commands/SimulateSensors.php`
- Create: `app/Services/SimulatorService.php`
- Create: `app/Console/Commands/PruneSensorReadings.php`
- Modify: `routes/channels.php`
- Modify: `app/Console/Kernel.php` (или `routes/console.php`)

- [ ] **Step 1: SimulatorService**

`app/Services/SimulatorService.php`:
```php
<?php

namespace App\Services;

class SimulatorService
{
    private array $driftState = [];

    public function generateValue(int $sensorId, float $baseValue, float $min, float $max): float
    {
        $range = $max - $min;
        $variance = $range * 0.02;

        if (!isset($this->driftState[$sensorId])) {
            $this->driftState[$sensorId] = $baseValue;
        }

        $current = $this->driftState[$sensorId];
        $drift = (mt_rand(-100, 100) / 100) * $variance;
        $smoothed = $current + ($drift * 0.3);
        $value = max($min, min($max, $smoothed));
        $this->driftState[$sensorId] = $value;

        return round($value, 2);
    }
}
```

- [ ] **Step 2: SimulateSensors command**

`app/Console/Commands/SimulateSensors.php`:
```php
<?php

namespace App\Console\Commands;

use App\Models\Equipment;
use App\Services\SensorService;
use App\Services\SimulatorService;
use Illuminate\Console\Command;

class SimulateSensors extends Command
{
    protected $signature = 'app:simulate-sensors {--interval=5 : Seconds between readings}';
    protected $description = 'Simulate sensor readings for active equipment';

    private bool $running = true;

    public function handle(SensorService $sensorService, SimulatorService $simulator): int
    {
        $interval = (int) $this->option('interval');
        $this->info("Simulating sensors every {$interval}s. Press Ctrl+C to stop.");

        pcntl_signal(SIGTERM, fn () => $this->running = false);
        pcntl_signal(SIGINT, fn () => $this->running = false);

        while ($this->running) {
            $equipment = Equipment::with('sensorDefinitions')
                ->whereIn('status', ['working', 'idle'])
                ->get();

            foreach ($equipment as $eq) {
                foreach ($eq->sensorDefinitions as $sensor) {
                    $baseValue = ($sensor->max_value + $sensor->min_value) / 2;
                    $value = $simulator->generateValue(
                        $sensor->id,
                        $baseValue,
                        (float) $sensor->min_value,
                        (float) $sensor->max_value,
                    );
                    $sensorService->recordReading($sensor, $value);
                }
            }

            $this->line('[' . now()->format('H:i:s') . "] Generated readings for {$equipment->count()} rigs");

            pcntl_signal_dispatch();
            if ($this->running) {
                sleep($interval);
            }
        }

        $this->info('Simulator stopped.');
        return 0;
    }
}
```

- [ ] **Step 3: PruneSensorReadings command**

`app/Console/Commands/PruneSensorReadings.php`:
```php
<?php

namespace App\Console\Commands;

use App\Models\SensorReading;
use Illuminate\Console\Command;

class PruneSensorReadings extends Command
{
    protected $signature = 'app:prune-sensor-readings {--days=30 : Days to retain}';
    protected $description = 'Delete sensor readings older than N days';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoff = now()->subDays($days);

        $deleted = SensorReading::where('timestamp', '<', $cutoff)->delete();

        $this->info("Deleted {$deleted} readings older than {$days} days.");
        return 0;
    }
}
```

- [ ] **Step 4: Настроить Reverb channels**

`routes/channels.php`:
```php
<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('equipment.{equipmentId}.sensors', function ($user, $equipmentId) {
    return true; // All authenticated users can listen
});

Broadcast::channel('equipment.{equipmentId}.alerts', function ($user, $equipmentId) {
    return true;
});
```

- [ ] **Step 5: Настроить scheduler**

В `routes/console.php` (Laravel 12):
```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('app:prune-sensor-readings')->daily();
```

- [ ] **Step 6: Проверить работу симулятора**

```bash
make artisan app:simulate-sensors --interval=5
# Expected: generates readings, logs output every 5s
# Ctrl+C to stop
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: WebSocket channels, sensor simulator, readings pruning"
```

---

## Task 16: API Contract + финализация

**Files:**
- Create: `docs/api-contract/api-contract.md`
- Modify: `.env.example`

- [ ] **Step 1: Создать API контракт**

`docs/api-contract/api-contract.md` — документ описывающий все ~35 эндпоинтов с:
- URL, метод, описание
- Query параметры (фильтры, пагинация)
- Request body (JSON schema)
- Response (JSON пример)
- Error codes

Формат: Markdown с JSON-блоками. Source of truth для фронтенда.

- [ ] **Step 2: Обновить .env.example**

Убедиться что все необходимые переменные задокументированы.

- [ ] **Step 3: Запустить полный тестовый набор**

```bash
make fresh
make test
# Expected: all tests pass, 0 failures
```

- [ ] **Step 4: Проверить что Docker Compose поднимается с нуля**

```bash
make down
docker volume rm rudgormash-backend_postgres_data rudgormash-backend_redis_data 2>/dev/null
make build
make up
make migrate
make seed
# Expected: all services running, data seeded
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: API contract — full endpoint documentation"
```

---

## Чеклист по спеку

| Раздел спека | Task |
|--------------|------|
| §1 Цели и контекст | Task 1 (infra), Task 16 (contract) |
| §2 Docker Compose (6 сервисов) | Task 1 |
| §3 БД (20 таблиц) | Task 2 (migrations), Task 3 (models) |
| §4 API (~35 endpoints) | Tasks 4-13 |
| §4 Пагинация + JSON envelope | Tasks 4-13 (each controller) |
| §4 Сериализация связей | Tasks 6-13 (resources) |
| §5 MaintenanceService | Task 11 |
| §5 SensorService | Task 7 |
| §5 AlertService | Task 8 |
| §5 SimulatorService | Task 15 |
| §5 DocumentService | Task 13 |
| §5 AuditService | Task 13 |
| §6 Events & Listeners | Task 14 |
| §7 Auth (Sanctum + Spatie) | Task 4 |
| §8 Project structure | All tasks |
| §9 Seeders + demo data | Task 5 |
| §10 Testing | Tasks 4-14 (each has tests) |
| §11 API контракт | Task 16 |
| WebSocket channels | Task 15 |
| Prune command + scheduler | Task 15 |
