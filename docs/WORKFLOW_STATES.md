# Workflow State Machines

## Transaction

`DRAFT → CONFIRMED → AWAITING_PAYMENT → PAID → FULFILLING → DELIVERED → COMPLETE`

Cancellation/dispute are explicit branches.

## Payment

`INTENT_CREATED → PENDING → EVIDENCE_SUBMITTED → PROCESSOR_CONFIRMED → VERIFIED` with failure/reversal/unknown/mismatch/expiry states.

## Document

`REQUESTED → OPENED → UPLOADED → RECEIVED → VALIDATING → VALIDATED → VERIFIED → ACCEPTED` with rejection/expiry/cancellation branches.

## Dispute

`OPEN → EVIDENCE_REQUESTED → EVIDENCE_RECEIVED → UNDER_REVIEW → RESOLVED → CLOSED`.

## Obligation

Status derives from configured dates and policy. The system distinguishes expiry date, recurring filing deadline, renewal window and document review date.

Every workflow needs idempotency, timeout/retry/compensation, correlation/causation and audit evidence in production.
