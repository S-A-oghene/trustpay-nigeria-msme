import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { PaystackPaymentProvider } from '@/lib/server/providers/paystack'
import { createAdminClient } from '@/lib/supabase/admin'
import { reconcilePayment } from '@/lib/domain/reconciliation'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const raw = await request.text()
  const signature = request.headers.get('x-paystack-signature')
  const provider = new PaystackPaymentProvider()
  if (!provider.verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ ok: false, error: 'Invalid webhook signature.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 })
  }

  const payload = body as { event?: unknown; data?: { id?: unknown; reference?: unknown; amount?: unknown; currency?: unknown } }
  const reference = String(payload.data?.reference || '')
  const providerEventId = String(payload.data?.id || '') || crypto.createHash('sha256').update(raw).digest('hex')
  const eventType = String(payload.event || 'UNKNOWN')
  if (!reference) return NextResponse.json({ ok: false, error: 'Provider reference missing.' }, { status: 400 })

  // A signed provider event is not itself final business truth. Re-query provider state before verification.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: true, accepted: true, verified: false, reason: 'Signed provider event received, but production persistence is not configured.' })
  }

  try {
    const supabase = createAdminClient()
    const { data: intent, error: intentError } = await supabase
      .from('payment_intents')
      .select('id,tenant_id,order_id,amount_minor,currency,status')
      .eq('provider_reference', reference)
      .single()

    if (intentError || !intent) {
      return NextResponse.json({ ok: true, accepted: true, verified: false, reason: 'No bound TrustPay payment intent for provider reference; no state change made.' })
    }

    const payloadHash = crypto.createHash('sha256').update(raw).digest('hex')
    const inserted = await supabase.from('payment_events').insert({
      tenant_id: intent.tenant_id,
      payment_intent_id: intent.id,
      provider: 'PAYSTACK',
      provider_event_id: providerEventId,
      event_type: eventType,
      observed_at: new Date().toISOString(),
      payload_hash: payloadHash,
      signature_valid: true,
      amount_minor: typeof payload.data?.amount === 'number' ? payload.data.amount : null,
      currency: typeof payload.data?.currency === 'string' ? payload.data.currency : null,
      destination_ref: null,
      raw_payload: body,
    })

    if (inserted.error && !inserted.error.message.toLowerCase().includes('duplicate')) {
      return NextResponse.json({ ok: false, error: 'Provider event could not be recorded.' }, { status: 500 })
    }
    if (inserted.error && inserted.error.message.toLowerCase().includes('duplicate')) {
      return NextResponse.json({ ok: true, accepted: true, idempotent: true, verified: false })
    }

    const providerResult = await provider.verify(reference)
    const reconciliation = reconcilePayment({
      expectedAmountMinor: Number(intent.amount_minor),
      expectedCurrency: intent.currency,
      provider: providerResult,
    })

    await supabase.from('payment_intents').update({ status: reconciliation.status }).eq('id', intent.id)

    const orderUpdate: Record<string, string> = {
      verification_state: reconciliation.verificationState,
      payment_status: reconciliation.status,
    }
    if (reconciliation.status === 'PAYMENT_VERIFIED') orderUpdate.status = 'PAID'
    if (reconciliation.status === 'PAYMENT_AMOUNT_MISMATCH' || reconciliation.status === 'PAYMENT_DESTINATION_MISMATCH') orderUpdate.risk_state = 'STEP_UP'

    await supabase.from('orders').update(orderUpdate).eq('id', intent.order_id)
    await supabase.from('audit_events').insert({
      tenant_id: intent.tenant_id,
      action: 'PAYMENT_RECONCILED',
      resource: intent.order_id,
      timestamp: new Date().toISOString(),
      correlation_id: request.headers.get('x-correlation-id') || crypto.randomUUID(),
      previous_state: intent.status,
      resulting_state: reconciliation.status,
      evidence_ids: [],
      outcome: 'SUCCESS',
      approval_status: 'NOT_REQUIRED',
      payload_hash: payloadHash,
    })

    return NextResponse.json({ ok: true, accepted: true, verified: reconciliation.status === 'PAYMENT_VERIFIED', status: reconciliation.status, reason: reconciliation.reason })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Webhook reconciliation failed; state was not promoted.' }, { status: 500 })
  }
}
