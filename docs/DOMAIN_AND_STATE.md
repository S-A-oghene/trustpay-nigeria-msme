# Domain and State Reference

## Verification states

`VERIFIED`, `UNVERIFIED`, `UNKNOWN`, `MISMATCH`, `ADDITIONAL_VERIFICATION_REQUIRED`.

## Risk states

`CLEAR → WATCH → STEP_UP → REVIEW → RESTRICTED → RELEASED`.

## Payment states

`PAYMENT_INTENT_CREATED → PAYMENT_PENDING → PAYMENT_EVIDENCE_SUBMITTED → PAYMENT_PROCESSOR_CONFIRMED → PAYMENT_VERIFIED`, with failure/reversal/unknown/mismatch/expiry branches.

## Document states

`REQUESTED → OPENED → UPLOADED → RECEIVED → VALIDATING → VALIDATED → VERIFIED → ACCEPTED`, with rejection, expiry and cancellation branches.

## Transaction states

`DRAFT → CONFIRMED → AWAITING_PAYMENT → PAID → FULFILLING → DELIVERED → COMPLETE`, with cancellation/dispute branches.

Material commercial changes must be represented as a new order version/event rather than silent mutation.
