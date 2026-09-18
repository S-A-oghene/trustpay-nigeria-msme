type Bucket = { count: number; windowStarted: number }

const buckets = new Map<string, Bucket>()
const MAX_KEYS = 10_000

export function rateLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now()
  const current = buckets.get(key)
  if (!current || now - current.windowStarted >= windowMs) {
    if (buckets.size >= MAX_KEYS) {
      const oldestKey = buckets.keys().next().value
      if (oldestKey) buckets.delete(oldestKey)
    }
    const next = { count: 1, windowStarted: now }
    buckets.set(key, next)
    return { allowed: true, remaining: Math.max(0, limit - 1), retryAfterSeconds: 0 }
  }
  current.count += 1
  const allowed = current.count <= limit
  return { allowed, remaining: Math.max(0, limit - current.count), retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - current.windowStarted)) / 1000)) }
}

export function clientRateLimitKey(request: Request, fallback: string) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const real = request.headers.get('x-real-ip')?.trim()
  return `${fallback}:${forwarded || real || 'unknown'}`
}
