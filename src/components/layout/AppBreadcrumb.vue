<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(segment, index) in segments" :key="index">
        <BreadcrumbItem>
          <BreadcrumbLink v-if="index < segments.length - 1" as-child>
            <RouterLink :to="segment.to">{{ segment.label }}</RouterLink>
          </BreadcrumbLink>
          <BreadcrumbPage v-else>{{ segment.label }}</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="index < segments.length - 1" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const route = useRoute()

const segments = computed(() => {
  const breadcrumb = route.meta?.breadcrumb
  if (!breadcrumb) return []

  const parts = breadcrumb.split(' / ')

  return parts.map((part, index) => {
    let label = part
    if (label.startsWith(':')) {
      const paramName = label.slice(1)
      label = route.params[paramName] || label
    }

    let to = '/'
    if (index === 0 && parts.length > 1) {
      const routeMap = {
        Оборудование: '/equipment',
        Мониторинг: '/dashboard',
        Уведомления: '/alerts',
        Аналитика: '/analytics',
        Настройки: '/settings',
        Техобслуживание: '/maintenance',
        Главная: '/',
      }
      to = routeMap[part] || '/'
    }

    return { label, to }
  })
})
</script>
