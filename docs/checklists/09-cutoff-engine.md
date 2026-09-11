# Checklist 09: Cutoff Engine & Kitchen Batch Counter

## Goal
Automate cutoff locking, enforce late cancellation policies, and calculate live kitchen batch preparation counters.

## Requirements
- [x] Background worker evaluating order cutoffs every 60 seconds
- [x] Auto-confirm autopilot default when cutoff expires
- [x] Late skip charge calculation (50% or 100% based on policy)
- [x] Live aggregation query for total meals to prepare by shift

## Implementation
- [x] Database/model
- [x] Server-side logic
- [x] UI
- [x] Validation
- [x] Error handling
- [x] Tests
- [x] Documentation

## Acceptance Criteria
- [x] Orders past cutoff strictly transition to LATE_SKIP or reject cancellation
- [x] Kitchen prep counters update in real time

## Verification
- [x] Local test passed
- [x] Build passed
- [x] Relevant tests passed
- [x] Manual verification passed

## Git
- Commit: feat: implement cutoff locking worker, late fee policies and live kitchen batch counter
- Push: origin main
- Branch: main

