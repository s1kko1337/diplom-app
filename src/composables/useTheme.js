import { computed, watchEffect } from 'vue'
import { Sun, Moon, Contrast, Eye, Layers } from 'lucide-vue-next'
import { usePreferencesStore } from '@/stores/preferences'

/**
 * Доступные темы оформления.
 * `dark: true` — тема относится к «тёмному» семейству: на <html> навешивается
 * класс `.dark`, чтобы продолжали работать Tailwind-варианты `dark:` и
 * вычисление цветов графиков.
 */
export const THEMES = [
  { value: 'light', label: 'СВЕТЛАЯ', description: 'Базовая светлая тема', icon: Sun, dark: false },
  { value: 'dark', label: 'ТЁМНАЯ', description: 'Базовая тёмная тема', icon: Moon, dark: true },
  {
    value: 'mono',
    label: 'МОНОХРОМ',
    description: 'Классический ч/б стиль с острыми углами',
    icon: Contrast,
    dark: false,
  },
  {
    value: 'contrast',
    label: 'КОНТРАСТНАЯ',
    description: 'Повышенная контрастность для слабовидящих',
    icon: Eye,
    dark: true,
  },
  {
    value: 'graphite',
    label: 'ГРАФИТОВАЯ',
    description: 'Мягкая серо-белая палитра с контрастом',
    icon: Layers,
    dark: false,
  },
]

const DARK_THEMES = new Set(THEMES.filter((t) => t.dark).map((t) => t.value))
const VALID_THEMES = new Set(THEMES.map((t) => t.value))
const FALLBACK_THEME = 'dark'

function applyToDocument(value) {
  const theme = VALID_THEMES.has(value) ? value : FALLBACK_THEME
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.classList.toggle('dark', DARK_THEMES.has(theme))
}

// Применяем кэшированную тему до монтирования приложения, чтобы избежать мигания.
const cached = localStorage.getItem('theme')
if (cached) {
  applyToDocument(cached)
}

export function useTheme() {
  const preferences = usePreferencesStore()
  const theme = computed(() => preferences.theme)
  const isDark = computed(() => DARK_THEMES.has(theme.value))

  watchEffect(() => {
    applyToDocument(theme.value)
    localStorage.setItem('theme', theme.value)
  })

  function applyTheme(value) {
    preferences.setTheme(VALID_THEMES.has(value) ? value : FALLBACK_THEME)
  }

  // Быстрый тумблер в шапке/сайдбаре: переключает между светлой и тёмной.
  function toggleTheme() {
    applyTheme(isDark.value ? 'light' : 'dark')
  }

  return { theme, isDark, themes: THEMES, toggleTheme, applyTheme }
}
