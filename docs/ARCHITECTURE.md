# TrustPay Architecture

## Domain flow

`Identity → Account → Order → Payment → Evidence → Reconciliation → Trust History`

Around it: `Chase → Watch → Resolve`.

## Authority boundaries

Human constitutional rules outrank security/legal controls, which outrank organization/domain/workflow decisions, which outrank agent/model/tool suggestions. Deterministic policy owns payment verification, permission, risk state transition and evidence status.

## Core services represented

Identity, Trading Identity, Account, Transaction/Order, Payment Intent, Payment Reconciliation, Evidence, Risk, Documents, Obligations, Disputes, Communications, Provider Adapters, Audit, Pricing/Usage, Tenant/Auth, Notification, Admin Command, Health/Dependency.

## Provider boundary

Provider-neutral interfaces live under `src/lib/server/providers`. Domain code only consumes normalized results. Paystack is the first live adapter because official documentation exposes initialize/verify transaction APIs and webhook signatures; it remains credential-gated.

## Persistence

The Supabase schema uses tenant-scoped relational tables with RLS. Audit records are append-first, with payload/previous-hash fields for integrity chaining. Public Trust Cards use a narrow `security definer` function rather than exposing private tables to anonymous queries.

## Demo Mode

The default experience uses deterministic in-memory demo state. This is intentionally separate from production state and visibly marked. A production deployment should set `NEXT_PUBLIC_DEMO_MODE=false` only after Supabase and provider configuration have been completed and smoke tested.
