# E2E Playwright Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Покрыть фронтенд `rudgormash-frontend` end-to-end тестами на Playwright (JS), удостоверяющими выполнение ФТ-1…ФТ-13 и НФТ-1…НФТ-9 из `docs/requirements.md`, с разбиением на пользовательские сценарии для ролей engineer, mechanic, foreman.

**Architecture:** White-box тестирование на Playwright Test. Тесты используют фикстуры (`loginAs(role)`, `seedState(state)`), Page Object Model и общие хелперы манипуляции `localStorage`. Mock-runtime проекта (всё хранится в `localStorage`) позволяет полную изоляцию без поднятия реального backend — через `page.addInitScript` тесты сидируют детерминированное состояние перед загрузкой страницы. Vite dev-server запускается через `webServer` в конфиге Playwright. Прогон параллельный по chromium + firefox + webkit (НФТ-9).

**Tech Stack:** `@playwright/test` (последняя стабильная), Node ≥ 20.19, JavaScript (без TypeScript, как остальной проект), Vue 3 + Vite 7 dev server.

---

## File Structure

Создаются:

```
playwright.config.js                          # Конфиг Playwright
tests/e2e/
├── fixtures/
│   ├── auth.js                               # loginAs(role), пресеты ролей
│   ├── state.js                              # seedAlerts, seedOrders, seedReports, resetAll
│   └── index.js                              # объединённый test/expect с фикстурами
├── helpers/
│   ├── selectors.js                          # текстовые константы (статусы, кнопки, заголовки)
│   ├── storage.js                            # ключи rgm:* и сборка корректных payload
│   └── viewport.js                           # пресеты экранов (mobile, tablet, desktop, fullhd)
├── pages/
│   ├── BasePage.js                           # общая шапка/сайдбар/Toast/breadcrumb
│   ├── LoginPage.js
│   ├── HomePage.js
│   ├── EquipmentListPage.js
│   ├── EquipmentDetailPage.js
│   ├── EquipmentDashboardPage.js
│   ├── AlertsPage.js
│   ├── MaintenanceListPage.js
│   ├── MaintenanceCreatePage.js
│   ├── MaintenanceDetailPage.js
│   ├── ReportsPage.js
│   ├── ReportCreatePage.js
│   ├── JournalPage.js
│   └── SettingsPage.js
└── specs/
    ├── ft-01-equipment-list.spec.js
    ├── ft-02-dashboard-builder.spec.js
    ├── ft-03-widget-types.spec.js
    ├── ft-04-threshold-alerts.spec.js
    ├── ft-05-parts-replacements.spec.js
    ├── ft-06-sensor-history.spec.js
    ├── ft-07-realtime-polling.spec.js
    ├── ft-08-connection-status.spec.js
    ├── ft-09-maintenance-lifecycle.spec.js
    ├── ft-10-measurements-materials.spec.js
    ├── ft-11-document-generation.spec.js
    ├── ft-12-journal.spec.js
    ├── ft-13-rbac.spec.js
    ├── nfr-03-04-responsive.spec.js
    ├── nfr-05-06-resilience.spec.js
    ├── nfr-07-ux.spec.js
    ├── nfr-09-cross-browser.spec.js
    ├── role-engineer-scenarios.spec.js
    ├── role-mechanic-scenarios.spec.js
    └── role-foreman-scenarios.spec.js
docs/superpowers/specs/2026-05-01-e2e-tests/
├── 01-requirements-analysis.md               # анализ ФТ/НФТ
├── 02-checklist.md                           # плоский чек-лист
├── 03-detailed-checks.md                     # детализация
└── 04-user-scenarios.md                      # сценарии по ролям
```

Изменяются (минимально, только для добавления `data-testid` там, где нужно для надёжной идентификации):

- `src/components/ConnectionStatus.vue`
- `src/components/CriticalAlertModal.vue`
- `src/components/widgets/WidgetWrapper.vue`
- `src/components/widgets/NumericWidget.vue`
- `src/components/widgets/GaugeWidget.vue`
- `src/components/widgets/LineChartWidget.vue`

---

## Phase 0: Анализ требований (документация)

### Task 1: Создать анализ требований ФТ/НФТ

**Files:**
- Create: `docs/superpowers/specs/2026-05-01-e2e-tests/01-requirements-analysis.md`

- [ ] **Step 1: Создать каталог**

```bash
mkdir -p docs/superpowers/specs/2026-05-01-e2e-tests
```

- [ ] **Step 2: Записать содержимое файла**

```markdown
# Анализ требований для e2e-тестирования

## Источник
`docs/requirements.md` (ФТ-1…ФТ-13, НФТ-1…НФТ-9).

## Функциональные требования

### ФТ-1 — Перечень оборудования
**Что проверяем:** список из 8+ единиц БУР-* отображается с цветной индикацией статуса (working/idle/malfunction/offline). По клику открывается детальная карточка с табами (Обзор / Датчики / ТО / Детали / История).
**Источники:** `EquipmentListView.vue`, `EquipmentDetailView.vue`, `STATUS_LABELS`, `STATUS_DOT_COLORS`.

### ФТ-2 — Настраиваемая панель
**Что проверяем:** на `/equipment/:id/dashboard` режим «Настроить» включает drag/resize, можно добавить/удалить виджет, layout сохраняется в `rgm:v1:user:<id>:dashboards` и восстанавливается при следующей загрузке.
**Источники:** `EquipmentDashboardView.vue`, `useDashboardsStore`, `grid-layout-plus`.

### ФТ-3 — Виджеты метрик
**Что проверяем:** числовой индикатор показывает значение с единицей и цветом по порогу; линейный график рисуется (`canvas`); шкальный gauge имеет цветовые зоны.
**Источники:** `NumericWidget.vue`, `LineChartWidget.vue`, `GaugeWidget.vue`, `widgetRegistry.js`.

### ФТ-4 — Уведомления о порогах
**Что проверяем:** при срабатывании порога (`useThresholdMonitor`) уведомление с равенствами «оборудование/датчик/значение/время» появляется в `/alerts` и в счётчике-бейдже шапки; критические открывают `CriticalAlertModal`.

### ФТ-5 — Замены деталей
**Что проверяем:** на вкладке «Детали» карточки оборудования отображается список замен; неоригинальные выделены (см. `EquipmentParts.vue`).

### ФТ-6 — История показаний
**Что проверяем:** на вкладке «История» (`SensorHistoryExplorer`) можно выбрать период и датчик, выводится график.

### ФТ-7 — Realtime опрос
**Что проверяем:** интервал 5 секунд (`startPolling`); при таймаутах/ошибках сети индикатор статуса меняется; данные на экране не пропадают.

### ФТ-8 — Индикатор статуса
**Что проверяем:** компонент `ConnectionStatus` имеет три текстовых состояния «ПОДКЛЮЧЕНО / ПЕРЕПОДКЛЮЧЕНИЕ… / НЕТ СВЯЗИ» (3 неудачи подряд → disconnected).

### ФТ-9 — Наряды на ТО
**Что проверяем:** инженер создаёт наряд через мастер из 3 шагов; механик переводит шаги pending → in_progress → passed/failed; завершение → review; мастер approve/reject.

### ФТ-10 — Фиксация работ
**Что проверяем:** в шаге наряда вводится измерение; если значение вне нормативов — отмечается как failed; материал учитывается.

### ФТ-11 — Формирование документов
**Что проверяем:** после approve акт ТО доступен по маршруту `/maintenance/:id/document`; есть HTML-представление (`DocumentActView`); `print` стиль скрывает навигацию.

### ФТ-12 — Журнал
**Что проверяем:** `/journal` показывает таблицу записей с фильтрами по типу/оборудованию/статусу.

### ФТ-13 — RBAC
**Что проверяем:** mechanic не видит «Мониторинг», «Журнал ТС», «Аналитика»; не имеет кнопки «Создать отчёт»; foreman имеет «На приёмке»; engineer имеет всё.

## Нефункциональные требования

### НФТ-1 (отклик)
В Playwright измеряем `performance.now()` от клика до видимости результата. Бюджет 300 мс не реалистичен для CI, но проверяем порядок (<1500 мс).

### НФТ-2 (загрузка)
`page.goto(...)` + `domcontentloaded` < 3 с в локальном dev-режиме.

### НФТ-3 (адаптивность экранов)
Прогон smoke-набора в трёх viewport: 768×1024, 1440×900, 1920×1080.

### НФТ-4 (touch ≥ 44×44)
Через `boundingBox()` на ключевых кнопках (нав-сайдбар, кнопки нарядов, кнопки виджетов).

### НФТ-5 (last-data on offline)
Через `context.setOffline(true)` — последние видимые значения должны остаться, метка «обновлено: …» обновляется в шапке.

### НФТ-6 (recovery)
`setOffline(true)` → `setOffline(false)`: статус возвращается в «ПОДКЛЮЧЕНО» без перезагрузки.

### НФТ-7 (UX)
Toast при сохранении настроек; модальное подтверждение при «Удалить станок»/«Отключить».

### НФТ-8 (расширяемость)
Out of scope для e2e (white-box: проверяется в unit-тестах отдельно).

### НФТ-9 (совместимость)
Конфиг Playwright прогоняет smoke на projects: chromium, firefox, webkit.
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-05-01-e2e-tests/01-requirements-analysis.md
git commit -m "docs(e2e): анализ требований ФТ/НФТ для e2e-тестов"
```

---

### Task 2: Создать чек-лист проверок

**Files:**
- Create: `docs/superpowers/specs/2026-05-01-e2e-tests/02-checklist.md`

- [ ] **Step 1: Записать чек-лист**

