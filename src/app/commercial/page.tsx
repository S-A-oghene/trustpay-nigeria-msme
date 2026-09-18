import { DemoBanner } from '@/components/DemoBanner'
import { Icon } from '@/components/Icon'
import { StatusPill } from '@/components/StatusPill'
import { launchHypotheses, economicsFlag } from '@/lib/domain/pricing'
import { money } from '@/lib/config'

export default function CommercialPage() {
  const revenue = 175000
  const cost = 38000

  return (
    <>
      <DemoBanner />
      <section className="data-hero">
        <div className="eyebrow">COMMERCIAL CONTROL</div>
        <h1>Simple pricing. Measurable unit economics.</h1>
        <p className="muted sp-3">These values are launch hypotheses / demo configuration, not current market guarantees.</p>
        <div className="status-stack sp-4"><StatusPill label="HYPOTHESIS" tone="warn" /><StatusPill label="NGN" tone="info" /><StatusPill label="FAIR-USE" tone="neutral" /></div>
      </section>

      <section className="section price-grid">
        {launchHypotheses.map((p, index) => (
          <article className={`price-card ${index === 1 ? 'featured' : ''}`} key={p.code}>
            <div className="eyebrow">{p.code}</div>
            <h2 className="sp-3">{p.name}</h2>
            <div className="price">{money(p.monthlyMinor)} <small>/ month</small></div>
            <ul className="price-list">
              <li>{p.includedTrustEvents} included Trust Events in demo configuration.</li>
              <li>{p.notes}</li>
              <li>Higher-cost verification can be separated from the routine plan.</li>
            </ul>
            <div className="actions">
              <span className="code-tag">DESIGN CONFIGURATION</span>
            </div>
          </article>
        ))}
      </section>

      <section className="section grid-12">
        <article className="surface">
          <div className="eyebrow">COST CONTROL</div>
          <h2 className="sp-3">Track the direct cost of trust.</h2>
          <p className="muted-tight sp-2">Payment collection, verification providers, messaging, infrastructure, support and fraud review all consume margin. Unit economics should be observable before pricing is treated as final.</p>
          <div className="hero-stat-grid">
            <div className="hero-stat"><strong>{money(revenue)}</strong><span>Demo revenue</span></div>
            <div className="hero-stat"><strong>{money(cost)}</strong><span>Direct cost</span></div>
            <div className="hero-stat"><strong>{(cost / revenue * 100).toFixed(1)}%</strong><span>Demo cost ratio</span></div>
          </div>
        </article>

        <article className="dark-surface card">
          <div className="eyebrow">ECONOMICS SIGNAL</div>
          <h2 className="sp-3">A price point is only useful when the cost to serve is visible.</h2>
          <p className="sp-3" style={{ color: 'rgba(255,255,255,.66)', fontSize: 12 }}>{economicsFlag(revenue, cost)}</p>
          <div className="actions"><Icon name="balance" size={15} /><span className="small" style={{ color: 'rgba(255,255,255,.62)' }}>Review direct costs before launch.</span></div>
        </article>
      </section>
    </>
  )
}
