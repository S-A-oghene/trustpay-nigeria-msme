import Link from 'next/link'
import { DemoBanner } from '@/components/DemoBanner'
import { Icon } from '@/components/Icon'
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
  type OrderRow = { id: string; order_reference: string; status: string; payment_status: string; risk_state: string; created_at: string }
  type DocumentRow = { id: string; title: string; status: string; due_at: string | null }
  type ObligationRow = { id: string; name: string; status: string; due_at: string | null; expiry_at: string | null; applicability: string }
  type DisputeRow = { id: string; status: string; created_at: string }
  const safeOrders = (ordersResult.data || []) as OrderRow[]
  const safeDocuments = (documentsResult.data || []) as DocumentRow[]
  const safeObligations = (obligationsResult.data || []) as ObligationRow[]
  const safeDisputes = (disputesResult.data || []) as DisputeRow[]
  const verified = safeOrders.filter(x => x.payment_status === 'PAYMENT_VERIFIED').length
  const attention = safeOrders.filter(x => ['STEP_UP', 'REVIEW', 'RESTRICTED'].includes(String(x.risk_state))).length
  const waitingDocs = safeDocuments.filter(x => x.status === 'REQUESTED' || x.status === 'OPENED').length
  const dueSoon = safeObligations.filter(x => ['DUE_SOON', 'OVERDUE', 'EXPIRED'].includes(String(x.status))).length

  return (
    <>
      <section className="page-head">
        <div>
          <div className="eyebrow">BUSINESS CONTROL · LIVE DATA</div>
          <h1>TrustPay command dashboard</h1>
          <p className="page-head-copy">Authenticated, tenant-scoped operational data. The interface surfaces decisions and attention before detail.</p>
        </div>
        <div className="page-head-actions">
          <Link className="btn secondary compact" href="/trust/trust-demo-1001">Preview Trust Card</Link>
          <Link className="btn primary compact" href="/demo">Open Demo</Link>
        </div>
      </section>

      <section className="kpi-strip">
        <MetricCard label="Verified payments" value={String(verified)} detail="Provider-confirmed records only." />
        <MetricCard label="Needs attention" value={String(attention)} detail="Deterministic risk or mismatch states." />
        <MetricCard label="Documents waiting" value={String(waitingDocs)} detail="DocumentChaser requests." />
        <MetricCard label="Expiry / overdue" value={String(dueSoon)} detail="Obligation Watch items." />
      </section>

      <section className="section feature-rail">
        <div className="surface">
          <div className="section-head">
            <div>
              <div className="eyebrow">PAYMENTS</div>
              <h2>Where the business needs confidence</h2>
            </div>
            <Link className="btn secondary compact" href="/transactions/trust-demo-1001">Open transaction <Icon name="arrow-up-right" size={14} /></Link>
          </div>
          {safeOrders.length ? safeOrders.map(order => (
            <div className="timeline-item" key={order.id}>
              <div className={`timeline-dot ${order.payment_status === 'PAYMENT_VERIFIED' ? 'good' : String(order.payment_status).includes('MISMATCH') ? 'bad' : 'warn'}`} />
              <div>
                <div className="timeline-item-title">{order.order_reference}</div>
                <div className="timeline-item-copy">{order.status} · Risk {order.risk_state}</div>
                <div className="status-stack sp-2">
                  <StatusPill label={String(order.payment_status).replaceAll('_', ' ')} tone={order.payment_status === 'PAYMENT_VERIFIED' ? 'good' : String(order.payment_status).includes('MISMATCH') ? 'bad' : 'warn'} />
                </div>
              </div>
            </div>
          )) : <p className="muted-tight">No tenant transactions are available yet.</p>}
        </div>

        <div className="surface">
          <div className="section-head">
            <div>
              <div className="eyebrow">WORK QUEUES</div>
              <h2>What needs doing next</h2>
            </div>
          </div>
          {safeDocuments.slice(0, 4).map(item => (
            <div className="evidence-line" key={item.id}>
              <span>{item.status} · {item.title}</span>
              <span className="code-tag">DOC</span>
            </div>
          ))}
          {safeObligations.slice(0, 4).map(item => (
            <div className="evidence-line" key={item.id}>
              <span>{item.status} · {item.name}</span>
              <span className="code-tag">WATCH</span>
            </div>
          ))}
          {!safeDocuments.length && !safeObligations.length && <p className="muted-tight sp-3">No document or obligation records are available yet.</p>}
        </div>
      </section>

      <section className="section grid">
        <div className="card"><div className="eyebrow">RESOLVE</div><h3 className="sp-3">Disputes</h3><p className="muted-tight sp-2">{safeDisputes.length} dispute record(s) visible to this tenant.</p><Link className="btn secondary compact" href="/disputes" style={{ marginTop: 14 }}>Open disputes</Link></div>
        <div className="card"><div className="eyebrow">TRUST</div><h3 className="sp-3">Public trust evidence</h3><p className="muted-tight sp-2">Expose only the configured public-safe fields through a Trust Card token.</p><Link className="btn secondary compact" href="/trust/trust-demo-1001" style={{ marginTop: 14 }}>Inspect Trust Card</Link></div>
        <div className="card"><div className="eyebrow">BOUNDARY</div><h3 className="sp-3">Production safety</h3><p className="muted-tight sp-2">No demo transaction state should appear while production mode is active.</p></div>
      </section>
    </>
  )
}

