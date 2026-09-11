# Checklist 12: UPI Payments & Webhook Reconciliation

## Goal
Implement UPI-first payment gateway abstraction with idempotent webhook reconciliation.

## Requirements
- [ ] PaymentGatewayAdapter interface supporting UPI Intent and QR generation
- [ ] Payment state machine: CREATED -> INITIATED -> PENDING -> SUCCESS -> FAILED
- [ ] Cryptographic webhook signature verification (HMAC SHA-256)
- [ ] Idempotent payment success handler appending PAYMENT_CREDIT to Khata

## Implementation
- [ ] Database/model
- [ ] Server-side logic
- [ ] UI
- [ ] Validation
- [ ] Error handling
- [ ] Tests
- [ ] Documentation

## Acceptance Criteria
- [ ] Duplicate payment webhooks cause zero double-crediting
- [ ] Client cannot mark payment successful without verified server webhook

## Verification
- [ ] Local test passed
- [ ] Build passed
- [ ] Relevant tests passed
- [ ] Manual verification passed

## Git
- Commit:
- Push:
- Branch:
