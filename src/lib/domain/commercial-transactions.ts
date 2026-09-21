import type { TransactionStatus } from './types'

export type CommercialTransactionType =
  | 'BUY_SELL'
  | 'SERVICE'
  | 'B2B_PURCHASE'
  | 'B2B_RECEIVABLE'
  | 'RECURRING'
  | 'CLAIM'
  | 'REFUND'
  | 'CONTRIBUTION'
  | 'OTHER'

export type AgreementStatus = 'DRAFT' | 'ACTIVE' | 'SUPERSEDED' | 'CANCELLED' | 'EXPIRED'
export type TransactionPartyRole = 'SELLER' | 'BUYER' | 'OTHER'
export type ObligationKind = 'MONEY' | 'NON_MONEY'

export interface CommercialTransactionTerms {
  version: number
  productDescription: string
  amountMinor: number
  currency: string
  paymentDestinationId?: string
  effectiveAt: string
  changedReason?: string
  immutableHash: string
}

export interface CommercialTransactionRecord {
  id: string
  tenantId: string
  publicToken: string
  transactionReference: string
  transactionType: CommercialTransactionType
  status: TransactionStatus
  sellerPersonId?: string
  buyerPersonId?: string
  tradingIdentityId?: string
  agreementId?: string
  sourceOrderId?: string
  currentTermsVersion: number
  expiresAt: string
  createdAt: string
}

export interface V1OrderCompatibilitySource {
  id: string
  tenantId: string
  publicToken: string
  orderReference: string
  status: TransactionStatus
  sellerPersonId?: string
  buyerPersonId?: string
  tradingIdentityId?: string
  currentVersion: number
  expiresAt: string
  createdAt: string
}

export function canonicalTermsValue(input: Omit<CommercialTransactionTerms, 'immutableHash'>): string {
  return [
    input.version,
    input.productDescription.trim(),
    input.amountMinor,
    input.currency.trim().toUpperCase(),
    input.paymentDestinationId ?? '',
    input.effectiveAt,
    input.changedReason?.trim() ?? '',
  ].join('|')
}

export async function hashTerms(input: Omit<CommercialTransactionTerms, 'immutableHash'>): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalTermsValue(input))
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('')
}

export async function createInitialTerms(input: Omit<CommercialTransactionTerms, 'version' | 'immutableHash'>): Promise<CommercialTransactionTerms> {
  const versioned = { ...input, version: 1 }
  return { ...versioned, immutableHash: await hashTerms(versioned) }
}

export async function versionTerms(
  current: CommercialTransactionTerms,
  patch: Partial<Pick<CommercialTransactionTerms, 'productDescription' | 'amountMinor' | 'currency' | 'paymentDestinationId' | 'effectiveAt' | 'changedReason'>>,
): Promise<CommercialTransactionTerms> {
  const next = {
    version: current.version + 1,
    productDescription: patch.productDescription ?? current.productDescription,
    amountMinor: patch.amountMinor ?? current.amountMinor,
    currency: patch.currency ?? current.currency,
    paymentDestinationId: patch.paymentDestinationId ?? current.paymentDestinationId,
    effectiveAt: patch.effectiveAt ?? current.effectiveAt,
    changedReason: patch.changedReason,
  }
  return { ...next, immutableHash: await hashTerms(next) }
}

export function compatibilityFromOrder(order: V1OrderCompatibilitySource): CommercialTransactionRecord {
  return {
    id: order.id,
    tenantId: order.tenantId,
    publicToken: order.publicToken,
    transactionReference: order.orderReference,
    transactionType: 'BUY_SELL',
    status: order.status,
    sellerPersonId: order.sellerPersonId,
    buyerPersonId: order.buyerPersonId,
    tradingIdentityId: order.tradingIdentityId,
    sourceOrderId: order.id,
    currentTermsVersion: order.currentVersion,
    expiresAt: order.expiresAt,
    createdAt: order.createdAt,
  }
}

export function isObligationCompatible(kind: ObligationKind, amountMinor?: number, currency?: string): boolean {
  if (kind === 'NON_MONEY') return amountMinor === undefined && currency === undefined
  return Number.isInteger(amountMinor) && Number(amountMinor) > 0 && typeof currency === 'string' && currency.trim().length === 3
}
