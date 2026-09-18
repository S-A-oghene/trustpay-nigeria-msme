import type { Evidence, PaymentStatus, VerificationState } from './types'

export function paymentStatusFromEvidence(evidence: Evidence): PaymentStatus {
  if (evidence.type === 'PAYMENT_SUBMISSION') return 'PAYMENT_EVIDENCE_SUBMITTED'
  if (evidence.type !== 'PAYMENT_PROVIDER') return 'PAYMENT_UNKNOWN'
  if (evidence.integrity !== 'VERIFIED' || evidence.status !== 'VERIFIED') return 'PAYMENT_UNKNOWN'
  return 'PAYMENT_PROCESSOR_CONFIRMED'
}

export function isAuthoritativePaymentEvidence(evidence: Evidence) {
  return evidence.type === 'PAYMENT_PROVIDER' && evidence.integrity === 'VERIFIED' && evidence.status === 'VERIFIED' && evidence.verificationMethod.length > 0
}

export function publicVerificationLabel(state: VerificationState) {
  const labels: Record<VerificationState,string> = {
    VERIFIED:'Verified', UNVERIFIED:'Not verified', UNKNOWN:'Unable to establish', MISMATCH:'Mismatch detected', ADDITIONAL_VERIFICATION_REQUIRED:'Additional verification required',
  }
  return labels[state]
}
