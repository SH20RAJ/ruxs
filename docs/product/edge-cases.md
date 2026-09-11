# Edge Cases & Failure Modes Specification: RUXS

**Classification:** `[CONFIRMED PRODUCT REQUIREMENT]`

---

## 1. Overview

Hyper-local recurring operations are prone to human errors, asynchronous network drops, concurrent actions, and physical-world ambiguities. This document details the expected system behavior, data consistency guarantees, and audit requirements for critical edge cases.

---

## 2. Edge Case Scenarios

### EC-01: Customer Skips After Cutoff Time
* **Problem:** Customer taps `[SKIP]` at 10:04 AM when the kitchen cutoff is configured for 10:00 AM. Ingredients are already on the stove.
* **Expected Behavior:** System checks cutoff timestamp. Rejects regular skip. Transitions fulfillment status to `LATE_SKIP`.
  * If vendor policy is `LATE_CHARGE_100%`: Customer is debited full meal cost, but marked cancelled so driver does not deliver.
  * If vendor policy is `LATE_CHARGE_50%`: Customer is debited 50% raw ingredient fee.
  * WhatsApp response: *"Your skip was received after the 10:00 AM cutoff. Your kitchen was compensated as per policy."*
* **Data Consistency:** Atomically update `DailyFulfillment.status = LATE_SKIP`, write ledger debit entry with code `LATE_CANCELLATION_FEE`.
* **Audit Requirement:** Log exact client action timestamp, server receipt timestamp, and configured cutoff rule in `AuditLog`.

### EC-02: Vendor Overrides a Customer Skip
* **Problem:** Customer skipped lunch, but calls vendor asking: *"Can you please make an exception? My guests just arrived."*
* **Expected Behavior:** Vendor Admin enters dashboard, clicks customer, and selects `Force Re-open Fulfillment`. State transitions from `SKIPPED` -> `CONFIRMED`. Live kitchen count increments by 1.
* **Data Consistency:** Record `DailyFulfillment.override_by = VendorAdminUserId`, record timestamp, reverse any skip credit or recalculate batch.
* **Audit Requirement:** Immutable log entry: `VENDOR_MANUAL_OVERRIDE` referencing both vendor and customer IDs.

### EC-03: Customer Claims Non-Delivery Despite Driver Marking Delivered
* **Problem:** Driver marked meal `DELIVERED` at 1:15 PM, but customer messages at 2:00 PM: *"No food outside my door."*
* **Expected Behavior:** Customer taps `[REPORT ISSUE]` on WhatsApp or Web. A `Dispute` record is opened with status `OPEN`. The associated Khata debit entry is flagged as `DISPUTED`.
* **Data Consistency:** Khata debit remains pending resolution; vendor admin is notified with delivery timestamp and driver notes.
* **Audit Requirement:** Create `Dispute` ticket with driver's geolocation coordinates and delivery timestamp.

### EC-04: Driver Marks Delivered Accidentally
* **Problem:** Driver fat-fingers `DELIVERED` while the bike is parked, before actually reaching the customer's apartment.
* **Expected Behavior:** Driver can revert status within a 5-minute safety window to `OUT_FOR_DELIVERY` if no subsequent action was taken.
* **Data Consistency:** Reversal of `DELIVERED` transitions back to `OUT_FOR_DELIVERY`. Corresponding Khata ledger transaction is soft-voided with a countervailing `VOID_DELIVERY` entry.
* **Audit Requirement:** Log driver device ID, time delta, and `DRIVER_ACCIDENTAL_TAP_REVERTED`.

### EC-05: Payment Webhook Arrives Twice (Duplicate Webhook)
* **Problem:** Payment gateway retries webhook, sending identical `payment_success` payload twice within 2 seconds.
* **Expected Behavior:** Idempotency layer checks `PaymentAttempt.gateway_reference_id`. The second webhook finds an existing processed record, logs a duplicate receipt warning, and returns HTTP 200 OK immediately without double-crediting.
* **Data Consistency:** Khata credit transaction executed exactly once. Balance is not double-credited.
* **Audit Requirement:** Log incoming webhook ID, hash of payload, and duplicate detection flag.

### EC-06: WhatsApp Webhook Arrives Twice
* **Problem:** Meta sends duplicate webhook notifications for a single button click due to network latency.
* **Expected Behavior:** Ingestion handler checks `whatsapp_message_id` in Redis / Database idempotency table. If already processed within the last 24 hours, drop payload and return HTTP 200.
* **Data Consistency:** Fulfillment state machine is not evaluated twice.
* **Audit Requirement:** Record `WHATSAPP_DUPLICATE_WEBHOOK_DROPPED`.

