import { computed } from 'vue'
import { useTheme } from './useTheme'

export function useChartColors() {
  const { theme } = useTheme()

  const colors = computed(() => {
    const isDark = theme.value === 'dark'
    return {
      foreground: isDark ? '#FFFFFF' : '#0A0A0A',
      background: isDark ? '#0A0A0A' : '#FAFAFA',
      surface1: isDark ? '#151515' : '#FFFFFF',
      surface2: isDark ? '#1C1C1C' : '#F0F0F0',
      border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)',
      chart1: isDark ? '#FFFFFF' : '#0A0A0A',
      chart2: isDark ? '#E0E0E0' : '#2C2C2C',
      chart3: isDark ? '#C0C0C0' : '#404040',
      chart4: isDark ? '#A0A0A0' : '#606060',
      chart5: isDark ? '#808080' : '#808080',
    }
  })

  return { colors }
}
