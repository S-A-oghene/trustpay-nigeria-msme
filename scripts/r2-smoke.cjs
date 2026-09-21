/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs')
const assert = require('node:assert/strict')

const sql = fs.readFileSync('supabase/migrations/20260921000000_r2_commercial_transactions.sql', 'utf8')
const schema = fs.readFileSync('supabase/schema.sql', 'utf8')

for (const name of ['agreements', 'commercial_transactions', 'transaction_parties', 'transaction_terms', 'transaction_line_items']) {
  assert.match(sql, new RegExp(`create\\s+table\\s+public\\.${name}`), `missing ${name}`)
  assert.match(schema, new RegExp(`create\\s+table\\s+public\\.${name}`), `${name} missing from consolidated schema`)
}
assert.match(sql, /transaction_party_exactly_one_identity/i)
assert.match(sql, /unique \(commercial_transaction_id, version\)/i)
assert.match(sql, /on conflict \(source_order_id\) do nothing/i)
assert.match(sql, /R2_COMPATIBILITY_BACKFILL/i)
assert.match(sql, /obligation_kind/i)
console.log('TrustPay R2 commercial transaction smoke: PASS')
