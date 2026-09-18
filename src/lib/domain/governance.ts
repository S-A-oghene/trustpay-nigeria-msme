export type RiskClass = 'R0' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5'
export type Gate = 'IDENTITY' | 'AUTHORITY' | 'POLICY' | 'EVIDENCE'

const order: RiskClass[] = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5']

export function riskAtLeast(actual: RiskClass, minimum: RiskClass) {
  return order.indexOf(actual) >= order.indexOf(minimum)
}

export function authorizeHighImpact(input: {
  identity: boolean
  authority: boolean
  policy: boolean
  evidence: boolean
  riskClass: RiskClass
  minimumRiskClass?: RiskClass
}) {
  const gates: Record<Gate, boolean> = {
    IDENTITY: input.identity,
    AUTHORITY: input.authority,
    POLICY: input.policy,
    EVIDENCE: input.evidence,
  }
  const gatesPassed = Object.values(gates).every(Boolean)
  const riskPassed = riskAtLeast(input.riskClass, input.minimumRiskClass || 'R3')
  return { allowed: gatesPassed && riskPassed, gates, riskPassed }
}

export const AI_PROHIBITIONS = [
  'mark payment verified',
  'release or move funds',
  'declare a person fraudulent',
  'approve payment destination changes',
  'alter constitutional policy',
  'delete audit history',
  'reveal restricted private data',
  'grant privileged access',
] as const
