import { DemoBanner } from '@/components/DemoBanner'
import { Icon } from '@/components/Icon'
import { StatusPill } from '@/components/StatusPill'
import { demoStore } from '@/lib/demo/store'
import { appConfig, isProductionDataConfigured } from '@/lib/config'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function ObligationsPage() {
  if (appConfig.demoMode) return <DemoObligations />
  if (!isProductionDataConfigured()) return <section className="surface"><div className="eyebrow">OBLIGATION WATCH</div><h1 className="sp-3">Production data is not configured</h1><p className="muted-tight sp-2">No demo obligations are shown in live mode.</p></section>
  await requireUser()
  const supabase = await createClient()
  const { data, error } = await supabase.from('obligations').select('id,name,category,jurisdiction,issuer,due_at,expiry_at,status,applicability,source_url,last_verified_at').order('due_at', { ascending: true })
  if (error) throw new Error(`Obligation Watch lookup failed: ${error.message}`)
  return <ObligationView title="Business Obligation Watch · Live" items={data || []} />
}

function DemoObligations() {
  const items = demoStore().obligations.map(o => ({
    id: o.id,
    name: o.name,
    category: o.category,
    jurisdiction: o.jurisdiction,
    issuer: o.issuer || null,
    due_at: o.dueAt || null,
    expiry_at: o.expiryAt || null,
    status: o.status,
    applicability: o.applicability,
    source_url: null,
    last_verified_at: null,
  }))

  return (
    <>
      <DemoBanner />
      <section className="page-head">
        <div>
          <div className="eyebrow">BUSINESS CONTROL · OBLIGATION WATCH</div>
          <h1>Stay ahead of what needs attention.</h1>
          <p className="page-head-copy">Track due dates, expiry windows and configured obligations without hard-coding legal conclusions.</p>
        </div>
        <div className="page-head-actions"><StatusPill label="DEMO / SIMULATED" tone="warn" /></div>
      </section>
      <ObligationView title="Business Obligation Watch · Demo" items={items} />

      <section className="section grid">
        <article className="card"><div className="eyebrow">REMINDER POLICY</div><h3 className="sp-3">Progressive escalation</h3><p className="muted-tight sp-2">Configurable 90/60/30/14/7/3-day, due-date and overdue escalation is represented as data, not hard-coded legal truth.</p></article>
        <article className="card"><div className="eyebrow">CAC WATCH</div><h3 className="sp-3">Report the change</h3><p className="muted-tight sp-2">A registry change should be reported as evidence such as “registry status changed”, not automatically “business illegal”.</p></article>
        <article className="card"><div className="eyebrow">TAX WATCH</div><h3 className="sp-3">Track without advising</h3><p className="muted-tight sp-2">Tax-related dates and documents can be tracked, but TrustPay is not a tax adviser.</p></article>
      </section>
    </>
  )
}

type ObligationRow = {
  id: string
  name: string
  category: string
  jurisdiction: string
  issuer: string | null
  due_at: string | null
  expiry_at: string | null
  status: string
  applicability: string
  source_url: string | null
  last_verified_at: string | null
}

function obligationTone(status: string) {
  return status === 'CURRENT' ? 'good' : status === 'EXPIRED' || status === 'OVERDUE' ? 'bad' : 'warn'
}

function ObligationView({ title, items }: { title: string; items: ObligationRow[] }) {
  const urgent = items.filter(x => ['DUE_SOON', 'OVERDUE', 'EXPIRED'].includes(x.status))
  const current = items.filter(x => x.status === 'CURRENT')

  return (
    <section className="surface">
      <div className="section-head">
        <div>
          <div className="eyebrow">ATTENTION MAP</div>
          <h2>{title}</h2>
          <p>Applicability and legal interpretation remain subject to the relevant authority/adviser.</p>
        </div>
        <div className="status-stack"><StatusPill label={`${urgent.length} need attention`} tone={urgent.length ? 'warn' : 'good'} /><StatusPill label={`${current.length} current`} tone="good" /></div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Item</th><th>Category</th><th>When</th><th>Status</th><th>Applicability</th></tr></thead>
          <tbody>
            {items.map(o => (
              <tr key={o.id}>
                <td><strong>{o.name}</strong><div className="muted-tight">{o.issuer || 'Configurable issuer'} · {o.jurisdiction}</div></td>
                <td><span className="code-tag">{o.category}</span></td>
                <td>{new Date(o.expiry_at || o.due_at || '').toLocaleDateString('en-GB')}</td>
                <td><StatusPill label={o.status} tone={obligationTone(o.status)} /></td>
                <td>{o.applicability === 'POTENTIALLY_APPLICABLE' ? 'Potentially applicable — verify with authority/adviser.' : 'Configured'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
