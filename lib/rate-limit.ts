type RateLimitStore = Map<string, number>

declare global {
  // eslint-disable-next-line no-var
  var __multisportActionRateLimit__: RateLimitStore | undefined
}

const store: RateLimitStore = globalThis.__multisportActionRateLimit__ ?? new Map<string, number>()
if (!globalThis.__multisportActionRateLimit__) {
  globalThis.__multisportActionRateLimit__ = store
}

export function checkRateLimit(key: string, minIntervalMs: number) {
  const now = Date.now()
  const last = store.get(key) ?? 0
  const elapsed = now - last

  if (elapsed < minIntervalMs) {
    return { allowed: false, retryAfterMs: minIntervalMs - elapsed }
  }

  store.set(key, now)

  setTimeout(() => {
    const current = store.get(key)
    if (current && current <= now) {
      store.delete(key)
    }
  }, minIntervalMs).unref?.()

  return { allowed: true, retryAfterMs: 0 }
}

