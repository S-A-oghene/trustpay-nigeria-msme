import { notFound } from 'next/navigation'
import { DemoBanner } from '@/components/DemoBanner'
import { Icon } from '@/components/Icon'
import { StatusPill } from '@/components/StatusPill'
import { demoStore } from '@/lib/demo/store'
import { isProductionDataConfigured, appConfig } from '@/lib/config'
import { getProductionPublicTrustCard } from '@/lib/server/public-trust'

export default async function TrustCardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  if (!process.env.NEXT_PUBLIC_DEMO_MODE || appConfig.demoMode) {
    const d = demoStore()
    const tx = d.transactions.find(x => x.publicToken === token)
    if (!tx) notFound()
    const trader = d.tradingIdentities.find(x => x.id === tx.tradingIdentityId)!
    const person = d.people.find(x => x.id === trader.personId)!
    const account = d.accounts.find(x => x.id === tx.paymentDestination)!
    const registrationEvidence = d.evidence.find(e => e.type === 'REGISTRY' && e.linkedEntityId === trader.id)
    return (
      <TrustCardFrame
        demo
        trader={trader.displayName}
        personState={person.identityState}
        registrationState={trader.registrationState}
        registrationText={registrationEvidence?.claim || 'No registration evidence is established in this demo.'}
        accountState={account.verificationState}
        accountRelationship={account.holderRelationship}
        personalAccount={account.isPersonalAccount}
        reference={tx.orderReference}
        paymentState={tx.paymentStatus}
        verificationState={tx.verificationState}
        riskState={tx.riskState}
      />
    )
  }

  if (!isProductionDataConfigured()) notFound()
  const row = await getProductionPublicTrustCard(token)
  if (!row) notFound()

  return (
    <TrustCardFrame
      trader={row.trading_identity}
      personState={row.identity_state}
      registrationState={row.registration_state}
      registrationText="Registry evidence is represented only by the configured production registry result."
      accountState={row.account_state}
      accountRelationship={row.account_holder_relationship}
      personalAccount={row.personal_account}
      reference={row.transaction_reference}
      paymentState={row.payment_state}
      verificationState={row.verification_state}
      riskState={row.risk_state}
    />
  )
}

function TrustCardFrame(p: {
  demo?: boolean
  trader: string
  personState: string
  registrationState: string
  registrationText: string
  accountState: string
  accountRelationship: string
  personalAccount: boolean
  reference: string
  paymentState: string
  verificationState: string
  riskState: string
}) {
  return (
    <>
      {p.demo && <DemoBanner />}
      <section className="trust-card-grid">
        <article className="trust-identity">
          <div className="trust-seal"><Icon name="shield" size={28} /><span>Evidence<br />view</span></div>
          <div className="eyebrow sp-4">PUBLIC TRUST CARD</div>
          <h1>{p.trader}</h1>
          <p>This page does not certify that the trader is “safe”. It presents evidence within the scope of configured checks and its limitations.</p>
          <div className="trust-meta-grid">
            <div className="trust-meta-item"><span>Identity</span><strong>{p.personState}</strong></div>
            <div className="trust-meta-item"><span>Registration</span><strong>{p.registrationState}</strong></div>
            <div className="trust-meta-item"><span>Account</span><strong>{p.accountState}</strong></div>
            <div className="trust-meta-item"><span>Risk state</span><strong>{p.riskState}</strong></div>
          </div>
          {p.demo && (
            <div className="actions">
              <a className="btn secondary compact" href={`/transactions/${p.reference === 'TP-DEMO-1001' ? 'trust-demo-1001' : p.reference === 'TP-DEMO-1002' ? 'trust-demo-1002' : 'trust-demo-risk'}`}>Open transaction <Icon name="arrow-up-right" size={14} /></a>
            </div>
          )}
        </article>

        <div className="evidence-grid">
          <article className="surface">
            <div className="section-head"><div><div className="eyebrow">EVIDENCE STACK</div><h2>What is established</h2></div><StatusPill label={p.demo ? 'DEMO / SIMULATED' : 'LIVE CONFIGURED'} tone={p.demo ? 'warn' : 'good'} /></div>
            <div className="evidence-grid">
              <div className="evidence-card">
                <div className="evidence-card-head"><h3>Individual identity</h3><StatusPill label={p.personState} tone={p.personState === 'VERIFIED' ? 'good' : 'warn'} /></div>
                <p>Identity state, not a character assessment.</p>
              </div>
              <div className="evidence-card">
                <div className="evidence-card-head"><h3>Business registration</h3><StatusPill label={p.registrationState} tone={p.registrationState === 'VERIFIED' ? 'good' : 'neutral'} /></div>
                <p>{p.registrationText}</p>
              </div>
              <div className="evidence-card">
                <div className="evidence-card-head"><h3>Receiving account</h3><StatusPill label={p.accountState} tone={p.accountState === 'VERIFIED' ? 'good' : 'warn'} /></div>
                <p>Relationship: {p.accountRelationship || 'UNKNOWN'} · Personal account: {p.personalAccount ? 'Yes' : 'No'}.</p>
              </div>
            </div>
          </article>

          <article className="surface">
            <div className="section-head"><div><div className="eyebrow">TRANSACTION</div><h2>{p.reference}</h2></div><StatusPill label={p.paymentState} tone={p.paymentState === 'PAYMENT_VERIFIED' ? 'good' : p.paymentState.includes('MISMATCH') ? 'bad' : 'warn'} /></div>
            <div className="evidence-card">
              <div className="evidence-card-head"><span className="muted-tight">Verification</span><StatusPill label={p.verificationState} tone={p.verificationState === 'VERIFIED' ? 'good' : p.verificationState === 'MISMATCH' ? 'bad' : 'warn'} /></div>
              <div className="evidence-divider"><span className="muted-tight">Risk</span><strong style={{ marginLeft: 8 }}>{p.riskState}</strong></div>
            </div>
            <div className="callout sp-3"><strong>{p.demo ? 'Demo provider results are simulated.' : 'Live results depend on configured provider sources.'}</strong><br />A screenshot alone never authorizes PAYMENT_VERIFIED.</div>
          </article>

          <article className="surface">
            <div className="eyebrow">EVIDENCE LIMITATIONS</div>
            <ul className="limitations sp-3">
              <li>CAC registration and identity status are separate attributes.</li>
              <li>Personal account status is not automatically a fraud finding.</li>
              <li>UNKNOWN and MISMATCH remain valid outcomes.</li>
              <li>External provider states depend on the configured source and its availability.</li>
            </ul>
          </article>
        </div>
      </section>
    </>
  )
}
