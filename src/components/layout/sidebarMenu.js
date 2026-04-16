import {
  Home,
  LayoutDashboard,
  Server,
  Bell,
  BarChart3,
  Settings,
  ClipboardCheck,
  BookOpen,
} from 'lucide-vue-next'

// roles: undefined → всем доступен; массив → только указанным ролям
export const menuGroups = [
  {
    title: 'Основное',
    items: [
      { to: '/', icon: Home, label: 'Главная', exact: true },
      {
        to: '/dashboard',
        icon: LayoutDashboard,
        label: 'Мониторинг',
        roles: ['engineer', 'foreman'],
      },
      { to: '/equipment', icon: Server, label: 'Оборудование' },
      { to: '/maintenance', icon: ClipboardCheck, label: 'Техобслуживание' },
      { to: '/journal', icon: BookOpen, label: 'Журнал ТС', roles: ['engineer', 'foreman'] },
    ],
  },
  {
    title: 'Аналитика',
    items: [
      { to: '/alerts', icon: Bell, label: 'Уведомления' },
      { to: '/analytics', icon: BarChart3, label: 'Аналитика', roles: ['engineer', 'foreman'] },
    ],
  },
  {
    title: 'Система',
    items: [{ to: '/settings', icon: Settings, label: 'Настройки' }],
  },
]

export function filterMenuByRole(groups, role) {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0)
}
