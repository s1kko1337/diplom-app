<template>
  <nav class="flex items-center gap-2 py-2 overflow-x-auto">
    <RouterLink
      v-for="item in menuItems"
      :key="item.to"
      :to="item.to"
      custom
      v-slot="{ isActive, navigate }"
    >
      <button
        class="flex items-center gap-2 px-4 py-2 border-2 transition-all duration-150 whitespace-nowrap hover:translate-x-0.5 hover:-translate-y-0.5"
        :class="isActive ? 'border-primary bg-surface-2' : 'border-border hover:bg-surface-2'"
        @click="navigate"
      >
        <component :is="item.icon" class="w-4 h-4 shrink-0" />
        <span class="text-xs hidden sm:inline">{{ item.label }}</span>
      </button>
    </RouterLink>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { LayoutDashboard, HardDrive, Bell, BarChart3, Settings } from 'lucide-vue-next'

const menuItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'МОНИТОРИНГ' },
  { to: '/equipment', icon: HardDrive, label: 'ОБОРУДОВАНИЕ' },
  { to: '/alerts', icon: Bell, label: 'АЛЕРТЫ' },
  { to: '/analytics', icon: BarChart3, label: 'АНАЛИТИКА' },
  { to: '/settings', icon: Settings, label: 'НАСТРОЙКИ' },
]
</script>

<style scoped></style>
