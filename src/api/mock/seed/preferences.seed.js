export function createSeed() {
  return {
    display: {
      language: 'ru',
      refreshRate: 5,
      autoUpdate: true,
      showTimestamps: false,
      compactMode: false,
    },
    notifications: {
      criticalAlerts: true,
      warnings: true,
      infoMessages: false,
      emailNotifications: true,
      email: '',
    },
    thresholds: {
      maxTemp: 95,
      maxVibration: 1.5,
      maxPower: 95,
      toolWear: 70,
      minFuel: 25,
      maxPressure: 150,
    },
    security: {
      twoFactor: true,
    },
    theme: 'dark',
  }
}
