import { describe, expect, it } from 'vitest'
import {
  compatibilityFromOrder,
  createInitialTerms,
  hashTerms,
  isObligationCompatible,
  versionTerms,
} from '@/lib/domain/commercial-transactions'

const now = '2026-09-21T00:00:00.000Z'

describe('TrustPay R2 commercial transaction domain', () => {
  it('creates deterministic immutable hashes for initial terms', async () => {
    const terms = await createInitialTerms({
      productDescription: '25 cartons of packaging',
      amountMinor: 250000,
      currency: 'NGN',
      paymentDestinationId: 'acct-1',
      effectiveAt: now,
    })

    expect(terms.version).toBe(1)
    expect(terms.immutableHash).toBe(await hashTerms(terms))
  })

  it('increments term versions and changes the hash when a material term changes', async () => {
    const first = await createInitialTerms({
      productDescription: '25 cartons of packaging',
      amountMinor: 250000,
      currency: 'NGN',
      effectiveAt: now,
    })
    const next = await versionTerms(first, { amountMinor: 300000, changedReason: 'Buyer-approved quantity change' })

    expect(next.version).toBe(2)
    expect(next.amountMinor).toBe(300000)
    expect(next.immutableHash).not.toBe(first.immutableHash)
  })

  it('maps a V1 order into a generalized transaction without inventing a new reference', () => {
    const result = compatibilityFromOrder({
      id: 'order-1',
      tenantId: 'tenant-1',
      publicToken: 'trust-1',
      orderReference: 'ORD-1001',
      status: 'CONFIRMED',
      sellerPersonId: 'seller-1',
      buyerPersonId: 'buyer-1',
      tradingIdentityId: 'identity-1',
      currentVersion: 3,
      expiresAt: now,
      createdAt: now,
    })

    expect(result.transactionReference).toBe('ORD-1001')
    expect(result.sourceOrderId).toBe('order-1')
    expect(result.currentTermsVersion).toBe(3)
    expect(result.transactionType).toBe('BUY_SELL')
  })

  it('keeps money and non-money obligations explicit', () => {
    expect(isObligationCompatible('NON_MONEY')).toBe(true)
    expect(isObligationCompatible('MONEY', 1000, 'NGN')).toBe(true)
    expect(isObligationCompatible('MONEY')).toBe(false)
    expect(isObligationCompatible('NON_MONEY', 1000, 'NGN')).toBe(false)
  })
})
