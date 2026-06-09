import { computed } from 'vue'
import { useTheme } from './useTheme'

/**
 * Цвета графиков считываются напрямую из CSS-переменных активной темы,
 * поэтому любая тема (включая монохром, контрастную и яркую) автоматически
 * получает корректную палитру без дублирования значений в JS.
 */
export function useChartColors() {
  const { theme } = useTheme()

  const colors = computed(() => {
    // Зависимость от темы: пересчитываем палитру при её смене.
    void theme.value
    const styles = getComputedStyle(document.documentElement)
    const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback

    return {
      foreground: read('--foreground', '#09090B'),
      background: read('--background', '#F4F4F5'),
      surface1: read('--surface-1', '#FFFFFF'),
      surface2: read('--surface-2', '#E4E4E7'),
      border: read('--border', '#C4C4C8'),
      chart1: read('--chart-1', '#1D4ED8'),
      chart2: read('--chart-2', '#6D28D9'),
      chart3: read('--chart-3', '#0E7490'),
      chart4: read('--chart-4', '#B45309'),
      chart5: read('--chart-5', '#BE185D'),
    }
  })

  return { colors }
}
