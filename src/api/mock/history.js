export function generateHistory(baseValue, variance, from, to, intervalMinutes = 5) {
  const start = new Date(from).getTime()
  const end = new Date(to).getTime()
  const step = intervalMinutes * 60 * 1000
  const result = []

  let current = baseValue
  for (let t = start; t <= end; t += step) {
    const drift = (Math.random() - 0.5) * variance
    current = current + drift * 0.3
    current = Math.max(baseValue - variance, Math.min(baseValue + variance, current))

    result.push({
      timestamp: new Date(t).toISOString(),
      value: +current.toFixed(2),
    })
  }

  return result
}

export function getSensorHistory(equipmentId, sensorId, from, to, intervalMinutes = 5) {
  const sensorBaseValues = {
    'temp-engine': { base: 80, variance: 15 },
    speed: { base: 2200, variance: 300 },
    depth: { base: 45, variance: 10 },
    pressure: { base: 120, variance: 20 },
    vibration: { base: 0.8, variance: 0.5 },
    power: { base: 85, variance: 15 },
    torque: { base: 340, variance: 60 },
    'fuel-rate': { base: 18, variance: 5 },
    'tool-wear': { base: 55, variance: 10 },
    'oil-level': { base: 90, variance: 8 },
    'oil-temp': { base: 55, variance: 12 },
    'engine-load': { base: 84, variance: 12 },
  }

  const config = sensorBaseValues[sensorId] || { base: 50, variance: 10 }
  return generateHistory(config.base, config.variance, from, to, intervalMinutes)
}
