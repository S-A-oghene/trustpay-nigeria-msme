import { DemoBanner } from '@/components/DemoBanner'
import { Icon } from '@/components/Icon'
import { StatusPill } from '@/components/StatusPill'
import { demoStore } from '@/lib/demo/store'
import { appConfig, isProductionDataConfigured } from '@/lib/config'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function DisputesPage() {
  if (appConfig.demoMode) return <DemoDisputes />
  if (!isProductionDataConfigured()) return <section className="surface"><div className="eyebrow">RESOLVE · DISPUTE CONTROL</div><h1 className="sp-3">Production data is not configured</h1><p className="muted-tight sp-2">No demo disputes are shown in live mode.</p></section>
  await requireUser()
  const supabase = await createClient()
  const { data, error } = await supabase.from('disputes').select('id,order_id,status,outcome,created_at,resolved_at').order('created_at', { ascending: false })
  if (error) throw new Error(`Dispute lookup failed: ${error.message}`)
  return <DisputeView title="Evidence-backed dispute queue · Live" rows={data || []} />
}

function DemoDisputes() {
  const disputed = demoStore().transactions.filter(t => t.disputeStatus !== 'NONE')
  return (
    <>
      <DemoBanner />
      <section className="page-head">
        <div>
          <div className="eyebrow">RESOLVE · DISPUTE CONTROL</div>
          <h1>Resolve from evidence, not emotion.</h1>
          <p className="page-head-copy">A dispute is a workflow state, not a fraud finding. Resolution depends on the evidence and authority available.</p>
        </div>
        <div className="page-head-actions"><StatusPill label="DEMO / SIMULATED" tone="warn" /></div>
      </section>
      <DisputeView title="Evidence-backed dispute queue · Demo" rows={disputed.map(t => ({ id: `demo_${t.id}`, order_id: t.id, status: t.disputeStatus, outcome: t.disputeStatus === 'RESOLVED' ? 'RESOLVED' : null, created_at: '2026-09-18T07:00:00.000Z', resolved_at: t.disputeStatus === 'RESOLVED' ? '2026-09-18T07:00:00.000Z' : null }))} />
    </>
  )
}

type DisputeRow = { id: string; order_id: string; status: string; outcome: string | null; created_at: string; resolved_at: string | null }

function DisputeView({ title, rows }: { title: string; rows: DisputeRow[] }) {
  return (
    <>
      <section className="surface">
        <div className="section-head">
          <div><div className="eyebrow">CASE QUEUE</div><h2>{title}</h2><p>Evidence packets bring identity, account, order, payment, fulfilment, delivery, communication and audit references together.</p></div>
          <StatusPill label={`${rows.filter(x => x.status !== 'RESOLVED' && x.status !== 'CLOSED').length} open`} tone={rows.some(x => x.status !== 'RESOLVED' && x.status !== 'CLOSED') ? 'warn' : 'good'} />
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Order</th><th>Status</th><th>Outcome</th><th>Created</th><th>Resolved</th></tr></thead>
            <tbody>
              {rows.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.order_id}</strong><div className="muted-tight">{t.id}</div></td>
                  <td><StatusPill label={t.status} tone={t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'good' : 'warn'} /></td>
                  <td>{t.outcome || 'Pending decision'}</td>
                  <td>{new Date(t.created_at).toLocaleString('en-GB')}</td>
                  <td>{t.resolved_at ? new Date(t.resolved_at).toLocaleString('en-GB') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section grid">
        <article className="card"><div className="eyebrow">EVIDENCE PACKET</div><h3 className="sp-3">Assemble the trail</h3><p className="muted-tight sp-2">Identity, account, order, payment, fulfilment, delivery, communication and audit references can be assembled for reviewer examination.</p></article>
        <article className="card"><div className="eyebrow">APPEAL</div><h3 className="sp-3">Keep outcomes separate</h3><p className="muted-tight sp-2">Appeal/correction outcomes remain distinct from the original event.</p></article>
        <article className="card"><div className="eyebrow">AUTHORITY</div><h3 className="sp-3">No invented promises</h3><p className="muted-tight sp-2">TrustPay does not promise a refund unless the relevant payment/settlement authority and provider path actually authorise it.</p><div className="actions"><Icon name="scale" size={15} /><span className="small muted">Decision stays with the authorised process.</span></div></article>
      </section>
    </>
  )
}
