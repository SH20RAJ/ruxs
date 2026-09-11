# Checklist 04: Vendor Onboarding & Profile Setup

## Goal
Enable local service vendors to register their business, set UPI payment IDs, and define service operating zones.

## Requirements
- [x] Vendor business profile form (Name, Phone, Address, UPI ID)
- [x] Default shift configuration (Morning, Lunch, Evening)
- [x] Delivery radius / society coverage definition
- [x] Generation of vendor public slug / QR invite link

## Implementation
- [x] Database/model
- [x] Server-side logic
- [x] UI
- [x] Validation
- [x] Error handling
- [x] Tests
- [x] Documentation

## Acceptance Criteria
- [x] New vendor profile created with active tenant record
- [x] Validation prevents invalid UPI IDs or malformed addresses

## Verification
- [x] Local test passed
- [x] Build passed
- [x] Relevant tests passed
- [x] Manual verification passed

## Git
- Commit: feat: implement vendor onboarding, upi validation and public subscriber portal generator
- Push: origin main
- Branch: main

