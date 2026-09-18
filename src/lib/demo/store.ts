import { buildDemoDataset } from './data'
import type { DemoDataset, Transaction, PaymentAccount } from '../domain/types'

let dataset: DemoDataset | null = null

export function demoStore() {
  if (!dataset) dataset = buildDemoDataset()
  return dataset
}

export function resetDemoStore() {
  dataset = buildDemoDataset()
  return dataset
}

export function getDemoTransaction(token: string) {
  return demoStore().transactions.find(t => t.publicToken === token)
}

export function getDemoDocument(token: string) {
  return demoStore().documents.find(d => d.publicToken === token)
}

export function getDemoAccount(accountId: string): PaymentAccount | undefined {
  return demoStore().accounts.find(a => a.id === accountId)
}

export function verifyDemoPayment(tx: Transaction, mode: 'success'|'mismatch'|'unknown' = 'success') {
  if (mode === 'mismatch') {
    tx.paymentStatus = 'PAYMENT_AMOUNT_MISMATCH'
    tx.verificationState = 'MISMATCH'
    tx.riskState = 'STEP_UP'
    return { status: tx.paymentStatus, verified: false, reason: 'Authoritative demo result exists, but amount does not match the confirmed order.' }
  }
  if (mode === 'unknown') {
    tx.paymentStatus = 'PAYMENT_UNKNOWN'
    tx.verificationState = 'UNKNOWN'
    tx.riskState = 'REVIEW'
    return { status: tx.paymentStatus, verified: false, reason: 'The simulated provider response is unavailable or inconclusive.' }
  }
  tx.paymentStatus = 'PAYMENT_VERIFIED'
  tx.verificationState = 'VERIFIED'
  tx.riskState = 'RELEASED'
  return { status: tx.paymentStatus, verified: true, reason: 'DEMO/SIMULATED — server-side provider confirmation path represented without live funds.' }
}

export function changeDemoAccount(accountId: string) {
  const account = getDemoAccount(accountId)
  if (!account) return null
  account.changedAt = new Date().toISOString()
  account.active = false
  return account
}
