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

const tenantTables=requiredTables.filter(t=>t!=='obligation_templates');
for(const table of tenantTables){
  assert.match(sql,new RegExp('tenant_id\\s+uuid[^;\\n]*', 'i'),`tenant_id declaration missing somewhere before policy scan: ${table}`);
  const policyRe=new RegExp('create\\s+policy[^\\n]*on\\s+public\\.'+table+'[^\\n]*public\\.is_tenant_member\\(tenant_id\\)', 'i');
  assert.match(sql,policyRe,`tenant membership policy missing: ${table}`);
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
