import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: AuthLayout,
      meta: { guest: true },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/views/LoginView.vue'),
        },
      ],
    },
    {
      path: '/',
      component: DefaultLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          meta: { breadcrumb: 'Главная' },
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          meta: { breadcrumb: 'Мониторинг' },
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'equipment',
          name: 'equipment',
          meta: { breadcrumb: 'Оборудование' },
          component: () => import('@/views/EquipmentListView.vue'),
        },
        {
          path: 'equipment/:id',
          name: 'equipment-detail',
          meta: { breadcrumb: 'Оборудование / :id' },
          component: () => import('@/views/EquipmentDetailView.vue'),
        },
        {
          path: 'equipment/:id/dashboard',
          name: 'equipment-dashboard',
          meta: { breadcrumb: 'Оборудование / :id / Дашборд' },
          component: () => import('@/views/EquipmentDashboardView.vue'),
        },
        {
          path: 'alerts',
          name: 'alerts',
          meta: { breadcrumb: 'Уведомления' },
          component: () => import('@/views/AlertsView.vue'),
        },
        {
          path: 'analytics',
          name: 'analytics',
          meta: { breadcrumb: 'Аналитика' },
          component: () => import('@/views/AnalyticsView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          meta: { breadcrumb: 'Настройки' },
          component: () => import('@/views/SettingsView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.matched.some((r) => r.meta.requiresAuth) && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.matched.some((r) => r.meta.guest) && authStore.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
