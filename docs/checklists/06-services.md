# Checklist 06: Service Catalog & Product Management

## Goal
Allow vendors to configure recurring service categories (Tiffin, Water, Milk), unit pricing, and cutoff policies.

## Requirements
- [x] Create and edit services with categories (TIFFIN, WATER, MILK, etc.)
- [x] Define products/SKUs with base price in Paise and unit types
- [x] Configure shift-specific cutoff rules (Poll time, Cutoff time)
- [x] Toggle asset tracking requirement per service

## Implementation
- [x] Database/model
- [x] Server-side logic
- [x] UI
- [x] Validation
- [x] Error handling
- [x] Tests
- [x] Documentation

## Acceptance Criteria
- [x] Vendor can add a Meal or Water product with exact pricing
- [x] Cutoff policies correctly attached to services

## Verification
- [x] Local test passed
- [x] Build passed
- [x] Relevant tests passed
- [x] Manual verification passed

## Git
- Commit: feat: implement service catalog, product pricing in paise and cutoff windows
- Push: origin main
- Branch: main

