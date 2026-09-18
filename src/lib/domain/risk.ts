import type { RiskEvent, RiskState, Transaction } from './types'

export interface RiskInput {
  duplicateReference: boolean
  replayedEvent: boolean
  amountMismatch: boolean
  destinationMismatch: boolean
  failedAttempts: number
  accountChangedRecently: boolean
  highValueFirstUse: boolean
  repeatedDisputes: boolean
  providerAnomaly: boolean
}

export function evaluateRisk(input: RiskInput, now = new Date().toISOString()): { state: RiskState; events: RiskEvent[] } {
  const events: RiskEvent[] = []
  const add = (code: string, severity: RiskEvent['severity'], description: string) => events.push({
    id: `risk_${events.length + 1}`,
    code, severity, description, triggeredAt: now, ruleVersion: 'risk-rules-v1', resolved: false,
  })

  if (input.amountMismatch) add('AMOUNT_MISMATCH', 'HIGH', 'Authoritative payment amount does not match the confirmed order amount.')
  if (input.destinationMismatch) add('DESTINATION_MISMATCH', 'CRITICAL', 'Authoritative payment destination does not match the bound transaction destination.')
  if (input.duplicateReference) add('DUPLICATE_REFERENCE', 'HIGH', 'The payment reference appears more than once in the same control scope.')
  if (input.replayedEvent) add('WEBHOOK_REPLAY', 'HIGH', 'A payment event appears to be replayed or already processed.')
  if (input.failedAttempts >= 3) add('VELOCITY_FAILURE', 'MEDIUM', 'Multiple failed attempts occurred within the configured review window.')
  if (input.accountChangedRecently) add('ACCOUNT_CHANGE', 'HIGH', 'The receiving account changed recently and requires step-up verification.')
  if (input.highValueFirstUse) add('HIGH_VALUE_FIRST_USE', 'MEDIUM', 'A comparatively high-value transaction is associated with first use.')
  if (input.repeatedDisputes) add('REPEATED_DISPUTES', 'MEDIUM', 'Repeated disputes are associated with the relationship.')
  if (input.providerAnomaly) add('PROVIDER_ANOMALY', 'MEDIUM', 'The payment provider returned an inconsistent or unavailable response.')

  if (events.some(e => e.severity === 'CRITICAL')) return { state: 'RESTRICTED', events }
  if (events.some(e => e.severity === 'HIGH')) return { state: 'STEP_UP', events }
  if (events.length) return { state: 'WATCH', events }
  return { state: 'CLEAR', events }
}

export function transactionRiskInput(tx: Transaction): RiskInput {
  return {
    duplicateReference: false,
    replayedEvent: false,
    amountMismatch: tx.paymentStatus === 'PAYMENT_AMOUNT_MISMATCH',
    destinationMismatch: tx.paymentStatus === 'PAYMENT_DESTINATION_MISMATCH',
    failedAttempts: 0,
    accountChangedRecently: false,
    highValueFirstUse: false,
    repeatedDisputes: tx.disputeStatus !== 'NONE',
    providerAnomaly: tx.paymentStatus === 'PAYMENT_UNKNOWN',
  }
}
