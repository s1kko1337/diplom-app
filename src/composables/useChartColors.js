import { computed } from 'vue'
import { useTheme } from './useTheme'

export function useChartColors() {
  const { theme } = useTheme()

  const colors = computed(() => {
    const isDark = theme.value === 'dark'
    return {
      foreground: isDark ? '#FAFAFA' : '#09090B',
      background: isDark ? '#09090B' : '#F4F4F5',
      surface1: isDark ? '#18181B' : '#FFFFFF',
      surface2: isDark ? '#27272A' : '#E4E4E7',
      border: isDark ? '#3F3F46' : '#C4C4C8',
      chart1: isDark ? '#3B82F6' : '#1D4ED8',
      chart2: isDark ? '#8B5CF6' : '#6D28D9',
      chart3: isDark ? '#06B6D4' : '#0E7490',
      chart4: isDark ? '#F59E0B' : '#B45309',
      chart5: isDark ? '#EC4899' : '#BE185D',
    }
  })

  return { colors }
}
