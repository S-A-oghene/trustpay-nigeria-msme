# Acceptance Matrix

| Capability | Acceptance criterion | Evidence location | Status |
|---|---|---|---|
| Trust Card | Public page shows evidence attributes and limitations | `src/app/trust/[token]/page.tsx` | Implemented |
| Payment verification | Authoritative result controls verification state | `src/lib/server/providers/*`, state model | Implemented source |
| Screenshot handling | Never directly grants payment verification | state/domain docs | Implemented |
| Account Change Shield | Change represented and risk/step-up state available | `risk.ts`, data model | Implemented source |
| Fraud engine | Deterministic rules | `risk.ts` | Implemented |
| DocumentChaser | Browser link + distinct validation/verification states | `docs/[token]` | Implemented demo |
| Obligation Watch | Due/expiry/reminder model | schema + page | Implemented demo |
| Disputes | Dispute status exists and evidence can attach | transaction/evidence/audit model | Partial; persistence extension remains for full packet UI |
| RLS | Tenant-scoped policies | `supabase/schema.sql` | Implemented source |
| Audit | Append-first durable model | `audit_events` SQL + hash helper | Implemented source |
| Idempotency | Key table + provider event uniqueness | `idempotency_keys`, payment_events | Implemented source |
| Beginner deployment | Browser-only path documented | `docs/BEGINNER_BROWSER_DEPLOYMENT.md` | Implemented |
| Build | Next build pass | `BUILD_STATE.md` | Blocked by package registry timeout in build container |
