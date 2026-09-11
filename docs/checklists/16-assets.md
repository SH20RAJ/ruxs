# Checklist 16: Physical Asset Ledger (Jars & Tiffins)

## Goal
Track circulating physical containers, empty exchanges, customer holding balances, and deposits.

## Requirements
- [x] AssetType entity (20L Water Can, Stainless Steel Tiffin)
- [x] CustomerAssetBalance holding tracker
- [x] Doorstep asset exchange recording (Delivered vs Collected)
- [x] Security deposit debit/refund integration with Khata

## Implementation
- [x] Database/model
- [x] Server-side logic
- [x] UI
- [x] Validation
- [x] Error handling
- [x] Tests
- [x] Documentation

## Acceptance Criteria
- [x] Delivery recording updates holding balance: new = old + (del - col)
- [x] Asset exit reconciliation verifies 0 unreturned containers before deposit refund

## Verification
- [x] Local test passed
- [x] Build passed
- [x] Relevant tests passed
- [x] Manual verification passed

## Git
- Commit: feat: implement physical asset ledger for circulating containers and deposit reconciliation
- Push: origin main
- Branch: main

