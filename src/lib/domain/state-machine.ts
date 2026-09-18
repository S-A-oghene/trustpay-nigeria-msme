import type { PaymentStatus, TransactionStatus, DocumentStatus, ObligationStatus } from './types'

export function canTransitionTransaction(from: TransactionStatus, to: TransactionStatus) {
  const map: Record<TransactionStatus, TransactionStatus[]> = {
    DRAFT: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['AWAITING_PAYMENT', 'CANCELLED'],
    AWAITING_PAYMENT: ['PAID', 'CANCELLED', 'DISPUTED'],
    PAID: ['FULFILLING', 'DISPUTED', 'CANCELLED'],
    FULFILLING: ['DELIVERED', 'DISPUTED'],
    DELIVERED: ['COMPLETE', 'DISPUTED'],
    COMPLETE: ['DISPUTED'],
    CANCELLED: [],
    DISPUTED: ['PAID', 'COMPLETE', 'CANCELLED'],
  }
  return map[from].includes(to)
}

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus) {
  const map: Record<PaymentStatus, PaymentStatus[]> = {
    PAYMENT_INTENT_CREATED: ['PAYMENT_PENDING', 'PAYMENT_EXPIRED', 'PAYMENT_UNKNOWN'],
    PAYMENT_PENDING: ['PAYMENT_EVIDENCE_SUBMITTED', 'PAYMENT_PROCESSOR_CONFIRMED', 'PAYMENT_FAILED', 'PAYMENT_EXPIRED', 'PAYMENT_UNKNOWN', 'PAYMENT_AMOUNT_MISMATCH', 'PAYMENT_DESTINATION_MISMATCH'],
    PAYMENT_EVIDENCE_SUBMITTED: ['PAYMENT_PROCESSOR_CONFIRMED', 'PAYMENT_UNKNOWN', 'PAYMENT_FAILED'],
    PAYMENT_PROCESSOR_CONFIRMED: ['PAYMENT_VERIFIED', 'PAYMENT_AMOUNT_MISMATCH', 'PAYMENT_DESTINATION_MISMATCH', 'PAYMENT_REVERSED'],
    PAYMENT_VERIFIED: ['PAYMENT_REVERSED'],
    PAYMENT_FAILED: [],
    PAYMENT_REVERSED: [],
    PAYMENT_UNKNOWN: ['PAYMENT_PROCESSOR_CONFIRMED', 'PAYMENT_VERIFIED', 'PAYMENT_FAILED'],
    PAYMENT_AMOUNT_MISMATCH: ['PAYMENT_UNKNOWN', 'PAYMENT_FAILED'],
    PAYMENT_DESTINATION_MISMATCH: ['PAYMENT_UNKNOWN', 'PAYMENT_FAILED'],
    PAYMENT_EXPIRED: [],
  }
  return map[from].includes(to)
}

export function canTransitionDocument(from: DocumentStatus, to: DocumentStatus) {
  const map: Record<DocumentStatus, DocumentStatus[]> = {
    REQUESTED: ['OPENED', 'EXPIRED', 'CANCELLED'],
    OPENED: ['UPLOADED', 'EXPIRED', 'CANCELLED'],
    UPLOADED: ['RECEIVED', 'HASHED', 'VALIDATING', 'REJECTED', 'CANCELLED'],
    RECEIVED: ['HASHED', 'VALIDATING', 'REJECTED'],
    HASHED: ['VALIDATING', 'VALIDATED', 'REJECTED'],
    VALIDATING: ['VALIDATED', 'REJECTED'],
    VALIDATED: ['VERIFIED', 'REJECTED'],
    VERIFIED: ['ACCEPTED', 'REJECTED'],
    ACCEPTED: [],
    REJECTED: ['UPLOADED', 'CANCELLED'],
    EXPIRED: [],
    CANCELLED: [],
  }
  return map[from].includes(to)
}

export function obligationStatus(dueAt?: string, expiryAt?: string, now = new Date()) : ObligationStatus {
  const target = expiryAt || dueAt
  if (!target) return 'UNKNOWN'
  const ms = new Date(target).getTime() - now.getTime()
  if (ms < 0) return 'OVERDUE'
  const days = ms / 86400000
  if (days <= 7) return 'DUE_SOON'
  if (days <= 30) return 'UPCOMING'
  return 'CURRENT'
}
