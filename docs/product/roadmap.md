# Phased Product Roadmap: RUXS

**Brand:** RUXS (`ruxs.in`)  
**Classification:** `[CONFIRMED PRODUCT REQUIREMENT]`

> **Note on Timelines:** Roadmap milestones represent operational capability horizons and technical dependencies, not rigid calendar commitments.

---

## 1. Roadmap Overview

```mermaid
gantt
    title RUXS Product Evolution Roadmap
    dateFormat  YYYY-Q#
    section Foundational
    Phase 0 - Architecture & Spec       :done, p0, 2026-Q1, 2026-Q1
    Phase 1 - Zero-Friction MVP        :active, p1, 2026-Q2, 2026-Q3
    section Expansion
    Phase 2 - Multi-Category & Apps    :p2, 2026-Q4, 2027-Q1
    Phase 3 - Delivery & Route Hub     :p3, 2027-Q2, 2027-Q3
    section Operating System
    Phase 4 - Household Unified Ops    :p4, 2027-Q4, 2028-Q1
    Phase 5 - Expense Splitting Layer  :p5, 2028-Q2, 2028-Q3
    Phase 6 - Open Marketplace & B2B   :p6, 2028-Q4, 2029-Q2
```

---

## 2. Phase-by-Phase Detailed Scope

### Phase 0: System Architecture & Specification (CURRENT)
* **Objective:** Establish airtight domain foundations, data models, state machines, and documentation before writing application code.
* **Deliverables:**
  * Complete domain specifications (`/docs/features`).
  * Conceptual and relational entity data models (`/docs/architecture`).
  * State machines for Fulfillment, Cutoffs, and Payments.
  * Architectural Decision Records (ADR).
* **Exit Gate:** Complete repository documentation ready for autonomous engineering execution.

### Phase 1: The Zero-Friction MVP
* **Objective:** Prove the daily coordination and collection loop with 10–20 hyper-local beachhead vendors (Tiffin & 20L Water).
* **Deliverables:**
  * Phone OTP authentication on `ruxs.in`.
  * Vendor setup: Cutoff windows, meal shifts, jar deposit amounts.
  * Automated morning WhatsApp interactive polls (`[DELIVER]`, `[SKIP]`, `[EXTRA]`).
  * Live kitchen production counter (real-time order totals at cutoff).
  * Transaction-oriented Digital Khata ledger.
  * Basic delivery run sheet view for drivers.
  * Month-end invoice generation with dynamic UPI payment links.
* **Exit Gate:** 500 active household subscriptions processed over 30 consecutive days with >95% daily response/autopilot fulfillment accuracy.

### Phase 2: Multi-Category Expansion & Asset Hardening
* **Objective:** Support higher frequency categories and launch lightweight mobile companion interfaces.
* **Deliverables:**
  * New categories: **Milk & Dairy** (decimal quantities 0.5L–2.0L), **Daily Car/Bike Cleaning**, and **Newspapers**.
  * Formalized Physical Asset Ledger: 20L water can deposits, tiffin dabba holding balances, lost/damaged write-offs.
  * Multi-service **Vacation Mode**: 1-click pause across milk, tiffin, and newspapers for a date range.
  * Vernacular WhatsApp flows (Hinglish, Hindi, Kannada, Marathi).
  * Native/PWA Delivery Staff app with offline support for basement parking areas.
* **Exit Gate:** >2,500 active households across 3 diverse service categories per user.

### Phase 3: Route Optimization & Payment Automation
* **Objective:** Drive field efficiency for multi-driver vendors and automate payment collections.
* **Deliverables:**
  * Intelligent Run Sheet Sequencing: Grouping stops by Society -> Tower -> Wing -> Floor.
  * Delivery Proof Verification: Geotagged doorstep photo or customer QR scan.
  * **UPI AutoPay Integration:** Pre-authorized recurring mandates on the 1st of each month to eliminate manual payment chasing.
  * Automated delivery failure handling and redelivery workflows.
* **Exit Gate:** Vendor Days Sales Outstanding (DSO) drops below 24 hours via auto-debit; driver delivery velocity increases by 30%.

### Phase 4: The Multi-Service Household Platform
* **Objective:** Move from vendor-centric relationships to a unified household command center.
* **Deliverables:**
  * Complex service onboarding: **Laundry / Dhobi** (two-way pickup and return piece-counts) and **Dry Waste / Scrap Collection** (weighing and negative khata balance credits).
  * Household Accounts: Primary account holder invites family members and flatmates.
  * Unified Household Calendar: Daily matrix of who is delivering what, and at what time.
* **Exit Gate:** Average household manages 4+ recurring daily services inside a single RUXS profile.

### Phase 5: Integrated Expense Splitting (Splitwise Layer)
* **Objective:** Eliminate household financial friction among roommates and co-living residents.
* **Deliverables:**
  * Native expense splitting on top of verified RUXS invoices: Equal, percentage, or item-by-item split.
  * Shared liability ledger: Track who paid which vendor, who owes whom, and net balances.
  * 1-Click Peer-to-Peer UPI Settlement: Settle roommate debts directly inside WhatsApp/Web.
* **Exit Gate:** >40% of bachelor/flatshare accounts actively use RUXS expense splitting to settle monthly bills.

### Phase 6: Hyper-Local Marketplace & B2B Vendor Supply
* **Objective:** Expand from closed vendor SaaS to an open discovery ecosystem and upstream B2B supply.
* **Deliverables:**
  * Consumer Discovery Directory: New residents moving into an apartment complex can discover verified neighborhood tiffin aunties, doodhwalas, and water suppliers.
  * Vendor Reputation & Quality Ratings: Based on verified fulfillment track records and low dispute rates.
  * B2B Procurement: Aggregated bulk purchasing of raw materials (rice, dal, cooking oil, 20L cans) for network vendors at wholesale rates.
