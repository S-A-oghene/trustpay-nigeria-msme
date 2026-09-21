# Changelog

## 0.1.0 — 2026-09-18

- Created TrustPay Nigeria MSME repository from the supplied Master Build Prompt.
- Added deterministic Demo Mode and demo dataset.
- Added evidence-first domain types and transition rules.
- Added Supabase schema, RLS, private storage bucket and safe public Trust Card function.
- Added isolated Demo and Paystack payment adapters.
- Added Paystack webhook HMAC-SHA512 verification boundary.
- Added deterministic risk rules and Account Change Shield state support.
- Added Trust Card, Transaction Control, Dashboard, DocumentChaser and Obligation Watch surfaces.
- Added beginner browser deployment documentation.
- Added external claim register and change-control register.

- Hardened live payment-intent initialization with authentication, role checks, order-version binding and idempotency persistence.
- Hardened Paystack reconciliation with provider-event fallback hashing, authoritative re-verification and order/payment state updates.
- Added provider-reference uniqueness, tenant-safe production dashboard/obligation/dispute reads, and role-gated Central Command.
- Converted demo verification from state-changing GET to POST and tightened live/demo separation.
- Added baseline in-process rate limiting, same-origin checking for authenticated payment writes and declared-MIME/content-signature validation for uploads.
- CI now includes dependency vulnerability scanning and Chromium E2E smoke execution on a connected runner.

## 2.0.0-r2 — 2026-09-21

- Corrected the R2 Supabase policy definitions so each INSERT policy has one consolidated `WITH CHECK` clause; frozen R1 migration remains unchanged.

- Added generalized commercial transactions while retaining V1 orders as first-class records.
- Added agreements, transaction parties, versioned immutable transaction terms and transaction line items.
- Added deterministic V1 order → commercial transaction compatibility backfill with audit records.
- Generalized existing obligations with explicit MONEY / NON_MONEY semantics and optional transaction linkage.
- Added tenant-scoped R2 RLS policies with no R2 delete policies for commercial-control history tables.
- Added R2 schema/domain adversarial checks and a browser-visible commercial transaction surface.
- Added a dedicated R2 CI workflow without changing the frozen R1 workflow or initial migration.
