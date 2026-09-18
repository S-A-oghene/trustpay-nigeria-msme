import Link from 'next/link'
import { DemoBanner } from '@/components/DemoBanner'
import { MetricCard } from '@/components/MetricCard'
import { StatusPill } from '@/components/StatusPill'
import { demoStore } from '@/lib/demo/store'
import { money, appConfig, isProductionDataConfigured } from '@/lib/config'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  if (appConfig.demoMode) return <DemoDashboard />
  if (!isProductionDataConfigured()) return <ProductionConfigurationNotice />

  await requireUser()
  const supabase = await createClient()
  const [ordersResult, documentsResult, obligationsResult, disputesResult] = await Promise.all([
    supabase.from('orders').select('id,order_reference,status,payment_status,risk_state,created_at').order('created_at', { ascending: false }).limit(12),
    supabase.from('documents').select('id,title,status,due_at').order('due_at', { ascending: true }).limit(12),
    supabase.from('obligations').select('id,name,status,due_at,expiry_at,applicability').order('due_at', { ascending: true }).limit(12),
    supabase.from('disputes').select('id,status,created_at').order('created_at', { ascending: false }).limit(12),
  ])

  type OrderRow = { id:string; order_reference:string; status:string; payment_status:string; risk_state:string; created_at:string }
  type DocumentRow = { id:string; title:string; status:string; due_at:string|null }
  type ObligationRow = { id:string; name:string; status:string; due_at:string|null; expiry_at:string|null; applicability:string }
  type DisputeRow = { id:string; status:string; created_at:string }
  const safeOrders = (ordersResult.data || []) as OrderRow[]
  const safeDocuments = (documentsResult.data || []) as DocumentRow[]
  const safeObligations = (obligationsResult.data || []) as ObligationRow[]
  const safeDisputes = (disputesResult.data || []) as DisputeRow[]
  const verified = safeOrders.filter(x => x.payment_status === 'PAYMENT_VERIFIED').length
  const attention = safeOrders.filter(x => ['STEP_UP', 'REVIEW', 'RESTRICTED'].includes(String(x.risk_state))).length
  const waitingDocs = safeDocuments.filter(x => x.status === 'REQUESTED' || x.status === 'OPENED').length
  const dueSoon = safeObligations.filter(x => ['DUE_SOON', 'OVERDUE', 'EXPIRED'].includes(String(x.status))).length

  return <>
    <section className="section"><div className="eyebrow">BUSINESS CONTROL · LIVE DATA</div><h1>TrustPay command dashboard</h1><p className="muted">Authenticated tenant-scoped operational data. RLS remains authoritative for isolation.</p></section>
    <div className="kpi-strip">
      <MetricCard label="Verified payments" value={String(verified)} detail="Provider-confirmed records only." />
      <MetricCard label="Needs attention" value={String(attention)} detail="Deterministic risk/mismatch states." />
      <MetricCard label="Documents waiting" value={String(waitingDocs)} detail="DocumentChaser requests." />
      <MetricCard label="Expiry / overdue" value={String(dueSoon)} detail="Obligation Watch items." />
    </div>
    <section className="section grid-2">
      <div className="card"><h2>Payments & transactions</h2>{safeOrders.length ? safeOrders.map(order => <div className="timeline-item" key={order.id}><div><strong>{order.order_reference}</strong><div className="muted">{order.status}</div></div><div><StatusPill label={String(order.payment_status).replaceAll('_', ' ')} tone={order.payment_status === 'PAYMENT_VERIFIED' ? 'good' : String(order.payment_status).includes('MISMATCH') ? 'bad' : 'warn'} /><div className="muted">Risk: {order.risk_state}</div></div></div>) : <p className="muted">No tenant transactions are available yet.</p>}</div>
      <div className="card"><h2>Documents & obligations</h2>{safeDocuments.map(item => <div className="timeline-item" key={item.id}><div>{item.status}</div><div><strong>{item.title}</strong><div className="muted">Due {item.due_at ? new Date(item.due_at).toLocaleDateString('en-GB') : 'not set'}</div></div></div>)}{safeObligations.map(item => <div className="timeline-item" key={item.id}><div>{item.status}</div><div><strong>{item.name}</strong><div className="muted">{item.applicability === 'POTENTIALLY_APPLICABLE' ? 'Potentially applicable — verify with authority/adviser.' : 'Configured control item.'}</div></div></div>)}{!safeDocuments.length && !safeObligations.length && <p className="muted">No document or obligation records are available yet.</p>}</div>
    </section>
    <section className="section grid"><div className="card"><h3>Disputes</h3><p>{safeDisputes.length} dispute record(s) visible to this tenant.</p><Link className="btn secondary" href="/disputes">Open disputes</Link></div><div className="card"><h3>Public trust evidence</h3><p>Use a public Trust Card token to expose only the configured public-safe evidence fields.</p></div><div className="card"><h3>Production boundary</h3><p>No demo transaction state is shown here while production mode is enabled.</p></div></section>
  </>
}

