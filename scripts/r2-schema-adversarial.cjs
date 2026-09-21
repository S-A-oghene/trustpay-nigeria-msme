/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs')
const crypto = require('node:crypto')
const assert = require('node:assert/strict')

const initialPath = 'supabase/migrations/20260918000000_initial.sql'
const schemaPath = 'supabase/schema.sql'
const r2MigrationPath = 'supabase/migrations/20260921000000_r2_commercial_transactions.sql'
const expectedInitialSha256 = '8f267533b8cbfcf67e0f6e06445fd5074ce415c90caf4569f9c9fb90823977ff'

const initial = fs.readFileSync(initialPath, 'utf8')
const schema = fs.readFileSync(schemaPath, 'utf8')
const r2 = fs.readFileSync(r2MigrationPath, 'utf8')

assert.equal(crypto.createHash('sha256').update(initial).digest('hex'), expectedInitialSha256, 'Frozen R1 migration was modified')
assert.ok(schema.startsWith(initial), 'Fresh-install schema must retain the frozen R1 schema verbatim as its prefix')

const requiredR2Tables = ['agreements', 'commercial_transactions', 'transaction_parties', 'transaction_terms', 'transaction_line_items']
for (const table of requiredR2Tables) {
  assert.match(schema, new RegExp(`create\\s+table\\s+public\\.${table}\\s*\\(`, 'i'), `missing R2 table: ${table}`)
  assert.match(schema, new RegExp(`alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`, 'i'), `R2 RLS not enabled: ${table}`)
  assert.match(r2, new RegExp(`create\\s+policy[^\\n]*on\\s+public\\.${table}`, 'i'), `R2 policy missing: ${table}`)
}

assert.match(r2, /source_order_id uuid unique references public\.orders\(id\) on delete set null/i)
assert.match(r2, /insert into public\.commercial_transactions[\s\S]*from public\.orders o[\s\S]*on conflict \(source_order_id\) do nothing/i)
assert.match(r2, /create table public\.transaction_terms[\s\S]*unique \(commercial_transaction_id, version\)/i)
assert.match(r2, /immutable_hash text not null/i)
assert.match(r2, /alter table public\.obligations[\s\S]*add column obligation_kind text not null default 'NON_MONEY'/i)
assert.match(r2, /obligations_money_fields_check/i)
assert.match(r2, /create index obligations_transaction/i)

// PostgreSQL CREATE POLICY permits at most one WITH CHECK clause per policy.
// The R2 migration must combine all insert invariants into that single clause.
for (const table of ['transaction_parties', 'transaction_terms', 'transaction_line_items']) {
  const needle = `create policy "tenant members insert ${table.replaceAll('_', ' ')}"`
  const start = r2.toLowerCase().indexOf(needle.toLowerCase())
  assert.notEqual(start, -1, `insert policy missing: ${table}`)
  const end = r2.indexOf(');', start) + 2
  const tail = r2.slice(start, end)
  const withCheckCount = (tail.match(/\bwith\s+check\b/gi) || []).length
  assert.equal(withCheckCount, 1, `insert policy must contain exactly one WITH CHECK: ${table}`)
}

for (const table of requiredR2Tables) {
  assert.doesNotMatch(r2, new RegExp(`create\\s+policy[^\\n]*on\\s+public\\.${table}[^\\n]*for\\s+(delete)`, 'i'), `R2 must not expose delete policy: ${table}`)
}

const r1Tables = ['orders', 'order_versions', 'payment_intents', 'payment_events', 'evidence', 'audit_events', 'disputes', 'communication_events', 'provider_connections', 'documents', 'obligations', 'idempotency_keys']
for (const table of r1Tables) {
  assert.match(schema, new RegExp(`create\\s+table\\s+public\\.${table}\\s*\\(`, 'i'), `R1 table disappeared: ${table}`)
}

assert.doesNotMatch(r2, /create\s+table\s+public\.(expected_events|expected_payments|payment_allocations|ledger_accounts|ledger_transactions|ledger_entries|settlements|bank_connections|cash_positions)\s*\(/i, 'R2 must not pull later release scope forward')
assert.doesNotMatch(r2, /create\s+table\s+public\.(api_keys|webhook_endpoints|sdk_clients)\s*\(/i, 'R2 must not pull API/SDK scope forward')

console.log(`TrustPay R2 schema/RLS adversarial validation: PASS`)
console.log(`R1 migration SHA-256 preserved: ${expectedInitialSha256}`)
console.log(`Validated ${requiredR2Tables.length} R2 tables, tenant policies, V1 order compatibility, immutable terms, obligation generalization and scope boundaries.`)
