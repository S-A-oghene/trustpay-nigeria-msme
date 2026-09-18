# TrustPay Nigeria MSME — Beginner Browser-Only Deployment

This guide assumes you do **not** use an IDE, local Node installation, Docker, local Git, a local database CLI or a terminal. The intended primary path is GitHub → Supabase → Vercel in the browser.

> **Current-UI note:** GitHub, Supabase and Vercel dashboards change over time. Button names/screens may differ from this document. Use the current labels shown by the services and verify each step before committing secrets.

## 1. Create a GitHub account

Use the GitHub website and sign in.

## 2. Create a repository in GitHub

Choose **New repository**. Give it a clear name such as `trustpay-nigeria-msme`. Keep it private while configuring production data and credentials.

## 3. Download and extract the TrustPay ZIP

Download the repository ZIP generated with this handoff and extract it on your computer. You do not need an IDE.

## 4. Upload files through GitHub

Open the repository → **Add file** → **Upload files**. Drag the extracted repository contents into the browser uploader. Commit to the default branch.

## 5. Create the Supabase project

Create a project using the Supabase dashboard. In the project's SQL Editor, paste and run `supabase/schema.sql`. Supabase's current Next.js guidance uses the `@supabase/ssr` package with cookie-based server-side auth and RLS.

## 6. Create the first user

Use Supabase Auth to enable the sign-in method you need and create an initial user. Add that user to a `tenant` and `membership` record using a controlled admin process. Do not paste real NIN/BVN values into ordinary chat or demo records.

## 7. Configure Vercel

Import the GitHub repository into Vercel. Use the framework's automatic Next.js detection. Add environment variables from `.env.example` in the Vercel project settings.

### Basic / Demo

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_DEMO_MODE=true`
- `NEXT_PUBLIC_CURRENCY=NGN`
- `NEXT_PUBLIC_LOCALE=en-NG`

### Production data

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only; do not expose to the browser)

### Payment provider

- `PAYMENT_PROVIDER=paystack`
- `PAYSTACK_SECRET_KEY`

Set the Paystack webhook URL to `/api/webhooks/paystack` and keep the webhook signing secret protected. The application verifies the `x-paystack-signature` HMAC before accepting an event.

## 8. First deployment

Deploy the Git-connected project. Open the deployed URL.

## 9. Run Demo Mode

Keep `NEXT_PUBLIC_DEMO_MODE=true` until the live setup is verified. Open `/demo` and confirm:

- merchant identity/registration/account evidence is visible;
- a personal receiving account is represented without being treated as fraud;
- a completed demo payment is explicitly marked simulated;
- the mismatch/risk case shows step-up/review behaviour;
- Trust Card opens without an app download;
- DocumentChaser shows the lifecycle;
- Obligation Watch shows due/expired/current cases.

## 10. Production smoke check

Before switching away from demo mode, verify:

1. homepage loads;
2. Supabase Auth sign-in works;
3. protected dashboard access is tenant-scoped;
4. public Trust Card only exposes public-safe data;
5. payment intent creation uses the configured provider;
6. provider verification controls the payment state;
7. duplicate/replay webhook events are idempotent;
8. no private document is publicly reachable;
9. account destination changes trigger the configured step-up path;
10. audit records are written and protected;
11. provider outage produces UNKNOWN/controlled fallback, never fake success;
12. legal/privacy texts have been reviewed by appropriate Nigerian counsel/compliance owners.

## 11. Configure production providers later

Identity, registry, messaging and protected-settlement connectors are intentionally adapter-based. Add one provider at a time, verify its current contract, test outage behaviour and record it in `docs/CURRENT_EXTERNAL_CLAIMS.md`.

## 12. WhatsApp fallback

A future WhatsApp adapter must remain optional. The same transaction/document/obligation event must remain deliverable via Web, email or SMS when configured. Do not make WhatsApp the system of record.

## 13. Rollback

Because Vercel is connected to GitHub, the simplest browser rollback is to revert the offending Git commit in GitHub and allow the connected deployment to rebuild. Do not roll back a security-sensitive database change blindly; use a reviewed migration/forward-fix procedure for persistent data.

## 14. Provider replacement

Change the configured provider after the new adapter passes contract, health, signature, reconciliation, failure and cost checks. Do not remove the old provider until historical references remain resolvable and a rollback path exists.

## 15. Troubleshooting

**The app says Supabase is not configured:** verify the Vercel environment variables and redeploy.  
**Payment provider is demo:** check `PAYMENT_PROVIDER` and `PAYSTACK_SECRET_KEY`.  
**Webhook is rejected:** verify the provider's exact raw-body signature mechanism and secret, then inspect the server logs without printing secrets.  
**Demo looks live:** this is a defect — simulated states must retain the `DEMO / SIMULATED` boundary.
