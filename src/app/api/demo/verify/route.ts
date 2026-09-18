import { NextRequest, NextResponse } from 'next/server'
import { getDemoTransaction, verifyDemoPayment } from '@/lib/demo/store'
import { rateLimit, clientRateLimitKey } from '@/lib/server/rate-limit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || ''
  const limit = rateLimit(clientRateLimitKey(request, `demo-verify:${token}`), 20, 60_000)
  if (!limit.allowed) return NextResponse.json({ ok: false, error: 'Too many demo verification attempts.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })
  const mode = (request.nextUrl.searchParams.get('mode') || 'success') as 'success' | 'mismatch' | 'unknown'
  const tx = getDemoTransaction(token)
  if (!tx) return NextResponse.json({ ok: false, error: 'Demo transaction not found.' }, { status: 404 })
  const result = verifyDemoPayment(tx, mode)
  return NextResponse.json({ ok: true, demo: true, transactionId: tx.id, ...result })
}
