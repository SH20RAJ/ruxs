# RUXS Documentation Index

Welcome to the engineering and product documentation for **RUXS** (`ruxs.in`), the hyper-local operating system for recurring household services.

> **Status:** Product Definition & Technical Architecture Phase (No implementation code).  
> **Brand:** RUXS  
> **Domain:** [ruxs.in](https://ruxs.in)  
> **Core Concept:** Operating system for everyday household life (tiffin, water, milk, flowers, newspaper, laundry, cleaning, scrap, etc.)

---

## Documentation Navigation

```
docs/
├── product/              # Strategy, vision, categories, principles, MVP, roadmap, metrics, risks, questions
├── features/             # Detailed feature specifications, state machines, cutoffs, ledgers, WhatsApp
├── architecture/         # System architecture, domain models, entity diagrams, auth, tenancy, events
├── business/             # SaaS pricing, unit economics, go-to-market strategy
├── operations/           # SOPs for vendors, delivery personnel, disputes, and customer support
├── security/             # Security controls, threat modeling, privacy, and PII protection
├── decisions/            # Architecture Decision Records (ADR)
└── development/          # Coding standards, testing philosophy, and deployment infrastructure
```

### 1. Product Foundations (`/docs/product`)
- [vision.md](file:///Users/shaswatraj/Desktop/ruxx/docs/product/vision.md) — Long-term North Star, operating layer concept, and core tenets.
- [problem.md](file:///Users/shaswatraj/Desktop/ruxx/docs/product/problem.md) — The broken manual status quo (WhatsApp chaos, paper khata, missed cutoffs).
- [solution.md](file:///Users/shaswatraj/Desktop/ruxx/docs/product/solution.md) — The digital coordination layer between customers, vendors, and delivery.
- [value-proposition.md](file:///Users/shaswatraj/Desktop/ruxx/docs/product/value-proposition.md) — Value pillars for Customers, Vendors, and Delivery staff.
- [target-users.md](file:///Users/shaswatraj/Desktop/ruxx/docs/product/target-users.md) — User personas and role boundaries across households and vendors.
- [service-categories.md](file:///Users/shaswatraj/Desktop/ruxx/docs/product/service-categories.md) — Deep dives into 9 initial services (Tiffin, Water, Milk, Bakery, Flowers, Newspapers, Laundry, Car Cleaning, Scrap Collection).
- [product-principles.md](file:///Users/shaswatraj/Desktop/ruxx/docs/product/product-principles.md) — The 10 immutable operating principles of RUXS.
- [mvp.md](file:///Users/shaswatraj/Desktop/ruxx/docs/product/mvp.md) — Scoped specification for Phase 1 vs. explicitly deferred features.
- [roadmap.md](file:///Users/shaswatraj/Desktop/ruxx/docs/product/roadmap.md) — Phased evolution from Phase 0 to Phase 6.
- [metrics.md](file:///Users/shaswatraj/Desktop/ruxx/docs/product/metrics.md) — North Star KPIs across Customer, Vendor, Operational, and Financial vectors.
- [open-questions.md](file:///Users/shaswatraj/Desktop/ruxx/docs/product/open-questions.md) — Unresolved strategic, operational, and technical dilemmas.
- [risks.md](file:///Users/shaswatraj/Desktop/ruxx/docs/product/risks.md) — Product, operational, and technological risk matrix with mitigation paths.
- [edge-cases.md](file:///Users/shaswatraj/Desktop/ruxx/docs/product/edge-cases.md) — 20+ real-world edge cases with expected behaviors and audit requirements.

### 2. Feature Specifications (`/docs/features`)
- [subscriptions.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/subscriptions.md) — Cadence patterns, schedules, paused states, and schedule mutations.
- [daily-fulfillment.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/daily-fulfillment.md) — Daily order generation and the 11-state fulfillment finite state machine.
- [cutoff-system.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/cutoff-system.md) — Configurable time windows, lockouts, late skips, and kitchen batching.
- [khata.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/khata.md) — Double-entry transactional ledger, immutable ledger entries, debit/credit math.
- [asset-ledger.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/asset-ledger.md) — Physical asset accounting (jars, tiffin dabbas, crates, deposits).
- [billing.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/billing.md) — Monthly statement derivation, itemization, adjustments, and tax handling.
- [payments.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/payments.md) — UPI-first payment lifecycle, intent, webhooks, and idempotent reconciliation.
- [whatsapp.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/whatsapp.md) — WhatsApp Cloud API interactive messaging, buttons, webhooks, and session rules.
- [notifications.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/notifications.md) — Multi-channel event-driven notifications (WhatsApp, Push, SMS fallback).
- [delivery.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/delivery.md) — Run sheets, geographic route sequencing (Society/Tower/Wing/Flat), and delivery states.
- [delivery-verification.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/delivery-verification.md) — Geo-stamped photo proofs, customer QR/NFC checkpoints, and dispute resistance.
- [vacation-mode.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/vacation-mode.md) — Multi-service bulk pause windows, exceptions, and automatic billing pauses.
- [household.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/household.md) — Shared household accounts, roommate roles, and multi-user service visibility.
- [expense-splitting.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/expense-splitting.md) — Splitwise-style shared billing for flatmates/families, custom splits, and settlements.
- [disputes.md](file:///Users/shaswatraj/Desktop/ruxx/docs/features/disputes.md) — Dispute workflows, evidence timelines, adjustments, and ledger arbitration.

### 3. System Architecture (`/docs/architecture`)
- [overview.md](file:///Users/shaswatraj/Desktop/ruxx/docs/architecture/overview.md) — High-level architecture, Next.js / Edge runtime, and system boundary map.
- [principles.md](file:///Users/shaswatraj/Desktop/ruxx/docs/architecture/principles.md) — 17 core architectural and engineering guidelines.
- [domain-model.md](file:///Users/shaswatraj/Desktop/ruxx/docs/architecture/domain-model.md) — DDD aggregates, bounded contexts, and domain events.
- [data-model.md](file:///Users/shaswatraj/Desktop/ruxx/docs/architecture/data-model.md) — Conceptual entity schemas, field definitions, relational constraints, and invariants.
- [authentication.md](file:///Users/shaswatraj/Desktop/ruxx/docs/architecture/authentication.md) — OTP-based phone authentication, JWT sessions, and device handoffs.
- [authorization.md](file:///Users/shaswatraj/Desktop/ruxx/docs/architecture/authorization.md) — Role-based access control (RBAC) across 5 primary roles.
- [multi-tenancy.md](file:///Users/shaswatraj/Desktop/ruxx/docs/architecture/multi-tenancy.md) — Strict tenant isolation, data partitioning, and vendor data privacy.
- [integrations.md](file:///Users/shaswatraj/Desktop/ruxx/docs/architecture/integrations.md) — WhatsApp Cloud API, payment gateways, and SMS/notification bridges.
- [background-jobs.md](file:///Users/shaswatraj/Desktop/ruxx/docs/architecture/background-jobs.md) — Scheduled cron jobs, daily fulfillment generators, cutoffs, and reconcilers.
- [events.md](file:///Users/shaswatraj/Desktop/ruxx/docs/architecture/events.md) — Event-driven domain pub/sub catalog and state change broadcasting.

### 4. Business & Operations (`/docs/business` & `/docs/operations`)
- [business-model.md](file:///Users/shaswatraj/Desktop/ruxx/docs/business/business-model.md) — SaaS monetization, collection take rates, and marketplace horizons.
- [vendor-plans.md](file:///Users/shaswatraj/Desktop/ruxx/docs/business/vendor-plans.md) — Starter (Free), Growth (₹499/mo), and Pro/Hub (₹1,499/mo) tier breakdowns.
- [unit-economics.md](file:///Users/shaswatraj/Desktop/ruxx/docs/business/unit-economics.md) — WhatsApp message costs, payment processing margins, and ARPU models.
- [go-to-market.md](file:///Users/shaswatraj/Desktop/ruxx/docs/business/go-to-market.md) — GTM strategy, hyper-local society-cluster beachheads, and vendor onboarding playbooks.
- [vendor-operations.md](file:///Users/shaswatraj/Desktop/ruxx/docs/operations/vendor-operations.md) — Day in the life of a vendor (prep, cutoffs, packing, settlement).
- [delivery-operations.md](file:///Users/shaswatraj/Desktop/ruxx/docs/operations/delivery-operations.md) — Driver run sheet execution, asset return handling, and exception protocols.
- [customer-support.md](file:///Users/shaswatraj/Desktop/ruxx/docs/operations/customer-support.md) — Tier 1 & Tier 2 support playbooks and issue escalation paths.
- [dispute-management.md](file:///Users/shaswatraj/Desktop/ruxx/docs/operations/dispute-management.md) — Rules of engagement for financial and fulfillment disputes.

### 5. Security, ADRs & Development (`/docs/security`, `/docs/decisions`, `/docs/development`)
- [security.md](file:///Users/shaswatraj/Desktop/ruxx/docs/security/security.md) — Threat model, webhook signatures, idempotency tokens, and data hygiene.
- [privacy.md](file:///Users/shaswatraj/Desktop/ruxx/docs/security/privacy.md) — Handling Indian phone numbers, addresses, and DPDP Act compliance.
- [threat-model.md](file:///Users/shaswatraj/Desktop/ruxx/docs/security/threat-model.md) — STRIDE threat analysis for hyper-local recurring operations.
- [ADR-001-initial-architecture.md](file:///Users/shaswatraj/Desktop/ruxx/docs/decisions/ADR-001-initial-architecture.md) — Selection of Next.js / Edge Runtime / Relational Ledger / Cloudflare.
- [development-principles.md](file:///Users/shaswatraj/Desktop/ruxx/docs/development/development-principles.md) — Engineering guidelines, zero-mutation financial ledgers, and state machine integrity.
- [coding-guidelines.md](file:///Users/shaswatraj/Desktop/ruxx/docs/development/coding-guidelines.md) — TypeScript conventions, error envelopes, and schema validation.
- [testing-strategy.md](file:///Users/shaswatraj/Desktop/ruxx/docs/development/testing-strategy.md) — Unit testing financial ledgers, fulfillment state machines, and mocking external webhooks.
- [deployment.md](file:///Users/shaswatraj/Desktop/ruxx/docs/development/deployment.md) — Edge deployment, staging environments, migrations, and observability.
