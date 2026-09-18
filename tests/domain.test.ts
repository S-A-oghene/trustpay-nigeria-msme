import { describe, expect, it } from 'vitest'
import { canTransitionPayment, canTransitionTransaction, obligationStatus } from '@/lib/domain/state-machine'
import { evaluateRisk } from '@/lib/domain/risk'
import { authorizeHighImpact } from '@/lib/domain/governance'
import { createAccountChangeEvent } from '@/lib/domain/account-shield'
import { reconcilePayment } from '@/lib/domain/reconciliation'

const now='2026-09-18T00:00:00.000Z'

describe('TrustPay deterministic domain',()=>{
  it('rejects direct screenshot-to-verified payment transitions',()=>{
    expect(canTransitionPayment('PAYMENT_EVIDENCE_SUBMITTED','PAYMENT_VERIFIED')).toBe(false)
    expect(canTransitionPayment('PAYMENT_PROCESSOR_CONFIRMED','PAYMENT_VERIFIED')).toBe(true)
  })
  it('keeps transaction state ordered',()=>{
    expect(canTransitionTransaction('DRAFT','CONFIRMED')).toBe(true)
    expect(canTransitionTransaction('DRAFT','COMPLETE')).toBe(false)
  })
  it('returns UNKNOWN when an obligation has no meaningful date',()=>{
    expect(obligationStatus(undefined,undefined,new Date(now))).toBe('UNKNOWN')
  })
  it('moves high-impact mismatches to step-up or restriction',()=>{
    const result=evaluateRisk({duplicateReference:false,replayedEvent:true,amountMismatch:true,destinationMismatch:false,failedAttempts:0,accountChangedRecently:true,highValueFirstUse:false,repeatedDisputes:false,providerAnomaly:false},now)
    expect(result.state).toBe('STEP_UP')
    expect(result.events.map(e=>e.code)).toContain('AMOUNT_MISMATCH')
  })
  it('requires all four authorization gates',()=>{
    expect(authorizeHighImpact({identity:true,authority:true,policy:true,evidence:false,riskClass:'R4'}).allowed).toBe(false)
    expect(authorizeHighImpact({identity:true,authority:true,policy:true,evidence:true,riskClass:'R4'}).allowed).toBe(true)
  })
  it('reconciles only authoritative provider success with matching terms',()=>{
    const verified=reconcilePayment({expectedAmountMinor:250000,expectedCurrency:'NGN',provider:{provider:'DEMO',reference:'demo-ok',status:'PAYMENT_VERIFIED',authoritative:true,amountMinor:250000,currency:'NGN',observedAt:now}})
    expect(verified.status).toBe('PAYMENT_VERIFIED')
    const mismatch=reconcilePayment({expectedAmountMinor:250000,expectedCurrency:'NGN',provider:{provider:'DEMO',reference:'demo-mismatch',status:'PAYMENT_VERIFIED',authoritative:true,amountMinor:1,currency:'NGN',observedAt:now}})
    expect(mismatch.status).toBe('PAYMENT_AMOUNT_MISMATCH')
    const screenshotOnly=reconcilePayment({expectedAmountMinor:250000,expectedCurrency:'NGN',provider:{provider:'DEMO',reference:'screenshot',status:'PAYMENT_PROCESSOR_CONFIRMED',authoritative:false,amountMinor:250000,currency:'NGN',observedAt:now}})
    expect(screenshotOnly.status).toBe('PAYMENT_UNKNOWN')
  })
  it('Account Change Shield creates a pending step-up event',()=>{
    const ev=createAccountChangeEvent({oldDestination:'acct-old',newDestination:'acct-new',initiator:'merchant'})
    expect(ev.approvalState).toBe('PENDING'); expect(ev.outcome).toBe('STEP_UP_REQUIRED'); expect(ev.verificationState).toBe('ADDITIONAL_VERIFICATION_REQUIRED')
  })
})
