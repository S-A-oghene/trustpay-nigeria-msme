# Testing & Acceptance Report

## Current status

The repository includes unit-test targets and an E2E configuration. The current build container could not resolve npm packages because registry access timed out; therefore no claim is made that the full Next.js build or Playwright suite passed here.

## Mandatory adversarial matrix

| Test | Intended invariant | Demo/core coverage |
|---|---|---|
| Fake screenshot | Screenshot does not create PAYMENT_VERIFIED | Core state model / UI wording |
| Duplicate webhook | No duplicate side effect | Schema idempotency/event unique key |
| Wrong signature | Reject provider event | Paystack adapter |
| Wrong amount | MISMATCH, not verified | Risk engine + state |
| Wrong destination | MISMATCH/RESTRICTED | State + risk model |
| Expired intent | PAYMENT_EXPIRED | State machine |
| Delayed provider | UNKNOWN until authoritative result | State model |
| Personal account | Supported without fraud label | Demo Trust Card |
| Unregistered trader | Registration UNKNOWN/UNVERIFIED separate from identity | Demo Trust Card |
| Missing document | REQUESTED / evidence chase | Document model |
| Malicious upload | Block before acceptance | Upload boundary documented; scanner adapter remains deployment gate |
| Cross-tenant access | RLS prevents access | Supabase schema policies |
| Public document guessing | Private bucket | Schema/storage boundary |
| Audit deletion | Append-only policy direction | SQL insert-only policy |
| Demo leakage | Demo state remains labelled | `DemoBanner` + docs |

## Release gates

A — repository integrity: **PASS**.  
B — build: **BLOCKED/UNVERIFIED** because npm registry dependency resolution was unavailable in the build container.  
C — type safety: **PASS for core/static checks**; full dependency-backed `npm run typecheck` remains unverified.  
D — tests: **PASS for deterministic core smoke tests**; full Vitest/Playwright suites remain unverified without dependencies.  
E — security: **source controls present; external security test still required**.  
F — policy: **constitutional rules represented**.  
G — demo: **implemented deterministically**.  
H — deployment: **documentation prepared, not executed here**.  
I — smoke: **requires deployed Supabase/Vercel environment**.  
J — documentation: **implemented**.  
K — evidence: **truthfully documented in BUILD_STATE**.
