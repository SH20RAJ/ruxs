# ADR-001: Initial Architecture & Runtime Selection

* **Status:** `ACCEPTED`
* **Date:** 2026-09-11
* **Deciders:** Product & Engineering Architecture Core
* **Classification:** `[CONFIRMED ARCHITECTURAL DECISION]`

---

## 1. Context

RUXS (`ruxs.in`) is an operating system for recurring household services. The system requirements dictate:
1. **Ultra-Low Latency Edge Ingestion:** Meta WhatsApp webhooks and morning interactive polls must be verified and acknowledged in <20 milliseconds.
2. **High-Integrity Financial Transactions:** The Digital Khata and Asset Ledger require strict ACID transactions, append-only constraints, and relational consistency (preventing floating-point balance corruption).
3. **App-Router Web Experience:** Responsive mobile web views for customers and vendors with zero bundle bloat and fast server-rendered views.
4. **Existing Repository Foundation:** The workspace is scaffolded using `bun`, `vite`, `vinext` (`@vinext/cloudflare`), `react` (v19 RSC), and `wrangler` targeting Cloudflare Workers.

---

## 2. Decision

We accept the following core architectural stack for RUXS:

### 2.1 Frontend & Application Runtime
* **Framework:** **Next.js App Router syntax via Vinext (`@vinext/cloudflare`)**
* **Runtime:** **Cloudflare Workers (Edge V8 isolates)**
* **Package Manager:** **Bun**
* **Language & Styling:** **TypeScript + Tailwind CSS (v4)**

### 2.2 Persistence & Ledgers
* **Primary Database:** **PostgreSQL** (Managed via Neon or Supabase with Hyperdrive / PgBouncer connection pooling).
* **ORM / Query Builder:** **Drizzle ORM** (Selected over Prisma for zero cold-start overhead and native compatibility with Cloudflare Workers Edge runtime).
* **Financial Ledger Architecture:** Append-only relational table with database-enforced Row-Level Security (RLS) for tenant isolation.

### 2.3 Caching, Queues & Fast Storage
* **Fast In-Memory Store:** **Redis** (Upstash Redis or Cloudflare KV) for webhook idempotency caches (24h TTL), distributed locks on cutoffs, and session revocations.
* **Asynchronous Jobs & Queues:** Cloudflare Queues or BullMQ for morning dispatch bursts and background cron workers.
* **Object Storage:** **Cloudflare R2** (S3-compatible, zero egress fees) for delivery drop photos and invoice PDF statements.

---

## 3. Alternatives Evaluated

| Component | Selected Option | Evaluated Alternatives | Why Alternatives Were Rejected |
| :--- | :--- | :--- | :--- |
| **Edge Runtime** | Cloudflare Workers + Vinext | Node.js on AWS EC2 / Container | Node.js containers suffer from 1.5s+ cold starts and multi-region deployment complexity. Cloudflare Workers run natively across Mumbai, Chennai, Bangalore, and Delhi with <10ms response times. |
| **Database** | PostgreSQL | MongoDB / DynamoDB | NoSQL databases lack cross-document ACID transactions and double-entry consistency guarantees. Financial ledgers require relational rigor and mathematical auditability. |
| **ORM** | Drizzle ORM | Prisma ORM | Prisma's heavy query engine binary introduces latency and bundle size penalties inside edge V8 isolates. Drizzle is lightweight, type-safe, and edge-native. |

---

## 4. Consequences

### Positive Consequences
* **Instant Global/Regional Availability:** Edge deployment ensures that 8:30 AM morning WhatsApp webhooks are received and verified with sub-15ms latency.
* **Zero Egress Bill Shock:** Utilizing Cloudflare R2 for drop photos eliminates bandwidth egress charges common with AWS S3.
* **Type-Safety Across Stack:** End-to-end TypeScript from database schemas to API routes to React Server Components.

### Negative Consequences & Trade-offs
* **Edge V8 Environment Limitations:** Standard Node.js native binary packages (`fs`, `net`, native C++ addons) cannot be run on Cloudflare Workers; all libraries must be Web-standards or Edge-compatible.
* **Connection Pooling Requirement:** Edge workers cannot maintain long-lived TCP database connections; requires an external connection pooler (Cloudflare Hyperdrive or PgBouncer).
