import { defineAsyncComponent } from 'vue'

export const widgetTypes = {
  'numeric-indicator': {
    label: 'Числовой индикатор',
    description: 'Текущее значение датчика с единицей измерения',
    defaultSize: { w: 3, h: 2 },
    requiresSensor: true,
    component: defineAsyncComponent(() => import('./NumericWidget.vue')),
  },
  'line-chart': {
    label: 'Линейный график',
    description: 'График изменения значения во времени',
    defaultSize: { w: 6, h: 4 },
    requiresSensor: true,
    component: defineAsyncComponent(() => import('./LineChartWidget.vue')),
  },
  gauge: {
    label: 'Шкала (gauge)',
    description: 'Круговая шкала с текущим значением',
    defaultSize: { w: 3, h: 4 },
    requiresSensor: true,
    component: defineAsyncComponent(() => import('./GaugeWidget.vue')),
  },
  'sensor-history': {
    label: 'Исторические данные датчика',
    description: 'График за последние 24 часа по выбранному датчику',
    defaultSize: { w: 6, h: 4 },
    requiresSensor: true,
    component: defineAsyncComponent(() => import('./SensorHistoryWidget.vue')),
  },
  info: {
    label: 'Краткая информация',
    description: 'Модель, серийный номер, год выпуска',
    defaultSize: { w: 4, h: 3 },
    requiresSensor: false,
    component: defineAsyncComponent(() => import('./InfoWidget.vue')),
  },
  status: {
    label: 'Индикатор статуса',
    description: 'Визуальный индикатор текущего состояния оборудования',
    defaultSize: { w: 2, h: 3 },
    requiresSensor: false,
    component: defineAsyncComponent(() => import('./StatusWidget.vue')),
  },
  specs: {
    label: 'Технические характеристики',
    description: 'Таблица технических параметров оборудования',
    defaultSize: { w: 4, h: 5 },
    requiresSensor: false,
    component: defineAsyncComponent(() => import('./SpecsWidget.vue')),
  },
  'service-history': {
    label: 'История обслуживания',
    description: 'Записи о проведённых ТО и ремонтах',
    defaultSize: { w: 4, h: 5 },
    requiresSensor: false,
    component: defineAsyncComponent(() => import('./ServiceHistoryWidget.vue')),
  },
  parts: {
    label: 'Замены деталей',
    description: 'История замены запчастей с артикулами',
    defaultSize: { w: 6, h: 5 },
    requiresSensor: false,
    component: defineAsyncComponent(() => import('./PartsWidget.vue')),
  },
}

export function getWidgetComponent(type) {
  return widgetTypes[type]?.component || null
}

export function getWidgetTypesList() {
  return Object.entries(widgetTypes).map(([key, val]) => ({
    type: key,
    label: val.label,
    description: val.description,
    defaultSize: val.defaultSize,
    requiresSensor: val.requiresSensor !== false,
  }))
}
