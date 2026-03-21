# Модуль ТО: Workflow технического обслуживания

**Цель:** Полноценный workflow технического обслуживания — создание нарядов, пошаговое выполнение (wizard), приёмка мастером, архив. На основе регламента ТО бурового станка СБШ-250МНА-32.

**Аналогия:** TMS (Test Management System) — создание тест-ранов → выполнение тест-кейсов по шагам → фиксация результатов.

---

## 1. Роли

| Роль | Код | Описание |
|------|-----|----------|
| Инженер | `engineer` | Создаёт наряды ТО, назначает механика, может отменить. Видит все наряды. |
| Механик | `mechanic` | Выполняет назначенные ТО по шагам (wizard). Отправляет на приёмку. |
| Мастер | `foreman` | Принимает завершённые ТО. Может утвердить или вернуть на доработку с указанием причины. |

Роль выбирается при логине (mock dropdown на странице входа). Хранится в `authStore.userRole`.

**Миграция с `admin`:** Существующая роль `admin` в mock-данных заменяется на `engineer`. Роль `admin` больше не используется. `ROLE_LABELS` не включает `admin`. Компоненты, ссылающиеся на `role === 'admin'` (например `SettingsSecurity.vue`), обновляются на `role === 'engineer'`.

---

## 2. Модель данных

### 2.1. MaintenanceOrder (наряд ТО)

```js
{
  id: 'MO-001',
  equipmentId: 'БУР-12',
  type: 'ТО-1',                     // ЕО, ТО-1..ТО-3, ТР-1..ТР-3, КР
  status: 'planned',                // planned | in_progress | review | completed | cancelled
  createdBy: { id, name, role },
  assignedTo: { id, name },          // механик
  reviewedBy: { id, name } | null,   // мастер
  createdAt: timestamp,
  startedAt: timestamp | null,
  completedAt: timestamp | null,
  reviewedAt: timestamp | null,
  returnReason: string | null,       // причина последнего возврата мастером (при повторных возвратах хранится только последняя)
  operatingHoursAtStart: number,     // из equipment.operatingHours в момент перехода в in_progress
  scheduledDate: string | null,      // плановая дата
  steps: [
    {
      id: 'step-1',
      description: 'Проверить уровень масла',
      requirement: 'Визуальный осмотр',
      tools: 'Щуп',
      status: 'pending',             // pending | passed | failed | skipped
      comment: '' | null,
      completedAt: timestamp | null,
    }
  ],
}
```

**`progress` — вычисляется, не хранится.** Прогресс рассчитывается из `steps` при рендеринге через computed/getter в store:
```js
function getProgress(order) {
  const steps = order.steps
  return {
    total: steps.length,
    passed: steps.filter(s => s.status === 'passed').length,
    failed: steps.filter(s => s.status === 'failed').length,
    skipped: steps.filter(s => s.status === 'skipped').length,
    pending: steps.filter(s => s.status === 'pending').length,
  }
}
```

### 2.2. User (мок-пользователь)

```js
{
  id: 'user-1',
  name: 'Иванов А.П.',
  role: 'engineer',  // engineer | mechanic | foreman
}
```

### 2.3. Новые константы

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

---

## 3. Жизненный цикл наряда

```
Запланировано (planned)
    ↓ механик нажимает «Начать выполнение»
В работе (in_progress)
    ↓ механик прошёл все шаги, нажимает «Отправить на приёмку»
На приёмке (review)
    ├→ мастер нажимает «Утвердить» → Завершено (completed)
    └→ мастер нажимает «Вернуть» + причина → В работе (in_progress)
         ↓ механик исправляет, снова отправляет на приёмку → review → ...

Отменено (cancelled) — инженер может отменить на любом этапе, кроме completed.
```

Возврат мастером: наряд возвращается в `in_progress`, `returnReason` заполняется. Механик видит причину, может изменить статусы шагов и комментарии, затем снова отправить на приёмку.

**Правило отправки на приёмку:** Механик может отправить на приёмку когда **все** шаги имеют статус (нет `pending`). Минимального порога pass нет — механик может отправить наряд даже если все шаги `failed` (мастер решает, что делать). Комментарий обязателен при статусе `failed`.

**Аудит:** Каждая смена статуса наряда записывается в аудит лог. Действия и их `action` значения:
- `maintenance_order_created` — создание наряда
- `maintenance_order_started` — механик начал выполнение
- `maintenance_order_submitted` — отправлено на приёмку
- `maintenance_order_approved` — мастер утвердил
- `maintenance_order_returned` — мастер вернул
- `maintenance_order_cancelled` — инженер отменил

---

## 4. Маршрутизация

| Path | Name | View | Breadcrumb |
|------|------|------|------------|
| `/maintenance` | maintenance | MaintenanceView | Техобслуживание |
| `/maintenance/create` | maintenance-create | MaintenanceCreateView | Техобслуживание / Создание |
| `/maintenance/:id` | maintenance-detail | MaintenanceDetailView | Техобслуживание / :id |

