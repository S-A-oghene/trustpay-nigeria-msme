import { NextResponse } from 'next/server'
import { appConfig, isProductionDataConfigured } from '@/lib/config'
import { paymentProvider } from '@/lib/server/providers/registry'

export const runtime = 'nodejs'

export async function GET() {
  const payment = await paymentProvider().health()
  return NextResponse.json({ ok: true, service: appConfig.name, demoMode: appConfig.demoMode, supabaseConfigured: isProductionDataConfigured(), paymentProvider: paymentProvider().providerCode, paymentHealthy: payment.healthy, paymentDetail: payment.detail, timestamp: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } })
}
