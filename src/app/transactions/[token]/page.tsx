import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DemoBanner } from '@/components/DemoBanner'
import { MetricCard } from '@/components/MetricCard'
import { StatusPill } from '@/components/StatusPill'
import { demoStore } from '@/lib/demo/store'
import { appConfig, money } from '@/lib/config'

export default async function TransactionPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  if (!appConfig.demoMode) {
    notFound()
  }

  const data = demoStore()
  const transaction = data.transactions.find((item) => item.publicToken === token)

  if (!transaction) {
    notFound()
  }

  const version = transaction.versions.at(-1)

  if (!version) {
    notFound()
  }

  const risks = data.riskEvents.filter((item) => item.transactionId === transaction.id)

  return (
    <>
      <DemoBanner />

      <section className="section card">
        <div className="eyebrow">TRANSACTION CONTROL</div>
        <h1>{version.productDescription}</h1>
        <p className="muted">
          {transaction.orderReference} · Version {version.version}
        </p>

        <div className="kpi-strip">
          <MetricCard label="Amount" value={money(version.amountMinor)} detail={version.currency} />
          <MetricCard
            label="Payment"
            value={transaction.paymentStatus.replaceAll('_', ' ')}
            detail="Authoritative state required for verification."
          />
          <MetricCard label="Risk" value={transaction.riskState} detail="Deterministic rules." />
          <MetricCard
            label="Fulfilment"
            value={transaction.fulfilmentStatus.replaceAll('_', ' ')}
            detail={transaction.disputeStatus}
          />
        </div>
      </section>

      <section className="section grid-2">
        <div className="card">
          <h2>Payment reconciliation</h2>
          <p>
            Provider reference: <strong>{transaction.providerReference || 'Not assigned'}</strong>
          </p>

          <StatusPill
            label={transaction.paymentStatus}
            tone={
              transaction.paymentStatus === 'PAYMENT_VERIFIED'
                ? 'good'
                : transaction.paymentStatus.includes('MISMATCH')
                  ? 'bad'
                  : 'warn'
            }
          />

          <p className="muted">
            A client-supplied screenshot is not used to set PAYMENT_VERIFIED.
            This demo&apos;s verified case is explicitly simulated.
          </p>

          <div className="actions">
            <form action={`/api/demo/verify?token=${token}`} method="post">
              <button className="btn" type="submit">
                Run demo verification
              </button>
            </form>

            <Link className="btn secondary" href={`/trust/${token}`}>
              View buyer Trust Card
            </Link>
          </div>
        </div>

        <div className="card">
          <h2>Risk events</h2>

          {risks.length ? (
            risks.map((risk) => (
              <div className="timeline-item" key={risk.id}>
                <div>
                  <StatusPill
                    label={risk.severity}
                    tone={
                      risk.severity === 'CRITICAL'
                        ? 'bad'
                        : risk.severity === 'HIGH'
                          ? 'warn'
                          : 'neutral'
                    }
                  />
                </div>
                <div>
                  <strong>{risk.code}</strong>
                  <div className="muted">{risk.description}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No triggered rule in this demo case.</p>
          )}
        </div>
      </section>
    </>
  )
}
