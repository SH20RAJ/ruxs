# Checklist 11: Consolidated Monthly Billing & Statements

## Goal
Derive monthly itemized invoices from unbilled Khata entries with automated statement generation.

## Requirements
- [ ] Monthly billing aggregator worker running on the 1st of each month
- [ ] Invoice entity creation with itemized line items and discounts
- [ ] Previous unpaid balance carry-forward logic
- [ ] Unique invoice reference number generation (INV-YYYY-MM-XXXX)

## Implementation
- [ ] Database/model
- [ ] Server-side logic
- [ ] UI
- [ ] Validation
- [ ] Error handling
- [ ] Tests
- [ ] Documentation

## Acceptance Criteria
- [ ] Invoice total equals exact sum of unbilled ledger debits minus credits
- [ ] Partial payments update invoice state without modifying ledger history

## Verification
- [ ] Local test passed
- [ ] Build passed
- [ ] Relevant tests passed
- [ ] Manual verification passed

## Git
- Commit:
- Push:
- Branch:
