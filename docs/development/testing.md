# Testing Standards & Quality Gates: RUXS

> **Canonical Document:** See detailed test suite plans in [testing-strategy.md](file:///Users/shaswatraj/Desktop/ruxx/docs/development/testing-strategy.md).

## Quality Gates
* **Unit Testing:** Focus on ledger balance mathematics and state machine transition guards.
* **Integration Testing:** Test webhook idempotency and cutoff locking.
* **E2E Testing:** Verify the core loop: Subscription -> Daily Fulfillment -> Khata Debit -> Invoice -> UPI Payment.
* **Pre-Commit Verification:** Every commit requires a successful `bun run build` and test run.
