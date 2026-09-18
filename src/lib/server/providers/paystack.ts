import crypto from 'node:crypto'
import type { PaymentProviderAdapter, PaymentIntentInput, ProviderVerification } from './payment'

interface PaystackResponse<T> { status: boolean; message: string; data: T }
interface PaystackTransaction { id: number; status: string; reference: string; amount: number; currency: string; channel?: string; paid_at?: string; metadata?: unknown; authorization?: { account_name?: string | null } }

export class PaystackPaymentProvider implements PaymentProviderAdapter {
  readonly providerCode = 'PAYSTACK'
  readonly mode = 'LIVE' as const
  private get secret() {
    return process.env.PAYSTACK_SECRET_KEY || ''
  }

  async initialize(input: PaymentIntentInput) {
    if (!this.secret) throw new Error('PAYSTACK_SECRET_KEY is not configured.')
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: input.customerEmail || 'buyer@example.invalid', amount: input.amountMinor, currency: input.currency, reference: input.reference, callback_url: input.callbackUrl, metadata: input.metadata }),
    })
    if (!response.ok) throw new Error(`Paystack initialize failed with HTTP ${response.status}`)
    const json = await response.json() as PaystackResponse<{ authorization_url: string; access_code: string; reference: string }>
    if (!json.status) throw new Error(json.message || 'Paystack initialization failed')
    return { authorizationUrl: json.data.authorization_url, providerReference: json.data.reference }
  }

  async verify(reference: string): Promise<ProviderVerification> {
    if (!this.secret) throw new Error('PAYSTACK_SECRET_KEY is not configured.')
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${this.secret}` }, cache: 'no-store' })
    if (!response.ok) throw new Error(`Paystack verify failed with HTTP ${response.status}`)
    const json = await response.json() as PaystackResponse<PaystackTransaction>
    const status = json.data.status
    const normalized = status === 'success' ? 'PAYMENT_VERIFIED' : status === 'reversed' ? 'PAYMENT_REVERSED' : status === 'failed' ? 'PAYMENT_FAILED' : 'PAYMENT_PENDING'
    return { provider: this.providerCode, reference: json.data.reference, status: normalized, authoritative: true, amountMinor: json.data.amount, currency: json.data.currency, observedAt: json.data.paid_at || new Date().toISOString(), providerRaw: json.data }
  }

  verifyWebhookSignature(rawBody: string, signature: string | null) {
    const secret = this.secret
    if (!secret || !signature) return false
    const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
    try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature)) } catch { return false }
  }

  async health() {
    if (!this.secret) return { healthy: false, detail: 'Credential not configured.' }
    return { healthy: true, detail: 'Credential is configured; runtime availability must still be monitored.' }
  }
}
