import Link from 'next/link'
import { DemoBanner } from '@/components/DemoBanner'
import { MetricCard } from '@/components/MetricCard'

export default function Home() {
  return <>
    <DemoBanner />
    <section className="hero">
      <div className="hero-panel">
        <div className="eyebrow">Trust · Pay · Proof · Chase · Watch · Resolve · History</div>
        <h1>A trust and control layer above Nigerian commerce rails.</h1>
        <p>TrustPay helps a buyer understand the evidence around a seller, helps a seller confirm authoritative payment events, and gives the business a durable record of what happened.</p>
        <div className="actions"><Link className="btn" href="/demo">Run the Demo</Link><Link className="btn secondary" href="/dashboard">Open Business Control</Link></div>
      </div>
      <div className="hero-panel side-card"><h2>Constitution</h2><p className="muted">TrustPay does not hold customer funds in the base product. It does not depend on WhatsApp, does not equate CAC registration with trust, and does not treat screenshots as authoritative payment confirmation.</p><div className="callout"><strong>UNKNOWN is valid.</strong><br/>The platform records evidence and limitations instead of inventing certainty.</div></div>
    </section>
    <section className="section"><div className="kpi-strip"><MetricCard label="Core flow" value="Identity → Account → Order → Payment" detail="Evidence remains first-class throughout."/><MetricCard label="Buyer experience" value="No app download" detail="Public Trust Cards work from a browser link."/><MetricCard label="Demo" value="Zero credentials" detail="Deterministic simulated provider and dataset."/><MetricCard label="Production boundary" value="Provider-gated" detail="Live payment/identity credentials remain optional until configured."/></div></section>
    <section className="section grid"><div className="card"><h3>Trust Card</h3><p className="muted">Shows identity, registration, account relationship, transaction evidence and limitations without a simplistic trust score.</p><Link className="btn secondary" href="/trust/trust-demo-1001">View demo Trust Card</Link></div><div className="card"><h3>DocumentChaser</h3><p className="muted">Request evidence using secure links, track receipt, validation and verification separately.</p><Link className="btn secondary" href="/docs/doc-demo-1001">View document case</Link></div><div className="card"><h3>Obligation Watch</h3><p className="muted">Track due dates and expiries through versioned reminder policies with an explicit legal/advisory boundary.</p><Link className="btn secondary" href="/obligations">View obligation cases</Link></div></section>
  </>
}
