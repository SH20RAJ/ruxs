# Checklist 02: Passwordless Phone Authentication

## Goal
Build frictionless phone OTP authentication, session creation, and edge role resolution.

## Requirements
- [ ] Create phone number normalization utility (+91 E.164)
- [ ] Implement OTP generation and verification mock/provider service
- [ ] Issue edge-verifiable session tokens (JWT/cookies)
- [ ] Enforce role assignment (Customer, Vendor, Driver, Admin)
- [ ] Handle magic deep-link session generation

## Implementation
- [ ] Database/model
- [ ] Server-side logic
- [ ] UI
- [ ] Validation
- [ ] Error handling
- [ ] Tests
- [ ] Documentation

## Acceptance Criteria
- [ ] User can enter phone number and receive/verify 6-digit OTP
- [ ] Session cookies are HttpOnly and secure
- [ ] Role middleware guards protected routes

## Verification
- [ ] Local test passed
- [ ] Build passed
- [ ] Relevant tests passed
- [ ] Manual verification passed

## Git
- Commit:
- Push:
- Branch:
