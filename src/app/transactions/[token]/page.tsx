import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DemoBanner } from '@/components/DemoBanner'
import { Icon } from '@/components/Icon'
import { StatusPill } from '@/components/StatusPill'
import { demoStore } from '@/lib/demo/store'
import { money } from '@/lib/config'

export default async function TransactionPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const d = demoStore()
  const tx = d.transactions.find(x => x.publicToken === token)

  if (!tx) {
    notFound()
  }

  const version = tx.versions.at(-1)!

  const risks = d.riskEvents.filter(x => x.transactionId === tx.id)
  const paymentTone =
    tx.paymentStatus === 'PAYMENT_VERIFIED'
      ? 'good'
      : tx.paymentStatus.includes('MISMATCH')
        ? 'bad'
        : 'warn'

  const riskTone =
    tx.riskState === 'RELEASED' || tx.riskState === 'CLEAR'
      ? 'good'
      : tx.riskState === 'STEP_UP'
        ? 'warn'
        : 'bad'

  return (
    <>
      <DemoBanner />

      <section className="data-hero">
        <div className="data-hero-grid">
          <div>
            <div className="eyebrow">TRANSACTION CONTROL · DEMO</div>
            <h1>{version.productDescription}</h1>
            <p className="muted sp-2">
              {tx.orderReference} · Version {version.version}
            </p>

            <div className="status-stack sp-3">
              <StatusPill
                label={tx.paymentStatus.replaceAll('_', ' ')}
                tone={paymentTone}
              />
              <StatusPill
                label={`RISK ${tx.riskState}`}
                tone={riskTone}
              />
              <StatusPill
                label={`FULFILMENT ${tx.fulfilmentStatus.replaceAll('_', ' ')}`}
                tone="neutral"
              />
            </div>
          </div>

          <div className="data-pulse">
            <div className="data-pulse-card">
              <span>Order amount</span>
              <strong>{money(version.amountMinor)}</strong>
            </div>

            <div className="data-pulse-card">
              <span>Currency</span>
              <strong>{version.currency}</strong>
            </div>

            <div className="data-pulse-card">
              <span>Provider reference</span>
              <strong>{tx.providerReference || 'Not assigned'}</strong>
            </div>

            <div className="data-pulse-card">
              <span>Dispute</span>
              <strong>{tx.disputeStatus}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section grid-12">
        <article className="surface">
          <div className="section-head">
            <div>
              <div className="eyebrow">PAYMENT RECONCILIATION</div>
              <h2>What was actually confirmed?</h2>
            </div>
            <StatusPill label={tx.paymentStatus} tone={paymentTone} />
          </div>

          <div className="evidence-line">
            <span>Provider reference</span>
            <strong>{tx.providerReference || 'Not assigned'}</strong>
          </div>

          <div className="evidence-line">
            <span>Verification state</span>
            <strong>{tx.verificationState}</strong>
          </div>

          <div className="evidence-line">
            <span>Risk state</span>
            <strong>{tx.riskState}</strong>
          </div>

          <div className="warning sp-3">
            <strong>A screenshot is evidence, not payment proof.</strong>
            <br />
            This demo&apos;s verified case is explicitly simulated.
            A client-supplied screenshot is not used to set PAYMENT_VERIFIED.
          </div>

          <div className="actions">
            <form action={`/api/demo/verify?token=${token}`} method="post">
              <button className="btn primary" type="submit">
                <Icon name="scan" size={15} />
                Run demo verification
              </button>
            </form>

            <Link className="btn secondary" href={`/trust/${token}`}>
              View buyer Trust Card
              <Icon name="arrow-up-right" size={14} />
            </Link>
          </div>
        </article>

        <article className={`surface ${risks.length ? 'danger-accent' : ''}`}>
          <div className="section-head">
            <div>
              <div className="eyebrow">RISK ENGINE</div>
              <h2>Triggered signals</h2>
            </div>
            <StatusPill label={tx.riskState} tone={riskTone} />
          </div>

          {risks.length ? (
            <div className="risk-grid">
              {risks.map(r => (
                <div className="risk-row" key={r.id}>
                  <StatusPill
                    label={r.severity}
                    tone={
                      r.severity === 'CRITICAL'
                        ? 'bad'
                        : r.severity === 'HIGH'
                          ? 'warn'
                          : 'neutral'
                    }
                  />

                  <div>
                    <div className="risk-code">{r.code}</div>
                    <div className="risk-copy">{r.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="success sp-3">
              No triggered rule in this demo case.
            </div>
          )}
        </article>
      </section>

      <section className="section">
        <div className="surface">
          <div className="section-head">
            <div>
              <div className="eyebrow">TRUST CHAIN</div>
              <h2>Identity → account → order → payment → evidence</h2>
            </div>
          </div>

          <div className="process-rail">
            {[
              ['01', 'Identity', 'Who is trading?'],
              ['02', 'Account', 'Where is money going?'],
              ['03', 'Order', 'What was agreed?'],
              ['04', 'Payment', 'What was confirmed?'],
              ['05', 'Evidence', 'What can we prove?'],
              ['06', 'History', 'What happened next?'],
            ].map(([no, title, copy]) => (
              <div className="process-step" key={no}>
                <div className="step-no">{no}</div>
                <strong>{title}</strong>
                <span>{copy}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
