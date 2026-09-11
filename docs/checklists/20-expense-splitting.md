# Checklist 20: Household Expense Splitting (Splitwise Layer)

## Goal
Build roommate expense division on top of verified invoices with P2P UPI settlements.

## Requirements
- [x] HouseholdExpense model linking to cleared RUXS invoice
- [x] Split strategies: Equal, percentage, custom amount, itemized
- [x] ExpenseParticipant share tracking and debt ledger
- [x] P2P UPI settlement deep-link generation

## Implementation
- [x] Database/model
- [x] Server-side logic
- [x] UI
- [x] Validation
- [x] Error handling
- [x] Tests
- [x] Documentation

## Acceptance Criteria
- [x] Expense splits sum exactly to total invoice amount
- [x] Vendor Khata remains independent of internal roommate debt

## Verification
- [x] Local test passed
- [x] Build passed
- [x] Relevant tests passed
- [x] Manual verification passed

## Git
- Commit: feat: implement household expense splitting with integer paise equal division and p2p upi settlements
- Push: SUCCESS
- Branch: main
