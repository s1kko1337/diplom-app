import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function usePermissions() {
  const auth = useAuthStore()

  const canCreate = computed(() => auth.userRole === 'engineer')
  const canReview = computed(() => auth.userRole === 'foreman')

  function canExecute(order) {
    return auth.userRole === 'mechanic' && order.assignedTo?.id === auth.userId
  }

  function canCancel(order) {
    return auth.userRole === 'engineer' && !['completed', 'cancelled'].includes(order.status)
  }

  return { canCreate, canExecute, canReview, canCancel }
}
