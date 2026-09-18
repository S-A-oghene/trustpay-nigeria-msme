create extension if not exists pgcrypto;

create type public.verification_state as enum ('VERIFIED','UNVERIFIED','UNKNOWN','MISMATCH','ADDITIONAL_VERIFICATION_REQUIRED');
create type public.risk_state as enum ('CLEAR','WATCH','STEP_UP','REVIEW','RESTRICTED','RELEASED');
create type public.payment_status as enum ('PAYMENT_INTENT_CREATED','PAYMENT_PENDING','PAYMENT_EVIDENCE_SUBMITTED','PAYMENT_PROCESSOR_CONFIRMED','PAYMENT_VERIFIED','PAYMENT_FAILED','PAYMENT_REVERSED','PAYMENT_UNKNOWN','PAYMENT_AMOUNT_MISMATCH','PAYMENT_DESTINATION_MISMATCH','PAYMENT_EXPIRED');
create type public.tx_status as enum ('DRAFT','CONFIRMED','AWAITING_PAYMENT','PAID','FULFILLING','DELIVERED','COMPLETE','CANCELLED','DISPUTED');
create type public.user_role as enum ('owner','manager','staff','reviewer','support','system','admin');
create type public.data_classification as enum ('PUBLIC','INTERNAL','CONFIDENTIAL','RESTRICTED');

