import Link from 'next/link'
import { DemoBanner } from '@/components/DemoBanner'
import { StatusPill } from '@/components/StatusPill'
import { requireUser } from '@/lib/auth'
import { appConfig } from '@/lib/config'
import { createClient } from '@/lib/supabase/server'

export default async function TransactionsIndexPage() {
  const d = appConfig.demoMode
  if (!d) await requireUser()

  if (d || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <DemoTransactionsIndex />
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('commercial_transactions')
    .select('id,public_token,transaction_reference,transaction_type,status,current_terms_version,source_order_id,created_at,expires_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(`Unable to load commercial transactions: ${error.message}`)

  type Row = {
    id: string
    public_token: string
    transaction_reference: string
    transaction_type: string
    status: string
    current_terms_version: number
    source_order_id: string | null
    created_at: string
    expires_at: string
  }

  const rows = (data || []) as Row[]

  return (
    <>
      <section className="page-head">
        <div>
          <div className="eyebrow">COMMERCIAL CONTROL · R2</div>
          <h1>Commercial transactions</h1>
          <p className="page-head-copy">Tenant-scoped generalized transactions. V1 orders remain linked through the compatibility field shown below.</p>
        </div>
      </section>
      <section className="section">
        <div className="surface">
          <div className="section-head">
            <div>
              <div className="eyebrow">CONTROL PLANE</div>
              <h2>Current transaction records</h2>
            </div>
            <span className="code-tag">READ ONLY</span>
          </div>
          {rows.length ? rows.map(row => (
            <div className="evidence-line" key={row.id}>
              <div>
                <strong>{row.transaction_reference}</strong>
                <div className="muted-tight">{row.transaction_type} · Terms v{row.current_terms_version} · {row.source_order_id ? 'V1 order linked' : 'Standalone R2 transaction'}</div>
              </div>
              <StatusPill label={row.status.replaceAll('_', ' ')} tone={row.status === 'COMPLETE' ? 'good' : row.status === 'DISPUTED' ? 'bad' : 'warn'} />
            </div>
          )) : <p className="muted-tight">No commercial transactions are available for this tenant yet.</p>}
        </div>
      </section>
    </>
  )
}

function DemoTransactionsIndex() {
  return (
    <>
      <DemoBanner />
      <section className="page-head">
        <div>
          <div className="eyebrow">COMMERCIAL CONTROL · DEMO</div>
          <h1>Commercial transactions</h1>
          <p className="page-head-copy">R2 is visible here as a generalized control-plane concept while Demo Mode remains the safe zero-credential path.</p>
        </div>
        <Link className="btn primary compact" href="/demo">Open Demo</Link>
      </section>
      <section className="section grid-12">
        <article className="surface">
          <div className="eyebrow">V1 COMPATIBILITY</div>
          <h2 className="sp-3">Orders remain first-class.</h2>
          <p className="muted-tight">The R2 migration maps each existing V1 order into one commercial transaction using the original reference and a source-order link.</p>
          <div className="callout sp-4">No payment allocation, ledger, treasury or settlement logic is included in R2.</div>
        </article>
        <article className="surface">
          <div className="eyebrow">VERSIONED TERMS</div>
          <h2 className="sp-3">Material changes get a new version.</h2>
          <p className="muted-tight">The domain test verifies version 2 is generated with a different immutable hash when a material amount changes.</p>
        </article>
      </section>
    </>
  )
}
