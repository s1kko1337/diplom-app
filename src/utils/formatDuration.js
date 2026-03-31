export function formatDuration(ms) {
  if (!ms || ms < 0) return '00:00:00'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

export function formatDurationHuman(ms) {
  if (!ms || ms < 0) return '0м'
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h > 0 && m > 0) return `${h}ч ${m}м`
  if (h > 0) return `${h}ч`
  return `${m}м`
}

export function durationBetween(startIso, endIso) {
  if (!startIso) return 0
  const start = new Date(startIso).getTime()
  if (Number.isNaN(start)) return 0
  const end = endIso ? new Date(endIso).getTime() : Date.now()
  if (Number.isNaN(end)) return 0
  return Math.max(0, end - start)
}