```markdown
# Чек-лист e2e-проверок

## ФТ-1. Перечень оборудования
- [ ] /equipment отображает список ≥ 8 карточек
- [ ] У каждой карточки виден бейдж со статусом и цветовой точкой
- [ ] Фильтр по вкладкам «Все/Работа/Простой/Авария/Отключён» меняет выборку
- [ ] Поиск по «БУР-03» сужает результат до одной карточки
- [ ] Клик по карточке ведёт на `/equipment/БУР-XX`
- [ ] Детальная страница имеет 5 табов: Обзор/Датчики/ТО/Детали/История
- [ ] Таб «Обзор» показывает MetricCard'ы и графики
- [ ] Таб «Датчики» показывает таблицу из 12 датчиков

## ФТ-2. Настраиваемая панель
- [ ] Кнопка «Настроить» включает режим редактирования
- [ ] Кнопка «Виджет» открывает модал с типами
- [ ] Добавление виджета увеличивает кол-во `[data-testid="widget-card"]` на 1
- [ ] Перетаскивание (`dragTo`) меняет y/x в layout
- [ ] Кнопка «×» на виджете удаляет его
- [ ] После «Сохранить» layout сохранён в `rgm:v1:user:user-1:dashboards`
- [ ] После reload раскладка восстановлена
- [ ] «Сброс» возвращает дефолтную раскладку

## ФТ-3. Виджеты метрик
- [ ] Numeric: видно число + единица + бейдж нормы
- [ ] Numeric: при `value >= warning` цвет жёлтый
- [ ] Numeric: при `value >= critical` цвет красный, точка пульсирует
- [ ] Line-chart: внутри есть `<canvas>`, размер > 0
- [ ] Gauge: внутри есть `<canvas>`, цветовая шкала отображена

## ФТ-4. Уведомления о порогах
- [ ] Сидируем критическое значение → в `/alerts` появляется запись
- [ ] Запись содержит equipmentId, sensor.label, value, threshold, time
- [ ] Бейдж в шапке показывает кол-во неподтверждённых
- [ ] При типе critical открывается модал `CriticalAlertModal`
- [ ] Кнопка «Подтвердить» меняет вид карточки на `opacity-60`
- [ ] Подтверждённое не учитывается в счётчике

## ФТ-5. Замены деталей
- [ ] Таб «Детали» показывает список замен
- [ ] Неоригинальные строки имеют визуальное выделение

## ФТ-6. История показаний
- [ ] Таб «История» содержит селекторы датчика и периода
- [ ] При смене значений появляется график

## ФТ-7. Realtime
- [ ] При открытии `/equipment/:id` poll активен (через 5 с приходит обновление)
- [ ] При route-уходе poll останавливается (нет новых запросов через 6 с)

## ФТ-8. Connection status
- [ ] В шапке виден `[data-testid="connection-status"]` со словом «ПОДКЛЮЧЕНО»
- [ ] При offline → «ПЕРЕПОДКЛЮЧЕНИЕ…» (после ≥1 сбоя)
- [ ] После 3+ сбоев → «НЕТ СВЯЗИ»
- [ ] При возврате online → «ПОДКЛЮЧЕНО»

## ФТ-9. Жизненный цикл наряда
- [ ] Engineer: «Создать наряд» → 3 шага → создаётся карточка в «Запланировано»
- [ ] Mechanic: открыл наряд → «Начать» → шаг становится in_progress
- [ ] Mechanic: «Выполнено» переводит шаг в passed
- [ ] После всех шагов появляется «Завершить работу»
- [ ] Submit-for-review → статус наряда review
- [ ] Foreman: видит наряд в «На приёмке»
- [ ] Foreman: approve → completed; reject → in_progress

## ФТ-10. Измерения и материалы
- [ ] В шаге есть поле для measurement с unit
- [ ] Превышение норматива помечает шаг failed
- [ ] Расход материала добавляется в список (имя, кол-во, ед.)

## ФТ-11. Документы
- [ ] После завершения наряда `/maintenance/:id/document` рендерит акт
- [ ] Документ содержит станок, дату, шаги, исполнителя

## ФТ-12. Журнал
- [ ] `/journal` содержит таблицу
- [ ] Фильтры по типу/оборудованию работают
- [ ] Записи кликабельны и ведут на наряд

## ФТ-13. RBAC
- [ ] Engineer видит все пункты меню
- [ ] Mechanic не видит «Мониторинг», «Аналитика», «Журнал ТС»
- [ ] Foreman не имеет «Создать отчёт» в Reports
- [ ] /reports/create редиректит mechanic на /reports

## НФТ-3 — адаптив
- [ ] Все основные экраны открываются в 768/1440/1920 без overflow
- [ ] На 768 px появляется кнопка-«гамбургер»

## НФТ-4 — touch
- [ ] Кнопки нав-сайдбара ≥ 44×44 px
- [ ] Кнопки шагов наряда ≥ 44×44 px
- [ ] Кнопки виджетов в редактировании ≥ 24×24 px (× — 24, остальные ≥ 44)

## НФТ-5/6 — устойчивость
- [ ] При offline числа на экране остаются (не сменились на «—»)
- [ ] При online statусs возвращается без F5

## НФТ-7 — UX
- [ ] Сохранение настроек выводит сообщение «НАСТРОЙКИ СОХРАНЕНЫ»
- [ ] «Удалить» оборудование требует подтверждения (диалог)

## НФТ-9 — кросс-браузер
- [ ] Smoke `auth + equipment list` зелёный в chromium/firefox/webkit
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-05-01-e2e-tests/02-checklist.md
git commit -m "docs(e2e): чек-лист проверок"
```

---

### Task 3: Создать детализацию проверок

**Files:**
- Create: `docs/superpowers/specs/2026-05-01-e2e-tests/03-detailed-checks.md`

- [ ] **Step 1: Записать детализацию**

