# Checklist 09: Cutoff Engine & Kitchen Batch Counter

## Goal
Automate cutoff locking, enforce late cancellation policies, and calculate live kitchen batch preparation counters.

## Requirements
- [ ] Background worker evaluating order cutoffs every 60 seconds
- [ ] Auto-confirm autopilot default when cutoff expires
- [ ] Late skip charge calculation (50% or 100% based on policy)
- [ ] Live aggregation query for total meals to prepare by shift

## Implementation
- [ ] Database/model
- [ ] Server-side logic
- [ ] UI
- [ ] Validation
- [ ] Error handling
- [ ] Tests
- [ ] Documentation

## Acceptance Criteria
- [ ] Orders past cutoff strictly transition to LATE_SKIP or reject cancellation
- [ ] Kitchen prep counters update in real time

## Verification
- [ ] Local test passed
- [ ] Build passed
- [ ] Relevant tests passed
- [ ] Manual verification passed

## Git
- Commit:
- Push:
- Branch:
