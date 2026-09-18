# Data Dictionary

| Object | Required meaning | Sensitive? |
|---|---|---|
| PERSON | Individual identity record | Confidential/restricted fields only |
| TRADING_IDENTITY | Name/entity under which trade occurs | Public-safe display name plus internal state |
| PAYMENT_ACCOUNT | Receiving destination and holder relationship | Confidential |
| ORDER | Versioned commercial intent | Confidential |
| ORDER_VERSION | Immutable material terms snapshot | Confidential |
| PAYMENT_INTENT | Provider-bound payment attempt | Confidential |
| PAYMENT_EVENT | Provider event/evidence | Confidential |
| EVIDENCE | Source-backed claim/artifact record | Classification varies |
| DOCUMENT | Requested business artifact | Confidential/restricted |
| OBLIGATION | Time-bound/recurring business control | Internal |
| DISPUTE | Structured disagreement lifecycle | Confidential |
| RISK_EVENT | Deterministic machine-readable risk signal | Restricted/internal |
| COMMUNICATION_EVENT | Channel event with consent reference | Confidential |
| AUDIT_EVENT | Material state/action history | Restricted/internal |
| PROVIDER_CONNECTION | External dependency capability and health | Internal |
| COST_LEDGER | Direct and fallback cost event | Confidential |
| SUBSCRIPTION | Merchant commercial plan | Confidential |

Raw NIN/BVN values are intentionally absent from the normal business object model.
