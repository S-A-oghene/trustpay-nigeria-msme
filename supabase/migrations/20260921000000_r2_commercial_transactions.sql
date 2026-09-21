-- TrustPay V2 R2 — commercial transaction generalization.
-- Additive only. The frozen R1 migration 20260918000000_initial.sql is intentionally untouched.
-- R2 introduces a generalized commercial transaction object while keeping V1 orders first-class.

create table public.agreements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  agreement_reference text not null,
  agreement_type text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','SUPERSEDED','CANCELLED','EXPIRED')),
  effective_at timestamptz,
  expires_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, agreement_reference)
);

create table public.commercial_transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  public_token text not null unique,
  transaction_reference text not null,
  transaction_type text not null check (transaction_type in ('BUY_SELL','SERVICE','B2B_PURCHASE','B2B_RECEIVABLE','RECURRING','CLAIM','REFUND','CONTRIBUTION','OTHER')),
  status public.tx_status not null default 'DRAFT',
  seller_person_id uuid references public.people(id),
  buyer_person_id uuid references public.people(id),
  trading_identity_id uuid references public.trading_identities(id),
  agreement_id uuid references public.agreements(id),
  source_order_id uuid unique references public.orders(id) on delete set null,
  current_terms_version integer not null default 1 check (current_terms_version > 0),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, transaction_reference)
);

create table public.transaction_parties (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  commercial_transaction_id uuid not null references public.commercial_transactions(id) on delete cascade,
  role text not null check (role in ('SELLER','BUYER','OTHER')),
  person_id uuid references public.people(id),
  trading_identity_id uuid references public.trading_identities(id),
  label text,
  created_at timestamptz not null default now(),
  constraint transaction_party_exactly_one_identity check ((person_id is not null) <> (trading_identity_id is not null)),
  unique (commercial_transaction_id, role)
);

create table public.transaction_terms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  commercial_transaction_id uuid not null references public.commercial_transactions(id) on delete cascade,
  version integer not null check (version > 0),
  product_description text not null,
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'NGN',
  payment_destination_id uuid references public.payment_accounts(id),
  effective_at timestamptz not null,
  changed_reason text,
  immutable_hash text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (commercial_transaction_id, version)
);

create table public.transaction_line_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  commercial_transaction_id uuid not null references public.commercial_transactions(id) on delete cascade,
  line_number integer not null check (line_number > 0),
  description text not null,
  quantity numeric(18,3) not null default 1 check (quantity > 0),
  unit_amount_minor bigint not null check (unit_amount_minor >= 0),
  line_total_minor bigint not null check (line_total_minor >= 0),
  currency text not null default 'NGN',
  created_at timestamptz not null default now(),
  unique (commercial_transaction_id, line_number)
);

-- Generalize the existing obligation object without creating a second obligation system.
alter table public.obligations
  add column obligation_kind text not null default 'NON_MONEY',
  add column commercial_transaction_id uuid references public.commercial_transactions(id) on delete set null,
  add column amount_minor bigint,
  add column currency text;

alter table public.obligations
  add constraint obligations_kind_check
  check (obligation_kind in ('MONEY','NON_MONEY'));

alter table public.obligations
  add constraint obligations_money_fields_check
  check (
    (obligation_kind = 'MONEY' and amount_minor is not null and amount_minor > 0 and currency is not null)
    or obligation_kind = 'NON_MONEY'
  );

-- V1 -> R2 compatibility mapping.
-- Each existing V1 order gets one generalized commercial transaction, preserving order/version data.
with inserted as (
  insert into public.commercial_transactions (
    tenant_id, public_token, transaction_reference, transaction_type, status,
    seller_person_id, buyer_person_id, trading_identity_id, source_order_id,
    current_terms_version, expires_at, created_at, updated_at
  )
  select
    o.tenant_id, o.public_token, o.order_reference, 'BUY_SELL', o.status,
    o.seller_person_id, o.buyer_person_id, o.trading_identity_id, o.id,
    o.current_version, o.expires_at, o.created_at, o.created_at
  from public.orders o
  on conflict (source_order_id) do nothing
  returning id, tenant_id, source_order_id
)
insert into public.audit_events (
  tenant_id, action, resource, timestamp, correlation_id,
  resulting_state, outcome, approval_status
)
select
  i.tenant_id,
  'R2_COMPATIBILITY_BACKFILL',
  'commercial_transaction:' || i.id::text,
  now(),
  'r2-order-backfill:' || i.source_order_id::text,
  'CREATED_FROM_V1_ORDER',
  'SUCCESS',
  'NOT_REQUIRED'
from inserted i;

