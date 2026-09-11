# Development Principles: RUXS Engineering Culture

**Classification:** `[CONFIRMED ENGINEERING DIRECTIVE]`

---

## 1. The Core Directives for Developers & AI Agents

Any engineer or AI agent writing code for RUXS must internalize these six non-negotiable engineering directives:

### Directive 1: Never Mutate a Financial Balance Directly
There is no `UPDATE users SET balance = balance + X`. All balances must be derived by inserting a signed transaction into the append-only `KhataEntry` ledger inside a database transaction. If you write an arbitrary balance mutation, your PR will be rejected.

### Directive 2: Guard Every State Machine Transition
Fulfillment, subscription, payment, and cutoff states are governed by formal finite state machines. Every state transition must explicitly assert:
* Who triggered it (Customer, Driver, Vendor, Cron)?
* Is the transition permitted from the current status?
* Have guard conditions passed (e.g., is `NOW() <= cutoff_time`)?
* Is the operation idempotent?

### Directive 3: Edge-First Compatibility
All application code must run inside edge V8 isolate environments (Cloudflare Workers). Avoid Node.js-only legacy APIs (`node:fs`, `node:net`, heavy binaries). Use Web standard APIs (`fetch`, `Request`, `Response`, `crypto.subtle`).

### Directive 4: Idempotency is Not Optional
In a mobile and WhatsApp world, duplicate network requests, webhook retries, and double-taps are everyday occurrences. Every mutation endpoint must accept or generate an `Idempotency-Key` and enforce atomic deduplication.

### Directive 5: Strict Multi-Tenant Scoping
A query without a `tenant_id` filter is considered a security vulnerability. Always verify that domain operations operate strictly within the tenant context established by the authenticated session.

### Directive 6: Fail Closed on Cutoffs
If there is network ambiguity or database contention at the cutoff boundary, the system must fail closed to protect vendor economics: an order that cannot be verified as skipped before the cutoff millisecond must default to the configured late policy or confirmation.
