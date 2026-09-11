# Checklist 13: WhatsApp Cloud API & Interactive Gateway

## Goal
Build the WhatsApp conversational layer for 1-tap morning polls, confirmations, and alerts.

## Requirements
- [ ] Meta WhatsApp Cloud API client abstraction
- [ ] Morning poll template builder with quick reply buttons ([DELIVER], [SKIP])
- [ ] Webhook receiver at /api/webhooks/whatsapp with HMAC verification
- [ ] Redis-based message deduplication (24h TTL)
- [ ] Payload router translating button taps into fulfillment state transitions

## Implementation
- [ ] Database/model
- [ ] Server-side logic
- [ ] UI
- [ ] Validation
- [ ] Error handling
- [ ] Tests
- [ ] Documentation

## Acceptance Criteria
- [ ] Tapping SKIP in WhatsApp updates fulfillment to SKIPPED in <500ms
- [ ] Opt-out keywords (STOP) immediately suppress outbound messaging

## Verification
- [ ] Local test passed
- [ ] Build passed
- [ ] Relevant tests passed
- [ ] Manual verification passed

## Git
- Commit:
- Push:
- Branch:
