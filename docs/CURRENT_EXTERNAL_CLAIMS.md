# Current External Claims Register

Checked: **2026-09-18**

| Claim | Source | Status / boundary | Reverify |
|---|---|---|---|
| Next.js 16 renamed `middleware` to `proxy`; 16.3.3 is described by Next.js as Active LTS in the August 2026 security release notice. | https://nextjs.org/docs/app/api-reference/file-conventions/proxy ; https://nextjs.org/blog | **Verified at check date**. Repository uses `proxy.ts` and pins 16.3.3. | On each framework upgrade |
| Supabase's current Next.js SSR guidance uses `@supabase/ssr`, cookies and `getClaims()` for server-side verification. | https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs ; https://supabase.com/nextjs | **Verified at check date**. | On dependency/auth upgrades |
| Paystack supports transaction initialize/verify and webhook signature validation using HMAC-SHA512 with the `x-paystack-signature` header. | https://paystack.com/docs/api/transaction/ ; https://paystack.com/docs/payments/webhooks/ | **Verified at check date**. Live use still requires merchant account, credentials and current commercial/compliance review. | Before production launch and provider changes |
| Paystack payment channels include cards and Nigerian options including bank-related methods/USSD where supported; feature availability is account/country dependent. | https://paystack.com/docs/payments/payment-channels/ | **Verified at check date**, subject to provider availability. | Before enabling each channel |
| CBN's published payment-service-provider list includes Paystack Payment Limited under Switching & Processing. | https://www.cbn.gov.ng/PaymentsSystem/PSPs.html | **Source-listed, but not treated as a permanent licensing guarantee for every product configuration.** Confirm current licence/status and permitted activity before production. | Before launch and annually |
| CAC provides company registration through its digital Company Registration Portal and publishes registration services. | https://cac.gov.ng/services/company-registration | **Verified as a public registry/service description, not a guarantee that a public API is available to TrustPay.** | Before registry automation |
| Current Nigerian privacy obligations must be mapped to applicable law/guidance. | https://ndpc.gov.ng/ | **Not hard-coded as legal advice.** Requires legal/compliance review and current guidance check before production. | Before launch / material legal change |

## Claims deliberately not hard-coded

- Current WhatsApp pricing/policies.
- Current KYC/KYB provider prices.
- Current CAC API access or search limits.
- Current tax rules.
- Current CBN sandbox/licensing requirements for any TrustPay-specific activity.
- Any statement that TrustPay itself is licensed to hold funds, provide payment services, operate escrow, or give legal/tax advice.
- Any “seller is safe” or “merchant is not fraudulent” statement.
