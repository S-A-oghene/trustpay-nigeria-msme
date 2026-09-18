import { DemoBanner } from '@/components/DemoBanner'
import { StatusPill } from '@/components/StatusPill'
import { demoStore } from '@/lib/demo/store'
import { appConfig, isProductionDataConfigured } from '@/lib/config'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function ObligationsPage() {
  if (appConfig.demoMode) return <DemoObligations />
  if (!isProductionDataConfigured()) return <section className="section card"><h1>Obligation Watch</h1><p className="muted">Production data is not configured. No demo obligations are shown in live mode.</p></section>
  await requireUser()
  const supabase = await createClient()
  const { data, error } = await supabase.from('obligations').select('id,name,category,jurisdiction,issuer,due_at,expiry_at,status,applicability,source_url,last_verified_at').order('due_at', { ascending: true })
  if (error) throw new Error(`Obligation Watch lookup failed: ${error.message}`)
  return <ObligationView title="Business Obligation Watch · Live" items={data || []}/>
}

function DemoObligations() {
  return <><DemoBanner/><ObligationView title="Business Obligation Watch · Demo" items={demoStore().obligations.map(o => ({id:o.id,name:o.name,category:o.category,jurisdiction:o.jurisdiction,issuer:o.issuer||null,due_at:o.dueAt||null,expiry_at:o.expiryAt||null,status:o.status,applicability:o.applicability,source_url:null,last_verified_at:null}))}/><section className="section grid"><div className="card"><h3>Reminder policy</h3><p>Configurable 90/60/30/14/7/3-day, due-date and overdue escalation is represented as data, not hard-coded legal truth.</p></div><div className="card"><h3>CAC Watch boundary</h3><p>A registry change should be reported as evidence such as “registry status changed”, not automatically “business illegal”.</p></div><div className="card"><h3>Tax Watch boundary</h3><p>Tax-related dates/documents are tracked, but TrustPay is not a tax adviser.</p></div></section></>
}

type ObligationRow = { id:string; name:string; category:string; jurisdiction:string; issuer:string|null; due_at:string|null; expiry_at:string|null; status:string; applicability:string; source_url:string|null; last_verified_at:string|null }
function ObligationView({title,items}:{title:string;items:ObligationRow[]}) { return <><section className="section"><div className="eyebrow">BUSINESS CONTROL · OBLIGATION WATCH</div><h1>{title}</h1><p className="muted">Applicability and legal interpretation remain subject to the relevant authority/adviser. Current legal rules require fresh verification before production enforcement.</p></section><section className="section card"><table className="table"><thead><tr><th>Item</th><th>Category</th><th>When</th><th>Status</th><th>Applicability</th></tr></thead><tbody>{items.map(o=><tr key={o.id}><td><strong>{o.name}</strong><div className="muted">{o.issuer||'Configurable issuer'} · {o.jurisdiction}</div></td><td>{o.category}</td><td>{new Date(o.expiry_at||o.due_at||'').toLocaleDateString('en-GB')}</td><td><StatusPill label={o.status} tone={o.status==='CURRENT'?'good':o.status==='EXPIRED'||o.status==='OVERDUE'?'bad':'warn'}/></td><td>{o.applicability==='POTENTIALLY_APPLICABLE'?'Potentially applicable — verify with authority/adviser.':'Configured'}</td></tr>)}</tbody></table></section></> }
