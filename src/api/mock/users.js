export const MOCK_USERS = [
  { id: 'user-1', name: 'Иванов А.П.', role: 'engineer' },
  { id: 'user-2', name: 'Петров С.В.', role: 'mechanic' },
  { id: 'user-3', name: 'Сидоров К.М.', role: 'mechanic' },
  { id: 'user-4', name: 'Козлов Д.А.', role: 'foreman' },
]

export function getUsers() {
  return [...MOCK_USERS]
}

export function getUsersByRole(role) {
  return MOCK_USERS.filter((u) => u.role === role)
}

export function getUserById(id) {
  return MOCK_USERS.find((u) => u.id === id) || null
}