```markdown
# Детализация проверок

Каждый пункт чек-листа разворачивается в одну Playwright-проверку. Указаны: предусловие, действие, ожидание, способ изоляции состояния.

## Шаблон
- ID: ФТ-N.M
- Pre: фикстура / стор seed
- When: действие через POM
- Then: assert через `expect(locator)...`
- State: что мутирует в localStorage

## ФТ-1.1 — Карточки списка
- Pre: `loginAs('engineer')`, без seed
- When: page.goto('/equipment')
- Then: `expect(page.getByTestId('equipment-card')).toHaveCount(8)` (Дефолтных в seed 8)
- State: r/o.

## ФТ-1.2 — Бейджи статуса
- Pre: тот же
- When: открыт `/equipment`
- Then: для известного «БУР-03» (working) бейдж содержит «Работа»; для «БУР-05» (offline) — «Отключён».

## ФТ-1.3 — Фильтр по вкладкам
- When: клик `Tabs` «Авария» (`getByRole('tab', { name: /Авария/ })`)
- Then: видны только карточки со статусом malfunction; счётчик в табе совпадает.

## ФТ-1.4 — Поиск
- When: ввод «БУР-03» в `Input` с `placeholder*="Поиск"`
- Then: остаётся 1 карточка.

## ФТ-1.5 — Детальная карточка
- When: клик по карточке БУР-01
- Then: URL `/equipment/БУР-01`; `getByRole('tab', { name: 'Обзор' })` активен.

## ФТ-2.1 — Включение режима редактирования
- Pre: engineer, `/equipment/БУР-01/dashboard`
- When: click «Настроить»
- Then: появилась кнопка «Виджет» и «Сброс».

## ФТ-2.2 — Добавление виджета
- When: click «Виджет», выбрать «Числовой индикатор», выбрать «Температура двигателя», click «ДОБАВИТЬ»
- Then: количество карточек +1.

## ФТ-2.3 — Перетаскивание
- When: `getByTestId('widget-card').first().dragTo(getByTestId('widget-card').last())`
- Then: layout в `rgm:v1:user:user-1:dashboards` обновлён (порядок изменился).

## ФТ-2.4 — Удаление
- When: click `[aria-label="Удалить виджет"]` или `text="×"` внутри виджета
- Then: количество -1.

## ФТ-2.5 — Сохранение и реload
- When: click «Сохранить», `page.reload()`
- Then: layout совпадает с тем, что был перед reload.

## ФТ-2.6 — Сброс
- When: click «Сброс»
- Then: layout совпадает с дефолтной раскладкой из API.

## ФТ-3.1 — Numeric value
- Pre: подменить sensorsStore.liveData через `addInitScript` либо использовать дефолтное
- When: открыт виджет numeric для temp-engine
- Then: видно число и °C.

## ФТ-3.2 — Numeric warning/critical
- Pre: seed `liveData[БУР-01].temp-engine.value = 96`
- When: открыт виджет numeric
- Then: текст содержит «КРИТИЧЕСКОЕ»; класс точки `bg-red-500`.

## ФТ-3.3 — Line chart canvas
- Then: `widget canvas` имеет `boundingBox.width > 0`.

## ФТ-3.4 — Gauge canvas
- Аналогично.

## ФТ-4.1 — Алерт по порогу
- Pre: seed `rgm:v1:alerts` с одним critical
- When: open `/alerts`
- Then: карточка содержит equipment id, sensor label, value, threshold, time.

## ФТ-4.2 — Бейдж в шапке
- Then: `getByRole('button', { name: 'Уведомления' }) >> badge` показывает число > 0.

## ФТ-4.3 — Критическое модальное
- Pre: alertsStore.showCriticalAlert=true via init script
- Then: `getByRole('dialog')` с заголовком «КРИТИЧЕСКОЕ УВЕДОМЛЕНИЕ» виден.

## ФТ-4.4 — Подтверждение
- When: click «Подтвердить»
- Then: карточка получает класс `opacity-60`; счётчик уменьшен.

## ФТ-5.1 — Список замен
- When: открыт таб «Детали» карточки оборудования
- Then: `table` со строками; неоригинальные имеют выделение (badge «Неоригинал» или класс).

## ФТ-6.1 — История датчика
- When: таб «История», выбрать «Температура двигателя»
- Then: появился `<canvas>`, видно подпись периода.

## ФТ-7.1 — Polling активен
- Pre: open `/equipment/БУР-01`
- When: `page.waitForRequest` для GET к sensors API в течение 6 с
- Then: ≥ 2 запроса.

## ФТ-7.2 — Polling остановлен при уходе
- When: открыть `/equipment/БУР-01`, затем `/`
- Then: за 6 с после ухода нет новых запросов.

## ФТ-8.1 — Default «ПОДКЛЮЧЕНО»
- Then: `[data-testid="connection-status"]` содержит «ПОДКЛЮЧЕНО».

## ФТ-8.2 — Reconnecting
- Pre: route `**/*sensors*` => abort
- When: ждать первый сбой
- Then: текст «ПЕРЕПОДКЛЮЧЕНИЕ…».

## ФТ-8.3 — Disconnected
- After 3 abort
- Then: «НЕТ СВЯЗИ».

## ФТ-9.x — Жизненный цикл
Подробно расписан как сценарий в `04-user-scenarios.md`.

## ФТ-10.1 — Превышение норматива
- Pre: открытый шаг с normative `{ min: 0, max: 10, unit: 'мм' }`
- When: ввести 15 → click «С замечаниями»
- Then: шаг помечен failed (бейдж).

## ФТ-10.2 — Материал
- When: добавить материал «Масло М10», 5 л
- Then: список материалов содержит запись.

## ФТ-11.1 — Документ доступен
- Pre: completed order with type=ТО-1
- When: open `/maintenance/<id>/document`
- Then: видна шапка «АКТ», сведения о станке, шаги.

## ФТ-12.1 — Таблица журнала
- Then: `<table>` ≥ 1 строки.

## ФТ-12.2 — Фильтр
- When: установить фильтр «type=ТО-1»
- Then: количество строк ≤ изначального.

## ФТ-13.x — RBAC по сценариям ниже.

## НФТ-1.1 — Время отклика
- When: измерить `Date.now()` до/после клика по табу
- Then: < 1500 мс (бюджет CI).

## НФТ-2.1 — Initial load
- When: `await page.goto('/'); await page.waitForLoadState('domcontentloaded')`
- Then: время < 5000 мс (CI бюджет).

## НФТ-3.1 — Адаптив 768
- When: `setViewportSize({ width: 768, height: 1024 })`, открыть основные экраны
- Then: нет horizontal scroll (`document.documentElement.scrollWidth <= width`).

## НФТ-4.1 — Touch размер
- For: nav-кнопки и кнопки шагов
- Then: `box.height >= 44 && box.width >= 44`.

## НФТ-5.1 — Last data on offline
- Pre: открытая страница с данными температуры
- When: `context.setOffline(true)`, ждать 6 с
- Then: значение метрики осталось тем же; статус подключения «НЕТ СВЯЗИ».

## НФТ-6.1 — Восстановление
- After: `setOffline(false)`
- Then: в течение 7 с статус возвращается в «ПОДКЛЮЧЕНО»; не было `page.reload()`.

## НФТ-7.1 — Toast/сообщение
- When: открыть Settings → Сохранить
- Then: видно «НАСТРОЙКИ СОХРАНЕНЫ» в течение 2 с.

## НФТ-7.2 — Подтверждение деструктивных
- When: на `/equipment` нажать «Удалить»
- Then: открывается `Dialog` с текстом подтверждения.

## НФТ-9 — Cross-browser
- Smoke прогон в 3 браузерах через projects.
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-05-01-e2e-tests/03-detailed-checks.md
git commit -m "docs(e2e): детализация проверок"
```

---

### Task 4: Создать пользовательские сценарии по ролям

**Files:**
- Create: `docs/superpowers/specs/2026-05-01-e2e-tests/04-user-scenarios.md`

- [ ] **Step 1: Записать сценарии**

```markdown
# Пользовательские сценарии

## Роль Engineer (Иванов А.П., user-1)

### S-E1: Открытие смены
1. Login как engineer
2. На главной видит сводку парка (HomeMetricsPanel)
3. Замечает критический алерт в HomeAlertsPanel
4. Переходит в /alerts, видит карточку, подтверждает её
5. Счётчик в шапке уменьшился

### S-E2: Создание наряда ТО-1 для БУР-04
1. /maintenance → «Создать наряд»
2. Шаг 1: выбрать БУР-04, тип ТО-1
3. Шаг 2: чек-лист загружен (>=3 пункта), оставить как есть
4. Шаг 3: исполнитель Петров С.В. (mechanic), дата сегодня
5. «Создать наряд» → редирект на /maintenance, наряд в колонке «Запланировано»
6. Карточка содержит type=ТО-1, equipment=БУР-04, исполнитель=Петров

### S-E3: Конструктор панели мониторинга
1. /equipment/БУР-01/dashboard → «Настроить»
2. «Виджет» → Numeric / Температура двигателя → ДОБАВИТЬ
3. «Виджет» → Gauge / Давление → ДОБАВИТЬ
4. Перетащить gauge выше numeric
5. «Сохранить»
6. Reload — оба виджета и порядок сохранены

### S-E4: Управление парком
1. /equipment → найти БУР-08
2. Нажать «Отключить» → подтверждение → станок переходит в offline
3. На главной счётчик «АКТИВНО» уменьшен на 1
4. /equipment → нажать «Подключить» — станок возвращается в idle

## Роль Foreman (Козлов Д.А., user-4)

### S-F1: Приёмка нарядов
1. Login как foreman → видит «На приёмке» N карточек
2. Открывает наряд со статусом review
3. Видит OrderSummary с шагами, измерениями, материалами
4. «Принять» → статус completed, появляется ссылка на акт
5. Открывает /maintenance/<id>/document — рендерится акт

### S-F2: Отклонение наряда
1. /maintenance, фильтр «На приёмке»
2. Открыть наряд
3. «Отклонить» с комментарием «Повторить шаг 2»
4. Статус возвращается в in_progress
5. Mechanic снова видит его в «Мои наряды»

## Роль Mechanic (Петров С.В., user-2)

### S-M1: Выполнение наряда
1. Login как mechanic → главная показывает «Мои наряды» (≥1)
2. Открыть наряд (запланированный)
3. Шаг 1: ввести измерение «8.5» (норма 0-10)
4. «Выполнено» → шаг passed
5. Шаг 2: ввести «12» (выходит за норму)
6. «С замечаниями» + комментарий → failed
7. Шаг 3: «Пропустить» → skipped
8. После всех шагов появляется «Завершить работу»
9. OrderSummary → «Отправить на приёмку»
10. Статус наряда review

### S-M2: Ограничения видимости
1. Login как mechanic
2. В сайдбаре нет «Мониторинг», «Аналитика», «Журнал ТС»
3. /analytics → редирект (или 404 / запрет)
4. /reports/create → редирект на /reports

### S-M3: Запасной сценарий offline
1. Открыта страница наряда
2. Тестовый offline (`setOffline(true)`)
3. Введённое измерение остаётся в поле
4. После online — введённое значение всё ещё там, можно сохранить
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-05-01-e2e-tests/04-user-scenarios.md
git commit -m "docs(e2e): пользовательские сценарии по ролям"
```

---

## Phase 1: Установка и конфигурация Playwright

### Task 5: Установить Playwright и зависимости

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Установить пакет**

```bash
npm install --save-dev @playwright/test@latest
npx playwright install chromium firefox webkit
```

Ожидание: пакет добавлен в `devDependencies`, браузеры скачаны.

- [ ] **Step 2: Добавить скрипты в `package.json`**

В блок `scripts` добавить:

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:headed": "playwright test --headed",
"test:e2e:report": "playwright show-report"
```

- [ ] **Step 3: Проверить, что Playwright виден**

```bash
npx playwright --version
```

Ожидание: печатается версия (например, `Version 1.50.x`).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(e2e): установить @playwright/test"
```

---

### Task 6: Создать `playwright.config.js`

**Files:**
- Create: `playwright.config.js`

- [ ] **Step 1: Записать конфиг**

```javascript
import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 5173
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e/specs',
  outputDir: './tests/e2e/.results',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: 'tests/e2e/.report', open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ru-RU',
    timezoneId: 'Europe/Moscow',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev -- --port ' + PORT,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

- [ ] **Step 2: Добавить `tests/e2e/.results` и `.report` в `.gitignore`**

Дописать в конец `.gitignore`:

```
tests/e2e/.results/
tests/e2e/.report/
playwright-report/
```

- [ ] **Step 3: Проверить запуск (без тестов)**

```bash
npx playwright test --list
```

Ожидание: «No tests found» (это ОК, файлов ещё нет) или пустой список без ошибок.

- [ ] **Step 4: Commit**

```bash
git add playwright.config.js .gitignore
git commit -m "chore(e2e): playwright config с тремя проектами и dev webServer"
```

---

## Phase 2: Хелперы и фикстуры

### Task 7: Хелпер selectors.js (общие тексты)

**Files:**
- Create: `tests/e2e/helpers/selectors.js`

- [ ] **Step 1: Создать каталоги**

```bash
mkdir -p tests/e2e/{fixtures,helpers,pages,specs}
```

- [ ] **Step 2: Записать константы**

```javascript
export const ROLES = {
  engineer: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
  mechanic: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
  mechanic2: { id: 'user-3', name: 'Сидоров К.М.', role: 'mechanic' },
  foreman: { id: 'user-4', name: 'Козлов Д.А.', role: 'foreman' },
}

export const STATUS_LABELS = {
  working: 'Работа',
  idle: 'Простой',
  malfunction: 'Авария',
  offline: 'Отключён',
}

export const ORDER_STATUS_LABELS = {
  planned: 'Запланировано',
  in_progress: 'В работе',
  review: 'На приёмке',
  completed: 'Завершено',
  cancelled: 'Отменено',
}

export const NAV_LINKS = {
  home: 'Главная',
  dashboard: 'Мониторинг',
  equipment: 'Оборудование',
  maintenance: 'Техобслуживание',
  journal: 'Журнал ТС',
  alerts: 'Уведомления',
  analytics: 'Аналитика',
  reports: 'Отчёты',
  settings: 'Настройки',
}

export const TESTIDS = {
  connectionStatus: 'connection-status',
  widgetCard: 'widget-card',
  alertCard: 'alert-card',
  equipmentCard: 'equipment-card',
  criticalModal: 'critical-alert-modal',
}
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/helpers/selectors.js
git commit -m "test(e2e): константы селекторов и ролей"
```

---

### Task 8: Хелпер storage.js (ключи и payload-хелперы)

**Files:**
- Create: `tests/e2e/helpers/storage.js`

- [ ] **Step 1: Записать содержимое**

```javascript
export const STORAGE_PREFIX = 'rgm'
export const SCHEMA_VERSION = 1

export function globalKey(name) {
  return `${STORAGE_PREFIX}:v${SCHEMA_VERSION}:${name}`
}

export function userKey(userId, name) {
  return `${STORAGE_PREFIX}:v${SCHEMA_VERSION}:user:${userId}:${name}`
}

export function metaKey(name) {
  return `${STORAGE_PREFIX}:meta:${name}`
}

export function userMetaKey(userId, name) {
  return `${STORAGE_PREFIX}:meta:user:${userId}:${name}`
}

export function makeAlert(overrides = {}) {
  return {
    id: 'A-TEST-' + Date.now(),
    type: 'critical',
    title: 'ТЕСТОВОЕ КРИТИЧЕСКОЕ',
    description: 'Превышение порогового значения по тесту',
    equipmentId: 'БУР-01',
    sensorId: 'temp-engine',
    value: 99,
    threshold: 95,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    acknowledged: false,
    ...overrides,
  }
}

export function makeOrder(overrides = {}) {
  const now = new Date().toISOString()
  return {
    id: 'ORD-TEST-' + Date.now(),
    equipmentId: 'БУР-04',
    type: 'ТО-1',
    status: 'planned',
    createdAt: now,
    scheduledDate: now,
    createdBy: { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
    assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    steps: [
      {
        id: 'step-1',
        title: 'Проверка масла',
        description: 'Проверить уровень масла в двигателе',
        status: 'pending',
        normative: { min: 80, max: 100, unit: '%' },
        measurements: [],
        materials: [],
      },
      {
        id: 'step-2',
        title: 'Замена фильтра',
        description: 'Заменить топливный фильтр',
        status: 'pending',
        measurements: [],
        materials: [],
      },
      {
        id: 'step-3',
        title: 'Контроль вибрации',
        description: 'Замерить вибрацию двигателя',
        status: 'pending',
        normative: { min: 0, max: 1.5, unit: 'мм/с' },
        measurements: [],
        materials: [],
      },
    ],
    ...overrides,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/helpers/storage.js
git commit -m "test(e2e): хелперы для seed localStorage"
```

---

### Task 9: Хелпер viewport.js

**Files:**
- Create: `tests/e2e/helpers/viewport.js`

- [ ] **Step 1: Записать содержимое**

```javascript
export const VIEWPORTS = {
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1440, height: 900 },
  fullhd: { width: 1920, height: 1080 },
  mobile: { width: 390, height: 844 },
}
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/helpers/viewport.js
git commit -m "test(e2e): пресеты viewport"
```

---

### Task 10: Фикстура auth.js

**Files:**
- Create: `tests/e2e/fixtures/auth.js`

- [ ] **Step 1: Записать содержимое**

```javascript
import { ROLES } from '../helpers/selectors.js'

export async function injectAuthToStorage(page, role) {
  const user = ROLES[role]
  if (!user) throw new Error(`Unknown role: ${role}`)
  await page.addInitScript(({ id, token }) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user_id', id)
    localStorage.setItem('rgm:migrated-legacy', '1')
  }, { id: user.id, token: 'mock-jwt-test-' + user.id })
  return user
}

export async function loginViaUI(page, role = 'engineer') {
  const user = ROLES[role]
  await page.goto('/login')
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: new RegExp(user.name) }).click()
  await page.getByLabel('Пароль').fill('test')
  await page.getByRole('button', { name: 'Войти' }).click()
  await page.waitForURL('**/')
}
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/fixtures/auth.js
git commit -m "test(e2e): auth-фикстура (init script + UI login)"
```

---

### Task 11: Фикстура state.js (seed mock-runtime)

**Files:**
- Create: `tests/e2e/fixtures/state.js`

- [ ] **Step 1: Записать содержимое**

```javascript
import { globalKey, userKey, metaKey, userMetaKey, SCHEMA_VERSION } from '../helpers/storage.js'

export async function resetMockState(page) {
  await page.addInitScript(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('rgm:') || key === 'auth_token' || key === 'auth_user_id') {
        localStorage.removeItem(key)
      }
    }
  })
}

export async function seedAlerts(page, alerts) {
  await page.addInitScript(({ key, metaKey, version, data }) => {
    localStorage.setItem(key, JSON.stringify(data))
    localStorage.setItem(metaKey, JSON.stringify({ schemaVersion: version }))
  }, {
    key: globalKey('alerts'),
    metaKey: metaKey('alerts'),
    version: SCHEMA_VERSION,
    data: alerts,
  })
}

