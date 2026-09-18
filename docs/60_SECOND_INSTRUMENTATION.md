# 60-Second Instrumentation

The roughly-one-minute Lagos payment-cycle observation is a UX hypothesis, not a guarantee.

Capture timestamps for:

- transaction start;
- order/payment-intent presentation;
- payment initiation;
- provider completion;
- TrustPay verification;
- merchant confirmation;
- abandonment;
- errors/timeouts;
- first useful action.

Report p50/p75/p90/p95 by payment method, device, value band, buyer/merchant type, connectivity conditions and provider. Never weaken security controls merely to meet a latency target.