create table public.tenants (
  id uuid primary key default gen_random_uuid(), name text not null, created_at timestamptz not null default now()
);
create table public.memberships (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null default 'staff',
  created_at timestamptz not null default now(),
  primary key (tenant_id,user_id)
);
create table public.people (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  display_name text not null, contact_masked text, identity_state public.verification_state not null default 'UNKNOWN',
  provider_ref text, classification public.data_classification not null default 'CONFIDENTIAL', created_at timestamptz not null default now()
);
create table public.trading_identities (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id), display_name text not null, identity_type text not null,
  registration_state public.verification_state not null default 'UNKNOWN', registry_ref text, created_at timestamptz not null default now()
);
create table public.payment_accounts (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  trading_identity_id uuid not null references public.trading_identities(id), bank_name text, masked_account text not null,
  holder_name text, holder_relationship text, verification_state public.verification_state not null default 'UNKNOWN',
  is_personal_account boolean not null default false, active boolean not null default true, changed_at timestamptz, created_at timestamptz not null default now()
);
create table public.orders (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  public_token text unique not null, seller_person_id uuid references public.people(id), buyer_person_id uuid references public.people(id),
  trading_identity_id uuid references public.trading_identities(id), order_reference text not null, status public.tx_status not null default 'DRAFT',
  current_version integer not null default 1, payment_destination_id uuid references public.payment_accounts(id),
  risk_state public.risk_state not null default 'CLEAR', verification_state public.verification_state not null default 'UNKNOWN', payment_status public.payment_status not null default 'PAYMENT_INTENT_CREATED', settlement_mode text not null default 'DIRECT_VERIFIED',
  expires_at timestamptz not null, created_at timestamptz not null default now()
);
create table public.order_versions (
  order_id uuid not null references public.orders(id) on delete cascade, version integer not null, product_description text not null,
  amount_minor bigint not null check (amount_minor > 0), currency text not null default 'NGN', payment_destination_id uuid references public.payment_accounts(id),
  confirmed_at timestamptz, changed_reason text, primary key(order_id,version)
);
create table public.payment_intents (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  order_id uuid not null references public.orders(id), provider text not null, provider_reference text, amount_minor bigint not null,
  currency text not null default 'NGN', status public.payment_status not null default 'PAYMENT_INTENT_CREATED',
  idempotency_key text unique not null, expires_at timestamptz, created_at timestamptz not null default now()
);
create table public.payment_events (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  payment_intent_id uuid not null references public.payment_intents(id), provider text not null, provider_event_id text not null, event_type text not null,
  observed_at timestamptz not null default now(), payload_hash text not null, previous_hash text, signature_valid boolean not null default false,
  amount_minor bigint, currency text, destination_ref text, raw_payload jsonb, unique(provider,provider_event_id)
);
create table public.evidence (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  type text not null, source_system text not null, source_reference text, captured_at timestamptz not null, observed_at timestamptz not null,
  artifact_hash text, verification_method text not null, verifier text, confidence numeric, integrity text not null,
  retention_class public.data_classification not null, linked_order_id uuid references public.orders(id), linked_entity_id uuid, claim text not null,
  status public.verification_state not null default 'UNKNOWN', created_at timestamptz not null default now()
);
create table public.audit_events (
  id uuid primary key default gen_random_uuid(), tenant_id uuid references public.tenants(id) on delete restrict,
  actor_user_id uuid references auth.users(id), action text not null, resource text not null, timestamp timestamptz not null default now(),
  correlation_id text not null, previous_state text, resulting_state text, evidence_ids uuid[] not null default '{}', outcome text not null,
  error text, approval_status text not null default 'NOT_REQUIRED', payload_hash text, previous_hash text
);
create table public.disputes (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  order_id uuid references public.orders(id), status text not null default 'OPEN', reason text not null, created_by uuid references auth.users(id),
  decision text, decision_reason text, decided_by uuid references auth.users(id), appeal_status text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.communication_events (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade, channel text not null,
  event_type text not null, provider text, provider_reference text, consent_reference text, status text not null default 'PENDING',
  created_at timestamptz not null default now()
);
create table public.provider_connections (
  id uuid primary key default gen_random_uuid(), tenant_id uuid references public.tenants(id) on delete cascade, capability text not null, provider text not null,
  mode text not null check (mode in ('DEMO','LIVE')), criticality text not null, health text not null default 'UNKNOWN', last_checked_at timestamptz, disabled boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);
create table public.cost_ledger (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade, category text not null, provider text,
  amount_minor bigint not null, currency text not null default 'NGN', effective_at timestamptz not null default now(), metadata jsonb not null default '{}'::jsonb
);
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade, plan_code text not null, status text not null default 'TRIAL',
  monthly_price_minor bigint not null default 0, included_trust_events integer not null default 0, starts_at timestamptz not null default now(), ends_at timestamptz
);
create table public.documents (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  public_token text unique not null, title text not null, requested_from text not null, reason text not null, status text not null default 'REQUESTED',
  due_at timestamptz, storage_path text, artifact_hash text, evidence_id uuid references public.evidence(id), created_at timestamptz not null default now()
);
create table public.obligation_templates (
  id uuid primary key default gen_random_uuid(), code text unique not null, name text not null, category text not null, jurisdiction text not null,
  issuer text, authority_url text, applicability_note text, reminder_days integer[] not null default '{90,60,30,14,7,3,0,-1}', effective_from timestamptz not null,
  effective_to timestamptz
);
create table public.obligations (

  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  template_id uuid references public.obligation_templates(id), name text not null, category text not null, jurisdiction text not null, issuer text,
  authority_url text, source_record_id text, effective_at timestamptz, due_at timestamptz, expiry_at timestamptz, renewal_window_days integer, status text not null default 'UNKNOWN', applicability text not null default 'UNKNOWN',
  last_checked_at timestamptz, last_verified_at timestamptz, legal_review_required boolean not null default false, retention_class public.data_classification not null default 'INTERNAL',
  reminder_policy_version text not null, created_at timestamptz not null default now()
);
create table public.evidence_links (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade, from_type text not null, from_id uuid not null, to_type text not null, to_id uuid not null, relationship text not null, created_at timestamptz not null default now()
);
create table public.account_change_events (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade, payment_account_id uuid references public.payment_accounts(id), old_destination text not null, new_destination text not null, initiator uuid references auth.users(id), changed_at timestamptz not null default now(), reason text, verification_state public.verification_state not null default 'ADDITIONAL_VERIFICATION_REQUIRED', approval_state text not null default 'PENDING', outcome text not null default 'STEP_UP_REQUIRED'
);
create table public.consents (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade, subject_id uuid, purpose text not null, channel text, status text not null, captured_at timestamptz not null default now(), withdrawn_at timestamptz
);
create table public.risk_events (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  order_id uuid references public.orders(id), code text not null, severity text not null, description text not null, rule_version text not null,
  triggered_at timestamptz not null default now(), resolved boolean not null default false
);
create table public.idempotency_keys (
  tenant_id uuid not null references public.tenants(id) on delete cascade, key text not null, operation text not null, request_hash text not null,
  response_json jsonb, created_at timestamptz not null default now(), primary key(tenant_id,key)
);