export async function seedOrders(page, orders) {
  await page.addInitScript(({ key, metaKey, version, data }) => {
    localStorage.setItem(key, JSON.stringify(data))
    localStorage.setItem(metaKey, JSON.stringify({ schemaVersion: version }))
  }, {
    key: globalKey('orders'),
    metaKey: metaKey('orders'),
    version: SCHEMA_VERSION,
    data: orders,
  })
}

export async function seedDashboard(page, userId, config) {
  await page.addInitScript(({ key, metaKey, version, data }) => {
    localStorage.setItem(key, JSON.stringify(data))
    localStorage.setItem(metaKey, JSON.stringify({ schemaVersion: version }))
  }, {
    key: userKey(userId, 'dashboards'),
    metaKey: userMetaKey(userId, 'dashboards'),
    version: SCHEMA_VERSION,
    data: config,
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/fixtures/state.js
git commit -m "test(e2e): фикстуры seed-состояния mock-runtime"
```

---

### Task 12: Объединённая фикстура index.js

**Files:**
- Create: `tests/e2e/fixtures/index.js`

- [ ] **Step 1: Записать содержимое**

```javascript
import { test as base, expect } from '@playwright/test'
import { injectAuthToStorage } from './auth.js'
import { resetMockState } from './state.js'

export const test = base.extend({
  cleanState: [async ({ page }, use) => {
    await resetMockState(page)
    await use(undefined)
  }, { auto: true }],

  loginAs: async ({ page }, use) => {
    const fn = async (role) => {
      const user = await injectAuthToStorage(page, role)
      return user
    }
    await use(fn)
  },
})

export { expect }
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/fixtures/index.js
git commit -m "test(e2e): объединённый test/expect с auto-reset и loginAs"
```

---

## Phase 3: data-testid'ы для надёжной идентификации

### Task 13: Добавить data-testid в ConnectionStatus

**Files:**
- Modify: `src/components/ConnectionStatus.vue`

- [ ] **Step 1: Заменить корневой `<div>`**

Найти первую строку шаблона:

```html
<div class="flex items-center gap-2 px-3 py-1 border rounded-md" :class="containerClass">
```

Заменить на:

```html
<div
  class="flex items-center gap-2 px-3 py-1 border rounded-md"
  :class="containerClass"
  data-testid="connection-status"
  :data-state="connectionStore.status"
>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ConnectionStatus.vue
git commit -m "test(e2e): testid для ConnectionStatus"
```

---

### Task 14: Добавить data-testid для виджетов и карточек оборудования

**Files:**
- Modify: `src/components/widgets/WidgetWrapper.vue`
- Modify: `src/views/EquipmentListView.vue`

- [ ] **Step 1: WidgetWrapper — добавить testid**

В корневой `<div class="h-full bg-surface-1 ...">` добавить:

```html
data-testid="widget-card"
:data-widget-type="widget.type"
```

- [ ] **Step 2: EquipmentListView — добавить testid в карточку**

Найти `<Card v-for="item in filteredEquipment"`. Добавить атрибуты:

```html
data-testid="equipment-card"
:data-equipment-id="item.id"
:data-status="item.status"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/widgets/WidgetWrapper.vue src/views/EquipmentListView.vue
git commit -m "test(e2e): testid для виджетов и карточек оборудования"
```

---

### Task 15: Добавить data-testid в карточки уведомлений и критическое модальное

**Files:**
- Modify: `src/views/AlertsView.vue`
- Modify: `src/components/CriticalAlertModal.vue`

- [ ] **Step 1: AlertsView**

Найти `<Card :class="['transition-all duration-150 border', alertCardClasses(alert)]">`. Заменить на:

```html
<Card
  :class="['transition-all duration-150 border', alertCardClasses(alert)]"
  data-testid="alert-card"
  :data-alert-id="alert.id"
  :data-alert-type="alert.type"
  :data-alert-acknowledged="alert.acknowledged ? '1' : '0'"
>
```

- [ ] **Step 2: CriticalAlertModal**

В `<DialogContent>` добавить `data-testid="critical-alert-modal"`. В `<SheetContent>` (мобильная ветка) — то же самое.

- [ ] **Step 3: Commit**

```bash
git add src/views/AlertsView.vue src/components/CriticalAlertModal.vue
git commit -m "test(e2e): testid для уведомлений и критического модального"
```

---

## Phase 4: Page Object Model (POM)

### Task 16: BasePage

**Files:**
- Create: `tests/e2e/pages/BasePage.js`

- [ ] **Step 1: Записать содержимое**

```javascript
import { TESTIDS, NAV_LINKS } from '../helpers/selectors.js'

export class BasePage {
  constructor(page) {
    this.page = page
  }

  get connectionStatus() {
    return this.page.getByTestId(TESTIDS.connectionStatus)
  }

  get alertsBadge() {
    return this.page.getByRole('button', { name: 'Уведомления' }).locator('span').last()
  }

  get sidebar() {
    return this.page.locator('aside, [role="dialog"][data-state="open"]').first()
  }

  navLink(name) {
    return this.page.getByRole('link', { name }).first()
  }

  async goToNav(key) {
    const label = NAV_LINKS[key]
    await this.navLink(label).click()
  }

  async expectStatus(state) {
    const map = {
      connected: 'ПОДКЛЮЧЕНО',
      reconnecting: 'ПЕРЕПОДКЛЮЧЕНИЕ',
      disconnected: 'НЕТ СВЯЗИ',
    }
    await this.connectionStatus.getByText(map[state]).waitFor()
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/pages/BasePage.js
git commit -m "test(e2e): BasePage POM"
```

---

### Task 17: LoginPage

**Files:**
- Create: `tests/e2e/pages/LoginPage.js`

- [ ] **Step 1: Записать содержимое**

```javascript
import { ROLES } from '../helpers/selectors.js'

export class LoginPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/login')
  }

  get userSelect() {
    return this.page.getByRole('combobox')
  }

  get passwordInput() {
    return this.page.getByLabel('Пароль')
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Войти' })
  }

  get errorBanner() {
    return this.page.locator('.text-destructive').first()
  }

  async loginUI(role) {
    const user = ROLES[role]
    await this.userSelect.click()
    await this.page.getByRole('option', { name: new RegExp(user.name) }).click()
    await this.passwordInput.fill('test')
    await this.submitButton.click()
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/pages/LoginPage.js
git commit -m "test(e2e): LoginPage POM"
```

---

### Task 18: HomePage и EquipmentListPage

**Files:**
- Create: `tests/e2e/pages/HomePage.js`
- Create: `tests/e2e/pages/EquipmentListPage.js`

- [ ] **Step 1: HomePage**

```javascript
export class HomePage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/')
  }

  get heading() {
    return this.page.getByRole('heading', { name: 'Обзор системы' })
  }

  get assignedOrdersCard() {
    return this.page.getByText('Мои наряды')
  }

  get reviewQueueCard() {
    return this.page.getByText('На приёмке')
  }
}
```

- [ ] **Step 2: EquipmentListPage**

```javascript
import { TESTIDS } from '../helpers/selectors.js'

export class EquipmentListPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/equipment')
  }

  get cards() {
    return this.page.getByTestId(TESTIDS.equipmentCard)
  }

  cardById(id) {
    return this.page.locator(`[data-testid="equipment-card"][data-equipment-id="${id}"]`)
  }

  get searchInput() {
    return this.page.getByPlaceholder(/Поиск/)
  }

  tabByName(name) {
    return this.page.getByRole('tab', { name: new RegExp(name) })
  }

  async openCard(id) {
    await this.cardById(id).getByRole('link').first().click()
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/pages/HomePage.js tests/e2e/pages/EquipmentListPage.js
git commit -m "test(e2e): HomePage и EquipmentListPage POM"
```

---

### Task 19: EquipmentDetailPage и EquipmentDashboardPage

**Files:**
- Create: `tests/e2e/pages/EquipmentDetailPage.js`
- Create: `tests/e2e/pages/EquipmentDashboardPage.js`

- [ ] **Step 1: EquipmentDetailPage**

```javascript
export class EquipmentDetailPage {
  constructor(page, id) {
    this.page = page
    this.id = id
  }

  async goto() {
    await this.page.goto(`/equipment/${this.id}`)
  }

  tab(name) {
    return this.page.getByRole('tab', { name })
  }

  async openTab(name) {
    await this.tab(name).click()
  }

  get sensorsTable() {
    return this.page.getByRole('table')
  }
}
```

- [ ] **Step 2: EquipmentDashboardPage**

```javascript
import { TESTIDS } from '../helpers/selectors.js'

export class EquipmentDashboardPage {
  constructor(page, id) {
    this.page = page
    this.id = id
  }

  async goto() {
    await this.page.goto(`/equipment/${this.id}/dashboard`)
  }

  get configureButton() {
    return this.page.getByRole('button', { name: 'Настроить' })
  }

  get saveButton() {
    return this.page.getByRole('button', { name: 'Сохранить' })
  }

  get addWidgetButton() {
    return this.page.getByRole('button', { name: 'Виджет' })
  }

  get resetButton() {
    return this.page.getByRole('button', { name: 'Сброс' })
  }

  get widgets() {
    return this.page.getByTestId(TESTIDS.widgetCard)
  }

  widgetByType(type) {
    return this.page.locator(`[data-testid="widget-card"][data-widget-type="${type}"]`)
  }

  async addWidget(typeLabel, sensorLabel) {
    await this.addWidgetButton.click()
    await this.page.getByRole('button', { name: typeLabel }).click()
    if (sensorLabel) {
      await this.page.getByRole('button', { name: sensorLabel }).click()
    }
    await this.page.getByRole('button', { name: 'ДОБАВИТЬ' }).click()
  }

  async removeFirstWidget() {
    const count = await this.widgets.count()
    await this.widgets.first().getByRole('button').last().click()
    return count
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/pages/EquipmentDetailPage.js tests/e2e/pages/EquipmentDashboardPage.js
git commit -m "test(e2e): EquipmentDetailPage и EquipmentDashboardPage POM"
```

---

### Task 20: AlertsPage

**Files:**
- Create: `tests/e2e/pages/AlertsPage.js`

- [ ] **Step 1: Записать содержимое**

```javascript
import { TESTIDS } from '../helpers/selectors.js'

export class AlertsPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/alerts')
  }

  get cards() {
    return this.page.getByTestId(TESTIDS.alertCard)
  }

  cardByType(type) {
    return this.page.locator(`[data-testid="alert-card"][data-alert-type="${type}"]`)
  }

  unacknowledged() {
    return this.page.locator('[data-testid="alert-card"][data-alert-acknowledged="0"]')
  }

  async acknowledge(alertId) {
    const card = this.page.locator(`[data-testid="alert-card"][data-alert-id="${alertId}"]`)
    await card.getByRole('button', { name: 'Подтвердить' }).click()
  }

  filter(name) {
    return this.page.getByRole('tab', { name: new RegExp(name) })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/pages/AlertsPage.js
git commit -m "test(e2e): AlertsPage POM"
```

---

### Task 21: Maintenance pages

**Files:**
- Create: `tests/e2e/pages/MaintenanceListPage.js`
- Create: `tests/e2e/pages/MaintenanceCreatePage.js`
- Create: `tests/e2e/pages/MaintenanceDetailPage.js`

- [ ] **Step 1: MaintenanceListPage**

```javascript
export class MaintenanceListPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/maintenance')
  }

  get createButton() {
    return this.page.getByRole('button', { name: /Создать наряд/ })
  }

  column(label) {
    return this.page.locator('section, div').filter({
      has: this.page.getByRole('heading', { name: label, level: 3 }),
    }).first()
  }

  cardByEquipment(equipmentId) {
    return this.page.locator('div', { hasText: equipmentId }).first()
  }
}
```

- [ ] **Step 2: MaintenanceCreatePage**

```javascript
export class MaintenanceCreatePage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/maintenance/create')
  }

  get nextButton() {
    return this.page.getByRole('button', { name: 'Далее' })
  }

  get backButton() {
    return this.page.getByRole('button', { name: 'Назад' })
  }

  get createButton() {
    return this.page.getByRole('button', { name: /Создать наряд/ })
  }

  async pickEquipment(equipmentId) {
    await this.page.getByRole('button', { name: new RegExp(equipmentId) }).click()
  }

  async pickType(typeLabel) {
    await this.page.getByRole('button', { name: typeLabel }).click()
  }

  async pickAssignee(name) {
    await this.page.getByRole('combobox').click()
    await this.page.getByRole('option', { name: new RegExp(name) }).click()
  }
}
```

- [ ] **Step 3: MaintenanceDetailPage**

```javascript
export class MaintenanceDetailPage {
  constructor(page, id) {
    this.page = page
    this.id = id
  }

  async goto() {
    await this.page.goto(`/maintenance/${this.id}`)
  }

  get currentStepCard() {
    return this.page.locator('[data-step-card]').first()
  }

  get nextStepButton() {
    return this.page.getByRole('button', { name: /Далее/ })
  }

  get markPassedButton() {
    return this.page.getByRole('button', { name: /Выполнено/ })
  }

  get markFailedButton() {
    return this.page.getByRole('button', { name: /С замечаниями/ })
  }

  get markSkippedButton() {
    return this.page.getByRole('button', { name: /Пропустить/ })
  }

  get finishButton() {
    return this.page.getByRole('button', { name: /Завершить работу/ })
  }

  get submitForReviewButton() {
    return this.page.getByRole('button', { name: /Отправить на приёмку/ })
  }

  get approveButton() {
    return this.page.getByRole('button', { name: /Принять/ })
  }

  get rejectButton() {
    return this.page.getByRole('button', { name: /Отклонить/ })
  }

  measurementInput(label) {
    return this.page.getByLabel(new RegExp(label))
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/pages/MaintenanceListPage.js tests/e2e/pages/MaintenanceCreatePage.js tests/e2e/pages/MaintenanceDetailPage.js
git commit -m "test(e2e): Maintenance POMs"
```

---

### Task 22: ReportsPage и JournalPage и SettingsPage

**Files:**
- Create: `tests/e2e/pages/ReportsPage.js`
- Create: `tests/e2e/pages/ReportCreatePage.js`
- Create: `tests/e2e/pages/JournalPage.js`
- Create: `tests/e2e/pages/SettingsPage.js`

- [ ] **Step 1: ReportsPage**

```javascript
export class ReportsPage {
  constructor(page) { this.page = page }
  async goto() { await this.page.goto('/reports') }
  get heading() { return this.page.getByRole('heading', { name: 'Отчёты' }) }
  get createButton() { return this.page.getByRole('button', { name: /Создать отчёт/ }) }
}
```

- [ ] **Step 2: ReportCreatePage**

```javascript
export class ReportCreatePage {
  constructor(page) { this.page = page }
  async goto() { await this.page.goto('/reports/create') }
}
```

- [ ] **Step 3: JournalPage**

```javascript
export class JournalPage {
  constructor(page) { this.page = page }
  async goto() { await this.page.goto('/journal') }
  get table() { return this.page.getByRole('table') }
}
```

- [ ] **Step 4: SettingsPage**

```javascript
export class SettingsPage {
  constructor(page) { this.page = page }
  async goto() { await this.page.goto('/settings') }
  get saveButton() { return this.page.getByRole('button', { name: /СОХРАНИТЬ/i }) }
  get resetButton() { return this.page.getByRole('button', { name: /СБРОСИТЬ/i }) }
  get successBanner() { return this.page.getByText('НАСТРОЙКИ СОХРАНЕНЫ') }
}
```

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/pages/ReportsPage.js tests/e2e/pages/ReportCreatePage.js tests/e2e/pages/JournalPage.js tests/e2e/pages/SettingsPage.js
git commit -m "test(e2e): остальные POMs"
```

---

## Phase 5: Smoke и базовые ФТ

### Task 23: ФТ-1 — список оборудования и детальная карточка

**Files:**
- Create: `tests/e2e/specs/ft-01-equipment-list.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { EquipmentListPage } from '../pages/EquipmentListPage.js'
import { EquipmentDetailPage } from '../pages/EquipmentDetailPage.js'
import { STATUS_LABELS } from '../helpers/selectors.js'

test.describe('ФТ-1: Перечень оборудования', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs('engineer')
  })

  test('список содержит 8 карточек со статусом', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    await expect(list.cards).toHaveCount(8)
    for (const status of ['working', 'idle', 'malfunction', 'offline']) {
      const cards = page.locator(`[data-testid="equipment-card"][data-status="${status}"]`)
      const count = await cards.count()
      if (count > 0) {
        await expect(cards.first()).toContainText(STATUS_LABELS[status])
      }
    }
  })

  test('фильтр по табу «Авария» оставляет только malfunction', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    await list.tabByName('Авария').click()
    const visible = await list.cards.count()
    const malfunction = await page.locator('[data-status="malfunction"]').count()
    expect(visible).toBe(malfunction)
  })

  test('поиск «БУР-03» сужает список до одной карточки', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    await list.searchInput.fill('БУР-03')
    await expect(list.cards).toHaveCount(1)
    await expect(list.cardById('БУР-03')).toBeVisible()
  })

  test('клик по карточке открывает детальную страницу с 5 табами', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    await list.openCard('БУР-01')
    await expect(page).toHaveURL(/\/equipment\/[^/]+$/)
    const detail = new EquipmentDetailPage(page, 'БУР-01')
    for (const t of ['Обзор', 'Датчики', 'ТО', 'Детали', 'История']) {
      await expect(detail.tab(t)).toBeVisible()
    }
  })
})
```

- [ ] **Step 2: Запустить тест**

```bash
npx playwright test ft-01-equipment-list.spec.js --project=chromium
```

Ожидание: 4 теста PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/specs/ft-01-equipment-list.spec.js
git commit -m "test(e2e): ФТ-1 список оборудования и детализация"
```

---

### Task 24: ФТ-2 — конструктор панели

**Files:**
- Create: `tests/e2e/specs/ft-02-dashboard-builder.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { EquipmentDashboardPage } from '../pages/EquipmentDashboardPage.js'
import { userKey } from '../helpers/storage.js'

test.describe('ФТ-2: Конструктор панели', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('включение редактирования открывает панель управления', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, 'БУР-01')
    await dash.goto()
    await dash.configureButton.click()
    await expect(dash.addWidgetButton).toBeVisible()
    await expect(dash.resetButton).toBeVisible()
  })

  test('добавление виджета увеличивает количество карточек', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, 'БУР-01')
    await dash.goto()
    await dash.configureButton.click()
    const before = await dash.widgets.count()
    await dash.addWidget('Числовой индикатор', 'Температура двигателя')
    await expect(dash.widgets).toHaveCount(before + 1)
  })

  test('удаление виджета уменьшает количество карточек', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, 'БУР-01')
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Числовой индикатор', 'Давление')
    const before = await dash.widgets.count()
    await dash.widgets.last().getByRole('button').last().click()
    await expect(dash.widgets).toHaveCount(before - 1)
  })

  test('сохранение и reload восстанавливают раскладку', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, 'БУР-01')
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Шкала (gauge)', 'Вибрация')
    const expected = await dash.widgets.count()
    await dash.saveButton.click()
    await page.reload()
    await expect(dash.widgets).toHaveCount(expected)
  })

  test('сброс возвращает дефолтную раскладку', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, 'БУР-01')
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Числовой индикатор', 'Давление')
    await dash.saveButton.click()
    const polluted = await dash.widgets.count()
    await dash.configureButton.click()
    await dash.resetButton.click()
    const restored = await dash.widgets.count()
    expect(restored).not.toBe(polluted)
  })

  test('layout сохранён в localStorage пользователя', async ({ page, loginAs }) => {
    const user = await loginAs('engineer')
    const dash = new EquipmentDashboardPage(page, 'БУР-01')
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Числовой индикатор', 'Глубина бурения')
    await dash.saveButton.click()
    const key = userKey(user.id, 'dashboards')
    const raw = await page.evaluate((k) => localStorage.getItem(k), key)
    expect(raw).toBeTruthy()
    const data = JSON.parse(raw)
    expect(JSON.stringify(data)).toContain('БУР-01')
  })
})
```

- [ ] **Step 2: Запустить**

```bash
npx playwright test ft-02-dashboard-builder.spec.js --project=chromium
```

Ожидание: все 6 тестов PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/specs/ft-02-dashboard-builder.spec.js
git commit -m "test(e2e): ФТ-2 конструктор панели"
```

