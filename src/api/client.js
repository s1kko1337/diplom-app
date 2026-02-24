const DEFAULT_DELAY = 150
const DEFAULT_TIMEOUT = 10000

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export async function request(handler, { delay = DEFAULT_DELAY, timeout = DEFAULT_TIMEOUT } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    await sleep(delay + Math.random() * 100)
    if (controller.signal.aborted) {
      throw new ApiError(408, 'Превышено время ожидания запроса')
    }
    return await handler()
  } finally {
    clearTimeout(timer)
  }
}
