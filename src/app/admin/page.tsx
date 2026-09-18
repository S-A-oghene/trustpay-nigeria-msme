import { DemoBanner } from '@/components/DemoBanner'
import { paymentProvider } from '@/lib/server/providers/registry'
import { appConfig, isProductionDataConfigured } from '@/lib/config'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage(){
  if (appConfig.demoMode) {
    const provider = paymentProvider(); const health = await provider.health()
    return <><DemoBanner/><AdminView provider={provider.providerCode} mode={provider.mode} healthy={health.healthy} detail={health.detail} demo/></>
  }
  if (!isProductionDataConfigured()) return <section className="section card"><h1>Central Command</h1><p className="muted">Production configuration is incomplete.</p></section>
  const claims = await requireUser()
  const supabase = await createClient()
  const { data: membership } = await supabase.from('memberships').select('role').eq('user_id', String(claims.sub)).in('role', ['owner','manager','admin']).limit(1).maybeSingle()
  if (!membership) return <section className="section card"><h1>Access denied</h1><p className="muted">Central Command requires an owner, manager or admin role in a TrustPay tenant.</p></section>
  const provider = paymentProvider(); const health = await provider.health()
  return <AdminView provider={provider.providerCode} mode={provider.mode} healthy={health.healthy} detail={health.detail}/>
}

function AdminView(p:{provider:string;mode:string;healthy:boolean;detail:string;demo?:boolean}) { return <section className="section"><div className="eyebrow">CENTRAL COMMAND</div><h1>Provider & governance control</h1><p className="muted">{p.demo?'Demo health only — no live provider action is implied.':'Authenticated read/health surface. High-impact mutations must pass server-side authorization and policy gates.'}</p><section className="grid"><div className="card"><h3>Payment adapter</h3><p><strong>{p.provider}</strong></p><p>{p.mode}</p><p><span className={`pill pill-${p.healthy?'good':'warn'}`}>{p.healthy?'HEALTHY':'NOT READY'}</span></p><p className="muted">{p.detail}</p></div><div className="card"><h3>Governance</h3><p>Four gates: Identity · Authority · Policy · Evidence.</p><p>AI has proposal/support authority only.</p></div><div className="card"><h3>Dependency posture</h3><p>Provider adapters are replaceable. Core transaction state, evidence graph, risk rules, audit and merchant UX remain TrustPay-owned.</p></div></section></section> }
