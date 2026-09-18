export interface PlanPrice { code: string; name: string; monthlyMinor: number; includedTrustEvents: number; notes: string }
export interface CostItem { category: string; provider?: string; amountMinor: number; currency: string; effectiveDate: string }

export const launchHypotheses: PlanPrice[] = [
  { code: 'MICRO', name: 'Micro', monthlyMinor: 175000, includedTrustEvents: 25, notes: 'Hypothesis: ₦1,750/month; validate against measured willingness-to-pay and direct cost.' },
  { code: 'SMALL', name: 'Small', monthlyMinor: 350000, includedTrustEvents: 75, notes: 'Hypothesis: ₦3,500/month; configurable.' },
]

export function directCostRatio(revenueMinor: number, costsMinor: number) {
  if (revenueMinor <= 0) return 1
  return costsMinor / revenueMinor
}

export function economicsFlag(revenueMinor: number, directCostsMinor: number) {
  return directCostRatio(revenueMinor, directCostsMinor) <= 0.3 ? 'WITHIN_DESIGN_TARGET' : 'ABOVE_DESIGN_TARGET'
}
