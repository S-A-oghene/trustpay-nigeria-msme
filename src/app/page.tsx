import Link from 'next/link'
import { DemoBanner } from '@/components/DemoBanner'
import { Icon } from '@/components/Icon'
import { MetricCard } from '@/components/MetricCard'

const flow = [
  ['01', 'Identity', 'Who is this?'],
  ['02', 'Account', 'Where can money go?'],
  ['03', 'Order', 'What was agreed?'],
  ['04', 'Payment', 'Did money move?'],
  ['05', 'Evidence', 'What can we prove?'],
  ['06', 'History', 'What happened over time?'],
] as const

export default function Home() {
  return (
    <>
      <DemoBanner />

      <section className="hero" aria-labelledby="home-title">
        <div className="hero-panel hero-primary">
          <div className="eyebrow">TRUST · PAY · PROOF · CONTROL</div>
          <h1 id="home-title">Make online commerce feel accountable.</h1>
          <p className="hero-copy">
            TrustPay gives buyers and Nigerian MSMEs a shared evidence layer for the moments that matter: who is trading, where payment was sent, what was actually confirmed, which documents are outstanding, and what needs attention next.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" href="/demo"><Icon name="spark" size={15} /> Explore the live simulation</Link>
            <Link className="btn secondary" href="/dashboard">Open business control <Icon name="arrow-up-right" size={15} /></Link>
          </div>
          <p className="hero-footnote">Designed around evidence and explicit uncertainty — not opaque trust scores.</p>

          <div className="hero-stat-grid">
            <div className="hero-stat"><strong>Buyer + seller</strong><span>Two-sided trust</span></div>
            <div className="hero-stat"><strong>Payment state</strong><span>Server-authoritative</span></div>
            <div className="hero-stat"><strong>UNKNOWN</strong><span>Valid outcome</span></div>
          </div>
        </div>

        <div className="hero-panel trust-preview" aria-label="TrustPay product preview">
          <div className="preview-top">
            <div className="preview-label">Transaction trust map</div>
            <span className="code-tag">SIMULATED</span>
          </div>
          <div className="preview-orbit">
            <span className="preview-float a">IDENTITY · VERIFIED</span>
            <span className="preview-float b">PAYMENT · VERIFIED</span>
            <span className="preview-float c">RISK · CLEAR</span>
            <div className="preview-node">
              <div>
                <strong>₦850k</strong>
                <span>TRACEABLE EVENT</span>
              </div>
            </div>
          </div>
          <div className="preview-body">
            <div className="eyebrow">evidence view</div>
            <h2>One transaction. One shared truth.</h2>
            <p>Connect identity, account, order, payment and evidence without pretending any single signal proves everything.</p>
            <div className="preview-stat-row">
              <div className="preview-stat"><strong>5</strong><span>Evidence layers</span></div>
              <div className="preview-stat"><strong>1</strong><span>Order reference</span></div>
              <div className="preview-stat"><strong>0</strong><span>Live funds</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">WHY THE EXPERIENCE IS DIFFERENT</div>
            <h2>Decision-first, not dashboard-heavy.</h2>
            <p>Modern financial interfaces increasingly prioritize clarity, explainability, adaptive density, accessibility and visible system state over feature walls. TrustPay applies that direction to commerce verification.</p>
          </div>
        </div>
        <div className="feature-strip">
          <article className="feature-card"><div className="feature-index">Trust</div><h3>Evidence over vibes</h3><p>Separate identity, registration, account, payment and risk states.</p></article>
          <article className="feature-card"><div className="feature-index">Pay</div><h3>Confirmation over screenshots</h3><p>Payment status follows the authoritative processor path.</p></article>
          <article className="feature-card"><div className="feature-index">Control</div><h3>Attention where it matters</h3><p>Surface mismatches, account changes, expiring obligations and disputes.</p></article>
          <article className="feature-card"><div className="feature-index">Experience</div><h3>Made for the browser</h3><p>No app download or WhatsApp dependency for the core trust journey.</p></article>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">THE TRUSTPAY OBJECT</div>
            <h2>Every journey follows the evidence.</h2>
          </div>
          <Link className="btn secondary compact" href="/demo">See all demo states <Icon name="arrow-right" size={14} /></Link>
        </div>
        <div className="process-rail">
          {flow.map(([no, title, copy]) => (
            <div className="process-step" key={no}>
              <div className="step-no">{no}</div>
              <strong>{title}</strong>
              <span>{copy}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section grid-12">
        <article className="dark-surface card">
          <div className="eyebrow">BUILT FOR NIGERIAN COMMERCE</div>
          <h2 className="sp-3">Designed for the realities of social and transfer-led selling.</h2>
          <p className="sp-3" style={{ color: 'rgba(255,255,255,.66)', fontSize: 13 }}>
            A seller may be informal. A receiving account may be personal. Registration may be unknown. A buyer may have a screenshot. None of those facts alone should become a shortcut to a verdict.
          </p>
          <div className="actions">
            <Link className="btn lagoon" href="/trust/trust-demo-1001">See buyer view</Link>
            <Link className="btn secondary" href="/transactions/trust-demo-risk">See risk view</Link>
          </div>
        </article>

        <article className="card">
          <div className="eyebrow">NON-NEGOTIABLE</div>
          <h2 className="sp-3">UNKNOWN is a product state.</h2>
          <p className="sp-3 muted-tight">When evidence is unavailable or contradictory, TrustPay records the limitation instead of manufacturing certainty.</p>
          <div className="callout sp-4"><strong>“Not established” is sometimes the safest truth.</strong><br />The interface makes uncertainty legible without making it dramatic.</div>
        </article>
      </section>

      <section className="section kpi-strip">
        <MetricCard label="Core flow" value="Identity → Payment" detail="Evidence remains first-class throughout." />
        <MetricCard label="Buyer experience" value="No app download" detail="Public Trust Cards open from a browser link." />
        <MetricCard label="Demo" value="Zero credentials" detail="Everything on the public simulation is deterministic." />
        <MetricCard label="Production boundary" value="Provider-gated" detail="Live connectors remain separately configured and reviewed." />
      </section>
    </>
  )
}
