# Service Categories Specification: RUXS

**Classification:** `[CONFIRMED PRODUCT REQUIREMENT]`

---

## 1. Overview and Phased Rollout Matrix

RUXS provides a modular service architecture capable of modeling any recurring hyper-local service. To maximize operational focus and ensure technical stability, service categories are phased strategically based on operational complexity and frequency.

| Service Category | Cadence | Physical Asset Tracking? | Cutoff Urgency | Target Phase |
| :--- | :--- | :--- | :--- | :--- |
| **A. Tiffin Services** | Daily / Meal shifts | Yes (Tiffin boxes) | Critical (Cooking window) | **MVP (Phase 1)** |
| **B. 20L Water Jars** | 2-3 days / SOS | Yes (20L Cans + Deposits) | Moderate | **MVP (Phase 1)** |
| **C. Milk & Dairy** | Daily early morning | Optional (Glass bottles/crates) | Strict (Night prior) | **Phase 2** |
| **D. Daily Car / Bike Wash**| Daily morning | No | Low | **Phase 2** |
| **E. Newspapers** | Daily early morning | No | Strict (Night prior) | **Phase 2** |
| **F. Pooja Flowers** | Daily morning | Yes (Reusable baskets) | Moderate | **Phase 3** |
| **G. Bakery & Breakfast** | Daily / Alternate | No | Moderate | **Phase 3** |
| **H. Laundry / Dhobi** | Bi-weekly pickup | Yes (Bags, Hangers) | Low | **Phase 4** |
| **I. Dry Scrap & Cartons** | Weekly / Monthly | Yes (Weighing scale / bags) | Low | **Phase 4** |

---

## 2. Deep Dive: Category Specifications

### A. Tiffin Services (Beachhead - MVP)
* **Description:** Home-cooked or cloud kitchen meal subscriptions serving breakfast, lunch, and dinner.
* **Meal Variations:** Regular, Jain (no onion/garlic), Low-oil/Diet, Non-Veg days.
* **Quantity & Add-ons:** Integer meal counts (1 meal, 2 meals) plus line-item add-ons (+2 Extra Rotis, +1 Bowl Rice, +Sweet).
* **Cutoff Dynamics:**
  * Lunch: Poll at 8:30 AM → Cutoff at 10:00 AM → Delivery 12:30 PM–1:30 PM.
  * Dinner: Poll at 4:30 PM → Cutoff at 6:00 PM → Delivery 7:30 PM–8:45 PM.
* **Asset Tracking:** Stainless steel dabbas (tiffin containers). Customer holds 1 or 2 dabbas; driver swaps empty for full at doorstep.
* **Late Cancellation Policy:** Skips after cutoff result in `LATE_SKIP`, triggering a configurable 50% or 100% kitchen compensation charge.

### B. 20L RO Water Jars (Beachhead - MVP)
* **Description:** Scheduled or on-demand delivery of 20-liter purified bubble-top water cans.
* **Cadence Options:**
  * Fixed recurring: Every 2 days, Every Monday/Thursday, or Weekly.
  * SOS / On-Demand: 1-tap reorder when the current jar is half empty.
* **Asset & Deposit Engine:**
  * Jars have a non-zero financial liability. Default customer deposit: ₹150–₹300 per jar.
  * Customer ledger maintains an exact `jars_held` balance (e.g., Customer holds 2 jars).
  * Delivery action requires entering: `Jars Delivered: N`, `Empties Collected: M`.
  * Net holding changes automatically: `new_balance = old_balance + (N - M)`.

### C. Milk & Dairy (Phase 2)
* **Description:** Fresh pouch or bottled milk (Cow, Buffalo, A2, Full Cream) and dairy staples (Dahi, Paneer, Chaas).
* **Quantity Handling:** Support for **decimal quantities** (0.5L, 1.0L, 1.5L, 2.0L).
* **Temporary Fluctuations:** Guests visiting over the weekend: customer requests `+1.0L Cow Milk` and `500g Paneer` for Saturday only.
* **Cutoff Dynamics:** Night-before cutoff (e.g., 9:00 PM cutoff for 5:30 AM doorstep delivery).

### D. Daily Car Cleaning & Bike Wash (Phase 2)
* **Description:** Early-morning dusting and exterior/interior wiping of vehicles parked in apartment basements.
* **Cadence:** 6 days a week (e.g., Mon–Sat exterior wipe, Sunday deep interior vacuum).
* **Proof of Service:** Driver marks vehicle done and optionally snaps a geotagged photo of the cleaned car with timestamp.
* **Pause / Skip:** Customer travels or parks at airport: 1-tap pause for specific dates without billing.

### E. Newspapers & Magazines (Phase 2)
* **Description:** Daily morning newspaper delivery (e.g., Times of India, Economic Times, Dainik Bhaskar).
* **Billing Pauses:** Zero-waste paper holds. When vacation mode is active, billing is automatically paused, and the vendor receives a condensed stop-list.

### F. Pooja Flowers (Phase 3)
* **Description:** Fresh morning flower strings (Marigold, Jasmine, Hibiscus, Rose petals) delivered in reusable wicker baskets or cloth bags before 6:30 AM.
* **Festival Surges:** Automatic volume adjustments on Hindu festival dates (e.g., Diwali, Ganesh Chaturthi, Navratri) with pre-scheduled opt-in notifications.

### G. Bakery & Breakfast Staples (Phase 3)
* **Description:** Freshly baked pav, brown/white bread, farm eggs, and butter delivered alongside early morning milk.

### H. Laundry & Dhobi (Phase 4)
* **Description:** Recurring pick-up, wash, iron, and return cycle for domestic laundry.
* **Complexity:** Requires two-way tracking:
  * Stage 1: Pickup from home, bag tagged with unique barcode/number.
  * Stage 2: In-hub piece count verification (e.g., 8 shirts, 4 trousers, 2 bedsheets).
  * Stage 3: Return delivery with hanger/cover tracking and itemized Khata debit.

### I. Dry Waste, Scrap & Carton Collection (Phase 4)
* **Description:** Scheduled or on-demand collection of Amazon cardboard boxes, plastic scrap, and old newspapers.
* **Reversed Financial Flow:** Instead of customer paying the vendor, the vendor weighs scrap (e.g., 12 kg cardboard @ ₹10/kg = ₹120) and **credits the customer's Khata** or offsets other household service bills.