### EC-07: Customer Changes Registered Phone Number
* **Problem:** Customer loses SIM card or switches primary number, but has an active subscription and outstanding Khata balance.
* **Expected Behavior:** Customer initiates phone change from authenticated web session, requiring OTP verification on BOTH old and new numbers (or admin verification if old number is lost).
* **Data Consistency:** Update `User.phone_number`. Update unique index. Migrate WhatsApp conversation mapping to new MSISDN. Historic Khata transactions retain immutable `user_id` foreign key.
* **Audit Requirement:** Security log: `PHONE_NUMBER_MIGRATED` with IP address and admin confirmation.

### EC-08: Vendor Changes Pricing Midway Through Billing Cycle
* **Problem:** Tiffin vendor increases meal price from ₹80 to ₹90 on the 15th of the month.
* **Expected Behavior:**
  * Historic fulfillments (1st–14th) must strictly retain the old price (₹80).
  * Future fulfillments (15th onwards) reflect the new price (₹90).
  * System requires customer notification before price change takes effect.
* **Data Consistency:** `FulfillmentItem` must snapshot `unit_price` at the moment of creation. Never compute past totals by multiplying historic counts by current product catalog price.
* **Audit Requirement:** Log `PRODUCT_PRICE_UPDATED` with previous and new price points.

### EC-09: Subscription Paused Midway Through Billing Cycle
* **Problem:** Customer activates vacation pause on the 12th after having consumed 10 meals earlier in the month.
* **Expected Behavior:** System cancels generation of future daily fulfillment records between pause start and end dates. Outstanding unbilled Khata debits from earlier in the month remain intact and are billed at normal month-end.
* **Data Consistency:** No orphaned fulfillment records; Khata balance reflects exact consumed units.
* **Audit Requirement:** Record `SUBSCRIPTION_PAUSED_SCHEDULE`.

### EC-10: Customer Changes Daily Quantity for a Single Day
* **Problem:** Customer usually takes 1 meal, but requests 3 meals for Friday lunch due to visiting colleagues.
* **Expected Behavior:** A temporary `ONE_TIME_ADDON` fulfillment record is generated for that specific date. Daily prep count increases by 2. Saturday automatically reverts to 1 meal default.
* **Data Consistency:** Two line items attached to Friday's `DailyFulfillment`: 1 regular subscription item, 1 temporary extra item.
* **Audit Requirement:** Log `ONE_TIME_QUANTITY_OVERRIDE`.

### EC-11: Water Jar Returned Late or Customer Shifts House
* **Problem:** Customer discontinues water service but fails to return 2 empty cans.
* **Expected Behavior:** System initiates asset recovery workflow. If cans are not returned after 14 days, the vendor can execute an `ASSET_FORFEIT` transaction. The customer's cash deposit (e.g., 2 × ₹150 = ₹300) is converted into a non-refundable asset purchase credit on the ledger.
* **Data Consistency:** Customer asset balance decrements from 2 to 0. Khata deposit liability is cleared against asset compensation debit.
* **Audit Requirement:** Log `ASSET_DEPOSIT_FORFEITED`.

### EC-12: Customer Subscribes to Multiple Independent Vendors
* **Problem:** Rahul gets tiffin from Vendor A (Sharma Kitchen) and water from Vendor B (Colony Aqua).
* **Expected Behavior:** Complete tenant separation. Each vendor has a dedicated Khata ledger with Rahul. A morning WhatsApp prompt cleanly groups or separates messages: *"Sharma Kitchen: Lunch today?"* and *"Colony Aqua: Water delivery today?"*.
* **Data Consistency:** Two independent `Subscription` rows, two independent `Khata` ledger balances.
* **Audit Requirement:** Tenant ID enforced on every ledger entry.

### EC-13: Concurrent Skip and Delivery Actions
* **Problem:** At 9:59:58 AM, customer taps `[SKIP]` on WhatsApp while simultaneously delivery boy taps `OUT_FOR_DELIVERY` on dashboard.
* **Expected Behavior:** Database optimistic locking or row-level `SELECT FOR UPDATE` on `DailyFulfillment`. Whichever transaction commits first wins. If `SKIP` commits first, driver app receives notification: *"Order was skipped by customer"*.
* **Data Consistency:** Prevent invalid state `DELIVERED_AND_SKIPPED`. Strict finite state machine guard conditions.
* **Audit Requirement:** Log race resolution order and concurrency timestamp.