function DemoDashboard() {
  const d = demoStore()
  const verified = d.transactions.filter(t => t.paymentStatus === 'PAYMENT_VERIFIED').length
  const attention = d.transactions.filter(t => ['STEP_UP', 'REVIEW', 'RESTRICTED'].includes(t.riskState)).length
  return <><DemoBanner/><section className="section"><div className="eyebrow">BUSINESS CONTROL · DEMO</div><h1>TrustPay command dashboard</h1><p className="muted">A beginner-first surface with deterministic simulated evidence. Nothing shown here is live production truth.</p></section><div className="kpi-strip"><MetricCard label="Verified payments" value={String(verified)} detail="Authoritative simulation results only."/><MetricCard label="Needs attention" value={String(attention)} detail="Risk or mismatch cases."/><MetricCard label="Documents waiting" value={String(d.documents.filter(x => x.status === 'REQUESTED').length)} detail="DocumentChaser requests."/><MetricCard label="Expiring / overdue" value={String(d.obligations.filter(x => ['DUE_SOON','EXPIRED','OVERDUE'].includes(x.status)).length)} detail="Obligation Watch items."/></div><section className="section grid-2"><div className="card"><h2>Payments</h2>{d.transactions.map(t => <div className="timeline-item" key={t.id}><div>{t.orderReference}</div><div><strong>{money(t.versions.at(-1)!.amountMinor)}</strong> · <StatusPill label={t.paymentStatus.replaceAll('_', ' ')} tone={t.paymentStatus === 'PAYMENT_VERIFIED' ? 'good' : t.paymentStatus.includes('MISMATCH') ? 'bad' : 'warn'}/><div className="muted">Risk: {t.riskState}. Fulfilment: {t.fulfilmentStatus}.</div></div></div>)}</div><div className="card"><h2>Documents & obligations</h2>{d.documents.map(x => <div className="timeline-item" key={x.id}><div>{x.status}</div><div><strong>{x.title}</strong><div className="muted">Due {new Date(x.dueAt).toLocaleDateString('en-GB')}</div></div></div>)}{d.obligations.map(x => <div className="timeline-item" key={x.id}><div>{x.status}</div><div><strong>{x.name}</strong><div className="muted">{x.applicability === 'POTENTIALLY_APPLICABLE' ? 'Potentially applicable — verify with the relevant authority/adviser.' : 'Configured control item.'}</div></div></div>)}</div></section></>
}

function ProductionConfigurationNotice() {
  return <section className="section card"><div className="eyebrow">PRODUCTION CONFIGURATION</div><h1>Production data is not configured</h1><p>Set the Supabase public URL and publishable key, then authenticate a tenant member. Demo Mode remains the zero-credential path.</p><Link className="btn" href="/login">Open login</Link></section>
}
