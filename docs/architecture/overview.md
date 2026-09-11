# System Architecture Overview: RUXS

**Brand:** RUXS (`ruxs.in`)  
**Classification:** `[CONFIRMED PRODUCT REQUIREMENT]`

---

## 1. High-Level Architectural Topology

RUXS is designed as an edge-capable, highly available, event-driven web application built on modern Next.js and Cloudflare Workers architecture.

```mermaid
flowchart TB
    subgraph Clients ["Client Interaction Surfaces"]
        WA[WhatsApp App - Meta Cloud API]
        PWA[Progressive Web App - ruxs.in / Mobile & Desktop]
        DriverApp[Delivery Staff Lightweight PWA]
        VendorPortal[Vendor Kitchen Dashboard]
    end

    subgraph EdgeLayer ["Edge Ingestion & Gateway Layer (Cloudflare Workers)"]
        CF_RSC[Vinext / Cloudflare Worker RSC Engine]
        WH_Route[Webhook Routing & Signature Verification]
        AuthGate[Edge Session Validation & RBAC Middleware]
    end

    subgraph AppLayer ["Next.js Domain Services & Business Logic"]
        SubService[Subscription Engine]
        FulfillService[Daily Fulfillment FSM]
        CutoffService[Cutoff Window & Batch Counter]
        KhataService[Digital Khata Double-Entry Ledger]
        AssetService[Asset & Deposit Ledger]
        BillService[Billing & Invoice Aggregator]
        PayService[UPI Payment Orchestrator]
    end

    subgraph EventAndJobs ["Asynchronous Processing & Jobs"]
        Queue[Redis / Cloudflare Queues Message Bus]
        CronEngine[Scheduled Workers - Polling, Cutoffs, Billing]
        EventBus[Domain Event Publisher]
    end

    subgraph Persistence ["Persistence & External Gateways"]
        PG[(PostgreSQL Database - Relational & Ledger Data)]
        RedisCache[(Redis - Idempotency Keys, Locks, Sessions)]
        S3Bucket[(Cloudflare R2 / S3 - Delivery Proofs & Invoice PDFs)]
        
        GW_Meta[Meta WhatsApp Cloud API]
        GW_UPI[UPI Payment Gateway - Cashfree/Razorpay]
        GW_SMS[TRAI DLT SMS Fallback Gateway]
    end

    WA <-->|Webhooks & Templates| GW_Meta
    GW_Meta <--> WH_Route
    PWA <--> CF_RSC
    DriverApp <--> CF_RSC
    VendorPortal <--> CF_RSC

    CF_RSC --> AuthGate
    WH_Route --> AuthGate
    AuthGate --> AppLayer

    AppLayer <--> PG
    AppLayer <--> RedisCache
    AppLayer --> S3Bucket
    AppLayer --> EventBus
    
    EventBus --> Queue
    Queue --> CronEngine
    CronEngine --> GW_Meta
    CronEngine --> GW_UPI
    CronEngine --> GW_SMS
```

---

## 2. Component Layer Responsibilities

### 2.1 Edge & Ingestion Layer
* **Cloudflare Workers & Vinext:** Renders React Server Components (RSC) with ultra-low latency from regional edge nodes across India (Mumbai, Chennai, Bangalore, Delhi, Hyderabad).
* **Webhook Receiver:** Ingests high-concurrency callbacks from Meta and payment gateways, verifies cryptographic signatures in <15ms, checks Redis idempotency caches, and returns HTTP 200 before queuing domain work.

### 2.2 Domain Application Core
* Modular business logic adhering to Domain-Driven Design (DDD) principles.
* Encapsulates state machines (Fulfillment, Cutoffs, Payments) with strict transition guards.
* Enforces tenant isolation and transaction boundaries.

### 2.3 Persistence & Storage
* **Primary Relational Store (PostgreSQL):** Stores relational entities, customer profiles, subscriptions, and the append-only `khata_entries` ledger.
* **In-Memory Cache (Redis):** Distributed locks for concurrent fulfillment actions, webhook idempotency keys (TTL 24 hours), and session tokens.
* **Object Store (Cloudflare R2 / S3):** Geotagged drop photos, verification snapshots, and generated PDF invoice statements.

### 2.4 Asynchronous Worker Subsystem
* Executes time-sensitive operations without blocking user request threads:
  * Morning WhatsApp Polling (06:00 AM–08:30 AM).
  * Cutoff Locking & Kitchen Production Aggregation (09:00 AM–10:00 AM).
  * Monthly Invoice Aggregation (1st of month at 00:01 AM).
  * Webhook retries and failed message rerouting.
