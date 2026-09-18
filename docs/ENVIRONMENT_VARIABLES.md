# Environment Variables

| Name | Required? | Purpose | Obtain from |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Basic | Canonical application URL | Vercel project domain |
| `NEXT_PUBLIC_DEMO_MODE` | Basic | Demo/production boundary | Set by operator |
| `NEXT_PUBLIC_SUPABASE_URL` | Production data | Supabase project URL | Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production data | Browser-safe Supabase key | Supabase project Connect/API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin/server features | Server-only privileged Supabase operations | Supabase project API settings |
| `PAYMENT_PROVIDER` | Payments | `demo` or configured live adapter | Operator |
| `PAYSTACK_SECRET_KEY` | Paystack | Server-side API credential | Paystack Dashboard |
| `PAYSTACK_WEBHOOK_SECRET` | Optional/provider-specific | Reserved secret if configured separately | Paystack/controlled deployment |
| `IDENTITY_PROVIDER` | Identity | `demo` until a provider is selected | Operator |
| `IDENTITY_PROVIDER_API_KEY` | Identity | Provider credential | Selected provider |
| `REGISTRY_PROVIDER` | Registry | `demo` until a provider is selected | Operator |
| `REGISTRY_PROVIDER_API_KEY` | Registry | Provider credential | Selected registry source |
| `MESSAGING_PROVIDER` | Messaging | Channel adapter selection | Operator |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp | Server-side Meta credential | Meta/WhatsApp Business setup |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp | WhatsApp sender identity | Meta/WhatsApp Business setup |
| `WHATSAPP_VERIFY_TOKEN` | WhatsApp | Webhook verification | Operator |
| `SMS_PROVIDER_API_KEY` | Optional | SMS adapter | Selected provider |
| `EMAIL_PROVIDER_API_KEY` | Optional | Email adapter | Selected provider |
| `DOCUMENT_MAX_BYTES` | Basic | Upload size policy | Operator/security policy |
| `DOCUMENT_SCAN_PROVIDER` | Optional | Malware scanning adapter | Selected provider |
| `DOCUMENT_SCAN_PROVIDER_API_KEY` | Optional | Scanner credential | Selected provider |
| `ADMIN_EMAILS` | Admin | Controlled admin allow-list/config | Organization |
| `CRON_SHARED_SECRET` | Operations | Protected job trigger | Vercel/hosted secret setting |

Never commit real values. Never log raw secrets.