Все маршруты под `requiresAuth`. Lazy-load.

В сайдбаре: пункт «Техобслуживание» (иконка `ClipboardCheck`) в группе «Основное», после «Оборудование». Название совпадает с breadcrumb.

---

## 5. Страницы и компоненты

### 5.1. MaintenanceView — Kanban-доска

4 колонки: Запланировано / В работе / На приёмке / Завершено. Отменённые наряды не показываются на kanban по умолчанию. В фильтрах есть переключатель «Показать отменённые» — при включении они отображаются в колонке «Завершено» с серым badge «Отменено».

**Карточка наряда (OrderCard):**
- Badge с типом ТО (ТО-1, ТР-2, ...)
- ID оборудования + модель
- Исполнитель (аватар + имя)
- Дата создания
- Прогресс-бар (5/9 шагов)
- Клик → переход на `/maintenance/:id`

**Фильтры (OrderFilters):**
- Оборудование (shadcn Select)
- Тип ТО (shadcn Select)
- Исполнитель (shadcn Select)
- Механик видит «Мои наряды» по умолчанию (переключатель)

**Действия:**
- Кнопка «Создать ТО» — видна только инженеру → `/maintenance/create`
- Колонка «Завершено» показывает последние 10, кнопка «Показать все» → раскрывает полный список в колонке (inline, без навигации)

### 5.2. MaintenanceCreateView — Wizard создания (3 шага)

**Шаг 1 (CreateStepEquipment):**
- Выбор оборудования (shadcn Select из equipmentStore.list)
- Выбор типа ТО (shadcn Select: ЕО, ТО-1..ТО-3, ТР-1..ТР-3, КР)
- При выборе — показывает карточку: наработка оборудования, последнее ТО, рекомендуемый тип

**Шаг 2 (CreateStepChecklist):**
- Предзаполненный чек-лист из регламента для выбранного типа
- Каждый шаг: описание, требования, инструменты
- Кнопки: добавить шаг, удалить шаг, редактировать текст
- Drag-and-drop для изменения порядка не нужен — просто стрелки вверх/вниз

**Шаг 3 (CreateStepAssign):**
- Назначить механика (shadcn Select из списка механиков)
- Плановая дата (shadcn Input type="date")
- Сводка: оборудование, тип, кол-во шагов, механик, дата

Кнопка «Создать наряд» → создаёт order со статусом `planned`, записывает в аудит, редирект на kanban.

### 5.3. MaintenanceDetailView — Карточка наряда + Wizard выполнения

**Шапка (OrderHeader):**
- Кнопка «← Техобслуживание» (назад на kanban)
- ID наряда, тип ТО (badge), оборудование
- Статус (badge с цветом)
- Создал / Исполнитель / Проверил
- Даты: создан, начат, завершён
- Наработка при начале

**Причина возврата:**
- Если наряд был возвращён мастером — жёлтый блок сверху с причиной и датой

**Тело — зависит от статуса и роли:**

| Статус | Механик (назначенный) | Мастер | Инженер / другие |
|--------|----------------------|--------|-----------------|
| planned | Кнопка «Начать выполнение» | Просмотр шагов | Просмотр + «Отменить» |
| in_progress | **StepWizard** | Просмотр прогресса | Просмотр + «Отменить» |
| review | Просмотр (ожидание) | **ReviewActions** | Просмотр |
| completed | Просмотр результатов | Просмотр результатов | Просмотр результатов |
| cancelled | Просмотр | Просмотр | Просмотр |

**StepWizard — пошаговое выполнение:**
- Прогресс-бар сверху (StepProgress): шаг N из M, визуальная шкала
- Один шаг на экране (StepCard):
  - Номер шага и описание (крупно)
  - Требования (текст)
  - Необходимые инструменты (текст)
  - 3 кнопки: «Выполнено» (зелёная) / «Не выполнено» (красная) / «Пропущено» (серая)
  - Поле комментария (textarea, необязательное; обязательное при «Не выполнено»)
  - Навигация: «← Назад» / «Далее →» (или «Отправить на приёмку» на последнем шаге)
- Можно перейти на любой предыдущий шаг и изменить статус/комментарий
- После последнего шага — сводка (OrderSummary):
  - Таблица всех шагов с их статусами
  - Статистика: выполнено X, не выполнено Y, пропущено Z
  - Кнопка «Отправить на приёмку»

**ReviewActions — действия мастера:**
- Таблица всех шагов с результатами и комментариями
- Статистика
- Кнопка «Утвердить» (зелёная)
- Кнопка «Вернуть на доработку» (жёлтая) + обязательное поле причины

