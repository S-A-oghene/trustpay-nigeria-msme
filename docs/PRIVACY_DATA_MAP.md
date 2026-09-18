# Privacy / Data Purpose Map

| Data class | Example | Purpose | Default exposure |
|---|---|---|---|
| PUBLIC | trading display name, public-safe state | Trust Card | public-safe only |
| INTERNAL | workflow state, provider health | operations | tenant/reviewer |
| CONFIDENTIAL | contacts, transaction records | commerce control | tenant scoped |
| RESTRICTED | raw identity credentials, fraud/security data, provider secrets | high-risk verification/security | privileged server only |

Raw NIN/BVN values are not modelled as ordinary domain fields. Prefer provider/result references. Retention and deletion must be configured for the actual regulatory purpose and contract.

Legal/privacy documents in this repository are implementation boundaries, not legal advice.
