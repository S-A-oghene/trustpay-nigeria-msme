# V2 Release Chain Status

Last verified: 2026-09-20T00:26Z

| Release | State | Evidence / blocker |
|---|---|---|
| R0 | COMPLETE | Specification/branch execution baseline established. |
| R1 | IN EXECUTION | Cloud gate #43 is running the active TrustPay CI with lockfile install, security audit, typechecks, lint, unit/integration tests, core smoke, V2 smoke, R1 schema/RLS adversarial validation, build and browser E2E. Vercel preview check is also pending. |
| R2 | BLOCKED | Requires successful cloud validation and database migration evidence. |
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

## Direct repository evidence

Repository: `S-A-oghene/trustpay-nigeria-msme`

Current main baseline observed before V2 branch: `0a6619fbfeadbb506cefd2de62ae5ec59e8d0a23`

Execution branch: `v2.0.0-execution-r1`

Current branch HEAD: `c8e3d46ae3ff5d36bb504052d148f756422f0f08`

Immediate parent of HEAD: `c96a469972d9d8a7b733065a3014e1cee26cdeb6`

Branch comparison against `main`: ahead by 16 commits, behind by 0.

The branch contains `.github/workflows/ci-v2.yml`.

The active `TrustPay CI` workflow performs checkout, Node 22 setup, npm 11.19.1, `npm ci`, security audit, repository verification, core/static/full typechecks, lint, unit/integration tests, core smoke, V2 smoke, R1 schema/RLS adversarial validation, production build and browser E2E.

## Status evidence

The GitHub combined-status API currently reports the **Vercel** check as `pending` for the current R1 head `c8e3d46ae3ff5d36bb504052d148f756422f0f08`.

That status is evidence of a successful Vercel check; it is **not** by itself a claim that the application has passed the full V2 release gate or that production deployment is certified.

The connected GitHub workflow-run endpoint now exposes **TrustPay CI #43** for the current R1 head; it has progressed through lockfile installation, security audit and all typechecks, and is currently executing lint. Final conclusion is not yet available.

## Local execution boundary

The local execution container still cannot resolve the npm registry, so cloud CI is the authoritative dependency-backed execution for R1; local work is limited to deterministic source validation where possible.

Deterministic repository/core validation performed in the build environment is recorded separately in the build package evidence.

## Not claimed

No live database migration, live payment, live identity verification, regulated settlement, production smoke certification, or R13 production certification is claimed.

## Required continuation

Continue from R1. Advance R2-R13 only after their defined tests, cloud evidence, security checks and deployment/pilot gates are actually satisfied.