**Просмотр (completed/cancelled):**
- Таблица шагов с результатами (read-only)
- Статистика
- Все даты и участники

---

## 6. Чек-листы из регламента

### Существующие (из PDF, таблицы 4-7):
- **ЕО** (8 пунктов): журнал тех.состояния, проверка инструмента, течи масла, КИП, уровень масла, изоляция кабелей, заземление, тормоза
- **ТО-1** (9 пунктов): крепления трубопроводов, опоры мачты, гусеничные ленты, смазка, уровень масла редукторов, электроаппаратура, тормоза, канаты, крепления проводов
- **ТО-2** (7 пунктов): металлоконструкции, заземление, очистка шкафов, изоляция электродвигателей, радиаторы, фильтры, смазка
- **ТО-3** (4 пункта): замена масла редукторов хода, редуктор вращателя, гидросистема, смазка

### Новые (генерируемые по логике регламента):
- **ТР-1** (8 пунктов): ревизия тормозной системы, замена подшипников вращателя, проверка гидроцилиндров подачи, ревизия пневмосистемы, проверка сварных швов мачты, замена манжет гидроцилиндров, ревизия электрошкафов, дефектация канатов
- **ТР-2** (10 пунктов): капремонт редукторов хода, замена канатов, полная ревизия электрошкафов, замена гидрошлангов, ревизия компрессора, замена футеровки, ревизия поворотной платформы, перепрессовка пальцев гусениц, ревизия вращателя, проверка рамы
- **ТР-3** (12 пунктов): разборка/сборка ходовой части, замена вращателя, капремонт компрессора, замена электродвигателей, полная дефектация гидросистемы, ревизия мачты с заменой секций, замена кабельного барабана, ревизия системы пылеподавления, замена опорно-поворотного устройства, капремонт лебёдки, ревизия системы охлаждения, восстановление антикоррозийного покрытия
- **КР** (15 пунктов): полная дефектация рамы, восстановление/замена мачты, замена ходовой части, полная замена гидросистемы, замена всех электродвигателей, замена компрессора, восстановление кабины оператора, полная замена КИП, восстановление системы пылеподавления, замена поворотной платформы, установка нового вращателя, монтаж новой лебёдки, полная замена кабельного хозяйства, покраска и антикоррозийная обработка, комплексные испытания

---

## 7. Ролевая модель в UI (permissions)

**Composable `usePermissions()`:**
```js
export function usePermissions() {
  const auth = useAuthStore()
  const canCreate = computed(() => auth.userRole === 'engineer')
  const canExecute = (order) => auth.userRole === 'mechanic' && order.assignedTo?.id === auth.userId
  const canReview = computed(() => auth.userRole === 'foreman')
  const canCancel = (order) => auth.userRole === 'engineer' && !['completed', 'cancelled'].includes(order.status)
  return { canCreate, canExecute, canReview, canCancel }
}
```

Компоненты используют `v-if` с permissions. Маршруты доступны всем ролям — ограничения только на уровне действий.

Механик по умолчанию видит kanban отфильтрованный по «Мои наряды», может снять фильтр.

---

## 8. Mock-слой

### Новые файлы:
- `src/api/mock/users.js` — 4 пользователя (1 инженер, 2 механика, 1 мастер)
- `src/api/users.js` — обёртка `getUsers()`, `getUsersByRole(role)`

### Расширение существующих:
- `src/api/mock/maintenance.js`:
  - Добавить чек-листы ТР-1, ТР-2, ТР-3, КР
  - Добавить `MOCK_ORDERS` (5-7 нарядов в разных статусах)
  - Функции: `getOrders(filters)`, `getOrder(id)`, `createOrder(data)`, `updateOrderStatus(id, status, payload)`, `updateOrderSteps(id, steps)`
  - Персистенция: orders хранятся в памяти (как текущие checklists), при перезагрузке сбрасываются к mock
- `src/api/maintenance.js` — добавить обёртки для новых функций

### Расширение auth:
- `src/stores/auth.js` — добавить `userId` как `computed(() => user.value?.id || null)` и добавить в `return { ... }`. Тип `id` — строка (не число).
- `src/api/auth.js` — заменить `MOCK_USER` с `id: 1, role: 'admin'` на lookup из mock/users.js. Функция `login(credentials)` принимает `credentials.role` (строка) и возвращает первого пользователя с этой ролью. Поле `id` — строка (`'user-1'`), не число.
- `src/views/LoginView.vue` — добавить dropdown выбора роли (shadcn Select) с вариантами: Инженер, Механик, Мастер. Значение передаётся в `credentials.role`. Поле username остаётся, но при mock-авторизации роль определяет пользователя.
- `src/components/settings/SettingsSecurity.vue` — заменить `role === 'admin'` на динамическое отображение роли через `ROLE_LABELS[authStore.userRole]` вместо хардкода «Администратор»/«Пользователь»

