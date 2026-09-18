import type { PaymentProviderAdapter, PaymentIntentInput, ProviderVerification } from './payment'

export class DemoPaymentProvider implements PaymentProviderAdapter {
  readonly providerCode = 'DEMO_PAYMENT'
  readonly mode = 'DEMO' as const

  async initialize(input: PaymentIntentInput) {
    return { providerReference: `demo_${input.reference}`, authorizationUrl: `/demo/pay/${encodeURIComponent(input.reference)}`, expiresAt: new Date(Date.now() + 15 * 60_000).toISOString() }
  }

  async verify(reference: string): Promise<ProviderVerification> {
    const status = reference.includes('mismatch') ? 'PAYMENT_AMOUNT_MISMATCH' : reference.includes('unknown') ? 'PAYMENT_UNKNOWN' : 'PAYMENT_VERIFIED'
    return { provider: this.providerCode, reference, status, authoritative: true, amountMinor: status === 'PAYMENT_AMOUNT_MISMATCH' ? 1 : undefined, currency: 'NGN', observedAt: new Date().toISOString() }
  }

  async health() { return { healthy: true, detail: 'Deterministic simulation provider available.' } }
}
