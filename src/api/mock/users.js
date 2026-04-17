import { defineCollection, read } from './_runtime'
import { createSeed } from './seed/users.seed'

defineCollection({ name: 'users', scope: 'global', schemaVersion: 1, seed: createSeed })

export function getUsers() {
  return [...read('users')]
}

export function getUsersByRole(role) {
  return read('users').filter((u) => u.role === role)
}

export function getUserById(id) {
  return read('users').find((u) => u.id === id) || null
}

export const MOCK_USERS = read('users')
