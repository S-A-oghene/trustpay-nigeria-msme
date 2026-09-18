# External Dependency Register

| Dependency | Criticality | Owned by TrustPay? | Failure fallback | Switch path |
|---|---|---|---|---|
| Supabase Postgres/Auth/Storage | High | No | Demo Mode for evaluation; controlled maintenance for production | Managed migration/provider abstraction where practical |
| Paystack | High for live payments | No | Demo adapter / `PAYMENT_UNKNOWN` | Adapter registry |
| CAC / registry source | Medium | No | UNKNOWN + human verification | Registry adapter |
| Identity provider | Medium/High depending tier | No | Progressive verification / UNKNOWN | Identity adapter |
| WhatsApp | Low/Medium | No | Web/email/SMS | Notification channel adapter |
| Email/SMS | Low | No | Browser notifications / manual operations | Notification adapter |
| Malware scanner | Medium | No | Quarantine / manual review | Storage/security adapter |
| Vercel | High for hosting | No | Git rollback / maintenance | Git-connected deployment |

Provider health and last verification date should be stored as operational data before production use.
