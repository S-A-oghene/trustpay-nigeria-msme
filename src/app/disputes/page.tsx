import { DemoBanner } from '@/components/DemoBanner'
import { StatusPill } from '@/components/StatusPill'
import { demoStore } from '@/lib/demo/store'
import { appConfig, isProductionDataConfigured } from '@/lib/config'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function DisputesPage() {
  if (appConfig.demoMode) return <DemoDisputes />
  if (!isProductionDataConfigured()) return <section className="section card"><h1>Dispute Control</h1><p className="muted">Production data is not configured. No demo disputes are shown in live mode.</p></section>
  await requireUser()
  const supabase = await createClient()
  const { data, error } = await supabase.from('disputes').select('id,order_id,status,outcome,created_at,resolved_at').order('created_at', { ascending: false })
  if (error) throw new Error(`Dispute lookup failed: ${error.message}`)
  return <DisputeView title="Evidence-backed dispute queue · Live" rows={data || []}/>
}

function DemoDisputes() {
  const disputed = demoStore().transactions.filter(t => t.disputeStatus !== 'NONE')
  return <><DemoBanner/><DisputeView title="Evidence-backed dispute queue · Demo" rows={disputed.map(t => ({id:`demo_${t.id}`,order_id:t.id,status:t.disputeStatus,outcome:t.disputeStatus==='RESOLVED'?'RESOLVED':null,created_at:'2026-09-18T07:00:00.000Z',resolved_at:t.disputeStatus==='RESOLVED'?'2026-09-18T07:00:00.000Z':null}))}/></>
}

type DisputeRow = {id:string;order_id:string;status:string;outcome:string|null;created_at:string;resolved_at:string|null}
function DisputeView({title,rows}:{title:string;rows:DisputeRow[]}) { return <><section className="section"><div className="eyebrow">RESOLVE · DISPUTE CONTROL</div><h1>{title}</h1><p className="muted">A dispute is a workflow state, not a fraud finding. Resolution depends on the evidence and authority available.</p></section><section className="section card"><table className="table"><thead><tr><th>Order</th><th>Status</th><th>Outcome</th><th>Created</th><th>Resolved</th></tr></thead><tbody>{rows.map(t=><tr key={t.id}><td><strong>{t.order_id}</strong><div className="muted">{t.id}</div></td><td><StatusPill label={t.status} tone={t.status==='RESOLVED'||t.status==='CLOSED'?'good':'warn'}/></td><td>{t.outcome||'Pending decision'}</td><td>{new Date(t.created_at).toLocaleString('en-GB')}</td><td>{t.resolved_at?new Date(t.resolved_at).toLocaleString('en-GB'):'—'}</td></tr>)}</tbody></table></section><section className="section grid"><div className="card"><h3>Evidence packet</h3><p>Identity, account, order, payment, fulfilment, delivery, communication and audit references can be assembled for reviewer examination.</p></div><div className="card"><h3>Appeal</h3><p>Appeal/correction outcomes remain separate from the original event. No unverified complaint becomes a public fraud label.</p></div><div className="card"><h3>Authority boundary</h3><p>TrustPay does not promise a refund unless the relevant payment/settlement authority and provider path actually authorise it.</p></div></section></> }
