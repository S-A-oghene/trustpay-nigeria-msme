export type VerificationState =
  | 'VERIFIED'
  | 'UNVERIFIED'
  | 'UNKNOWN'
  | 'MISMATCH'
  | 'ADDITIONAL_VERIFICATION_REQUIRED'

export type RiskState = 'CLEAR' | 'WATCH' | 'STEP_UP' | 'REVIEW' | 'RESTRICTED' | 'RELEASED'

export type PaymentStatus =
  | 'PAYMENT_INTENT_CREATED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_EVIDENCE_SUBMITTED'
  | 'PAYMENT_PROCESSOR_CONFIRMED'
  | 'PAYMENT_VERIFIED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REVERSED'
  | 'PAYMENT_UNKNOWN'
  | 'PAYMENT_AMOUNT_MISMATCH'
  | 'PAYMENT_DESTINATION_MISMATCH'
  | 'PAYMENT_EXPIRED'

export type TransactionStatus = 'DRAFT' | 'CONFIRMED' | 'AWAITING_PAYMENT' | 'PAID' | 'FULFILLING' | 'DELIVERED' | 'COMPLETE' | 'CANCELLED' | 'DISPUTED'
export type FulfilmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DELIVERED' | 'ACKNOWLEDGED'
export type DisputeStatus = 'NONE' | 'OPEN' | 'EVIDENCE_REQUESTED' | 'EVIDENCE_RECEIVED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED'
export type DocumentStatus = 'REQUESTED' | 'OPENED' | 'UPLOADED' | 'RECEIVED' | 'HASHED' | 'VALIDATING' | 'VALIDATED' | 'VERIFIED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED'
export type ObligationStatus = 'UPCOMING' | 'DUE_SOON' | 'DUE' | 'OVERDUE' | 'CURRENT' | 'EXPIRED' | 'RENEWAL_SUBMITTED' | 'WAIVED' | 'UNKNOWN'

export type EvidenceType = 'IDENTITY' | 'ACCOUNT' | 'REGISTRY' | 'PAYMENT_PROVIDER' | 'PAYMENT_SUBMISSION' | 'DOCUMENT' | 'DELIVERY' | 'DISPUTE' | 'COMMUNICATION' | 'RISK' | 'AUDIT'

export interface Person {
  id: string
  displayName: string
  contact?: string
  identityState: VerificationState
}

export interface TradingIdentity {
  id: string
  personId: string
  displayName: string
  type: 'INDIVIDUAL_TRADER' | 'SOLE_OPERATOR' | 'REGISTERED_BUSINESS_NAME' | 'COMPANY' | 'OTHER'
  registrationState: VerificationState
}

export interface NormalizedPaymentObservation {
  provider: string
  reference: string
  status: PaymentStatus
  authoritative: boolean
  amountMinor?: number
  currency?: string
  destination?: string
  providerRaw?: unknown
  observedAt: string
}

export interface PaymentAccount {
  id: string
  tradingIdentityId: string
  bankName: string
  maskedAccount: string
  holderName: string
  holderRelationship: 'SELF' | 'AUTHORIZED_OTHER' | 'UNKNOWN'
  verificationState: VerificationState
  isPersonalAccount: boolean
  active: boolean
  changedAt?: string
}

export interface Evidence {
  id: string
  type: EvidenceType
  sourceSystem: string
  sourceReference?: string
  capturedAt: string
  observedAt: string
  artifactHash?: string
  verificationMethod: string
  verifier?: string
  confidence?: number
  integrity: 'VERIFIED' | 'UNVERIFIED' | 'FAILED'
  retentionClass: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED'
  linkedTransactionId?: string
  linkedEntityId?: string
  claim: string
  status: VerificationState
}

export interface OrderVersion {
  version: number
  productDescription: string
  amountMinor: number
  currency: string
  paymentDestination: string
  confirmedAt?: string
  changedReason?: string
}

export interface Transaction {
  id: string
  publicToken: string
  sellerPersonId: string
  buyerPersonId?: string
  tradingIdentityId: string
  orderReference: string
  versions: OrderVersion[]
  createdAt: string
  expiresAt: string
  status: TransactionStatus
  paymentStatus: PaymentStatus
  fulfilmentStatus: FulfilmentStatus
  disputeStatus: DisputeStatus
  riskState: RiskState
  verificationState: VerificationState
  evidenceIds: string[]
  providerReference?: string
  paymentDestination: string
}

export interface DocumentRequest {
  id: string
  publicToken: string
  tenantId: string
  title: string
  requestedFrom: string
  reason: string
  status: DocumentStatus
  dueAt: string
  fileName?: string
  artifactHash?: string
  evidenceId?: string
}

export interface Obligation {
  id: string
  tenantId: string
  name: string
  category: string
  jurisdiction: string
  issuer?: string
  authorityUrl?: string
  dueAt?: string
  expiryAt?: string
  status: ObligationStatus
  evidenceIds: string[]
  reminderPolicyId: string
  applicability: 'CONFIRMED' | 'POTENTIALLY_APPLICABLE' | 'NOT_APPLICABLE' | 'UNKNOWN'
}

export interface RiskEvent {
  id: string
  transactionId?: string
  code: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  triggeredAt: string
  ruleVersion: string
  resolved: boolean
}

export interface AuditEvent {
  id: string
  actor: string
  action: string
  resource: string
  timestamp: string
  correlationId: string
  previousState?: string
  resultingState?: string
  evidenceIds: string[]
  outcome: 'SUCCESS' | 'DENIED' | 'FAILED'
  error?: string
  approvalStatus: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED'
}

export interface DemoDataset {
  people: Person[]
  tradingIdentities: TradingIdentity[]
  accounts: PaymentAccount[]
  evidence: Evidence[]
  transactions: Transaction[]
  documents: DocumentRequest[]
  obligations: Obligation[]
  riskEvents: RiskEvent[]
  audit: AuditEvent[]
}