### Интеграция usePermissions с шаблонами:
- `canCreate` и `canReview` — computed, использовать как `v-if="canCreate"` (без .value в template)
- `canExecute(order)` и `canCancel(order)` — функции, использовать как `v-if="canExecute(order)"`

---

## 9. Компонентная структура

### Новые файлы:

```
src/
├── views/
│   ├── MaintenanceView.vue              # Kanban-доска
│   ├── MaintenanceCreateView.vue        # Wizard создания (3 шага)
│   └── MaintenanceDetailView.vue        # Карточка + wizard выполнения
├── components/maintenance/
│   ├── KanbanBoard.vue                  # 4 колонки
│   ├── KanbanColumn.vue                 # Одна колонка
│   ├── OrderCard.vue                    # Карточка наряда
│   ├── OrderFilters.vue                 # Фильтры
│   ├── OrderHeader.vue                  # Шапка карточки
│   ├── OrderSummary.vue                 # Сводка результатов
│   ├── StepWizard.vue                   # Wizard пошагового выполнения
│   ├── StepCard.vue                     # Один шаг wizard
│   ├── StepProgress.vue                 # Прогресс-бар
│   ├── CreateStepEquipment.vue          # Шаг 1 создания
│   ├── CreateStepChecklist.vue          # Шаг 2 создания
│   ├── CreateStepAssign.vue             # Шаг 3 создания
│   └── ReviewActions.vue                # Действия мастера
├── composables/
│   └── usePermissions.js                # Ролевые permissions
├── api/
│   ├── users.js                         # API обёртка
│   └── mock/users.js                    # Мок пользователи
```

### Модификации:
- `src/router/index.js` — 3 новых маршрута
- `src/stores/maintenance.js` — расширить store: добавить `orders` (ref, массив), `currentOrder` (ref), `ordersLoading` (ref, отдельный от существующего `loading`). Новые actions: `loadOrders(filters)`, `loadOrder(id)`, `createOrder(data)`, `startOrder(id)`, `completeStep(orderId, stepId, status, comment)`, `submitForReview(id)`, `approveOrder(id)`, `returnOrder(id, reason)`, `cancelOrder(id)`. Геттер `getProgress(order)` — вычисляет прогресс из steps
- `src/api/maintenance.js` — новые методы
- `src/api/mock/maintenance.js` — orders CRUD, чек-листы ТР/КР
- `src/api/auth.js` — MOCK_USER → lookup из mock/users.js по роли
- `src/stores/auth.js` — добавить userId computed
- `src/views/LoginView.vue` — dropdown роли
- `src/components/layout/sidebarMenu.js` — пункт «Техобслуживание»
- `src/utils/constants.js` — ORDER_STATUSES, STEP_STATUSES, ROLE_LABELS
- `src/components/equipment/MaintenanceTab.vue` — добавить ссылку на модуль ТО (см. ниже)
- `src/components/settings/SettingsSecurity.vue` — admin → engineer

### Интеграция с MaintenanceTab.vue:
Существующий таб «ТО» на странице оборудования остаётся для просмотра графика ТО и прогресса наработки. Добавляется:
- Кнопка «Создать наряд» (только для инженера) → переход на `/maintenance/create?equipmentId=БУР-12` с предзаполненным оборудованием
- Список последних нарядов по этому оборудованию (из maintenanceStore.orders, фильтр по equipmentId) — компактные карточки со статусом, клик → `/maintenance/:id`

Существующий чек-лист в MaintenanceTab (простой toggle `completed: true/false`) остаётся как быстрый просмотр регламентных операций. Он НЕ связан с нарядами — это справочник «что делать при ТО-1». Наряды — это формальный workflow «кто, когда, с каким результатом».

### Совместимость чек-листов:
Существующие чек-листы в `mock/maintenance.js` (формат `{ id, description, requirement, tools, completed }`) остаются для MaintenanceTab.vue. Для нарядов используются те же шаблоны, но при создании наряда конвертируются в новый формат `{ id, description, requirement, tools, status: 'pending', comment: null, completedAt: null }`. Конвертация происходит в `createOrder()` — берёт шаблон чек-листа и маппит в step-формат.

### Loading/error states:
Все новые views следуют существующему паттерну: LoadingSpinner при загрузке, блок ошибки при неудаче, пустое состояние (empty state) если нет данных. MaintenanceView показывает пустые колонки с подписью «Нет нарядов» если orders пуст.

---

## 10. Что НЕ входит в scope

- Drag-and-drop карточек между колонками kanban (только визуальное разделение)
- Вложения файлов/фото к шагам (только текстовые комментарии)
- Числовые замеры в шагах (только статус + комментарий)
- Уведомления/email при смене статуса (только аудит лог)
- Печать наряда / экспорт PDF
- Привязка к реальному бекенду (всё на моках)