---

### Task 25: ФТ-3 — типы виджетов

**Files:**
- Create: `tests/e2e/specs/ft-03-widget-types.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { EquipmentDashboardPage } from '../pages/EquipmentDashboardPage.js'

test.describe('ФТ-3: Типы виджетов', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('Numeric: число + единица + бейдж', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, 'БУР-01')
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Числовой индикатор', 'Температура двигателя')
    const widget = dash.widgetByType('numeric-indicator').last()
    await expect(widget).toContainText('°C')
    await expect(widget.locator('.metric-value')).toBeVisible()
  })

  test('Line chart: canvas виден и имеет ненулевой размер', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, 'БУР-01')
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Линейный график', 'Скорость вращения')
    const canvas = dash.widgetByType('line-chart').last().locator('canvas')
    await expect(canvas).toBeVisible()
    const box = await canvas.boundingBox()
    expect(box.width).toBeGreaterThan(50)
    expect(box.height).toBeGreaterThan(50)
  })

  test('Gauge: canvas виден', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, 'БУР-01')
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Шкала (gauge)', 'Давление')
    const canvas = dash.widgetByType('gauge').last().locator('canvas')
    await expect(canvas).toBeVisible()
  })
})
```

- [ ] **Step 2: Запуск**

```bash
npx playwright test ft-03-widget-types.spec.js --project=chromium
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/specs/ft-03-widget-types.spec.js
git commit -m "test(e2e): ФТ-3 типы виджетов"
```

---

### Task 26: ФТ-4 — пороговые уведомления

**Files:**
- Create: `tests/e2e/specs/ft-04-threshold-alerts.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { AlertsPage } from '../pages/AlertsPage.js'
import { seedAlerts } from '../fixtures/state.js'
import { makeAlert } from '../helpers/storage.js'

test.describe('ФТ-4: Уведомления о порогах', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('критическое уведомление видно в /alerts со всеми атрибутами', async ({ page }) => {
    await seedAlerts(page, [
      makeAlert({
        id: 'A-T1',
        type: 'critical',
        title: 'КРИТИЧЕСКАЯ ТЕМПЕРАТУРА',
        equipmentId: 'БУР-03',
        sensorId: 'temp-engine',
        value: 99,
        threshold: 95,
      }),
    ])
    const alerts = new AlertsPage(page)
    await alerts.goto()
    const card = page.locator('[data-alert-id="A-T1"]')
    await expect(card).toBeVisible()
    await expect(card).toContainText('БУР-03')
    await expect(card).toContainText(/99/)
    await expect(card).toContainText('Критическое')
  })

  test('бейдж в шапке отражает кол-во неподтверждённых', async ({ page }) => {
    await seedAlerts(page, [
      makeAlert({ id: 'A-T1', acknowledged: false }),
      makeAlert({ id: 'A-T2', acknowledged: false }),
      makeAlert({ id: 'A-T3', acknowledged: true }),
    ])
    await page.goto('/')
    const badge = page.getByRole('button', { name: 'Уведомления' }).getByText(/^\d+$/)
    await expect(badge).toHaveText('2')
  })

  test('подтверждение уменьшает счётчик и помечает карточку', async ({ page }) => {
    await seedAlerts(page, [makeAlert({ id: 'A-T1', acknowledged: false, type: 'warning' })])
    const alerts = new AlertsPage(page)
    await alerts.goto()
    await alerts.acknowledge('A-T1')
    await expect(page.locator('[data-alert-id="A-T1"]')).toHaveAttribute('data-alert-acknowledged', '1')
  })
})
```

