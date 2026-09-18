import { notFound } from 'next/navigation'
import { DemoBanner } from '@/components/DemoBanner'
import { StatusPill } from '@/components/StatusPill'
import { demoStore } from '@/lib/demo/store'
import { isProductionDataConfigured, appConfig } from '@/lib/config'
import { getProductionPublicTrustCard } from '@/lib/server/public-trust'

export default async function TrustCardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!process.env.NEXT_PUBLIC_DEMO_MODE || appConfig.demoMode) {
    const d = demoStore(); const tx = d.transactions.find(t => t.publicToken === token); if(!tx) notFound()
    const trader = d.tradingIdentities.find(x=>x.id===tx.tradingIdentityId)!; const person = d.people.find(x=>x.id===trader.personId)!; const account = d.accounts.find(x=>x.id===tx.paymentDestination)!
    const registrationEvidence = d.evidence.find(e=>e.type==='REGISTRY' && e.linkedEntityId===trader.id)
    return <TrustCardFrame demo trader={trader.displayName} personState={person.identityState} registrationState={trader.registrationState} registrationText={registrationEvidence?.claim || 'No registration evidence is established in this demo.'} accountState={account.verificationState} accountRelationship={account.holderRelationship} personalAccount={account.isPersonalAccount} reference={tx.orderReference} paymentState={tx.paymentStatus} verificationState={tx.verificationState} riskState={tx.riskState}/>
  }
  if (!isProductionDataConfigured()) notFound()
  const row = await getProductionPublicTrustCard(token); if(!row) notFound()
  return <TrustCardFrame trader={row.trading_identity} personState={row.identity_state} registrationState={row.registration_state} registrationText="Registry evidence is represented only by the configured production registry result." accountState={row.account_state} accountRelationship={row.account_holder_relationship} personalAccount={row.personal_account} reference={row.transaction_reference} paymentState={row.payment_state} verificationState={row.verification_state} riskState={row.risk_state}/>
}

function TrustCardFrame(p:{demo?:boolean;trader:string;personState:string;registrationState:string;registrationText:string;accountState:string;accountRelationship:string;personalAccount:boolean;reference:string;paymentState:string;verificationState:string;riskState:string}){
 return <>{p.demo&&<DemoBanner/>}<section className="section card"><div className="eyebrow">PUBLIC TRUST CARD · EVIDENCE VIEW</div><h1>{p.trader}</h1><p className="muted">This page does not certify that the trader is “safe”. It presents evidence within the scope of the configured checks and its limitations.</p><div className="grid"><div className="card"><h3>Individual identity</h3><StatusPill label={p.personState} tone={p.personState==='VERIFIED'?'good':'warn'}/><p className="muted">Identity state, not a character assessment.</p></div><div className="card"><h3>Business registration</h3><StatusPill label={p.registrationState} tone={p.registrationState==='VERIFIED'?'good':'neutral'}/><p className="muted">{p.registrationText}</p></div><div className="card"><h3>Receiving account</h3><StatusPill label={p.accountState} tone={p.accountState==='VERIFIED'?'good':'warn'}/><p>Relationship: {p.accountRelationship || 'UNKNOWN'} · Personal account: {p.personalAccount ? 'Yes' : 'No'}.</p></div></div></section><section className="section grid-2"><div className="card"><h2>Current transaction</h2><p><strong>Reference:</strong> {p.reference}</p><p><strong>Payment:</strong> {p.paymentState}</p><p><strong>Verification:</strong> <StatusPill label={p.verificationState} tone={p.verificationState==='VERIFIED'?'good':p.verificationState==='MISMATCH'?'bad':'warn'}/></p><p><strong>Risk:</strong> {p.riskState}</p></div><div className="card"><h2>Evidence limitations</h2><ul><li>{p.demo?'Demo provider results are simulated.':'Live results depend on the configured provider sources.'}</li><li>CAC registration and identity status are separate attributes.</li><li>A screenshot alone never authorizes PAYMENT_VERIFIED.</li><li>UNKNOWN and MISMATCH remain valid outcomes.</li></ul></div></section></>
}
