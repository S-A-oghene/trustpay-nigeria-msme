/* eslint-disable @typescript-eslint/no-require-imports */
const fs=require('node:fs');
const assert=require('node:assert/strict');

const sql=fs.readFileSync('supabase/schema.sql','utf8');
const requiredTables=[
  'tenants','memberships','people','trading_identities','payment_accounts','orders','order_versions',
  'payment_intents','payment_events','evidence','audit_events','disputes','communication_events',
  'provider_connections','cost_ledger','subscriptions','documents','obligation_templates','obligations',
  'evidence_links','account_change_events','consents','risk_events','idempotency_keys'
];

for(const table of requiredTables){
  assert.match(sql,new RegExp('create\\s+table\\s+public\\.'+table+'\\s*\\(','i'),`missing table: ${table}`);
  assert.match(sql,new RegExp('alter\\s+table\\s+public\\.'+table+'\\s+enable\\s+row\\s+level\\s+security','i'),`RLS not enabled: ${table}`);
}

const policyExpectations={
  people:'public\\.is_tenant_member\\(tenant_id\\)',
  trading_identities:'public\\.is_tenant_member\\(tenant_id\\)',
  payment_accounts:'public\\.is_tenant_member\\(tenant_id\\)',
  orders:'public\\.is_tenant_member\\(tenant_id\\)',
  order_versions:'public\\.is_tenant_member\\(o\\.tenant_id\\)',
  payment_intents:'public\\.is_tenant_member\\(tenant_id\\)',
  payment_events:'public\\.is_tenant_member\\(tenant_id\\)',
  evidence:'public\\.is_tenant_member\\(tenant_id\\)',
  audit_events:'public\\.is_tenant_member\\(tenant_id\\)',
  documents:'public\\.is_tenant_member\\(tenant_id\\)',
  obligations:'public\\.is_tenant_member\\(tenant_id\\)',
  disputes:'public\\.is_tenant_member\\(tenant_id\\)',
  communication_events:'public\\.is_tenant_member\\(tenant_id\\)',
  provider_connections:'public\\.is_tenant_member\\(tenant_id\\)',
  cost_ledger:'public\\.is_tenant_member\\(tenant_id\\)',
  subscriptions:'public\\.is_tenant_member\\(tenant_id\\)',
  evidence_links:'public\\.is_tenant_member\\(tenant_id\\)',
  account_change_events:'public\\.is_tenant_member\\(tenant_id\\)',
  consents:'public\\.is_tenant_member\\(tenant_id\\)',
  risk_events:'public\\.is_tenant_member\\(tenant_id\\)',
  idempotency_keys:'public\\.is_tenant_member\\(tenant_id\\)',
};
assert.match(sql,/create\\s+policy\s+"tenant members can read tenant"\s+on\s+public\.tenants\s+for\s+select\s+using\s+\(public\.is_tenant_member\(id\)\)/i);
assert.match(sql,/create\\s+policy\s+"memberships are self visible"\s+on\s+public\.memberships\s+for\s+select\s+using\s+\(user_id = auth\.uid\(\) or public\.is_tenant_member\(tenant_id\)\)/i);
for(const [table,needle] of Object.entries(policyExpectations)){
  assert.match(sql,new RegExp('create\\s+policy[^\\n]*on\\s+public\\.'+table+'[^\\n]*'+needle,'i'),`tenant isolation policy missing: ${table}`);
}

assert.match(sql,/create\s+or\s+replace\s+function\s+public\.is_tenant_member\(target_tenant\s+uuid\)[\s\S]*?security\s+definer/i);
assert.match(sql,/set\s+search_path\s*=\s*public/i);

assert.match(sql,/create\s+or\s+replace\s+function\s+public\.get_public_trust_card\(p_token\s+text\)/i);
assert.match(sql,/grant\s+execute\s+on\s+function\s+public\.get_public_trust_card\(text\)\s+to\s+anon,\s*authenticated/i);
assert.doesNotMatch(sql,/get_public_trust_card[\s\S]*?raw_payload/i,'public Trust Card must not expose raw provider payloads');
assert.doesNotMatch(sql,/get_public_trust_card[\s\S]*?storage_path/i,'public Trust Card must not expose private storage paths');

assert.match(sql,/create\s+table\s+public\.payment_events[\s\S]*?unique\(provider,provider_event_id\)/i);
assert.match(sql,/create\s+table\s+public\.idempotency_keys[\s\S]*?primary\s+key\(tenant_id,key\)/i);

const auditSection=sql.match(/create\s+table\s+public\.audit_events[\s\S]*?(?=create\s+table\s+public\.disputes)/i)?.[0]??'';
assert.match(auditSection,/correlation_id\s+text\s+not\s+null/i);
assert.match(sql,/create\s+policy\s+"audit is append only"\s+on\s+public\.audit_events\s+for\s+insert/i);
assert.doesNotMatch(sql,/create\s+policy[^\n]*on\s+public\.audit_events\s+for\s+(update|delete)/i,'audit table must not expose update/delete RLS policies');

assert.match(sql,/insert\s+into\s+storage\.buckets\s*\(id,name,public\)\s*values\s*\('private-documents','private-documents',false\)/i);
assert.match(sql,/create\s+policy\s+"private docs tenant scoped"\s+on\s+storage\.objects\s+for\s+select\s+to\s+authenticated/i);
assert.match(sql,/create\s+policy\s+"private docs tenant upload"\s+on\s+storage\.objects\s+for\s+insert\s+to\s+authenticated/i);

console.log('TrustPay R1 schema/RLS adversarial validation: PASS');
console.log(`Validated ${requiredTables.length} tables, tenant isolation policy coverage, public RPC boundaries, idempotency/uniqueness controls, audit append policy, and private storage.`);
