# V2 Release Chain Status

Last verified: 2026-09-20T00:12Z

| Release | State | Evidence / blocker |
|---|---|---|
| R0 | COMPLETE | Specification/branch execution baseline established. |
| R1 | IN EXECUTION | V2 CI workflow, commerce-control primitives, reconciliation, ledger balance invariant and term versioning are committed to branch `v2.0.0-execution-r1`. |
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

Current branch HEAD: `43a0d2399d357292c95ceba50c96dd78d91073e0`

Immediate parent of HEAD: `46f9e8767c179e7446a64ccfe5134894a7b779d4`

Branch comparison against `main`: ahead by 8 commits, behind by 0.

The branch contains `.github/workflows/ci-v2.yml`.

The V2 workflow performs checkout, Node 22 setup, `npm ci`, repository verification, typecheck, tests and build.

## Status evidence

The GitHub combined-status API currently reports the **Vercel** check as `success` for both the 46f9 and current 43a0 commits.

That status is evidence of a successful Vercel check; it is **not** by itself a claim that the application has passed the full V2 release gate or that production deployment is certified.

The connected GitHub workflow-run endpoint available in this execution environment did not return a corresponding Actions run for the commits at verification time, so GitHub Actions CI is not marked passed here.

## Local execution boundary

The execution container does not contain the installed npm dependency tree and could not resolve the npm registry. Therefore the dependency-backed `npm test` / `npm build` results are not claimed as passed locally.

Deterministic repository/core validation performed in the build environment is recorded separately in the build package evidence.

## Not claimed

No live database migration, live payment, live identity verification, regulated settlement, production smoke certification, or R13 production certification is claimed.

## Required continuation

Continue from R1. Advance R2-R13 only after their defined tests, cloud evidence, security checks and deployment/pilot gates are actually satisfied.
