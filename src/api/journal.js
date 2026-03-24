import { request } from './client'
import * as mockJournal from './mock/journal'

export function getEntries(filters) {
  return request(() => mockJournal.getEntries(filters))
}

export function createEntry(data) {
  return request(() => mockJournal.createEntry(data))
}
