# Unit Economics & Operational Cost Model: RUXS

**Classification:** `[PROPOSED DESIGN & BUSINESS ASSUMPTIONS]`

---

## 1. Per-Active-Household Operational Cost Model (COGS)

To ensure long-term sustainability, the direct marginal cost of servicing a single active recurring household must remain well below platform revenue.

### Monthly Direct Variable Cost Breakdown (Per Active Household)

| Cost Component | Monthly Consumption | Unit Rate (INR) | Monthly Cost | Notes / Optimization |
| :--- | :--- | :--- | :---: | :--- |
| **WhatsApp Utility Messages** | 30 Daily Morning Polls | ₹0.12 / utility msg | ₹3.60 | Uses Meta India utility rate; replies within 24h are free. |
| **WhatsApp Invoicing & Alerts** | 4 Notifications / month | ₹0.12 / utility msg | ₹0.48 | Statement, payment receipt, cutoff alert. |
| **Edge Compute (Cloudflare)** | ~120 Edge Worker Requests | ₹0.00004 / request | ₹0.01 | Cloudflare Workers compute is negligible at scale. |
| **PostgreSQL & Database IO** | ~35 Transactions / month | Amortized across DB | ₹0.50 | Pooled relational instance with connection pooling. |
| **SMS DLT Fallback** | 1 OTP / 2 months | ₹0.15 / SMS | ₹0.08 | Triggered only when WhatsApp is opted-out or unavailable. |
| **Payment Gateway UPI Fee** | 1 Monthly UPI Settlement | 0.30% of ₹3,000 GMV | ₹9.00 | Paid by customer or deducted from vendor payout. |
| **TOTAL VARIABLE COGS** | — | — | **~₹13.67 / mo** | Net software COGS excluding payment gateway is **~₹4.67 / mo**. |

---

## 2. Vendor SaaS Unit Economics & Contribution Margin

### Scenario: Mid-Sized Tiffin Vendor on GROWTH Tier (₹499 / Month)
* **Active Subscribers:** 80 Households
* **Monthly GMV Processed:** 80 × ₹3,000 = **₹2,40,000 / month**

#### Platform Inflow:
* Vendor SaaS Subscription: **₹499.00**
* Payment Processing Margin (0.4% take-rate on ₹2.4L GMV): **₹960.00**
* **Total Gross Inflow:** **₹1,459.00 / month**

#### Platform Outflow (Variable Costs):
* WhatsApp Messaging Costs (80 households × ₹4.08): **₹326.40**
* Serverless & Database Allocation: **₹40.00**
* Payment Gateway Wholesale Wholesale (0.20% on ₹2.4L): **₹480.00**
* **Total Outflow:** **₹846.40 / month**

#### Net Monthly Contribution Margin:
$$\text{Net Margin} = ₹1,459.00 - ₹846.40 = \mathbf{+₹612.60} \quad (\mathbf{42.0\%} \text{ Contribution Margin})$$

---

## 3. Vendor ROI & Value Proposition

For the vendor, the economic equation is an undeniable no-brainer:

| Value Driver | Monthly Financial Benefit to Vendor |
| :--- | :---: |
| **Prevented Food Wastage** (Saving 6 unneeded meals/day @ ₹40 raw cost) | **+₹6,240 / month** |
| **Recovered Water Cans / Tiffin Losses** (Saving 4 lost containers @ ₹180) | **+₹720 / month** |
| **Faster Cash Collection & Zero Bad Debt** (Recovering 2% uncollected debt) | **+₹4,800 / month** |
| **Total Monthly Bottom-Line Benefit to Vendor** | **+₹11,760 / month** |
| **Vendor Cost (RUXS Growth Tier)** | **-₹499 / month** |
| **NET MONTHLY VENDOR BENEFIT** | **+₹11,261 (23.5x ROI)** |
