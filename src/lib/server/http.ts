import { NextRequest } from 'next/server'

export function requestCorrelationId(request: NextRequest) {
  return request.headers.get('x-correlation-id') || cryptoRandomUuid()
}

function cryptoRandomUuid() {
  return globalThis.crypto.randomUUID()
}

export function jsonError(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status, headers: { 'Cache-Control': 'no-store' } })
}

export function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (!origin) return null
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  const host = request.headers.get('host')
  if (configured && origin === configured) return null
  if (host) {
    try {
      const expected = `${request.nextUrl.protocol}//${host}`
      if (origin === expected) return null
    } catch { /* invalid host/origin is rejected below */ }
  }
  return jsonError('Cross-site request rejected.', 403)
}
