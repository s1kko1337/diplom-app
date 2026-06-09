const ID_PREFIX = 'БУР'
const ID_RE = /^БУР-(\d+)$/

/**
 * Возвращает следующий свободный идентификатор станка вида «БУР-NN».
 * Берёт максимальный числовой суффикс среди существующих id и прибавляет 1.
 * @param {string[]} ids существующие идентификаторы
 */
export function nextEquipmentId(ids = []) {
  let max = 0
  for (const id of ids) {
    const m = ID_RE.exec(id)
    if (m) {
      const n = Number(m[1])
      if (n > max) max = n
    }
  }
  return `${ID_PREFIX}-${String(max + 1).padStart(2, '0')}`
}
