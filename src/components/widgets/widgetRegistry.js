import { defineAsyncComponent } from 'vue'

export const widgetTypes = {
  'numeric-indicator': {
    label: 'Числовой индикатор',
    description: 'Текущее значение датчика с единицей измерения',
    defaultSize: { w: 3, h: 2 },
    component: defineAsyncComponent(() => import('./NumericWidget.vue')),
  },
  'line-chart': {
    label: 'Линейный график',
    description: 'График изменения значения во времени',
    defaultSize: { w: 6, h: 4 },
    component: defineAsyncComponent(() => import('./LineChartWidget.vue')),
  },
  gauge: {
    label: 'Шкала (gauge)',
    description: 'Круговая шкала с текущим значением',
    defaultSize: { w: 3, h: 4 },
    component: defineAsyncComponent(() => import('./GaugeWidget.vue')),
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
  }))
}
