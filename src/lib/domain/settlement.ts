export type SettlementMode='DIRECT_VERIFIED'|'PROTECTED_PARTNER'|'COD_RECORDED'|'UNSUPPORTED'

export function canUseSettlementMode(mode:SettlementMode, partnerConfigured:boolean) {
  if (mode==='PROTECTED_PARTNER') return partnerConfigured
  return mode!=='UNSUPPORTED'
}

export function assertTrustPayDoesNotCustody(mode:SettlementMode) {
  if (mode==='PROTECTED_PARTNER') return 'PARTNER_CUSTODY_ONLY'
  return 'TRUSTPAY_NO_CUSTODY'
}
