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
