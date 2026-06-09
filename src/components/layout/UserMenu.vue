<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon-sm" class="shrink-0">
        <User class="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-48">
      <DropdownMenuLabel class="font-normal">
        <div class="flex flex-col gap-1">
          <p class="text-sm font-medium">{{ authStore.userName }}</p>
          <p class="text-xs text-muted-foreground">
            {{ ROLE_LABELS[authStore.userRole] || authStore.userRole || 'Оператор' }}
          </p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="handleProfile">
        <UserCog class="mr-2 h-4 w-4" />
        Профиль
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="handleLogout">
        <LogOut class="mr-2 h-4 w-4" />
        Выход
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup>
import { User, UserCog, LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/utils/constants'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const router = useRouter()
const authStore = useAuthStore()

function handleProfile() {
  router.push({ name: 'settings' })
}

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>
