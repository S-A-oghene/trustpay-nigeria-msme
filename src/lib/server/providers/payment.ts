import type { NormalizedPaymentObservation } from '@/lib/domain/types'

export interface PaymentIntentInput {
  reference: string
  amountMinor: number
  currency: string
  customerEmail?: string
  callbackUrl?: string
  metadata?: Record<string, string>
}

export type ProviderVerification = NormalizedPaymentObservation

export interface PaymentProviderAdapter {
  readonly providerCode: string
  readonly mode: 'DEMO' | 'LIVE'
  initialize(
    input: PaymentIntentInput,
  ): Promise<{
    authorizationUrl?: string
    providerReference: string
    expiresAt?: string
  }>
  verify(reference: string): Promise<ProviderVerification>
  health(): Promise<{ healthy: boolean; detail: string }>
}
