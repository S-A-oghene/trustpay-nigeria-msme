import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DemoBanner } from '@/components/DemoBanner'
import { StatusPill } from '@/components/StatusPill'
import { demoStore } from '@/lib/demo/store'
import { money } from '@/lib/config'

import { MetricCard } from '@/components/MetricCard'

export default async function TransactionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; const d=demoStore(); const tx=d.transactions.find(x=>x.publicToken===token); if(!tx) notFound()
  const version=tx.versions.at(-1)!; const risks=d.riskEvents.filter(x=>x.transactionId===tx.id)
  return <><DemoBanner/><section className="section card"><div className="eyebrow">TRANSACTION CONTROL</div><h1>{version.productDescription}</h1><p className="muted">{tx.orderReference} · Version {version.version}</p><div className="kpi-strip"><MetricCard label="Amount" value={money(version.amountMinor)} detail={version.currency}/><MetricCard label="Payment" value={tx.paymentStatus.replaceAll('_',' ')} detail="Authoritative state required for verification."/><MetricCard label="Risk" value={tx.riskState} detail="Deterministic rules."/><MetricCard label="Fulfilment" value={tx.fulfilmentStatus.replaceAll('_',' ')} detail={tx.disputeStatus}/></div></section><section className="section grid-2"><div className="card"><h2>Payment reconciliation</h2><p>Provider reference: <strong>{tx.providerReference || 'Not assigned'}</strong></p><StatusPill label={tx.paymentStatus} tone={tx.paymentStatus==='PAYMENT_VERIFIED'?'good':tx.paymentStatus.includes('MISMATCH')?'bad':'warn'}/><p className="muted">A client-supplied screenshot is not used to set PAYMENT_VERIFIED. This demo's verified case is explicitly simulated.</p><div className="actions"><form action={`/api/demo/verify?token=${token}`} method="post"><button className="btn" type="submit">Run demo verification</button></form><Link className="btn secondary" href={`/trust/${token}`}>View buyer Trust Card</Link></div></div><div className="card"><h2>Risk events</h2>{risks.length ? risks.map(r=><div className="timeline-item" key={r.id}><div><StatusPill label={r.severity} tone={r.severity==='CRITICAL'?'bad':r.severity==='HIGH'?'warn':'neutral'}/></div><div><strong>{r.code}</strong><div className="muted">{r.description}</div></div></div>) : <p className="muted">No triggered rule in this demo case.</p>}</div></section></>
}
