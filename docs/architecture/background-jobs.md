# Architecture Specification: Background Jobs & Cron Workers

**Classification:** `[CONFIRMED PRODUCT REQUIREMENT]`

---

## 1. Asynchronous Job Scheduling Topology

RUXS depends on scheduled background workers to execute daily operational cycles without manual vendor intervention:

```mermaid
timeline
    title Daily Autonomous Operational Job Schedule
    00:01 AM : Midnight Subscription Generator : Generates daily fulfillments for today
    06:00 AM : Early Morning Polling Waves : Milk & Newspaper delivery locks
    08:30 AM : Lunch Shift Polling Waves : Dispatches WhatsApp morning polls
    10:00 AM : Lunch Cutoff Enforcer : Locks orders : Generates kitchen batch counts
    04:30 PM : Dinner Shift Polling Waves : Dispatches dinner polls
    06:00 PM : Dinner Cutoff Enforcer : Locks dinner orders
    23:59 PM : Daily Reconciliation Worker : Audits run sheets & missing debits
```

---

## 2. Core Worker Specifications

### 2.1 Midnight Subscription Generator Worker
* **Schedule:** Daily at `00:01 AM` (Local Time per Vendor Zone).
* **Execution Logic:**
  1. Queries all `ACTIVE` subscriptions where `start_date <= TODAY` and `(end_date IS NULL OR end_date >= TODAY)`.
  2. Filters out subscriptions with active `VacationPause` covering today.
  3. Checks cadence schedule (e.g., skips if subscription is `WEEKDAYS_ONLY` and today is Saturday).
  4. Inserts `DailyFulfillment` in `SCHEDULED` state with snapshot of product price.
* **Idempotency:** Unique composite database index on `(subscription_id, service_date, shift)` prevents duplicate fulfillment generation on worker retries.

### 2.2 Cutoff Enforcer & Autopilot Locker Worker
* **Schedule:** Recurring cron every **60 seconds**.
* **Execution Logic:**
  1. Queries all `CONFIRMATION_REQUIRED` fulfillments where `cutoff_time <= NOW()`.
  2. For orders with no customer response:
     * Transitions status to `CONFIRMED` (enforcing Autopilot default).
  3. Transitions locked fulfillments to `IN_PREPARATION`.
  4. Emits `CutoffWindowLocked` domain event.
  5. Recalculates and caches the live **Kitchen Production Counter** in Redis.

### 2.3 Monthly Statement & Invoicing Aggregator
* **Schedule:** 1st of every calendar month at `00:01 AM`.
* **Execution Logic:**
  1. Scans all unbilled `KhataEntry` records for the preceding month.
  2. Computes subtotal, promotional discounts, and previous outstanding unpaid balances.
  3. Inserts `Invoice` entity with status `ISSUED`.
  4. Attaches `InvoiceItem` records linked to individual ledger entries.
  5. Dispatches statement link to customer via WhatsApp template.

### 2.4 Dead-Letter Queue (DLQ) & Webhook Retry Worker
* **Schedule:** Continuous queue consumer.
* **Execution Logic:**
  1. Handles failed outbound WhatsApp dispatches or payment webhook processors.
  2. Retries using exponential backoff: 30s, 2m, 10m, 30m, 2h.
  3. After 5 failed attempts, routes message payload to a Dead-Letter Queue (DLQ) and raises a high-priority alert for engineering on-call.
