import {
  Home,
  LayoutDashboard,
  Server,
  Bell,
  BarChart3,
  Settings,
  ClipboardCheck,
} from 'lucide-vue-next'

export const menuGroups = [
  {
    title: 'Основное',
    items: [
      { to: '/', icon: Home, label: 'Главная', exact: true },
      { to: '/dashboard', icon: LayoutDashboard, label: 'Мониторинг' },
      { to: '/equipment', icon: Server, label: 'Оборудование' },
      { to: '/maintenance', icon: ClipboardCheck, label: 'Техобслуживание' },
    ],
  },
  {
    title: 'Аналитика',
    items: [
      { to: '/alerts', icon: Bell, label: 'Уведомления' },
      { to: '/analytics', icon: BarChart3, label: 'Аналитика' },
    ],
  },
  {
    title: 'Система',
    items: [{ to: '/settings', icon: Settings, label: 'Настройки' }],
  },
]
