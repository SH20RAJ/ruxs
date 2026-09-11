# Checklist 16: Physical Asset Ledger (Jars & Tiffins)

## Goal
Track circulating physical containers, empty exchanges, customer holding balances, and deposits.

## Requirements
- [ ] AssetType entity (20L Water Can, Stainless Steel Tiffin)
- [ ] CustomerAssetBalance holding tracker
- [ ] Doorstep asset exchange recording (Delivered vs Collected)
- [ ] Security deposit debit/refund integration with Khata

## Implementation
- [ ] Database/model
- [ ] Server-side logic
- [ ] UI
- [ ] Validation
- [ ] Error handling
- [ ] Tests
- [ ] Documentation

## Acceptance Criteria
- [ ] Delivery recording updates holding balance: new = old + (del - col)
- [ ] Asset exit reconciliation verifies 0 unreturned containers before deposit refund

## Verification
- [ ] Local test passed
- [ ] Build passed
- [ ] Relevant tests passed
- [ ] Manual verification passed

## Git
- Commit:
- Push:
- Branch:
