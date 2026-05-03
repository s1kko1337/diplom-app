# E2E-тесты Playwright

End-to-end проверки клиентской части системы мониторинга бурового оборудования
«Рудгормаш». Покрывают функциональные требования ФТ-1…ФТ-13 и нефункциональные
НФТ-3, НФТ-4, НФТ-5, НФТ-6, НФТ-7, НФТ-9 из `docs/requirements.md`, плюс
интеграционные сценарии по ролям engineer / mechanic / foreman.

## Запуск

- `npm run test:e2e` — все тесты в трёх браузерах (chromium / firefox / webkit)
- `npm run test:e2e -- --project=chromium` — только Chromium (быстро)
- `npm run test:e2e:ui` — интерактивный UI-режим Playwright
- `npm run test:e2e:headed` — с видимым браузером
- `npm run test:e2e:report` — открыть HTML-отчёт после прогона
- `npx playwright test ft-01 --project=chromium` — конкретный спек

Vite dev-server поднимается автоматически (`webServer` в `playwright.config.js`).

## Структура

```
tests/e2e/
├── fixtures/
│   ├── auth.js         loginAs(role) через addInitScript + UI-вариант
│   ├── state.js        seedAlerts/Orders/Dashboard, авто-cleanState (once-flag)
│   └── index.js        объединённый test/expect с auto-фикстурами
├── helpers/
│   ├── selectors.js    ROLES, STATUS_LABELS, NAV_LINKS, TESTIDS
│   ├── storage.js      ключи rgm:* + makeAlert/makeOrder
│   └── viewport.js     пресеты mobile/tablet/laptop/fullhd
├── pages/              POM на каждый экран (14 классов)
└── specs/
    ├── ft-01..ft-13    функциональные требования
    ├── nfr-03-04       адаптив и touch-таргеты
    ├── nfr-05-06       устойчивость к offline
    ├── nfr-07          UX-подтверждения
    ├── nfr-09          кросс-браузерный smoke
    └── role-*          сценарии по ролям
```

## Принципы

**Изоляция состояния.** Каждый тест автоматически сбрасывает `localStorage`
перед первой загрузкой страницы (фикстура `cleanState` через `addInitScript`
с once-флагом в `sessionStorage`, чтобы `page.reload()` не стирал сохранённые
тестом данные). Затем при необходимости сидируется детерминированный набор
данных через `seedAlerts`/`seedOrders`/`seedDashboard`.

**Логин.** `loginAs(role)` инжектит токен и `auth_user_id` напрямую в
`localStorage` через `addInitScript` — без UI, быстро и стабильно. Доступные
роли: `engineer`, `mechanic`, `mechanic2`, `foreman`.

**Доступ к Pinia из теста.** В DEV-сборке `src/main.js` экспонирует
`window.__pinia`, что позволяет тестам читать `liveData`, проверять статус
подключения и форсировать `disconnected/connected` без реальной сети.

**Отключение пороговых уведомлений.** В тестовой среде `useThresholdMonitor`
проверяет флаг `localStorage['rgm:e2e:disable-thresholds']` и пропускает
проверки, чтобы критическое модальное окно не блокировало UI.

**Селекторы.** Приоритет: `getByRole` → `getByText` → `[data-testid]`.
testid'ы добавлены только там, где нет надёжного семантического селектора:
`connection-status`, `widget-card`, `equipment-card`, `alert-card`,
`critical-alert-modal`.

## Документы

- `docs/superpowers/specs/2026-05-01-e2e-tests/01-requirements-analysis.md` — анализ ФТ/НФТ
- `docs/superpowers/specs/2026-05-01-e2e-tests/02-checklist.md` — плоский чек-лист проверок
- `docs/superpowers/specs/2026-05-01-e2e-tests/03-detailed-checks.md` — детализация
- `docs/superpowers/specs/2026-05-01-e2e-tests/04-user-scenarios.md` — пользовательские сценарии
- `docs/superpowers/plans/2026-05-01-e2e-playwright-tests.md` — план реализации