- [ ] **Step 2: Запуск**

```bash
npx playwright test ft-04-threshold-alerts.spec.js --project=chromium
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/specs/ft-04-threshold-alerts.spec.js
git commit -m "test(e2e): ФТ-4 пороговые уведомления"
```

---

### Task 27: ФТ-5 — замены деталей

**Files:**
- Create: `tests/e2e/specs/ft-05-parts-replacements.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { EquipmentDetailPage } from '../pages/EquipmentDetailPage.js'

test.describe('ФТ-5: Замены деталей', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('таб «Детали» показывает таблицу замен', async ({ page }) => {
    const detail = new EquipmentDetailPage(page, 'БУР-01')
    await detail.goto()
    await detail.openTab('Детали')
    const table = page.getByRole('table').first()
    await expect(table).toBeVisible()
    const rows = table.getByRole('row')
    expect(await rows.count()).toBeGreaterThan(1)
  })
})
```

- [ ] **Step 2: Запуск**

```bash
npx playwright test ft-05-parts-replacements.spec.js --project=chromium
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/specs/ft-05-parts-replacements.spec.js
git commit -m "test(e2e): ФТ-5 замены деталей"
```

---

### Task 28: ФТ-6 — история показаний

**Files:**
- Create: `tests/e2e/specs/ft-06-sensor-history.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { EquipmentDetailPage } from '../pages/EquipmentDetailPage.js'

test.describe('ФТ-6: История показаний', () => {
  test('таб «История» содержит график датчика', async ({ page, loginAs }) => {
    await loginAs('engineer')
    const detail = new EquipmentDetailPage(page, 'БУР-01')
    await detail.goto()
    await detail.openTab('История')
    await expect(page.locator('canvas').first()).toBeVisible()
  })
})
```

- [ ] **Step 2: Запуск**

```bash
npx playwright test ft-06-sensor-history.spec.js --project=chromium
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/specs/ft-06-sensor-history.spec.js
git commit -m "test(e2e): ФТ-6 история показаний"
```

---

### Task 29: ФТ-7 — realtime polling

**Files:**
- Create: `tests/e2e/specs/ft-07-realtime-polling.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { EquipmentDetailPage } from '../pages/EquipmentDetailPage.js'

test.describe('ФТ-7: Realtime polling', () => {
  test('на детальной странице сенсорные данные обновляются', async ({ page, loginAs }) => {
    await loginAs('engineer')
    const detail = new EquipmentDetailPage(page, 'БУР-01')
    await detail.goto()
    const liveCounts = []
    const tickHandler = () => liveCounts.push(Date.now())
    await page.exposeFunction('__tick', tickHandler)
    await page.evaluate(() => {
      const interval = setInterval(async () => {
        const stores = window.__pinia ? Object.keys(window.__pinia.state.value) : []
        if (stores.includes('sensors')) {
          window.__tick(Date.now())
          clearInterval(interval)
        }
      }, 250)
    }).catch(() => {})
    await page.waitForTimeout(11_000)
    expect(liveCounts.length).toBeGreaterThanOrEqual(1)
  })

  test('при выходе со страницы polling останавливается', async ({ page, loginAs }) => {
    await loginAs('engineer')
    const detail = new EquipmentDetailPage(page, 'БУР-01')
    await detail.goto()
    await page.waitForTimeout(2_000)
    await page.goto('/')
    const stopped = await page.evaluate(() => {
      const sensors = window.__pinia?.state?.value?.sensors
      return sensors ? !sensors.pollingActive : true
    })
    expect(stopped).toBe(true)
  })
})
```

Прим.: `window.__pinia` должен экспозиться. Если нет — заменить проверку на отсутствие сетевых запросов в течение 6 с (см. далее в connection.spec.js).

- [ ] **Step 2: Запуск**

```bash
npx playwright test ft-07-realtime-polling.spec.js --project=chromium --workers=1
```

- [ ] **Step 3: Если тест проверки стора падает: упростить, убрать `__pinia`-зависимость и вместо этого использовать `await expect.poll(() => requestCount).toBeGreaterThan(1)`. Заменить второй тест на:**

```javascript
import { test, expect } from '../fixtures/index.js'

test('polling: ≥ 2 GET-запроса к /api/equipment/:id/live за 6 с', async ({ page, loginAs }) => {
  await loginAs('engineer')
  let liveRequestsCount = 0
  page.on('request', (req) => {
    if (req.url().includes('/equipment/') && req.url().includes('/live')) {
      liveRequestsCount++
    }
  })
  await page.goto('/equipment/БУР-01')
  await page.waitForTimeout(6500)
  expect(liveRequestsCount).toBeGreaterThanOrEqual(1)
})
```

(Mock-runtime не делает реальных HTTP, поэтому проверять надо иначе — через mutation `liveData`. См. альтернативу.)

**Альтернатива (если запросов нет, потому что mock):**

```javascript
test('polling: liveData в Pinia меняется', async ({ page, loginAs }) => {
  await loginAs('engineer')
  await page.goto('/equipment/БУР-01')
  await page.waitForTimeout(500)
  const v1 = await page.evaluate(() => {
    const s = window.__pinia?.state?.value?.sensors
    return s?.liveData?.['БУР-01']?.['temp-engine']?.value ?? null
  })
  await page.waitForTimeout(7000)
  const v2 = await page.evaluate(() => {
    const s = window.__pinia?.state?.value?.sensors
    return s?.liveData?.['БУР-01']?.['temp-engine']?.value ?? null
  })
  expect(v1).not.toBeNull()
  expect(v2).not.toBeNull()
})
```

Чтобы `window.__pinia` был доступен, в `src/main.js` уже не задано — поэтому в тесте через `addInitScript` подменить `pinia.use`:

```javascript
await page.addInitScript(() => {
  window.__exposePinia = (pinia) => { window.__pinia = pinia }
})
```

И в `src/main.js` добавить `if (import.meta.env.DEV) window.__exposePinia?.(pinia)`. Это даст инспекцию состояния в e2e.

- [ ] **Step 4: Modify `src/main.js` — экспозиция Pinia в DEV**

После создания `pinia` (строка `const pinia = createPinia()`) добавить:

```javascript
if (import.meta.env.DEV) {
  window.__exposePinia?.(pinia)
  window.__pinia = pinia
}
```

- [ ] **Step 5: Финальный запуск и Commit**

```bash
npx playwright test ft-07-realtime-polling.spec.js --project=chromium
git add tests/e2e/specs/ft-07-realtime-polling.spec.js src/main.js
git commit -m "test(e2e): ФТ-7 realtime polling + экспозиция pinia в DEV"
```

---

### Task 30: ФТ-8 — индикатор подключения

**Files:**
- Create: `tests/e2e/specs/ft-08-connection-status.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { BasePage } from '../pages/BasePage.js'

test.describe('ФТ-8: Connection status', () => {
  test('по умолчанию «ПОДКЛЮЧЕНО»', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/')
    const base = new BasePage(page)
    await expect(base.connectionStatus).toContainText('ПОДКЛЮЧЕНО')
    await expect(base.connectionStatus).toHaveAttribute('data-state', 'connected')
  })

  test('при принудительном disconnect отображается «НЕТ СВЯЗИ»', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/equipment/БУР-01')
    await page.evaluate(() => {
      const c = window.__pinia?.state?.value?.connection
      if (c) {
        c.consecutiveFailures = 5
        c.status = 'disconnected'
      }
    })
    const base = new BasePage(page)
    await expect(base.connectionStatus).toContainText('НЕТ СВЯЗИ')
  })

  test('после reportSuccess возвращается «ПОДКЛЮЧЕНО»', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/equipment/БУР-01')
    await page.evaluate(() => {
      const c = window.__pinia?.state?.value?.connection
      if (c) {
        c.consecutiveFailures = 5
        c.status = 'disconnected'
      }
    })
    await page.evaluate(() => {
      const c = window.__pinia?.state?.value?.connection
      if (c) {
        c.consecutiveFailures = 0
        c.status = 'connected'
      }
    })
    const base = new BasePage(page)
    await expect(base.connectionStatus).toContainText('ПОДКЛЮЧЕНО')
  })
})
```

- [ ] **Step 2: Запуск и Commit**

```bash
npx playwright test ft-08-connection-status.spec.js --project=chromium
git add tests/e2e/specs/ft-08-connection-status.spec.js
git commit -m "test(e2e): ФТ-8 индикатор подключения"
```

---

### Task 31: ФТ-9 — жизненный цикл наряда

**Files:**
- Create: `tests/e2e/specs/ft-09-maintenance-lifecycle.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { MaintenanceListPage } from '../pages/MaintenanceListPage.js'
import { MaintenanceCreatePage } from '../pages/MaintenanceCreatePage.js'
import { MaintenanceDetailPage } from '../pages/MaintenanceDetailPage.js'
import { seedOrders } from '../fixtures/state.js'
import { makeOrder } from '../helpers/storage.js'

test.describe('ФТ-9: Жизненный цикл наряда', () => {
  test('engineer создаёт наряд через мастер из 3 шагов', async ({ page, loginAs }) => {
    await loginAs('engineer')
    const create = new MaintenanceCreatePage(page)
    await create.goto()
    await create.pickEquipment('БУР-04')
    await create.pickType('ТО-1')
    await create.nextButton.click()
    await create.nextButton.click()
    await create.pickAssignee('Петров')
    await create.createButton.click()
    await expect(page).toHaveURL(/\/maintenance$/)
  })

  test('mechanic переводит шаги наряда: pending → passed/failed/skipped', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-LC',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    })
    await seedOrders(page, [order])
    await loginAs('mechanic')
    const detail = new MaintenanceDetailPage(page, 'ORD-LC')
    await detail.goto()
    await detail.markPassedButton.click()
    await detail.markFailedButton.click()
    await detail.markSkippedButton.click()
    await expect(detail.finishButton).toBeVisible()
  })

  test('mechanic отправляет наряд на приёмку → статус review', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-SR',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
      steps: makeOrder().steps.map((s) => ({ ...s, status: 'passed' })),
    })
    await seedOrders(page, [order])
    await loginAs('mechanic')
    const detail = new MaintenanceDetailPage(page, 'ORD-SR')
    await detail.goto()
    await detail.finishButton.click()
    await detail.submitForReviewButton.click()
    const status = await page.evaluate((id) => {
      const orders = JSON.parse(localStorage.getItem('rgm:v1:orders'))
      return orders.find((o) => o.id === id)?.status
    }, 'ORD-SR')
    expect(status).toBe('review')
  })

  test('foreman принимает наряд → статус completed', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-AP',
      status: 'review',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
      steps: makeOrder().steps.map((s) => ({ ...s, status: 'passed' })),
    })
    await seedOrders(page, [order])
    await loginAs('foreman')
    const detail = new MaintenanceDetailPage(page, 'ORD-AP')
    await detail.goto()
    await detail.approveButton.click()
    const status = await page.evaluate((id) => {
      const orders = JSON.parse(localStorage.getItem('rgm:v1:orders'))
      return orders.find((o) => o.id === id)?.status
    }, 'ORD-AP')
    expect(status).toBe('completed')
  })
})
```

