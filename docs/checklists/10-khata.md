# Checklist 10: Digital Khata (Append-Only Financial Ledger)

## Goal
Build an immutable, double-entry transactional financial ledger ensuring zero balance corruption.

## Requirements
- [ ] Append-only khata_entries table with strict SQL immutability
- [ ] Transaction types: FULFILLMENT_DEBIT, PAYMENT_CREDIT, LATE_FEE, REFUND
- [ ] Integer Paise arithmetic eliminating floating point rounding errors
- [ ] Derived customer balance calculation with running balance snapshots

## Implementation
- [ ] Database/model
- [ ] Server-side logic
- [ ] UI
- [ ] Validation
- [ ] Error handling
- [ ] Tests
- [ ] Documentation

## Acceptance Criteria
- [ ] Zero mutable balance columns in database
- [ ] Every debit/credit links directly to fulfillment or payment entity
- [ ] Unit tests prove 100% balance integrity across random transaction series

## Verification
- [ ] Local test passed
- [ ] Build passed
- [ ] Relevant tests passed
- [ ] Manual verification passed

## Git
- Commit:
- Push:
- Branch:
