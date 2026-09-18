export interface AccountChangeEvent {
  id: string
  oldDestination: string
  newDestination: string
  initiator: string
  timestamp: string
  reason?: string
  verificationState: 'UNKNOWN'|'VERIFIED'|'MISMATCH'|'ADDITIONAL_VERIFICATION_REQUIRED'
  approvalState: 'PENDING'|'APPROVED'|'REJECTED'
  outcome: 'BLOCKED'|'STEP_UP_REQUIRED'|'APPROVED'
}

export function createAccountChangeEvent(input: Omit<AccountChangeEvent,'id'|'timestamp'|'verificationState'|'approvalState'|'outcome'>): AccountChangeEvent {
  return {...input,id:`acctchg_${globalThis.crypto.randomUUID()}`,timestamp:new Date().toISOString(),verificationState:'ADDITIONAL_VERIFICATION_REQUIRED',approvalState:'PENDING',outcome:'STEP_UP_REQUIRED'}
}
