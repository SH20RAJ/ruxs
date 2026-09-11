# Standard Operating Procedures: Vendor Daily Operations

**Classification:** `[CONFIRMED OPERATIONAL SPECIFICATION]`

---

## 1. A Day in the Life of a RUXS Vendor

```mermaid
timeline
    title Vendor Daily Operational Rhythm (Lunch Shift Example)
    08:30 AM : Morning Polling : System automatically pings customers on WhatsApp
    09:30 AM : 30-Min Cutoff Alert : Reviewing preliminary dashboard trends
    10:00 AM : CUTOFF LOCK : Final batch counter freezes : Cooking begins
    11:30 AM : Packing & Labeling : Sorting tiffins into delivery crates by Tower
    12:00 PM : Driver Handoff : Dispatching run sheets to delivery staff
    02:30 PM : Driver Reconciliation : Reviewing delivered vs failed drops and empties
    03:00 PM : Cash & Ledger Audit : Reviewing digital Khata debits and payments
```

---

## 2. Shift SOPs & Operational Checklists

### SOP-01: Morning Prep & Cutoff Review (08:30 AM – 10:00 AM)
1. **Log in to Dashboard:** Open `ruxs.in/vendor` on mobile or kitchen tablet.
2. **Monitor Response Flow:** Watch the live counter as responses arrive:
   * *Active Subscribers:* 84
   * *Confirmed Deliveries:* 62
   * *Explicit Skips:* 14
   * *Pending Responses:* 8
3. **Handle Incoming Calls:** If an elderly customer calls to skip, use the `Quick Skip` search bar to mark their status on the dashboard.
4. **At 10:00:00 AM Sharp (Cutoff Lock):**
   * The screen turns green with a prominent badge: **BATCH LOCKED FOR LUNCH**.
   * Note the final cooking requirement:
     * **Total Regular Meals:** 70
     * **Total Jain Meals:** 12
     * **Extra Rotis to Knead:** 24
   * Give final numbers to the head cook.

### SOP-02: Packing & Driver Handoff (11:30 AM – 12:00 PM)
1. Print or display the **Packing Manifest** sorted by apartment society and tower.
2. Pack meals into insulated crates labeled `Tower A` and `Tower B`.
3. Hand over physical crates to delivery staff.
4. Click `Dispatch Shift` on the vendor portal. This updates the driver's run sheet from `ASSIGNED` to `IN_PROGRESS` and notifies customers that meals are on the way.

### SOP-03: Post-Shift Reconciliation (02:30 PM – 03:00 PM)
1. Driver returns to the kitchen with empty containers.
2. Manager conducts the **Physical Return Count**:
   * *Full Dabbas Dispatched:* 82
   * *Delivered Successfully:* 81
   * *Failed Drops Returned:* 1
   * *Empty Dabbas Collected from Customers:* 78
3. Any discrepancy in collected empties is flagged on the driver's run sheet before signing off the shift.

### SOP-04: Month-End Statement Dispatch (1st of Calendar Month)
1. Review the automated pre-generated billing preview on the 31st evening.
2. Verify that manual cash payments received during the month were properly recorded as `PAYMENT_CREDIT`.
3. On the 1st at 10:00 AM, click **Dispatch Monthly WhatsApp Invoices**.
4. System automatically sends itemized statements with UPI payment links to all customers.