insert into public.transaction_terms (
  tenant_id, commercial_transaction_id, version, product_description, amount_minor, currency,
  payment_destination_id, effective_at, changed_reason, immutable_hash
)
select
  o.tenant_id,
  ct.id,
  ov.version,
  ov.product_description,
  ov.amount_minor,
  ov.currency,
  ov.payment_destination_id,
  coalesce(ov.confirmed_at, o.created_at),
  ov.changed_reason,
  encode(digest(
    concat_ws('|', o.id::text, ov.version::text, ov.product_description, ov.amount_minor::text,
      ov.currency, coalesce(ov.payment_destination_id::text, '')),
    'sha256'
  ), 'hex')
from public.orders o
join public.commercial_transactions ct on ct.source_order_id = o.id
join public.order_versions ov on ov.order_id = o.id
on conflict (commercial_transaction_id, version) do nothing;

insert into public.transaction_parties (
  tenant_id, commercial_transaction_id, role, person_id, label
)
select o.tenant_id, ct.id, 'SELLER', o.seller_person_id, 'V1 order seller'
from public.orders o
join public.commercial_transactions ct on ct.source_order_id=o.id
where o.seller_person_id is not null
on conflict (commercial_transaction_id, role) do nothing;

insert into public.transaction_parties (
  tenant_id, commercial_transaction_id, role, person_id, label
)
select o.tenant_id, ct.id, 'BUYER', o.buyer_person_id, 'V1 order buyer'
from public.orders o
join public.commercial_transactions ct on ct.source_order_id=o.id
where o.buyer_person_id is not null
on conflict (commercial_transaction_id, role) do nothing;

insert into public.transaction_parties (
  tenant_id, commercial_transaction_id, role, trading_identity_id, label
)
select o.tenant_id, ct.id, 'OTHER', o.trading_identity_id, 'V1 trading identity'
from public.orders o
join public.commercial_transactions ct on ct.source_order_id=o.id
where o.trading_identity_id is not null
on conflict (commercial_transaction_id, role) do nothing;

-- Represent the current V1 order version as one first-class R2 line item.
insert into public.transaction_line_items (
  tenant_id, commercial_transaction_id, line_number, description, quantity,
  unit_amount_minor, line_total_minor, currency
)
select
  o.tenant_id,
  ct.id,
  1,
  ov.product_description,
  1,
  ov.amount_minor,
  ov.amount_minor,
  ov.currency
from public.orders o
join public.commercial_transactions ct on ct.source_order_id=o.id
join public.order_versions ov on ov.order_id=o.id and ov.version=o.current_version
on conflict (commercial_transaction_id, line_number) do nothing;

-- Associate existing obligations only when an application has an explicit transaction link.
-- Existing rows keep NON_MONEY semantics and remain valid.
drop policy if exists "tenant members write obligations" on public.obligations;
create policy "tenant members write obligations" on public.obligations
for all using (public.is_tenant_member(tenant_id))
with check (
  public.is_tenant_member(tenant_id)
  and (
    commercial_transaction_id is null
    or exists (
      select 1 from public.commercial_transactions ct
      where ct.id = commercial_transaction_id
        and ct.tenant_id = public.obligations.tenant_id
    )
  )
);

alter table public.agreements enable row level security;
alter table public.commercial_transactions enable row level security;
alter table public.transaction_parties enable row level security;
alter table public.transaction_terms enable row level security;
alter table public.transaction_line_items enable row level security;

create policy "tenant members read agreements" on public.agreements
for select using (public.is_tenant_member(tenant_id));
create policy "tenant members insert agreements" on public.agreements
for insert with check (public.is_tenant_member(tenant_id));
create policy "tenant members update agreements" on public.agreements
for update using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));

create policy "tenant members read commercial transactions" on public.commercial_transactions
for select using (public.is_tenant_member(tenant_id));
create policy "tenant members insert commercial transactions" on public.commercial_transactions
for insert with check (
  public.is_tenant_member(tenant_id)
  and (seller_person_id is null or exists (
    select 1 from public.people p where p.id=seller_person_id and p.tenant_id=public.commercial_transactions.tenant_id
  ))
  and (buyer_person_id is null or exists (
    select 1 from public.people p where p.id=buyer_person_id and p.tenant_id=public.commercial_transactions.tenant_id
  ))
  and (trading_identity_id is null or exists (
    select 1 from public.trading_identities ti where ti.id=trading_identity_id and ti.tenant_id=public.commercial_transactions.tenant_id
  ))
  and (agreement_id is null or exists (
    select 1 from public.agreements a where a.id=agreement_id and a.tenant_id=public.commercial_transactions.tenant_id
  ))
  and (source_order_id is null or exists (
    select 1 from public.orders o where o.id=source_order_id and o.tenant_id=public.commercial_transactions.tenant_id
  ))
);
create policy "tenant members update commercial transactions" on public.commercial_transactions
for update using (public.is_tenant_member(tenant_id)) with check (
  public.is_tenant_member(tenant_id)
);

