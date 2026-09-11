# Checklist 14: Multi-Channel Notification Engine

## Goal
Build event-driven notification dispatch across WhatsApp, Web Push, and DLT SMS fallback.

## Requirements
- [ ] Event subscriber listening to domain fulfillment and billing events
- [ ] Channel priority router (WhatsApp -> Web Push -> SMS fallback)
- [ ] Template compilation with dynamic parameters
- [ ] Notification dispatch audit logging

## Implementation
- [ ] Database/model
- [ ] Server-side logic
- [ ] UI
- [ ] Validation
- [ ] Error handling
- [ ] Tests
- [ ] Documentation

## Acceptance Criteria
- [ ] Failed WhatsApp delivery automatically queues SMS fallback
- [ ] Quiet hours enforced for non-urgent notifications

## Verification
- [ ] Local test passed
- [ ] Build passed
- [ ] Relevant tests passed
- [ ] Manual verification passed

## Git
- Commit:
- Push:
- Branch:
