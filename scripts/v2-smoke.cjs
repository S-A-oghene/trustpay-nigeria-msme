const assert=require('node:assert/strict')
function reconcile(e,a){if(!a)return'MISSING';if(a.amountMinor===e.amountMinor&&a.currency===e.currency&&a.destinationRef===e.destinationRef)return'MATCHED';if(a.amountMinor===e.amountMinor&&a.currency===e.currency)return'PARTIAL';return'MISMATCH'}
function assertBalanced(es){const d=es.reduce((n,e)=>n+e.debit,0),c=es.reduce((n,e)=>n+e.credit,0);if(d!==c)throw new Error('LEDGER_NOT_BALANCED')}
assert.equal(reconcile({amountMinor:1000,currency:'NGN',destinationRef:'a'},{amountMinor:1000,currency:'NGN',destinationRef:'a'}),'MATCHED')
assert.equal(reconcile({amountMinor:1000,currency:'NGN',destinationRef:'a'},null),'MISSING')
assert.throws(()=>assertBalanced([{debit:1,credit:0}]),/LEDGER_NOT_BALANCED/)
assert.doesNotThrow(()=>assertBalanced([{debit:1,credit:0},{debit:0,credit:1}]))
console.log('TrustPay V2 commerce-control smoke: PASS')
