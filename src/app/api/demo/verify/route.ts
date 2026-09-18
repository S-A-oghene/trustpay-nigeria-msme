import { NextRequest, NextResponse } from 'next/server'
import { appConfig } from '@/lib/config'
import { getDemoTransaction, verifyDemoPayment } from '@/lib/demo/store'
import { clientRateLimitKey, rateLimit } from '@/lib/server/rate-limit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  if (!appConfig.demoMode) {
    return NextResponse.json(
      { ok: false, error: 'Demo endpoint is disabled in production mode.' },
      { status: 404 },
    )
  }

  const token = request.nextUrl.searchParams.get('token') || ''
  const limit = rateLimit(clientRateLimitKey(request, `demo-verify:${token}`), 20, 60_000)

  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many demo verification attempts.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  const requestedMode = request.nextUrl.searchParams.get('mode') || 'success'

  if (!['success', 'mismatch', 'unknown'].includes(requestedMode)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid demo verification mode.' },
      { status: 400 },
    )
  }

  const mode = requestedMode as 'success' | 'mismatch' | 'unknown'
  const transaction = getDemoTransaction(token)

  if (!transaction) {
    return NextResponse.json(
      { ok: false, error: 'Demo transaction not found.' },
      { status: 404 },
    )
  }

  const result = verifyDemoPayment(transaction, mode)

  return NextResponse.json(
    { ok: true, demo: true, transactionId: transaction.id, ...result },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
