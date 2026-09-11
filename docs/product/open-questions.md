# Open Strategic & Architectural Questions: RUXS

**Classification:** `[OPEN QUESTION]`  
**Status:** Under Active Product & Architectural Review

---

## 1. Go-To-Market & Ecosystem Dynamics

### Q1: Is RUXS Vendor-First (B2B SaaS) or Consumer-First (B2C Utility)?
* **The Dilemma:**
  * *Vendor-First:* We sell operational software to tiffin kitchens and water suppliers. They bring their existing 80–120 customers onto RUXS to automate their business. Zero customer acquisition cost (CAC) for RUXS.
  * *Consumer-First:* We acquire apartment residents who then pressure their local vendors to adopt RUXS.
* **Current Working Assumption:** **Vendor-First SaaS for Phase 1.** Vendors have acute operational pain (food waste, late payments) and can mandate customer onboarding.

### Q2: What is the Exact Geographic Beachhead for Phase 1?
* **Options:**
  * *Bangalore (HSR Layout / Koramangala):* High tech adoption, high bachelor density, widespread tiffin & water usage.
  * *Pune (Kothrud / Viman Nagar):* Massive student and young professional population dependent on daily mess/tiffin services.
  * *Jaipur or Indore:* Dense, highly localized traditional tiffin networks with deep relationship-driven operations.
* **Open Decision:** Select one high-density 3-square-kilometer cluster to concentrate field operations and vendor onboarding.

### Q3: How Does RUXS Verify Unregulated Informal Vendors?
* **Context:** Many hyper-local home-cooks and water delivery boys operate informally without formal GST registration or FSSAI licenses.
* **Options:**
  * Strict: Require FSSAI / GST before onboarding. (Risk: High barrier to entry, eliminates 80% of homestyle tiffin aunties).
  * Pragmatic Tiered: Allow basic phone verification + Aadhaar/PAN for low-volume (<₹40,000/month) operations; require FSSAI when scaling beyond 30 subscribers.

---

## 2. Technical & Cost Architecture

### Q4: How Do Meta WhatsApp Cloud API Costs Affect Unit Economics?
* **Context:** Meta charges per conversation window (Utility vs. Marketing vs. Authentication). A daily morning interactive poll sent 30 days a month could cost ₹15–₹30 per customer per month.
* **Proposed Mitigations:**
  1. Leverage Meta's 24-hour customer service window where incoming messages allow free outbound replies.
  2. Fallback to progressive web app push notifications for power users.
  3. Bundle WhatsApp message allowances into the Vendor SaaS tier (e.g., Growth tier includes 3,000 WhatsApp notifications/mo).

### Q5: Which Payment Aggregator Best Serves Hyper-Local UPI Settlement?
* **Options:** Cashfree, Razorpay, PhonePe PG, or Decentro.
* **Considerations:**
  * Lowest transaction fee for UPI Intent (< 0.25% or flat ₹1–2).
  * Direct vendor nodal payout capabilities (Split payments: 98.5% to vendor, 1.5% platform fee).
  * Support for recurring UPI AutoPay e-mandates in Phase 3.

---

## 3. Product & Financial Mechanics

### Q6: How Does Household Expense Splitting Interact with the Vendor Khata?
* **The Conflict:**
  * Does the vendor bill the *Household*, or does the vendor bill an *Individual*?
  * If flatmate A, B, and C split a ₹3,000 tiffin bill, but C refuses to pay their ₹1,000 share:
    * Is the vendor short ₹1,000? (Unacceptable to vendor).
    * Or does Account Owner A owe the vendor the full ₹3,000, while C's debt is strictly an internal peer-to-peer liability between C and A?
* **Working Assumption:** The vendor is **always owed the full invoice amount by the Primary Account Owner**. The Splitwise layer is an internal household reimbursement ledger on top of the cleared invoice.

### Q7: What Qualifies as Sufficient Delivery Verification?
* **The Conflict:**
  * Doorstep photo: High friction for delivery boys climbing 10 flights of stairs; burns data and storage.
  * Customer OTP / QR scan: Customer may not be home, or delivery happens at 6:00 AM while customer sleeps.
* **Working Assumption:** For routine deliveries, a 1-tap driver check-off with background geolocation tag suffices. Photo verification is only enforced for first-time drops, high-value orders, or customers flagged with past disputes.

### Q8: How Should Invoices Handle GST for Small Vendors?
* **Context:** Vendors with annual turnover under ₹40 Lakhs (or ₹20 Lakhs in some states) are legally exempt from GST in India.
* **Working Assumption:** RUXS generates a simplified "Commercial Bill of Supply / Monthly Statement" by default. If a vendor provides a valid GSTIN in their profile, the engine automatically calculates CGST/SGST line items.
