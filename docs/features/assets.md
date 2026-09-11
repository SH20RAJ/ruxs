# Feature Specification: Physical Assets & Returnable Inventory

> **Canonical Document:** See detailed specification in [asset-ledger.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/asset-ledger.md).

## Summary
* Tracks returnable physical containers: 20L water cans, stainless steel tiffins, milk crates.
* Records empty exchanges at doorstep: `Holding = Previous + Delivered - Collected`.
* Security deposits tracked in parallel with the financial Khata.
* Final customer exit reconciliation prevents deposit refunds until all physical assets are returned.
