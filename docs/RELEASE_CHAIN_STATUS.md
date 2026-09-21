# V2 Release Chain Status

Last recorded from the supplied R2 branch snapshot: 2026-09-21

| Release | State | Evidence / blocker |
|---|---|---|
| R0 | COMPLETE | Specification/branch execution baseline established. |
| R1 | FROZEN | The supplied R2 snapshot preserves the R1 initial migration byte-for-byte; R1 certification artifacts are not modified by R2 work. |
| R2 | IN EXECUTION | Source implementation and repository/schema checks prepared. Final gate still requires GitHub CI, actual Supabase migration evidence, Vercel deployment and browser smoke evidence. |
| R3 | BLOCKED | Requires verified AP/AR persistence and tests. |
| R4 | BLOCKED | Requires approval/segregation-of-duties evidence. |
| R5 | BLOCKED | Requires treasury/cash-position persistence and validation. |
| R6 | BLOCKED | Requires provider-connected evidence where applicable. |
| R7 | BLOCKED | Requires settlement-partner boundary and legal/commercial authorization. |
| R8 | BLOCKED | Requires API contract/build validation. |
| R9 | BLOCKED | Requires SDK/contract publication validation. |
| R10 | BLOCKED | Requires intelligence-layer validation. |
| R11 | BLOCKED | Requires observability/operations validation. |
| R12 | BLOCKED | Requires deployment and smoke-test evidence. |
| R13 | BLOCKED | Requires all preceding gates plus pilot/production authorization. |

## Supplied R2 snapshot evidence

- Package: corrected handoff derived from `trustpay-nigeria-msme-2.0.0-execution-r2.zip`
- Frozen R1 migration: `supabase/migrations/20260918000000_initial.sql`
- Frozen R1 migration SHA-256: `8f267533b8cbfcf67e0f6e06445fd5074ce415c90caf4569f9c9fb90823977ff`
- R2 migration: `supabase/migrations/20260921000000_r2_commercial_transactions.sql`
- R2 tables: `agreements`, `commercial_transactions`, `transaction_parties`, `transaction_terms`, `transaction_line_items`
- R2 schema/RLS adversarial smoke: PASS in the supplied build environment.
- Existing R1 schema/RLS adversarial smoke: PASS in the supplied build environment.
- Core TypeScript typecheck: PASS in the supplied build environment.
- Core compiled runtime smoke: PASS in the supplied build environment.

## Not yet claimed

No live Supabase migration, cloud CI completion, Vercel deployment, browser smoke against the connected deployment, provider-connected outcome, settlement custody or production certification is claimed from the supplied ZIP alone.