create policy "tenant members read transaction parties" on public.transaction_parties
for select using (
  public.is_tenant_member(tenant_id)
  and exists (select 1 from public.commercial_transactions ct where ct.id=commercial_transaction_id and ct.tenant_id=public.transaction_parties.tenant_id)
);
create policy "tenant members insert transaction parties" on public.transaction_parties
for insert with check (
  public.is_tenant_member(tenant_id)
  and exists (select 1 from public.commercial_transactions ct where ct.id=commercial_transaction_id and ct.tenant_id=public.transaction_parties.tenant_id)
  and (person_id is null or exists (select 1 from public.people p where p.id=person_id and p.tenant_id=public.transaction_parties.tenant_id))
  and (trading_identity_id is null or exists (select 1 from public.trading_identities ti where ti.id=trading_identity_id and ti.tenant_id=public.transaction_parties.tenant_id))
);
create policy "tenant members update transaction parties" on public.transaction_parties
for update using (
  public.is_tenant_member(tenant_id)
  and exists (select 1 from public.commercial_transactions ct where ct.id=commercial_transaction_id and ct.tenant_id=public.transaction_parties.tenant_id)
) with check (
  public.is_tenant_member(tenant_id)
  and exists (select 1 from public.commercial_transactions ct where ct.id=commercial_transaction_id and ct.tenant_id=public.transaction_parties.tenant_id)
  and (person_id is null or exists (select 1 from public.people p where p.id=person_id and p.tenant_id=public.transaction_parties.tenant_id))
  and (trading_identity_id is null or exists (select 1 from public.trading_identities ti where ti.id=trading_identity_id and ti.tenant_id=public.transaction_parties.tenant_id))
);

create policy "tenant members read transaction terms" on public.transaction_terms
for select using (
  public.is_tenant_member(tenant_id)
  and exists (select 1 from public.commercial_transactions ct where ct.id=commercial_transaction_id and ct.tenant_id=public.transaction_terms.tenant_id)
);
create policy "tenant members insert transaction terms" on public.transaction_terms
for insert with check (
  public.is_tenant_member(tenant_id)
  and exists (select 1 from public.commercial_transactions ct where ct.id=commercial_transaction_id and ct.tenant_id=public.transaction_terms.tenant_id)
  and (payment_destination_id is null or exists (select 1 from public.payment_accounts pa where pa.id=payment_destination_id and pa.tenant_id=public.transaction_terms.tenant_id))
);
create policy "tenant members update transaction terms" on public.transaction_terms
for update using (
  public.is_tenant_member(tenant_id)
  and exists (select 1 from public.commercial_transactions ct where ct.id=commercial_transaction_id and ct.tenant_id=public.transaction_terms.tenant_id)
) with check (
  public.is_tenant_member(tenant_id)
  and exists (select 1 from public.commercial_transactions ct where ct.id=commercial_transaction_id and ct.tenant_id=public.transaction_terms.tenant_id)
  and (payment_destination_id is null or exists (select 1 from public.payment_accounts pa where pa.id=payment_destination_id and pa.tenant_id=public.transaction_terms.tenant_id))
);

create policy "tenant members read transaction line items" on public.transaction_line_items
for select using (
  public.is_tenant_member(tenant_id)
  and exists (select 1 from public.commercial_transactions ct where ct.id=commercial_transaction_id and ct.tenant_id=public.transaction_line_items.tenant_id)
);
create policy "tenant members insert transaction line items" on public.transaction_line_items
for insert with check (
  public.is_tenant_member(tenant_id)
  and exists (select 1 from public.commercial_transactions ct where ct.id=commercial_transaction_id and ct.tenant_id=public.transaction_line_items.tenant_id)
);
create policy "tenant members update transaction line items" on public.transaction_line_items
for update using (
  public.is_tenant_member(tenant_id)
  and exists (select 1 from public.commercial_transactions ct where ct.id=commercial_transaction_id and ct.tenant_id=public.transaction_line_items.tenant_id)
) with check (
  public.is_tenant_member(tenant_id)
  and exists (select 1 from public.commercial_transactions ct where ct.id=commercial_transaction_id and ct.tenant_id=public.transaction_line_items.tenant_id)
);

create index agreements_tenant_created on public.agreements(tenant_id,created_at desc);
create index commercial_transactions_tenant_created on public.commercial_transactions(tenant_id,created_at desc);
create index commercial_transactions_source_order on public.commercial_transactions(source_order_id);
create index transaction_parties_tenant_transaction on public.transaction_parties(tenant_id,commercial_transaction_id);
create index transaction_terms_tenant_transaction on public.transaction_terms(tenant_id,commercial_transaction_id,version desc);
create index transaction_line_items_tenant_transaction on public.transaction_line_items(tenant_id,commercial_transaction_id,line_number);
create index obligations_transaction on public.obligations(tenant_id,commercial_transaction_id);
