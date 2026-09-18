# API Contracts — v0.1

## `GET /api/health`

Returns platform/demo/provider readiness. No secrets.

## `GET /api/demo/verify?token=...&mode=success|mismatch|unknown`

Demo-only payment-state simulation. Every response is labelled `demo=true`.

## `GET /api/demo/document?token=...`

Returns the deterministic document lifecycle example.

## `POST /api/documents/upload`

Multipart: `token`, `file`. Server validates size/type, hashes the file and (production mode) persists it to the private Supabase bucket using a tenant-scoped path. It does not mark a document verified.

## `POST /api/webhooks/paystack`

Reads the raw request body and verifies `x-paystack-signature` with HMAC-SHA512 before accepting a provider event. The production state transition must add database-level event/reference idempotency before changing a payment to verified.
