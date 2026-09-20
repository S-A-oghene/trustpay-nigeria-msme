export type SettlementState='NOT_READY'|'READY'|'PENDING'|'SETTLED'|'FAILED'
export type ReconciliationOutcome='MATCHED'|'PARTIAL'|'MISMATCH'|'MISSING'|'DUPLICATE'|'UNVERIFIED'
export type RiskState='CLEAR'|'WATCH'|'STEP_UP'|'REVIEW'|'RESTRICTED'|'RELEASED'
export interface TransactionTerms{version:number;amountMinor:number;currency:string;destinationRef:string;effectiveAt:string;immutableHash:string}
export interface TransactionRecord{id:string;tenantId:string;status:string;terms:TransactionTerms;settlement:SettlementState;reconciliation:ReconciliationOutcome;risk:RiskState}
export function assertBalanced(entries:Array<{debit:number;credit:number}>):void{const d=entries.reduce((n,e)=>n+e.debit,0),c=entries.reduce((n,e)=>n+e.credit,0);if(d!==c)throw new Error('LEDGER_NOT_BALANCED')}
export function reconcile(e:{amountMinor:number;currency:string;destinationRef:string},a:{amountMinor:number;currency:string;destinationRef:string}|null):ReconciliationOutcome{if(!a)return'MISSING';if(a.amountMinor===e.amountMinor&&a.currency===e.currency&&a.destinationRef===e.destinationRef)return'MATCHED';if(a.amountMinor===e.amountMinor&&a.currency===e.currency)return'PARTIAL';return'MISMATCH'}
export function paymentReadiness(t:TransactionRecord){if(t.reconciliation!=='MATCHED')return{ready:false,reason:'RECONCILIATION_NOT_MATCHED'};if(t.risk==='RESTRICTED'||t.risk==='REVIEW')return{ready:false,reason:'RISK_REVIEW_REQUIRED'};if(t.settlement==='FAILED')return{ready:false,reason:'SETTLEMENT_FAILED'};return{ready:true,reason:'READY'}}
export function nextTerms(c:TransactionTerms,p:Partial<Pick<TransactionTerms,'amountMinor'|'currency'|'destinationRef'>>,at:string):TransactionTerms{return{...c,...p,version:c.version+1,effectiveAt:at,immutableHash:'VERSIONED'}}
