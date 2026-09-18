import type { PaymentStatus, VerificationState } from './types'
import type { NormalizedPaymentObservation } from './types'

export function reconcilePayment(input:{expectedAmountMinor:number;expectedCurrency:string;provider:NormalizedPaymentObservation}): {status:PaymentStatus;verificationState:VerificationState;reason:string} {
  if (input.provider.status === 'PAYMENT_REVERSED') return {status:'PAYMENT_REVERSED',verificationState:'UNVERIFIED',reason:'Provider reports the transaction as reversed.'}
  if (input.provider.status !== 'PAYMENT_VERIFIED' && input.provider.status !== 'PAYMENT_PROCESSOR_CONFIRMED') return {status:input.provider.status,verificationState:'UNKNOWN',reason:'Provider response is not a successful authoritative confirmation.'}
  if (!input.provider.authoritative) return {status:'PAYMENT_UNKNOWN',verificationState:'UNKNOWN',reason:'Provider result is not authoritative.'}
  if (input.provider.amountMinor !== input.expectedAmountMinor) return {status:'PAYMENT_AMOUNT_MISMATCH',verificationState:'MISMATCH',reason:'Provider amount does not match the confirmed order amount.'}
  if ((input.provider.currency || '').toUpperCase() !== input.expectedCurrency.toUpperCase()) return {status:'PAYMENT_AMOUNT_MISMATCH',verificationState:'MISMATCH',reason:'Provider currency does not match the confirmed order currency.'}
  return {status:'PAYMENT_VERIFIED',verificationState:'VERIFIED',reason:'Provider reported success and the amount/currency match the TrustPay order.'}
}
