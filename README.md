# TrustPay Nigeria MSME

**Evidence and trust control for Nigerian commerce.**

TrustPay is built as a two-sided evidence, transaction-trust and business-control layer for Nigerian micro and small enterprises. Its durable path is:

`IDENTITY → ACCOUNT → ORDER → PAYMENT → EVIDENCE → RECONCILIATION → TRUST HISTORY`

with `CHASE → WATCH → RESOLVE` around it.

It does **not** hold customer funds in the base product, does not require CAC registration for participation, does not treat personal receiving accounts as fraud by default, and does not make WhatsApp the system of record.

## 1. What is in this repository?

- Next.js / TypeScript browser application.
- Deterministic Demo Mode with a complete Nigerian MSME sample dataset.
- Supabase Postgres/Auth/Storage schema and RLS policies.
- Provider-neutral payment adapter boundary.
- Isolated Paystack live adapter with server-side verification and webhook-signature validation.
- Evidence-first Trust Card and transaction surfaces.
- Account Change Shield risk state.
- DocumentChaser lifecycle.
- Obligation Watch / expiry model.
- Pricing and cost-engine primitives.
- Security threat model, external-claims register, change control and beginner deployment guide.
- CI configuration for dependency install, typecheck, lint, tests and build; this handoff omits a lockfile because registry resolution was unavailable in the build container.

## 2. Demo Mode

Demo Mode is the safest first-run path and requires no external credentials. Open `/demo` after deployment.

The deterministic dataset contains:

- an informal individual trader using a personal bank account;
- a registered small enterprise with registration evidence;
- a repeat buyer and a new buyer;
- a completed simulated payment;
- an adversarial mismatch/account-change/replay case;
- requested/uploaded/expired documents;
- due-soon/expired/current obligations;
- a resolved dispute represented in transaction history.

Every simulated result is visibly marked **DEMO / SIMULATED**. Demo data must never be interpreted as a live payment, live identity result, live registry result or live fraud finding.

## 3. Repository structure

```text
src/app/                 Next.js routes and browser surfaces
src/components/          Small reusable UI components
src/lib/domain/          Typed domain objects and deterministic policy
src/lib/demo/            Deterministic simulation data/store
src/lib/server/          Provider adapters, audit, server helpers
src/lib/supabase/        SSR clients and session refresh
supabase/schema.sql      Postgres tables, RLS, public Trust Card RPC
scripts/                 Browser/CI-independent repository checks
tests/                   Unit/E2E tests
```

## 4. Architecture

The architecture follows:

`Intent → Context → Plan → Orchestrate → Execute → Observe → Verify → Reconcile → Learn`

Core authority rules are deterministic. AI, if later introduced, may assist with classification/explanation/support, but it cannot authorize money movement, mark payment verified, alter policy, delete audit history, reveal restricted data, or grant privileged access.

## 5. Beginner browser-only deployment

See `docs/BEGINNER_BROWSER_DEPLOYMENT.md`. The intended path is:

`GitHub browser → Supabase dashboard → Vercel browser → Demo Mode → production smoke tests`

No local IDE, Docker, local database CLI, local Git or command-line development environment is required for deployment.

## 6. Supabase setup

Run `supabase/schema.sql` in the Supabase SQL Editor. The schema uses tenant-scoped RLS for operational records, a private document bucket, an append-first audit table, idempotency keys, provider event uniqueness and a narrow public Trust Card RPC.

For production auth, use Supabase Auth with `@supabase/ssr` cookie-based server-side sessions. The current Supabase guidance recommends the `proxy.ts` convention on Next.js 16 and `getClaims()` for server-side verification.

## 7. Environment variables

Start with `.env.example` and read `docs/ENVIRONMENT_VARIABLES.md`.

**Never** put real secrets in GitHub. `SUPABASE_SERVICE_ROLE_KEY`, payment provider secret keys and messaging credentials are server-only.

## 8. Production payment provider

The current repository includes a Paystack adapter. It is not enabled merely because the adapter exists. Set:

`PAYMENT_PROVIDER=paystack`

and provide `PAYSTACK_SECRET_KEY` only after the operator has verified the current merchant/account eligibility, contract, pricing, permitted payment methods, settlement behaviour, refunds/reversals and data-processing terms.

The adapter initializes a payment server-side and verifies transactions server-side by provider reference. The webhook route validates the provider signature before accepting an event. The database idempotency/event model is the required control point before a production state transition.

## 9. Trust and evidence rules

- A screenshot can be stored as supporting evidence but cannot by itself cause `PAYMENT_VERIFIED`.
- `UNKNOWN` and `MISMATCH` are valid states.
- Registration, identity, account relationship and transaction verification remain separate.
- Public pages expose public-safe facts only.
- No public blacklist is launched by default.
- A complaint does not automatically become a fraud finding.

## 10. Security

See `docs/SECURITY_THREAT_MODEL.md` and `docs/SECURE_UPLOADS.md`.

The repository includes secure headers/CSP, server-side payment secrets, RLS, private storage configuration, idempotency schema, HMAC webhook verification, and an append-first audit model. A real production security assessment, dependency scanning and penetration test remain deployment gates.

## 11. Current limitations

The build environment used for this handoff could not resolve npm packages because npm registry access timed out. Therefore the repository does **not** claim that `npm run typecheck`, `npm run test` or `npm run build` passed in this isolated environment. `BUILD_STATE.md` records the evidence.

The repository also does not claim live deployment, live payment credentials, live identity/registry connectors, WhatsApp delivery or regulated protected settlement. Those remain credential/provider/compliance dependent.

## 12. Troubleshooting

**Demo works but production data is missing:** configure Supabase and seed tenant/membership data before setting Demo Mode false.

**Payment says DEMO:** `PAYMENT_PROVIDER` is still `demo`, or the Paystack secret is absent.

**Webhook signature fails:** verify the raw request body, `x-paystack-signature` and provider secret; never print the secret.

**A public document link exposes private content:** stop the deployment and treat it as a security incident. Private document storage must remain non-public and tenant/token controlled.

**Provider is unavailable:** retain `PAYMENT_UNKNOWN`/safe fallback state. Never substitute an invented success result.

## 13. Rollback

Browser-first rollback is a reviewed Git revert through GitHub followed by the connected Vercel deployment. Treat database migrations separately; do not blindly revert a schema migration without a reviewed forward/fallback data plan.

## 14. Release boundary

This repository is an implementation package and deployment handoff. It is **not** a declaration that TrustPay itself has a Nigerian financial, escrow, tax, legal or other regulatory authorisation. See `docs/LEGAL_BOUNDARIES.md`, `docs/CURRENT_EXTERNAL_CLAIMS.md` and the explicit release gates in `docs/TESTING_ACCEPTANCE.md`.
