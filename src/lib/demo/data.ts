import type { DemoDataset } from '../domain/types'

const now = new Date('2026-09-18T07:00:00.000Z')
const d = (days: number) => new Date(now.getTime() + days * 86400000).toISOString()

export function buildDemoDataset(): DemoDataset {
  const people = [
    { id: 'p_merchant_1', displayName: 'Aisha Bello', contact: '0803 *** 1122', identityState: 'VERIFIED' as const },
    { id: 'p_merchant_2', displayName: 'Tunde Adeyemi', contact: '0805 *** 3344', identityState: 'VERIFIED' as const },
    { id: 'p_buyer_1', displayName: 'Chinedu Okafor', contact: '0814 *** 5566', identityState: 'VERIFIED' as const },
    { id: 'p_buyer_2', displayName: 'Mary Eze', contact: '0902 *** 7788', identityState: 'UNKNOWN' as const },
  ]
  const tradingIdentities = [
    { id: 'ti_1', personId: 'p_merchant_1', displayName: 'Aisha Bello Fashion', type: 'INDIVIDUAL_TRADER' as const, registrationState: 'UNKNOWN' as const },
    { id: 'ti_2', personId: 'p_merchant_2', displayName: 'Adeyemi Foods & Supplies Ltd', type: 'COMPANY' as const, registrationState: 'VERIFIED' as const },
  ]
  const accounts = [
    { id: 'acct_1', tradingIdentityId: 'ti_1', bankName: 'Demo Bank', maskedAccount: '•••• 4412', holderName: 'Aisha Bello', holderRelationship: 'SELF' as const, verificationState: 'VERIFIED' as const, isPersonalAccount: true, active: true },
    { id: 'acct_2', tradingIdentityId: 'ti_2', bankName: 'Demo Bank', maskedAccount: '•••• 9021', holderName: 'Adeyemi Foods & Supplies Ltd', holderRelationship: 'SELF' as const, verificationState: 'VERIFIED' as const, isPersonalAccount: false, active: true },
  ]
  const evidence = [
    { id: 'ev_id_1', type: 'IDENTITY' as const, sourceSystem: 'DEMO_IDENTITY', capturedAt: d(-40), observedAt: d(-40), verificationMethod: 'SIMULATED_PROVIDER_RESULT', verifier: 'DEMO', integrity: 'VERIFIED' as const, retentionClass: 'PUBLIC' as const, linkedEntityId: 'p_merchant_1', claim: 'Identity verification result returned for Aisha Bello.', status: 'VERIFIED' as const },
    { id: 'ev_reg_2', type: 'REGISTRY' as const, sourceSystem: 'DEMO_CAC', sourceReference: 'DEMO-CAC-002', capturedAt: d(-20), observedAt: d(-20), verificationMethod: 'SIMULATED_REGISTRY_RESULT', verifier: 'DEMO', integrity: 'VERIFIED' as const, retentionClass: 'PUBLIC' as const, linkedEntityId: 'ti_2', claim: 'Registration evidence returned for Adeyemi Foods & Supplies Ltd.', status: 'VERIFIED' as const },
    { id: 'ev_pay_1', type: 'PAYMENT_PROVIDER' as const, sourceSystem: 'DEMO_PAYMENT_PROVIDER', sourceReference: 'demo_ref_1001', capturedAt: d(-1), observedAt: d(-1), verificationMethod: 'SIMULATED_SERVER_CONFIRMATION', verifier: 'DEMO', integrity: 'VERIFIED' as const, retentionClass: 'INTERNAL' as const, linkedTransactionId: 'tx_1', claim: 'Simulated processor confirmation for transaction tx_1.', status: 'VERIFIED' as const },
  ]
  const transactions = [
    { id: 'tx_1', publicToken: 'trust-demo-1001', sellerPersonId: 'p_merchant_1', buyerPersonId: 'p_buyer_1', tradingIdentityId: 'ti_1', orderReference: 'TP-DEMO-1001', versions: [{ version: 1, productDescription: '12-piece fashion set', amountMinor: 850000, currency: 'NGN', paymentDestination: 'acct_1', confirmedAt: d(-1) }], createdAt: d(-1), expiresAt: d(1), status: 'COMPLETE' as const, paymentStatus: 'PAYMENT_VERIFIED' as const, fulfilmentStatus: 'ACKNOWLEDGED' as const, disputeStatus: 'RESOLVED' as const, riskState: 'RELEASED' as const, verificationState: 'VERIFIED' as const, evidenceIds: ['ev_id_1', 'ev_pay_1'], providerReference: 'demo_ref_1001', paymentDestination: 'acct_1' },
    { id: 'tx_2', publicToken: 'trust-demo-1002', sellerPersonId: 'p_merchant_2', buyerPersonId: 'p_buyer_2', tradingIdentityId: 'ti_2', orderReference: 'TP-DEMO-1002', versions: [{ version: 1, productDescription: 'Wholesale food supply', amountMinor: 2450000, currency: 'NGN', paymentDestination: 'acct_2', confirmedAt: d(-2) }], createdAt: d(-2), expiresAt: d(2), status: 'AWAITING_PAYMENT' as const, paymentStatus: 'PAYMENT_PENDING' as const, fulfilmentStatus: 'NOT_STARTED' as const, disputeStatus: 'NONE' as const, riskState: 'CLEAR' as const, verificationState: 'VERIFIED' as const, evidenceIds: ['ev_reg_2'], providerReference: 'demo_ref_1002', paymentDestination: 'acct_2' },
    { id: 'tx_risk', publicToken: 'trust-demo-risk', sellerPersonId: 'p_merchant_1', buyerPersonId: 'p_buyer_2', tradingIdentityId: 'ti_1', orderReference: 'TP-DEMO-RISK', versions: [{ version: 1, productDescription: 'Laptop accessories', amountMinor: 1250000, currency: 'NGN', paymentDestination: 'acct_1', confirmedAt: d(0) }], createdAt: d(0), expiresAt: d(0.5), status: 'DISPUTED' as const, paymentStatus: 'PAYMENT_AMOUNT_MISMATCH' as const, fulfilmentStatus: 'NOT_STARTED' as const, disputeStatus: 'OPEN' as const, riskState: 'STEP_UP' as const, verificationState: 'MISMATCH' as const, evidenceIds: [], providerReference: 'demo_ref_replay', paymentDestination: 'acct_1' },
  ]
  const documents = [
    { id: 'doc_1', publicToken: 'doc-demo-1001', tenantId: 'tenant_demo', title: 'Invoice for September supply', requestedFrom: 'Supplier contact', reason: 'Complete transaction evidence packet', status: 'REQUESTED' as const, dueAt: d(3) },
    { id: 'doc_2', publicToken: 'doc-demo-1002', tenantId: 'tenant_demo', title: 'Supplier invoice', requestedFrom: 'Supplier contact', reason: 'Reconcile completed order', status: 'UPLOADED' as const, dueAt: d(2), fileName: 'invoice-1002.pdf', artifactHash: 'demo_sha256_invoice_1002' },
    { id: 'doc_3', publicToken: 'doc-demo-1003', tenantId: 'tenant_demo', title: 'Insurance certificate', requestedFrom: 'Business owner', reason: 'Annual document watch', status: 'EXPIRED' as const, dueAt: d(-4), fileName: 'insurance-2025.pdf', artifactHash: 'demo_sha256_insurance_2025' },
  ]
  const obligations = [
    { id: 'obl_7', tenantId: 'tenant_demo', name: 'Insurance certificate renewal', category: 'INSURANCE', jurisdiction: 'Lagos, NG', issuer: 'Provider', dueAt: d(7), status: 'DUE_SOON' as const, evidenceIds: [], reminderPolicyId: 'default-90-60-30-14-7-3-due-overdue', applicability: 'CONFIRMED' as const },
    { id: 'obl_expired', tenantId: 'tenant_demo', name: 'Certificate of compliance', category: 'CERTIFICATE', jurisdiction: 'Nigeria', issuer: 'Relevant authority', expiryAt: d(-5), status: 'EXPIRED' as const, evidenceIds: [], reminderPolicyId: 'default-90-60-30-14-7-3-due-overdue', applicability: 'POTENTIALLY_APPLICABLE' as const },
    { id: 'obl_current', tenantId: 'tenant_demo', name: 'Domain subscription', category: 'DIGITAL_ASSET', jurisdiction: 'N/A', dueAt: d(120), status: 'CURRENT' as const, evidenceIds: [], reminderPolicyId: 'digital-60-30-14-7', applicability: 'CONFIRMED' as const },
  ]
  const riskEvents = [
    { id: 'risk_1', transactionId: 'tx_risk', code: 'ACCOUNT_CHANGE', severity: 'HIGH' as const, description: 'Receiving account changed shortly before the current transaction.', triggeredAt: d(0), ruleVersion: 'risk-rules-v1', resolved: false },
    { id: 'risk_2', transactionId: 'tx_risk', code: 'AMOUNT_MISMATCH', severity: 'HIGH' as const, description: 'Submitted amount differs from the confirmed order amount.', triggeredAt: d(0), ruleVersion: 'risk-rules-v1', resolved: false },
    { id: 'risk_3', transactionId: 'tx_risk', code: 'WEBHOOK_REPLAY', severity: 'HIGH' as const, description: 'A duplicate payment event was detected in the demo adversarial case.', triggeredAt: d(0), ruleVersion: 'risk-rules-v1', resolved: false },
  ]
  const audit = [
    { id: 'audit_1', actor: 'DEMO_SYSTEM', action: 'PAYMENT_VERIFIED', resource: 'tx_1', timestamp: d(-1), correlationId: 'corr_demo_1001', previousState: 'PAYMENT_PROCESSOR_CONFIRMED', resultingState: 'PAYMENT_VERIFIED', evidenceIds: ['ev_pay_1'], outcome: 'SUCCESS' as const, approvalStatus: 'NOT_REQUIRED' as const },
    { id: 'audit_2', actor: 'DEMO_SYSTEM', action: 'RISK_FLAGGED', resource: 'tx_risk', timestamp: d(0), correlationId: 'corr_demo_risk', previousState: 'PAYMENT_PENDING', resultingState: 'PAYMENT_AMOUNT_MISMATCH', evidenceIds: [], outcome: 'SUCCESS' as const, approvalStatus: 'PENDING' as const },
  ]
  return { people, tradingIdentities, accounts, evidence, transactions, documents, obligations, riskEvents, audit }
}