create or replace function public.is_tenant_member(target_tenant uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.memberships m where m.tenant_id = target_tenant and m.user_id = auth.uid());
$$;

alter table public.tenants enable row level security;
alter table public.memberships enable row level security;
alter table public.people enable row level security;
alter table public.trading_identities enable row level security;
alter table public.payment_accounts enable row level security;
alter table public.orders enable row level security;
alter table public.order_versions enable row level security;
alter table public.payment_intents enable row level security;
alter table public.payment_events enable row level security;
alter table public.evidence enable row level security;
alter table public.audit_events enable row level security;
alter table public.documents enable row level security;
alter table public.obligation_templates enable row level security;
alter table public.obligations enable row level security;
alter table public.risk_events enable row level security;
alter table public.evidence_links enable row level security;
alter table public.account_change_events enable row level security;
alter table public.consents enable row level security;
alter table public.disputes enable row level security;
alter table public.communication_events enable row level security;
alter table public.provider_connections enable row level security;
alter table public.cost_ledger enable row level security;
alter table public.subscriptions enable row level security;
alter table public.idempotency_keys enable row level security;

create policy "tenant members can read tenant" on public.tenants for select using (public.is_tenant_member(id));
create policy "memberships are self visible" on public.memberships for select using (user_id = auth.uid() or public.is_tenant_member(tenant_id));

-- Shared tenant pattern: every operational table is readable only to an authenticated member of that tenant.
create policy "tenant members read people" on public.people for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write people" on public.people for insert with check (public.is_tenant_member(tenant_id));
create policy "tenant members update people" on public.people for update using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members read trading identities" on public.trading_identities for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write trading identities" on public.trading_identities for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members read accounts" on public.payment_accounts for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write accounts" on public.payment_accounts for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members read orders" on public.orders for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write orders" on public.orders for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members read order versions" on public.order_versions for select using (exists(select 1 from public.orders o where o.id=order_id and public.is_tenant_member(o.tenant_id)));
create policy "tenant members write order versions" on public.order_versions for all using (exists(select 1 from public.orders o where o.id=order_id and public.is_tenant_member(o.tenant_id))) with check (exists(select 1 from public.orders o where o.id=order_id and public.is_tenant_member(o.tenant_id)));
create policy "tenant members read payments" on public.payment_intents for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write payments" on public.payment_intents for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members read payment events" on public.payment_events for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write payment events" on public.payment_events for insert with check (public.is_tenant_member(tenant_id));
create policy "tenant members read evidence" on public.evidence for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write evidence" on public.evidence for insert with check (public.is_tenant_member(tenant_id));
create policy "tenant members read audit" on public.audit_events for select using (public.is_tenant_member(tenant_id));
create policy "audit is append only" on public.audit_events for insert with check (tenant_id is null or public.is_tenant_member(tenant_id));
create policy "tenant members read documents" on public.documents for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write documents" on public.documents for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "obligation templates are readable" on public.obligation_templates for select using (auth.uid() is not null);
create policy "tenant members read obligations" on public.obligations for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write obligations" on public.obligations for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members read disputes" on public.disputes for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write disputes" on public.disputes for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members read communication" on public.communication_events for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write communication" on public.communication_events for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members read providers" on public.provider_connections for select using (tenant_id is null or public.is_tenant_member(tenant_id));
create policy "tenant members write providers" on public.provider_connections for all using (tenant_id is null or public.is_tenant_member(tenant_id)) with check (tenant_id is null or public.is_tenant_member(tenant_id));
create policy "tenant members read costs" on public.cost_ledger for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write costs" on public.cost_ledger for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members read subscriptions" on public.subscriptions for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write subscriptions" on public.subscriptions for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members read evidence links" on public.evidence_links for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write evidence links" on public.evidence_links for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members read account changes" on public.account_change_events for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write account changes" on public.account_change_events for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members read consents" on public.consents for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write consents" on public.consents for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant members read risk" on public.risk_events for select using (public.is_tenant_member(tenant_id));
create policy "tenant members write risk" on public.risk_events for insert with check (public.is_tenant_member(tenant_id));
create policy "tenant members use idempotency" on public.idempotency_keys for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));

