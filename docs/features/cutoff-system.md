# Feature Specification: Cutoff System & Window Management

**Classification:** `[CONFIRMED PRODUCT REQUIREMENT]`

---

## 1. Operational Rationale

The cutoff mechanism is the critical boundary that protects vendor unit economics.

In traditional food delivery or on-demand services, food is prepared after the customer places an order. In recurring hyper-local services, operations are **batched**:
* A tiffin kitchen prepares 90 meals in bulk between 10:00 AM and 11:30 AM.
* A dairy distributor loads crates into tempos at 3:30 AM.
* A water supplier loads 80 cans onto a trike at 7:00 AM.

If a customer cancels at 11:45 AM, the food is already packed. Without a strict digital cutoff, either the vendor eats the loss, or an angry argument ensues. RUXS solves this through **automated, configurable cutoff enforcement**.

---

## 2. Cutoff Configuration Architecture

> **CRITICAL RULE:** Cutoffs must **NEVER be globally hard-coded** (e.g., assuming 9:00 AM poll / 10:00 AM cutoff everywhere). Every vendor, service category, and shift configures its own operational window.

```mermaid
timeline
    title Shift Operational Window (Example: Lunch Shift)
    08:30 AM : Polling Dispatch : Interactive WhatsApp message sent
    09:30 AM : First Warning : "30 mins left to skip today's lunch"
    10:00 AM : CUTOFF LOCK : State locks to IN_PREPARATION : Batch count frozen
    11:30 AM : Packing Complete : Shift handed to Delivery Staff
    12:30 PM - 01:30 PM : Doorstep Delivery Window
```

### Configurable Cutoff Parameters per Service/Shift

```typescript
interface ServiceCutoffPolicy {
  id: string;
  vendor_id: string;
  service_id: string;                 // e.g., "Tiffin - Lunch"
  shift: "MORNING" | "LUNCH" | "EVENING" | "NIGHT";
  
  // Timing parameters (24-hour format in vendor timezone)
  poll_time: string;                  // e.g., "08:30"
  cutoff_time: string;                // e.g., "10:00"
  dispatch_window_start: string;      // e.g., "12:30"
  dispatch_window_end: string;        // e.g., "13:30"
  
  // Policy behavior
  autopilot_behavior_at_cutoff: "CONFIRM_DEFAULT" | "SKIP_DEFAULT";
  late_skip_policy: 
    | "FORBIDDEN"                     // No skips allowed past cutoff; full charge applies
    | "CHARGE_FULL_PRICE"             // Skip acknowledged (not cooked/sent), but 100% charged
    | "CHARGE_INGREDIENT_PERCENTAGE"; // Skip acknowledged, charged N% (e.g. 50%)
  late_charge_percentage: number;     // e.g., 50 for 50%
  
  allow_vendor_override: boolean;     // Allows vendor admin to manually unlock for customer
}
```

---

## 3. Real-World Shift Scenarios

| Service & Shift | Poll Time | Cutoff Time | Delivery Window | Late Skip Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Tiffin - Lunch** | 08:30 AM | 10:00 AM | 12:30 PM – 01:30 PM | `CHARGE_INGREDIENT_PERCENTAGE` (50%) |
| **Tiffin - Dinner** | 04:30 PM | 06:00 PM | 07:45 PM – 08:45 PM | `CHARGE_INGREDIENT_PERCENTAGE` (50%) |
| **Early Morning Milk**| 08:00 PM (prev night) | 10:00 PM (prev night) | 05:30 AM – 07:00 AM | `FORBIDDEN` (crates loaded at 3 AM) |
| **Newspaper** | N/A (Daily default) | 09:00 PM (prev night) | 05:30 AM – 07:00 AM | `FORBIDDEN` |
| **20L Water Cans** | 07:00 AM | 09:00 AM | 10:00 AM – 02:00 PM | `CHARGE_FULL_PRICE` (0% penalty if empty not loaded) |

---

## 4. Cutoff Locking Execution Engine

The **Cutoff Evaluation Cron Worker** executes every 60 seconds:
1. Queries all `CONFIRMATION_REQUIRED` fulfillments where `cutoff_time <= NOW()`.
2. For customers who took no action:
   * Transition status to `CONFIRMED` (Autopilot).
   * Notify vendor live counter.
3. Locks the order against standard `SKIPPED` transitions.
4. Generates live **Kitchen Production Summary**:
   * Total Regular Meals
   * Total Jain Meals
   * Total Add-ons (+Rotis, +Sweets)
   * Net Active Delivery Addresses

---

## 5. Vendor Manual Override Protocol

If a customer calls the vendor directly begging for a late exception:
1. Vendor opens the RUXS dashboard.
2. Clicks `Override Cutoff`.
3. Selects action: `Manual Confirm` or `Manual Cancel with 0% Fee`.
4. Enters brief reason (e.g., *"Customer called, family emergency"*).
5. The system modifies the fulfillment and writes a timestamped record to `AuditLog`.
