# Checklist 11: Consolidated Monthly Billing & Statements

## Goal
Derive monthly itemized invoices from unbilled Khata entries with automated statement generation.

## Requirements
- [x] Monthly billing aggregator worker running on the 1st of each month
- [x] Invoice entity creation with itemized line items and discounts
- [x] Previous unpaid balance carry-forward logic
- [x] Unique invoice reference number generation (INV-YYYY-MM-XXXX)

## Implementation
- [x] Database/model
- [x] Server-side logic
- [x] UI
- [x] Validation
- [x] Error handling
- [x] Tests
- [x] Documentation

## Acceptance Criteria
- [x] Invoice total equals exact sum of unbilled ledger debits minus credits
- [x] Partial payments update invoice state without modifying ledger history

## Verification
- [x] Local test passed
- [x] Build passed
- [x] Relevant tests passed
- [x] Manual verification passed

## Git
- Commit: feat: implement monthly consolidated billing engine with itemized line items and invoice generation
- Push: origin main
- Branch: main

