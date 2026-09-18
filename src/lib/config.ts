export const appConfig = {
  name: 'TrustPay Nigeria MSME',
  tagline: 'Evidence and trust control for Nigerian commerce.',
  country: 'NG',
  currency: process.env.NEXT_PUBLIC_CURRENCY || 'NGN',
  locale: process.env.NEXT_PUBLIC_LOCALE || 'en-NG',
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== 'false',
  maxDocumentBytes: Number(process.env.DOCUMENT_MAX_BYTES || 10 * 1024 * 1024),
} as const

export function isProductionDataConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

export function money(amountMinor: number, currency = appConfig.currency) {
  return new Intl.NumberFormat(appConfig.locale, {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amountMinor)
}

export function isoNow() {
  return new Date().toISOString()
}
