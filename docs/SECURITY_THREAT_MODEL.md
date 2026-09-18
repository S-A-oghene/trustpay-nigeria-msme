# Security / Threat Model

## Assets

Tenant records, authentication sessions, payment references, identity verification results, restricted evidence, private documents, audit history, provider credentials and business-control state.

## Main threats

1. Cross-tenant data access → RLS, membership checks, private storage.
2. Forged payment webhook → HMAC signature verification and idempotency key/event uniqueness.
3. Replay/duplicate event → provider event ID, payment reference uniqueness and workflow state checks.
4. Screenshot fraud → screenshot is evidence-submitted only, never authoritative verification.
5. Account destination hijack → Account Change Shield, step-up/re-authentication and auditable old/new destination records.
6. Public document leakage → private bucket, signed URL pattern, no public bucket.
7. Privilege escalation → server-side role/tenant authorization; high-impact four-gate policy.
8. Secret exposure → `.env` ignored, production keys server-only.
9. Malicious upload → size/MIME/ext validation and future malware-scanning adapter.
10. Provider outage → explicit UNKNOWN/fallback; no fabricated success.

## Web security controls

Secure headers and CSP are configured in `next.config.ts`. Public routes avoid privileged data. API responses use `no-store` where state is security-sensitive.

## Residual risks

A production deployment still requires an actual Supabase project review, storage-path policies tightened to the tenant convention, rate-limit infrastructure appropriate to traffic, dependency scanning, malware scanning, penetration testing, and legal/privacy review before handling regulated/high-sensitivity data.
