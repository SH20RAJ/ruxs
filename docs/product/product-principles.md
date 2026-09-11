# Product Principles: RUXS

**Classification:** `[CONFIRMED PRODUCT REQUIREMENT]`

---

## The 10 Core Product Principles

These ten principles govern every product decision, user interface interaction, data model design, and operational workflow in RUXS.

---

### 1. Zero-Friction Interaction
* **Tenet:** Common, daily actions must take **one tap** and less than three seconds.
* **In Practice:** A consumer deciding whether to eat lunch today should never be forced to log in, open an app drawer, browse a menu, or wait for splash screens. They receive an interactive message and tap `[DELIVER]` or `[SKIP]`. If they do nothing, the system executes their configured default (autopilot).

### 2. WhatsApp-First Accessibility
* **Tenet:** The system must work flawlessly for users who will never install a mobile app.
* **In Practice:** Over 500 million Indians use WhatsApp daily. WhatsApp is our primary interactive surface for consumers. Web and native apps provide deep configuration, rich ledger inspection, and administrative tools, but daily fulfillment operations must never depend on app installation.

### 3. Local-First
* **Tenet:** RUXS empowers neighborhood vendors; it does not replace or commoditize them.
* **In Practice:** We do not launch RUXS-branded cloud kitchens or centralized dark stores. We keep the neighborhood tiffin aunt, the local doodhwala, and the colony water distributor at the center of the customer relationship. RUXS acts as their invisible technology and operational backbone.

### 4. Recurring-First Architecture
* **Tenet:** The fundamental building block of RUXS is a **subscription**, not a one-off cart checkout.
* **In Practice:** E-commerce systems are designed around `Cart -> Checkout -> Payment -> Shipment`. RUXS is designed around `Cadence -> Cutoff -> Daily Fulfillment -> Ledger Entry -> Consolidated Billing`. One-off orders (e.g., extra meal, urgent water can) are treated as temporary perturbations on a recurring schedule.

### 5. Digital Khata Integrity
* **Tenet:** Every rupee charged must trace back to a verifiable daily fulfillment event.
* **In Practice:** There are no arbitrary balance mutations. Balances are derived from an immutable double-entry ledger. Neither a vendor nor a customer can arbitrarily change a number without a timestamped, auditable transaction explaining the change.

### 6. Physical + Digital Co-Existence
* **Tenet:** The digital system must track physical assets with the same precision as monetary debits and credits.
* **In Practice:** In hyper-local services, physical containers (20L water cans, stainless steel tiffins, milk crates, laundry bags) represent working capital. When a delivery occurs, the system records asset handover and collection in real time, preventing inventory leakage and deposit conflicts.

### 7. Radical Vendor Simplicity
* **Tenet:** Interfaces for vendors and delivery personnel must be dramatically simpler than traditional ERP software.
* **In Practice:** A kitchen owner or delivery boy cannot navigate complex multi-tab enterprise software. Screens must feature large touch targets, high contrast, minimal typing, one-thumb navigation, and local language accessibility. At 9:55 AM, the kitchen owner only needs to know one number: *"How many meals must I cook?"*

### 8. Automation of Routine Operations
* **Tenet:** Humans should only intervene when an exception occurs.
* **In Practice:** Polling customers, locking cutoffs, generating kitchen batch counts, building driver run sheets, calculating billing totals, and sending payment links must happen automatically through scheduled background workers.

### 9. Transparent Dispute Resolution
* **Tenet:** Both customer and vendor must instantly understand exactly why an invoice exists.
* **In Practice:** When a bill arrives, every single day has a clear status: `Delivered (12:42 PM by Ramesh)`, `Skipped (9:14 AM by User)`, `Late Cancellation (11:02 AM)`. If a dispute arises, both parties view the exact same chronological audit trail.

### 10. Modular Service Architecture
* **Tenet:** Adding a new recurring household service category must never require re-architecting the platform.
* **In Practice:** Whether handling meals (discrete counts + cutoff), water (asset deposits + SOS reorder), milk (decimal quantities), or laundry (piece-count pickup/return), all categories must implement common core domain interfaces (`SubscriptionService`, `FulfillmentItem`, `LedgerBridge`).