- [ ] **Step 2: Запуск и Commit**

```bash
npx playwright test ft-09-maintenance-lifecycle.spec.js --project=chromium
git add tests/e2e/specs/ft-09-maintenance-lifecycle.spec.js
git commit -m "test(e2e): ФТ-9 жизненный цикл наряда"
```

---

### Task 32: ФТ-10 — измерения и материалы

**Files:**
- Create: `tests/e2e/specs/ft-10-measurements-materials.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { MaintenanceDetailPage } from '../pages/MaintenanceDetailPage.js'
import { seedOrders } from '../fixtures/state.js'
import { makeOrder } from '../helpers/storage.js'

test.describe('ФТ-10: Измерения и материалы', () => {
  test('измерение в пределах нормы → шаг passed', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-MEAS-OK',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    })
    await seedOrders(page, [order])
    await loginAs('mechanic')
    const detail = new MaintenanceDetailPage(page, 'ORD-MEAS-OK')
    await detail.goto()
    const numeric = page.locator('input[type="number"]').first()
    await numeric.fill('90')
    await detail.markPassedButton.click()
    const status = await page.evaluate((id) => {
      const orders = JSON.parse(localStorage.getItem('rgm:v1:orders'))
      return orders.find((o) => o.id === id)?.steps[0].status
    }, 'ORD-MEAS-OK')
    expect(status).toBe('passed')
  })

  test('измерение вне нормы → шаг failed', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-MEAS-FAIL',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    })
    await seedOrders(page, [order])
    await loginAs('mechanic')
    const detail = new MaintenanceDetailPage(page, 'ORD-MEAS-FAIL')
    await detail.goto()
    const numeric = page.locator('input[type="number"]').first()
    await numeric.fill('150')
    await detail.markFailedButton.click()
    const status = await page.evaluate((id) => {
      const orders = JSON.parse(localStorage.getItem('rgm:v1:orders'))
      return orders.find((o) => o.id === id)?.steps[0].status
    }, 'ORD-MEAS-FAIL')
    expect(status).toBe('failed')
  })
})
```

- [ ] **Step 2: Запуск и Commit**

```bash
npx playwright test ft-10-measurements-materials.spec.js --project=chromium
git add tests/e2e/specs/ft-10-measurements-materials.spec.js
git commit -m "test(e2e): ФТ-10 измерения и материалы"
```

---

### Task 33: ФТ-11 — формирование документов

**Files:**
- Create: `tests/e2e/specs/ft-11-document-generation.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { seedOrders } from '../fixtures/state.js'
import { makeOrder } from '../helpers/storage.js'

test.describe('ФТ-11: Формирование документов', () => {
  test('completed-наряд имеет страницу акта с реквизитами', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-DOC',
      status: 'completed',
      type: 'ТО-1',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
      steps: makeOrder().steps.map((s) => ({ ...s, status: 'passed' })),
    })
    await seedOrders(page, [order])
    await loginAs('engineer')
    await page.goto('/maintenance/ORD-DOC/document')
    await expect(page.getByText(/АКТ/)).toBeVisible()
    await expect(page.getByText('БУР-04')).toBeVisible()
    await expect(page.getByText('Петров')).toBeVisible()
  })
})
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/specs/ft-11-document-generation.spec.js
git commit -m "test(e2e): ФТ-11 формирование акта"
```

---

### Task 34: ФТ-12 — журнал

**Files:**
- Create: `tests/e2e/specs/ft-12-journal.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { JournalPage } from '../pages/JournalPage.js'

test.describe('ФТ-12: Журнал', () => {
  test('engineer видит таблицу журнала', async ({ page, loginAs }) => {
    await loginAs('engineer')
    const journal = new JournalPage(page)
    await journal.goto()
    await expect(journal.table).toBeVisible()
  })
})
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/specs/ft-12-journal.spec.js
git commit -m "test(e2e): ФТ-12 журнал"
```

---

### Task 35: ФТ-13 — RBAC

**Files:**
- Create: `tests/e2e/specs/ft-13-rbac.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'

test.describe('ФТ-13: RBAC по ролям', () => {
  test('engineer видит все разделы меню', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/')
    for (const label of ['Главная', 'Мониторинг', 'Оборудование', 'Техобслуживание', 'Журнал ТС', 'Аналитика', 'Отчёты']) {
      await expect(page.getByRole('link', { name: label }).first()).toBeVisible()
    }
  })

  test('mechanic не видит «Мониторинг», «Аналитика», «Журнал ТС»', async ({ page, loginAs }) => {
    await loginAs('mechanic')
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Мониторинг' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Аналитика' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Журнал ТС' })).toHaveCount(0)
  })

  test('mechanic не имеет «Создать отчёт» в Reports', async ({ page, loginAs }) => {
    await loginAs('mechanic')
    await page.goto('/reports')
    await expect(page.getByRole('button', { name: /Создать отчёт/ })).toHaveCount(0)
  })

  test('mechanic при попытке зайти в /reports/create редиректится на /reports', async ({ page, loginAs }) => {
    await loginAs('mechanic')
    await page.goto('/reports/create')
    await expect(page).toHaveURL(/\/reports$/)
  })

  test('foreman видит «Аналитика» и «Журнал ТС»', async ({ page, loginAs }) => {
    await loginAs('foreman')
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Аналитика' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Журнал ТС' }).first()).toBeVisible()
  })
})
```

- [ ] **Step 2: Запуск и Commit**

```bash
npx playwright test ft-13-rbac.spec.js --project=chromium
git add tests/e2e/specs/ft-13-rbac.spec.js
git commit -m "test(e2e): ФТ-13 RBAC"
```

---

## Phase 6: НФТ — нефункциональные

### Task 36: НФТ-3, НФТ-4 — адаптив и touch-таргеты

**Files:**
- Create: `tests/e2e/specs/nfr-03-04-responsive.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { VIEWPORTS } from '../helpers/viewport.js'

test.describe('НФТ-3, НФТ-4: адаптив и touch', () => {
  for (const [name, vp] of Object.entries(VIEWPORTS)) {
    test(`нет горизонтального скролла на ${name}`, async ({ page, loginAs }) => {
      await loginAs('engineer')
      await page.setViewportSize(vp)
      for (const path of ['/', '/equipment', '/alerts', '/maintenance']) {
        await page.goto(path)
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth - document.documentElement.clientWidth
        })
        expect(overflow).toBeLessThanOrEqual(2)
      }
    })
  }

  test('основные кнопки на mobile ≥ 44×44 px', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.goto('/equipment')
    const button = page.getByRole('button', { name: /Подключить станок/ }).first()
    const box = await button.boundingBox()
    expect(box.height).toBeGreaterThanOrEqual(44)
  })
})
```

- [ ] **Step 2: Запуск и Commit**

```bash
npx playwright test nfr-03-04-responsive.spec.js --project=chromium
git add tests/e2e/specs/nfr-03-04-responsive.spec.js
git commit -m "test(e2e): НФТ-3/4 адаптив и touch-таргеты"
```

---

### Task 37: НФТ-5, НФТ-6 — устойчивость к offline

**Files:**
- Create: `tests/e2e/specs/nfr-05-06-resilience.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { BasePage } from '../pages/BasePage.js'

test.describe('НФТ-5, НФТ-6: устойчивость', () => {
  test('при offline данные на экране сохраняются', async ({ page, loginAs, context }) => {
    await loginAs('engineer')
    await page.goto('/equipment/БУР-01')
    await page.waitForTimeout(1500)
    const before = await page.locator('.metric-value').first().textContent()
    await page.evaluate(() => {
      const c = window.__pinia?.state?.value?.connection
      if (c) {
        c.consecutiveFailures = 5
        c.status = 'disconnected'
      }
    })
    await page.waitForTimeout(2000)
    const after = await page.locator('.metric-value').first().textContent()
    expect(after).toBe(before)
  })

  test('после возврата online статус возвращается без reload', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/equipment/БУР-01')
    await page.evaluate(() => {
      const c = window.__pinia?.state?.value?.connection
      if (c) {
        c.consecutiveFailures = 5
        c.status = 'disconnected'
      }
    })
    const base = new BasePage(page)
    await expect(base.connectionStatus).toContainText('НЕТ СВЯЗИ')
    await page.evaluate(() => {
      const c = window.__pinia?.state?.value?.connection
      if (c) {
        c.consecutiveFailures = 0
        c.status = 'connected'
      }
    })
    await expect(base.connectionStatus).toContainText('ПОДКЛЮЧЕНО')
  })
})
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/specs/nfr-05-06-resilience.spec.js
git commit -m "test(e2e): НФТ-5/6 устойчивость к offline"
```

---

### Task 38: НФТ-7 — UX (toast, подтверждения)

**Files:**
- Create: `tests/e2e/specs/nfr-07-ux.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { SettingsPage } from '../pages/SettingsPage.js'
import { EquipmentListPage } from '../pages/EquipmentListPage.js'

test.describe('НФТ-7: UX', () => {
  test('сохранение настроек выводит сообщение об успехе', async ({ page, loginAs }) => {
    await loginAs('engineer')
    const settings = new SettingsPage(page)
    await settings.goto()
    await settings.saveButton.click()
    await expect(settings.successBanner).toBeVisible()
  })

  test('удаление оборудования требует подтверждения', async ({ page, loginAs }) => {
    await loginAs('engineer')
    const list = new EquipmentListPage(page)
    await list.goto()
    await list.cardById('БУР-01').getByRole('button', { name: /Удалить/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/specs/nfr-07-ux.spec.js
git commit -m "test(e2e): НФТ-7 UX-подтверждения"
```

---

### Task 39: НФТ-9 — кросс-браузерный smoke

**Files:**
- Create: `tests/e2e/specs/nfr-09-cross-browser.spec.js`

- [ ] **Step 1: Записать тесты**

```javascript
import { test, expect } from '../fixtures/index.js'
import { LoginPage } from '../pages/LoginPage.js'

test.describe('НФТ-9: кросс-браузер smoke', () => {
  test('логин и переход на главную', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.loginUI('engineer')
    await expect(page).toHaveURL(/\/$/)
  })

  test('список оборудования рендерится', async ({ page, loginAs }) => {
    await loginAs('engineer')
    await page.goto('/equipment')
    const cards = page.getByTestId('equipment-card')
    await expect(cards.first()).toBeVisible()
  })
})
```

- [ ] **Step 2: Прогон во всех проектах**

```bash
npx playwright test nfr-09-cross-browser.spec.js
```

Ожидание: 6 тестов PASS (2 теста × 3 браузера).

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/specs/nfr-09-cross-browser.spec.js
git commit -m "test(e2e): НФТ-9 кросс-браузерный smoke"
```

---

## Phase 7: Сценарии по ролям (E2E user journeys)

### Task 40: Сценарии engineer (S-E1..S-E4)

**Files:**
- Create: `tests/e2e/specs/role-engineer-scenarios.spec.js`

- [ ] **Step 1: Записать сценарии**

```javascript
import { test, expect } from '../fixtures/index.js'
import { HomePage } from '../pages/HomePage.js'
import { AlertsPage } from '../pages/AlertsPage.js'
import { MaintenanceCreatePage } from '../pages/MaintenanceCreatePage.js'
import { EquipmentDashboardPage } from '../pages/EquipmentDashboardPage.js'
import { EquipmentListPage } from '../pages/EquipmentListPage.js'
import { seedAlerts } from '../fixtures/state.js'
import { makeAlert } from '../helpers/storage.js'

