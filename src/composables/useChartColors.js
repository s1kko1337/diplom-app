import { computed } from 'vue'
import { useTheme } from './useTheme'

export function useChartColors() {
  const { theme } = useTheme()

  const colors = computed(() => {
    const isDark = theme.value === 'dark'
    return {
      foreground: isDark ? '#FAFAFA' : '#09090B',
      background: isDark ? '#09090B' : '#FAFAFA',
      surface1: isDark ? '#18181B' : '#FFFFFF',
      surface2: isDark ? '#27272A' : '#F4F4F5',
      border: isDark ? '#3F3F46' : '#E4E4E7',
      chart1: isDark ? '#3B82F6' : '#2563EB',
      chart2: isDark ? '#8B5CF6' : '#7C3AED',
      chart3: isDark ? '#06B6D4' : '#0891B2',
      chart4: isDark ? '#F59E0B' : '#D97706',
      chart5: isDark ? '#EC4899' : '#DB2777',
    }
  })

  return { colors }
}
