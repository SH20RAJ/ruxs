# Checklist 07: Recurring Subscription Engine

## Goal
Model long-running household subscription contracts with flexible recurrence cadences.

## Requirements
- [x] Implement cadence types: Daily, Weekdays, Selected Days, Alternate Days
- [x] Subscription creation flow connecting Customer, Product, and Cadence
- [x] Default quantity and autopilot action configuration
- [x] Subscription pause, resume, and cancellation methods

## Implementation
- [x] Database/model
- [x] Server-side logic
- [x] UI
- [x] Validation
- [x] Error handling
- [x] Tests
- [x] Documentation

## Acceptance Criteria
- [x] Subscription generates correct active delivery schedule
- [x] Status transitions adhere to subscription state machine

## Verification
- [x] Local test passed
- [x] Build passed
- [x] Relevant tests passed
- [x] Manual verification passed

## Git
- Commit: feat: implement recurring subscription engine with cadence evaluation and pause/resume FSM
- Push: origin main
- Branch: main