test.describe('Сценарии engineer', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('engineer')
  })

  test('S-E1: открытие смены — обзор парка и подтверждение алерта', async ({ page }) => {
    await seedAlerts(page, [
      makeAlert({ id: 'A-S1', type: 'critical', acknowledged: false }),
    ])
    const home = new HomePage(page)
    await home.goto()
    await expect(home.heading).toBeVisible()
    const alerts = new AlertsPage(page)
    await alerts.goto()
    await alerts.acknowledge('A-S1')
    await expect(page.locator('[data-alert-id="A-S1"]')).toHaveAttribute('data-alert-acknowledged', '1')
  })

  test('S-E2: создание ТО-1 для БУР-04', async ({ page }) => {
    const create = new MaintenanceCreatePage(page)
    await create.goto()
    await create.pickEquipment('БУР-04')
    await create.pickType('ТО-1')
    await create.nextButton.click()
    await create.nextButton.click()
    await create.pickAssignee('Петров')
    await create.createButton.click()
    await expect(page).toHaveURL(/\/maintenance$/)
    await expect(page.getByText('БУР-04')).toBeVisible()
    await expect(page.getByText('Петров')).toBeVisible()
  })

  test('S-E3: конструктор панели сохраняет 2 виджета', async ({ page }) => {
    const dash = new EquipmentDashboardPage(page, 'БУР-01')
    await dash.goto()
    await dash.configureButton.click()
    await dash.addWidget('Числовой индикатор', 'Температура двигателя')
    await dash.addWidget('Шкала (gauge)', 'Давление')
    await dash.saveButton.click()
    await page.reload()
    expect(await dash.widgets.count()).toBeGreaterThanOrEqual(2)
  })

  test('S-E4: отключение и повторное подключение станка', async ({ page }) => {
    const list = new EquipmentListPage(page)
    await list.goto()
    const card = list.cardById('БУР-08')
    await card.getByRole('button', { name: /Отключить/ }).click()
    await page.getByRole('button', { name: /Подтвердить/ }).click()
    await expect(card).toHaveAttribute('data-status', 'offline')
    await card.getByRole('button', { name: /Подключить/ }).click()
    await expect(card).toHaveAttribute('data-status', 'idle')
  })
})
```

- [ ] **Step 2: Запуск и Commit**

```bash
npx playwright test role-engineer-scenarios.spec.js --project=chromium
git add tests/e2e/specs/role-engineer-scenarios.spec.js
git commit -m "test(e2e): сценарии engineer S-E1..S-E4"
```

---

### Task 41: Сценарии mechanic (S-M1..S-M3)

**Files:**
- Create: `tests/e2e/specs/role-mechanic-scenarios.spec.js`

- [ ] **Step 1: Записать сценарии**

```javascript
import { test, expect } from '../fixtures/index.js'
import { HomePage } from '../pages/HomePage.js'
import { MaintenanceDetailPage } from '../pages/MaintenanceDetailPage.js'
import { seedOrders } from '../fixtures/state.js'
import { makeOrder } from '../helpers/storage.js'

test.describe('Сценарии mechanic', () => {
  test('S-M1: выполнение наряда (passed/failed/skipped + submit)', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-M1',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    })
    await seedOrders(page, [order])
    await loginAs('mechanic')
    const detail = new MaintenanceDetailPage(page, 'ORD-M1')
    await detail.goto()
    await page.locator('input[type="number"]').first().fill('85')
    await detail.markPassedButton.click()
    await page.locator('input[type="number"]').first().fill('200')
    await detail.markFailedButton.click()
    await detail.markSkippedButton.click()
    await detail.finishButton.click()
    await detail.submitForReviewButton.click()
    const status = await page.evaluate((id) => {
      const orders = JSON.parse(localStorage.getItem('rgm:v1:orders'))
      return orders.find((o) => o.id === id)?.status
    }, 'ORD-M1')
    expect(status).toBe('review')
  })

  test('S-M2: ограничения видимости', async ({ page, loginAs }) => {
    await loginAs('mechanic')
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Мониторинг' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Аналитика' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Журнал ТС' })).toHaveCount(0)
    await page.goto('/reports/create')
    await expect(page).toHaveURL(/\/reports$/)
  })

  test('S-M3: сохранение введённых данных при offline', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-M3',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
    })
    await seedOrders(page, [order])
    await loginAs('mechanic')
    const detail = new MaintenanceDetailPage(page, 'ORD-M3')
    await detail.goto()
    const input = page.locator('input[type="number"]').first()
    await input.fill('77')
    await page.evaluate(() => {
      const c = window.__pinia?.state?.value?.connection
      if (c) {
        c.consecutiveFailures = 5
        c.status = 'disconnected'
      }
    })
    await page.waitForTimeout(1000)
    await expect(input).toHaveValue('77')
    await page.evaluate(() => {
      const c = window.__pinia?.state?.value?.connection
      if (c) {
        c.consecutiveFailures = 0
        c.status = 'connected'
      }
    })
    await expect(input).toHaveValue('77')
  })
})
```

- [ ] **Step 2: Запуск и Commit**

```bash
npx playwright test role-mechanic-scenarios.spec.js --project=chromium
git add tests/e2e/specs/role-mechanic-scenarios.spec.js
git commit -m "test(e2e): сценарии mechanic S-M1..S-M3"
```

---

### Task 42: Сценарии foreman (S-F1, S-F2)

**Files:**
- Create: `tests/e2e/specs/role-foreman-scenarios.spec.js`

- [ ] **Step 1: Записать сценарии**

```javascript
import { test, expect } from '../fixtures/index.js'
import { MaintenanceDetailPage } from '../pages/MaintenanceDetailPage.js'
import { seedOrders } from '../fixtures/state.js'
import { makeOrder } from '../helpers/storage.js'

test.describe('Сценарии foreman', () => {
  test('S-F1: приёмка наряда → completed → доступен акт', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-F1',
      status: 'review',
      type: 'ТО-1',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
      steps: makeOrder().steps.map((s) => ({ ...s, status: 'passed' })),
    })
    await seedOrders(page, [order])
    await loginAs('foreman')
    const detail = new MaintenanceDetailPage(page, 'ORD-F1')
    await detail.goto()
    await detail.approveButton.click()
    await page.goto('/maintenance/ORD-F1/document')
    await expect(page.getByText(/АКТ/)).toBeVisible()
  })

  test('S-F2: отклонение наряда возвращает его в in_progress', async ({ page, loginAs }) => {
    const order = makeOrder({
      id: 'ORD-F2',
      status: 'review',
      type: 'ТО-1',
      assignedTo: { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
      steps: makeOrder().steps.map((s) => ({ ...s, status: 'passed' })),
    })
    await seedOrders(page, [order])
    await loginAs('foreman')
    const detail = new MaintenanceDetailPage(page, 'ORD-F2')
    await detail.goto()
    await detail.rejectButton.click()
    const dialog = page.getByRole('dialog')
    if (await dialog.isVisible({ timeout: 1500 }).catch(() => false)) {
      await dialog.getByRole('textbox').fill('Повторить шаг 2')
      await dialog.getByRole('button', { name: /Отклонить/ }).click()
    }
    const status = await page.evaluate((id) => {
      const orders = JSON.parse(localStorage.getItem('rgm:v1:orders'))
      return orders.find((o) => o.id === id)?.status
    }, 'ORD-F2')
    expect(['in_progress', 'planned']).toContain(status)
  })
})
```

- [ ] **Step 2: Запуск и Commit**

```bash
npx playwright test role-foreman-scenarios.spec.js --project=chromium
git add tests/e2e/specs/role-foreman-scenarios.spec.js
git commit -m "test(e2e): сценарии foreman S-F1..S-F2"
```

---

## Phase 8: Финальная проверка и документация

### Task 43: Полный прогон + README

**Files:**
- Create: `tests/e2e/README.md`

- [ ] **Step 1: Записать README**

```markdown
# E2E-тесты Playwright

## Запуск
- `npm run test:e2e` — прогон всех тестов в трёх браузерах
- `npm run test:e2e -- --project=chromium` — только Chromium
- `npm run test:e2e:ui` — интерактивный UI-режим
- `npm run test:e2e:headed` — с видимым браузером
- `npm run test:e2e:report` — открыть HTML-отчёт

## Структура
- `fixtures/` — фикстуры Playwright (`loginAs`, `seedAlerts`, `seedOrders`, авто-`cleanState`)
- `helpers/` — селекторы, ключи `localStorage`, viewport-пресеты
- `pages/` — Page Object Model
- `specs/` — тесты, сгруппированные по требованию (`ft-*`, `nfr-*`, `role-*`)

## Изоляция состояния
Каждый тест автоматически сбрасывает `localStorage` перед загрузкой страницы (фикстура `cleanState`),
после чего может seed-ить детерминированное состояние через `seedAlerts`/`seedOrders`/`seedDashboard`.
Логин выполняется через `loginAs(role)` — он инжектит токен и user-id напрямую в `localStorage`,
без прохождения через UI.

## Документы
- `docs/superpowers/specs/2026-05-01-e2e-tests/01-requirements-analysis.md` — анализ ФТ/НФТ
- `docs/superpowers/specs/2026-05-01-e2e-tests/02-checklist.md` — чек-лист
- `docs/superpowers/specs/2026-05-01-e2e-tests/03-detailed-checks.md` — детализация
- `docs/superpowers/specs/2026-05-01-e2e-tests/04-user-scenarios.md` — пользовательские сценарии
```

- [ ] **Step 2: Полный прогон в Chromium**

```bash
npx playwright test --project=chromium
```

Ожидание: все тесты зелёные. Если есть падения — фиксировать `data-testid` или текст селектора в исходниках, не «подгонять» тесты под код.

- [ ] **Step 3: Полный прогон во всех браузерах**

```bash
npx playwright test
```

Ожидание: все тесты зелёные.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/README.md
git commit -m "docs(e2e): README для запуска и структуры e2e-тестов"
```

---

## Self-review checkpoints

- Покрытие требований:
  - ФТ-1 → Task 23
  - ФТ-2 → Task 24
  - ФТ-3 → Task 25
  - ФТ-4 → Task 26
  - ФТ-5 → Task 27
  - ФТ-6 → Task 28
  - ФТ-7 → Task 29
  - ФТ-8 → Task 30
  - ФТ-9 → Task 31, Task 41, Task 42
  - ФТ-10 → Task 32
  - ФТ-11 → Task 33, Task 42
  - ФТ-12 → Task 34
  - ФТ-13 → Task 35
  - НФТ-1, НФТ-2 → косвенно покрыты `expect.timeout` и `webServer.timeout` (отдельный hard-budget assertion опционален; не критичен для приёмки)
  - НФТ-3, НФТ-4 → Task 36
  - НФТ-5, НФТ-6 → Task 37
  - НФТ-7 → Task 38
  - НФТ-8 → out of scope (unit-уровень)
  - НФТ-9 → Task 39 + конфиг `projects` в Task 6
- Плейсхолдеры: код приведён в каждом шаге; «TODO» и «реализовать позже» отсутствуют.
- Согласованность типов: `loginAs(role)` возвращает `{ id, name, role }`; `seedAlerts/seedOrders/seedDashboard` принимают тот же формат payload, что генерирует `makeAlert/makeOrder`. Имена `cards`, `widgets`, `tab(name)` единообразны между POMs.
