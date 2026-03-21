import { request } from './client'
import * as mock from './mock/users'

export function getUsers() {
  return request(() => mock.getUsers())
}

export function getUsersByRole(role) {
  return request(() => mock.getUsersByRole(role))
}

export function getUserById(id) {
  return request(() => mock.getUserById(id))
}