function DemoDashboard() {
  const d = demoStore()
  const verified = d.transactions.filter(t => t.paymentStatus === 'PAYMENT_VERIFIED').length
  const attention = d.transactions.filter(t => ['STEP_UP', 'REVIEW', 'RESTRICTED'].includes(t.riskState)).length
  const waitingDocs = d.documents.filter(x => x.status === 'REQUESTED').length
  const expiring = d.obligations.filter(x => ['DUE_SOON', 'EXPIRED', 'OVERDUE'].includes(x.status)).length

  return (
    <>
      <DemoBanner />
      <section className="page-head">
        <div>
          <div className="eyebrow">BUSINESS CONTROL · DEMO</div>
          <h1>TrustPay command dashboard</h1>
          <p className="page-head-copy">A decision-first control room using deterministic simulated evidence. Nothing here is live production truth.</p>
        </div>
        <div className="page-head-actions"><Link className="btn primary compact" href="/demo">Return to demo control room</Link></div>
      </section>

      <section className="kpi-strip">
        <MetricCard label="Verified payments" value={String(verified)} detail="Authoritative simulation results only." />
        <MetricCard label="Needs attention" value={String(attention)} detail="Risk or mismatch cases." />
        <MetricCard label="Documents waiting" value={String(waitingDocs)} detail="DocumentChaser requests." />
        <MetricCard label="Expiring / overdue" value={String(expiring)} detail="Obligation Watch items." />
      </section>

      <section className="section grid-12">
        <div className="surface">
          <div className="section-head"><div><div className="eyebrow">PAYMENTS</div><h2>Recent transaction state</h2></div><Link className="btn secondary compact" href="/transactions/trust-demo-1001">View first case <Icon name="arrow-up-right" size={14} /></Link></div>
          {d.transactions.map(t => (
            <div className="timeline-item" key={t.id}>
              <div className={`timeline-dot ${t.paymentStatus === 'PAYMENT_VERIFIED' ? 'good' : t.paymentStatus.includes('MISMATCH') ? 'bad' : 'warn'}`} />
              <div>
                <div className="timeline-item-title">{t.orderReference}</div>
                <div className="timeline-item-copy">{money(t.versions.at(-1)!.amountMinor)} · Risk {t.riskState} · Fulfilment {t.fulfilmentStatus}</div>
                <div className="status-stack sp-2">
                  <StatusPill label={t.paymentStatus.replaceAll('_', ' ')} tone={t.paymentStatus === 'PAYMENT_VERIFIED' ? 'good' : t.paymentStatus.includes('MISMATCH') ? 'bad' : 'warn'} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="dark-surface card">
          <div className="eyebrow">ATTENTION</div>
          <h2 className="sp-3">Risk should be visible before it is urgent.</h2>
          <p className="sp-3" style={{ color: 'rgba(255,255,255,.66)', fontSize: 12 }}>The adversarial demo deliberately combines account change, amount mismatch and replay to show a step-up path.</p>
          <Link className="btn lagoon" href="/transactions/trust-demo-risk" style={{ marginTop: 18 }}>Inspect risk case <Icon name="arrow-up-right" size={14} /></Link>
        </div>
      </section>
    </>
  )
}

function ProductionConfigurationNotice() {
  return (
    <section className="form-card surface">
      <div className="eyebrow">PRODUCTION CONFIGURATION</div>
      <h1>Production data is not configured</h1>
      <p className="form-note">Set the Supabase public URL and publishable key, then authenticate a tenant member. Demo Mode remains the zero-credential path.</p>
      <Link className="btn primary" href="/login" style={{ marginTop: 18 }}>Open secure sign in <Icon name="arrow-up-right" size={14} /></Link>
    </section>
  )
}
