# TrustPay V2 Execution Status

Repository: S-A-oghene/trustpay-nigeria-msme
Execution branch: `v2.0.0-execution-r2`

## R2 implementation status in this snapshot

R2 source implementation is prepared in the corrected handoff snapshot as an additive commercial-control-plane layer:

- generalized `commercial_transactions` object;
- `transaction_parties`, `transaction_terms` and `transaction_line_items`;
- `agreements` container for commercial terms;
- versioned immutable transaction terms with deterministic hashes;
- existing V1 `orders` preserved as first-class records;
- deterministic V1 order → commercial transaction compatibility mapping;
- existing obligations generalized with explicit `MONEY` / `NON_MONEY` semantics;
- tenant-scoped RLS policies for all new operational tables;
- R2 adversarial schema checks and deterministic domain tests;
- minimal read-only commercial transaction browser surface.

## Deliberately not in R2

Expected payments, expected events, payment allocation, reconciliation persistence, ledger, AP/AR automation, treasury, provider expansion, conditional settlement/custody, public API/SDK and intelligence expansion remain later release scope.

## Verification boundary

This branch snapshot has been prepared from the repository files supplied for R2. Cloud execution, the actual Supabase project's migration result, Vercel deployment, browser smoke in the connected environment and final R2 certification are evidence-gated and must not be claimed until they are observed.


## R2 GATE B SCOPE CHANGE CONTROL — CC-R2-001

**Decision date:** 2026-09-29
**Release:** `v2.0.0-execution-r2`
**Controlling baseline:** TrustPay Nigeria MSME Master Build Commercial Manual v2.1.0, Gate B / §41.2 and Appendix J.12 / Appendix L.

### Decision

R2 is formally scoped as the **Gate B commercial-transaction foundation** comprising:

1. `commercial_transactions` without breaking `orders`;
2. versioned agreements / terms;
3. generalized MONEY / NON_MONEY obligations.

The following master Gate B capabilities are explicitly **deferred from R2**:

4. expected events;
5. expected payments;
6. domain-event envelope and replay discipline.

### Reason

The current R2 implementation was deliberately prepared around the first three Gate B capabilities and their supporting tenant-scoped commercial-control structures. Pulling the remaining three capabilities into R2 at this point would expand the release beyond its validated implementation boundary and would conflict with the manual's staged migration and dependency discipline.

This change-control decision preserves the master manual. It does not delete or silently rewrite the remaining Gate B requirements.

### Certification treatment

R2 must **not** be described as "Gate B complete".

The compliant release description is:

> **R2 commercial-transaction foundation validated against the approved R2 scope.**

The remaining Gate B capabilities remain controlled future implementation requirements.

### Evidence retained for R2

* R2 branch: `v2.0.0-execution-r2`
* Latest validated application correction: commit `c6f50ec`
* R2 CI / build / test evidence supplied by the project owner
* R2 Playwright public-smoke evidence supplied by the project owner
* All five R2 commercial-control tables present
* RLS enabled on all five R2 tables
* SELECT / INSERT / UPDATE coverage on all five R2 tables
* No DELETE policies on the five R2 tables
* `is_tenant_member(uuid)` authorization helper present
* `tenants`, `memberships`, and `people` protected by RLS
* Required generalized obligation columns present
* No later-release tables found
* User A and User B tenant-scoped verification completed according to the controlled browser sequence

### V1 compatibility evidence qualification

The live database contained **zero rows in `orders`** at verification time.

Therefore the V1 compatibility evidence is recorded precisely as:

> No existing V1 orders were present to exercise a live V1→R2 mapping. The compatibility query returned zero unmapped orders and the duplicate `source_order_id` query returned zero duplicate mappings.

This must not be represented as evidence that a non-empty V1 order population was successfully migrated.

### Follow-on requirement

Before any later release claims the full Gate B definition complete, the project must implement and validate:

* expected events;
* expected payments;
* domain-event envelope and replay discipline;

or create a subsequent explicit change-control decision that revises their release mapping.

### Guardrails

Do not create later-release tables inside R2 merely to close this documentation discrepancy.

Do not modify or retarget `v2.0.0-r1`.

Do not weaken RLS.

Do not expose the service-role credential.

Do not claim national-scale production readiness or full Gate B completion from this R2 evidence.

**Status: APPROVED R2 SCOPE REVISION — Gate B foundation only.**
