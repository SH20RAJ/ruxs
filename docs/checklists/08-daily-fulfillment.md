# Checklist 08: Daily Fulfillment State Machine & Generator

## Goal
Implement the 11-state daily fulfillment engine that converts subscriptions into actionable daily operations.

## Requirements
- [ ] Midnight generator function producing SCHEDULED fulfillments
- [ ] Full 11-state finite state machine with strict transition guards
- [ ] Atomic status transition API (Confirm, Skip, Out for Delivery, Delivered)
- [ ] Price snapshot preservation on fulfillment items

## Implementation
- [ ] Database/model
- [ ] Server-side logic
- [ ] UI
- [ ] Validation
- [ ] Error handling
- [ ] Tests
- [ ] Documentation

## Acceptance Criteria
- [ ] All 11 states modeled with invalid transitions rejected
- [ ] Delivered transition triggers Khata and Asset updates atomically

## Verification
- [ ] Local test passed
- [ ] Build passed
- [ ] Relevant tests passed
- [ ] Manual verification passed

## Git
- Commit:
- Push:
- Branch:
