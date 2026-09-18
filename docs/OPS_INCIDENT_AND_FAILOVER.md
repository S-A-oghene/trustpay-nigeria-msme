# Operations / Incident & Failover

Universal recovery:

`DETECT → CLASSIFY → CONTAIN → PRESERVE EVIDENCE → LAST GOOD → PROPOSE → POLICY CHECK → BOUNDED RECOVERY → VERIFY → CLOSE/ESCALATE`

Provider outages must produce explicit health state and controlled fallback. Payment verification must fail closed for the affected high-impact action; the rest of the dashboard should remain usable.

## Provider shock cases

- API outage/rate limiting → `PAYMENT_UNKNOWN`, retry with bounded backoff, reconcile after recovery.
- Webhook delay → do not invent success; verify by provider reference when permitted.
- Webhook replay → idempotency key/provider event uniqueness.
- Account suspension → disable adapter, keep historical provider references, switch only through approved configuration.
- Pricing/capability change → update dependency register and cost ledger; re-run contract tests.
- WhatsApp unavailable → web/email/SMS route remains primary.
