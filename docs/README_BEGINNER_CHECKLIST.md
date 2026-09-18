# Beginner Release Checklist

Before declaring a live deployment complete:

- [ ] GitHub repository exists and is controlled by the operator.
- [ ] Supabase project created.
- [ ] `supabase/schema.sql` run successfully.
- [ ] Auth user and tenant membership created through a controlled process.
- [ ] Vercel environment variables set.
- [ ] Demo Mode tested before live providers.
- [ ] Live provider adapter selected and current provider terms/contracts reviewed.
- [ ] Webhook signature endpoint tested with provider test events.
- [ ] Payment verification tested against amount, currency and destination binding.
- [ ] RLS tested for cross-tenant denial.
- [ ] Private documents cannot be fetched without authorization.
- [ ] Legal/privacy/compliance review completed.
- [ ] Security scan/penetration test completed.
- [ ] Monitoring and incident contacts configured.
- [ ] Rollback process tested.