-- Safe public trust-card function. Only selected public-safe fields are exposed by token.
create or replace function public.get_public_trust_card(p_token text)
returns table (
  trading_identity text,
  person_name text,
  identity_state public.verification_state,
  registration_state public.verification_state,
  account_state public.verification_state,
  account_holder_relationship text,
  personal_account boolean,
  transaction_reference text,
  payment_state public.payment_status,
  verification_state public.verification_state,
  risk_state public.risk_state,
  observed_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select ti.display_name, p.display_name, p.identity_state, ti.registration_state, pa.verification_state,
         pa.holder_relationship, pa.is_personal_account, o.order_reference,
         pi.status, o.verification_state, o.risk_state, greatest(o.created_at, pi.created_at)
  from public.orders o
  join public.trading_identities ti on ti.id=o.trading_identity_id
  join public.people p on p.id=ti.person_id
  left join public.payment_accounts pa on pa.id=o.payment_destination_id and pa.active=true
  left join public.payment_intents pi on pi.order_id=o.id
  where o.public_token=p_token
  order by pi.created_at desc nulls last
  limit 1;
$$;
grant execute on function public.get_public_trust_card(text) to anon, authenticated;

insert into storage.buckets (id,name,public) values ('private-documents','private-documents',false) on conflict (id) do nothing;
create policy "private docs tenant scoped" on storage.objects for select to authenticated using (bucket_id='private-documents' and case when (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$' then public.is_tenant_member((storage.foldername(name))[1]::uuid) else false end);
create policy "private docs tenant upload" on storage.objects for insert to authenticated with check (bucket_id='private-documents' and case when (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$' then public.is_tenant_member((storage.foldername(name))[1]::uuid) else false end);
-- Production deployments should tighten storage path conventions with tenant prefixes and signed URLs.

create index disputes_tenant_created on public.disputes(tenant_id,created_at desc);
create index communication_tenant_created on public.communication_events(tenant_id,created_at desc);
create index providers_capability on public.provider_connections(capability,health);
create index costs_tenant_effective on public.cost_ledger(tenant_id,effective_at desc);
create index subscriptions_tenant on public.subscriptions(tenant_id,status);
create index evidence_links_tenant on public.evidence_links(tenant_id,created_at desc);
create index account_changes_tenant on public.account_change_events(tenant_id,changed_at desc);
create index consents_tenant on public.consents(tenant_id,captured_at desc);
create index orders_tenant_created on public.orders(tenant_id,created_at desc);
create index orders_public_token on public.orders(public_token);
create unique index payment_provider_reference_unique on public.payment_intents(provider,provider_reference) where provider_reference is not null;
create index payment_events_tenant_observed on public.payment_events(tenant_id,observed_at desc);
create index audit_tenant_timestamp on public.audit_events(tenant_id,timestamp desc);
create index obligations_tenant_due on public.obligations(tenant_id,due_at);
create index risk_tenant_triggered on public.risk_events(tenant_id,triggered_at desc);
