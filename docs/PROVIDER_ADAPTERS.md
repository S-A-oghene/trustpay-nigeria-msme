# Provider Adapters

## PaymentProviderAdapter

- `initialize(input)`
- `verify(reference)`
- `health()`

The Paystack implementation calls server-side initialize and verify endpoints and validates webhook signatures using the documented `x-paystack-signature` HMAC-SHA512 mechanism. It returns normalized TrustPay payment statuses.

## Future adapters

- `IdentityProviderAdapter`
- `BusinessRegistryProviderAdapter`
- `MessagingProviderAdapter`
- `StorageProviderAdapter`
- `NotificationProviderAdapter`
- `FraudSignalProviderAdapter`

Core business state must never import a provider-specific response shape.
