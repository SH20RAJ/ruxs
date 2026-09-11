# System Architecture Principles: RUXS

**Classification:** `[CONFIRMED PRODUCT REQUIREMENT]`

---

## The 17 Architectural Principles of RUXS

These principles govern all technical decisions, system boundaries, database designs, and code architectures within RUXS.

---

### 1. Modular Architecture
System capabilities must be partitioned into decoupled, self-contained functional modules (e.g., Subscriptions, Fulfillment, Khata, WhatsApp, Billing). Cross-module dependencies must flow through explicit service contracts, never through ad-hoc direct database joins.

### 2. Domain-Oriented Boundaries (DDD)
The codebase must mirror real-world operational domains. Business rules belong inside rich domain aggregates (e.g., `Subscription`, `FulfillmentItem`, `LedgerAccount`), not smeared across UI components or raw API handlers.

### 3. Strong Transaction Boundaries
Operations that alter financial state, order fulfillment, or physical asset balances must execute inside serializable database transactions (`ACID`). If any step in a multi-action flow fails (e.g., marking order delivered, debiting khata, logging asset handover), the entire transaction rolls back cleanly.

### 4. Idempotent Webhook Handling
External webhooks from Meta WhatsApp Cloud API and Payment Gateways are untrusted, retry-prone, and arrive out of order. All ingestion endpoints must enforce cryptographic signature verification and atomic deduplication via unique webhook idempotency keys stored in Redis.

### 5. Event-Driven Asynchrony
Fulfillment events, status changes, and time triggers must emit typed domain events onto an internal bus. Side effects (sending WhatsApp notifications, updating driver run sheets, logging audit trails) must be decoupled from the synchronous HTTP request-response lifecycle.

### 6. Strict Financial Ledger Integrity
Zero balance mutations without an associated transaction. All customer and vendor balances are calculated from an append-only double-entry ledger. All currency values are stored as 64-bit signed integers in **Paise** (`1 INR = 100 paise`).

### 7. Immutable Auditability
Every user action, vendor override, late skip, and dispute resolution must append a timestamped record to an immutable `AuditLog` capturing actor ID, client IP, previous state, new state, and rationale.

### 8. Role-Based Access Control (RBAC)
Authorization is enforced at the service boundary. Users belong to explicit roles (`Customer`, `VendorAdmin`, `DeliveryStaff`, `HouseholdMember`, `PlatformAdmin`). Endpoints must reject unauthorized cross-role operations prior to executing business logic.

### 9. Strict Multi-Tenant Isolation
Every vendor operates as an isolated tenant. Every database query, cache key, and background worker MUST filter by `tenant_id`. Cross-tenant data leakage is treated as a P0 security defect.

### 10. Deep Observability & Distributed Tracing
Every request and webhook ingestion generates a unique `X-Request-Id` propagated across asynchronous workers, event handlers, and external API calls. Structured JSON logging and latency metrics must track cutoff processing and message delivery.

### 11. Resilient Error Handling & Circuit Breaking
External dependencies (Meta API, payment gateways, SMS providers) will experience outages. The architecture must employ circuit breakers, graceful degradation, and offline fallback queues.

### 12. Deterministic Retry Mechanisms with Jitter
Failed webhook deliveries, database transient deadlocks, and outbound notification dispatches must retry using **Exponential Backoff with Full Jitter** to prevent thundering herd spikes.

### 13. Decoupled Background Jobs
Time-consuming operations (midnight fulfillment generation, morning WhatsApp dispatch waves, monthly statement compilation) must run in isolated background workers, protecting the interactive web tier from resource starvation.

### 14. Edge Rate Limiting & Abuse Prevention
All public endpoints (especially OTP authentication, WhatsApp webhooks, and payment link routes) must enforce distributed token-bucket rate limits at the Cloudflare edge layer.

### 15. Semantic API Versioning
External interfaces (webhook callbacks, public payment redirect APIs) must maintain backward compatibility through semantic versioning (`/api/v1/...`). Breaking schema changes must run parallel version bridges for at least 90 days.

### 16. Defense-in-Depth Security
Zero trust for external inputs. Strict schema validation (e.g., Zod) on all ingress payloads, parameterized SQL queries, sanitized output rendering, and encrypted storage for API secrets and credentials.

### 17. Privacy & DPDP Act Compliance
Customer phone numbers, addresses, and door details represent sensitive Personally Identifiable Information (PII). Delivery staff can only access customer phone numbers during active shifts, and phone masking/proxy calling must be implemented as the fleet scales.
