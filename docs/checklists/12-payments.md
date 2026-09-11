# Checklist 12: UPI Payments & Webhook Reconciliation

## Goal
Implement UPI-first payment gateway abstraction with idempotent webhook reconciliation.

## Requirements
- [x] PaymentGatewayAdapter interface supporting UPI Intent and QR generation
- [x] Payment state machine: CREATED -> INITIATED -> PENDING -> SUCCESS -> FAILED
- [x] Cryptographic webhook signature verification (HMAC SHA-256)
- [x] Idempotent payment success handler appending PAYMENT_CREDIT to Khata

## Implementation
- [x] Database/model
- [x] Server-side logic
- [x] UI
- [x] Validation
- [x] Error handling
- [x] Tests
- [x] Documentation

## Acceptance Criteria
- [x] Duplicate payment webhooks cause zero double-crediting
- [x] Client cannot mark payment successful without verified server webhook

## Verification
- [x] Local test passed
- [x] Build passed
- [x] Relevant tests passed
- [x] Manual verification passed

## Git
- Commit: feat: implement upi payment gateway abstraction with hmac signature verification and idempotent khata reconciliation
- Push: origin main
- Branch: main

