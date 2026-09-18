import { NextRequest, NextResponse } from 'next/server'
import { requireUserApi } from '@/lib/auth'
import { paymentProvider } from '@/lib/server/providers/registry'
import { requestCorrelationId, requireSameOrigin } from '@/lib/server/http'
import { rateLimit } from '@/lib/server/rate-limit'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type PaymentIntentBody = {
  reference?: string
  orderId?: string
  amountMinor?: number
  currency?: string
  customerEmail?: string
  callbackUrl?: string
  metadata?: Record<string, string>
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as null | PaymentIntentBody
  const amountMinor = typeof body?.amountMinor === 'number' ? body.amountMinor : NaN
  const currency = typeof body?.currency === 'string' ? body.currency.toUpperCase() : ''

  if (!body?.reference || !body.orderId || !Number.isInteger(amountMinor) || amountMinor <= 0 || !currency) {
    return NextResponse.json(
      { ok: false, error: 'reference, orderId, positive integer amountMinor and currency are required.' },
      { status: 400 },
    )
  }

  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'false') {
    return NextResponse.json({
      ok: true,
      demo: true,
      provider: 'DEMO_PAYMENT',
      status: 'PAYMENT_PENDING',
      providerReference: `demo_${body.reference}`,
      correlationId: requestCorrelationId(request),
    })
  }

  const auth = await requireUserApi()
  if (auth.response) return auth.response
  const originError = requireSameOrigin(request)
  if (originError) return originError

  try {
    const userId = String(auth.claims?.sub || '')
    const limit = rateLimit(`payment-intent:${userId}`, 20, 60_000)
    if (!limit.allowed) return NextResponse.json({ ok:false, error:'Too many payment-intent attempts. Please retry later.' }, { status:429, headers:{'Retry-After':String(limit.retryAfterSeconds)} })
    const supabase = await createClient()
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['owner', 'manager', 'staff', 'admin'])
      .limit(1)
      .maybeSingle()
    if (membershipError || !membership) {
      return NextResponse.json({ ok: false, error: 'The authenticated user is not authorized to create payment intents.' }, { status: 403 })
    }
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id,tenant_id,current_version,status,payment_status,payment_destination_id')
      .eq('id', body.orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ ok: false, error: 'Order not found or not accessible to the authenticated user.' }, { status: 404 })
    }

    const { data: version, error: versionError } = await supabase
      .from('order_versions')
      .select('order_id,version,amount_minor,currency,payment_destination_id,confirmed_at')
      .eq('order_id', body.orderId)
      .eq('version', order.current_version)
      .single()

    if (versionError || !version || !version.confirmed_at) {
      return NextResponse.json({ ok: false, error: 'Order terms must be confirmed before payment initialization.' }, { status: 409 })
    }

    if (Number(version.amount_minor) !== amountMinor || String(version.currency).toUpperCase() !== currency) {
      return NextResponse.json({ ok: false, error: 'Payment amount/currency does not match the confirmed order terms.' }, { status: 409 })
    }

    const { data: existingIntent, error: existingError } = await supabase
      .from('payment_intents')
      .select('id,provider,provider_reference,status,expires_at')
      .eq('idempotency_key', body.reference)
      .single()

    if (!existingError && existingIntent) {
      return NextResponse.json({
        ok: true,
        demo: false,
        idempotent: true,
        provider: existingIntent.provider,
        providerReference: existingIntent.provider_reference,
        status: existingIntent.status,
        expiresAt: existingIntent.expires_at,
        correlationId: requestCorrelationId(request),
      })
    }

    const provider = paymentProvider()
    const result = await provider.initialize({
      reference: body.reference,
      amountMinor,
      currency,
      customerEmail: body.customerEmail,
      callbackUrl: body.callbackUrl,
      metadata: { ...(body.metadata || {}), trustpay_order_id: body.orderId },
    })

    const { error: insertError } = await supabase.from('payment_intents').insert({
      tenant_id: order.tenant_id,
      order_id: order.id,
      provider: provider.providerCode,
      provider_reference: result.providerReference,
      amount_minor: amountMinor,
      currency,
      status: 'PAYMENT_PENDING',
      idempotency_key: body.reference,
      expires_at: result.expiresAt || null,
    })

    if (insertError) {
      return NextResponse.json({ ok: false, error: 'Payment intent could not be persisted; no TrustPay payment state was promoted.', correlationId: requestCorrelationId(request) }, { status: 500 })
    }

    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({ payment_status: 'PAYMENT_PENDING' })
      .eq('id', order.id)

    if (orderUpdateError) {
      return NextResponse.json({ ok: false, error: 'Payment intent was persisted but order state could not be updated; manual reconciliation is required.', correlationId: requestCorrelationId(request) }, { status: 500 })
    }

    return NextResponse.json({ ok: true, demo: false, provider: provider.providerCode, ...result, status: 'PAYMENT_PENDING', correlationId: requestCorrelationId(request) })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Payment provider initialization failed.', correlationId: requestCorrelationId(request) }, { status: 502 })
  }
}
