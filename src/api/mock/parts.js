const partsDb = {
  'БУР-12': [
    {
      id: 'P-001',
      date: '2026-02-10',
      partName: 'Фильтр масляный',
      partNumber: 'FM-250-01',
      isOriginal: true,
      replacedBy: 'Иванов А.С.',
    },
    {
      id: 'P-002',
      date: '2026-01-28',
      partName: 'Долото буровое Ø250',
      partNumber: 'DB-250-03',
      isOriginal: true,
      replacedBy: 'Петров В.И.',
    },
    {
      id: 'P-003',
      date: '2025-12-20',
      partName: 'Ремень привода',
      partNumber: 'RP-132-02',
      isOriginal: false,
      replacedBy: 'Сидоров К.М.',
    },
  ],
  'БУР-08': [
    {
      id: 'P-004',
      date: '2025-12-10',
      partName: 'Фильтр воздушный',
      partNumber: 'FV-250-01',
      isOriginal: true,
      replacedBy: 'Иванов А.С.',
    },
  ],
  'БУР-03': [
    {
      id: 'P-005',
      date: '2026-01-10',
      partName: 'Долото буровое Ø320',
      partNumber: 'DB-320-01',
      isOriginal: true,
      replacedBy: 'Козлов Д.А.',
    },
    {
      id: 'P-006',
      date: '2025-11-15',
      partName: 'Подшипник шпинделя',
      partNumber: 'PS-320-02',
      isOriginal: false,
      replacedBy: 'Петров В.И.',
    },
  ],
  'БУР-05': [
    {
      id: 'P-007',
      date: '2026-02-15',
      partName: 'Гидронасос',
      partNumber: 'GN-1200-01',
      isOriginal: true,
      replacedBy: 'Козлов Д.А.',
    },
    {
      id: 'P-008',
      date: '2026-01-22',
      partName: 'Уплотнительное кольцо',
      partNumber: 'UK-1200-05',
      isOriginal: false,
      replacedBy: 'Сидоров К.М.',
    },
  ],
  'БУР-19': [
    {
      id: 'P-009',
      date: '2026-01-27',
      partName: 'Долото буровое Ø320',
      partNumber: 'DB-320-01',
      isOriginal: true,
      replacedBy: 'Иванов А.С.',
    },
  ],
}

export function getReplacements(equipmentId) {
  return partsDb[equipmentId] || []
}
