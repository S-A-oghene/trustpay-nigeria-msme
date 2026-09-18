import Link from 'next/link'
import { DemoBanner } from '@/components/DemoBanner'
import { StatusPill } from '@/components/StatusPill'
import { demoStore } from '@/lib/demo/store'
import { money } from '@/lib/config'

export default function DemoPage() {
  const data = demoStore()
  return <>
    <DemoBanner />
    <section className="section"><div className="eyebrow">DEMO CONTROL ROOM</div><h1>TrustPay end-to-end demonstration</h1><p className="muted">Every state below is simulated. Nothing moves real money or declares a live external verification result.</p></section>
    <section className="grid-2">
      <div className="card"><h2>Merchant 1</h2><p>Aisha Bello Fashion · individual trader · personal receiving account.</p><StatusPill label="Identity verified" tone="good"/> <StatusPill label="CAC not established" tone="neutral"/> <StatusPill label="Personal account" tone="warn"/><div className="actions"><Link className="btn" href="/trust/trust-demo-1001">Buyer view</Link></div></div>
      <div className="card"><h2>Merchant 2</h2><p>Adeyemi Foods & Supplies Ltd · registered small enterprise · business receiving account.</p><StatusPill label="Identity verified" tone="good"/> <StatusPill label="Registration verified" tone="good"/> <StatusPill label="Account verified" tone="good"/><div className="actions"><Link className="btn" href="/trust/trust-demo-1002">Buyer view</Link></div></div>
    </section>
    <section className="section card"><h2>Transactions</h2><table className="table"><thead><tr><th>Reference</th><th>Amount</th><th>Payment</th><th>Risk</th><th></th></tr></thead><tbody>{data.transactions.map(tx => <tr key={tx.id}><td>{tx.orderReference}</td><td>{money(tx.versions.at(-1)!.amountMinor)}</td><td><StatusPill label={tx.paymentStatus.replaceAll('_',' ')} tone={tx.paymentStatus==='PAYMENT_VERIFIED'?'good':tx.paymentStatus.includes('MISMATCH')?'bad':'warn'}/></td><td><StatusPill label={tx.riskState} tone={tx.riskState==='CLEAR'||tx.riskState==='RELEASED'?'good':tx.riskState==='STEP_UP'?'warn':'bad'}/></td><td><Link className="btn secondary" href={`/transactions/${tx.publicToken}`}>Open</Link></td></tr>)}</tbody></table></section>
    <section className="grid"><div className="card"><h3>Adversarial risk case</h3><p>Changed account + amount mismatch + replay attempt.</p><Link className="btn secondary" href="/transactions/trust-demo-risk">Run review view</Link></div><div className="card"><h3>Document case</h3><p>Requested, uploaded and expired evidence examples.</p><Link className="btn secondary" href="/docs/doc-demo-1002">Open request</Link></div><div className="card"><h3>Obligation case</h3><p>Due in 7 days, expired, and renewed/current examples.</p><Link className="btn secondary" href="/obligations">Open watch</Link></div></section>
  </>
}
