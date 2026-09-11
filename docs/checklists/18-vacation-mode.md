# Checklist 18: Vacation Mode & Multi-Service Pauses

## Goal
Allow customers to pause multiple recurring services across dates with automated billing freezes.

## Requirements
- [x] VacationPause entity with date range (start_date, end_date)
- [x] Multi-service selection UI (e.g., pause milk and tiffin, keep water)
- [x] Midnight generator check suppressing fulfillments during pause window
- [x] Early resumption and date range extension handlers

## Implementation
- [x] Database/model
- [x] Server-side logic
- [x] UI
- [x] Validation
- [x] Error handling
- [x] Tests
- [x] Documentation

## Acceptance Criteria
- [x] Zero fulfillments and zero Khata debits generated during vacation dates
- [x] Services resume automatically on the morning after end_date

## Verification
- [x] Local test passed
- [x] Build passed
- [x] Relevant tests passed
- [x] Manual verification passed

## Git
- Commit: feat: implement vacation mode pause windows, early resumption and fulfillment suppression
- Push: origin main
- Branch: main

