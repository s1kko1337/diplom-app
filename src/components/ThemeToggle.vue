<template>
  <button
    class="p-2 border border-border hover:bg-surface-2 transition-all duration-150"
    aria-label="Переключить тему"
    @click="toggleTheme"
  >
    <Sun v-if="theme === 'dark'" class="w-5 h-5" />
    <Moon v-else class="w-5 h-5" />
  </button>
</template>

<script setup>
import { Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
</script>
