# Checklist 18: Vacation Mode & Multi-Service Pauses

## Goal
Allow customers to pause multiple recurring services across dates with automated billing freezes.

## Requirements
- [ ] VacationPause entity with date range (start_date, end_date)
- [ ] Multi-service selection UI (e.g., pause milk and tiffin, keep water)
- [ ] Midnight generator check suppressing fulfillments during pause window
- [ ] Early resumption and date range extension handlers

## Implementation
- [ ] Database/model
- [ ] Server-side logic
- [ ] UI
- [ ] Validation
- [ ] Error handling
- [ ] Tests
- [ ] Documentation

## Acceptance Criteria
- [ ] Zero fulfillments and zero Khata debits generated during vacation dates
- [ ] Services resume automatically on the morning after end_date

## Verification
- [ ] Local test passed
- [ ] Build passed
- [ ] Relevant tests passed
- [ ] Manual verification passed

## Git
- Commit:
- Push:
- Branch:
