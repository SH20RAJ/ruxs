# Product & Operational Metrics (KPIs): RUXS

**Classification:** `[CONFIRMED PRODUCT REQUIREMENT]`

---

## 1. Metric Hierarchy & The North Star

RUXS measures success through a balanced scorecard across four operational pillars:
1. **Customer Engagement & Autopilot Health**
2. **Vendor Operational Efficiency & Retention**
3. **Fulfillment & Asset Integrity**
4. **Financial Velocity & Revenue**

```
┌────────────────────────────────────────────────────────┐
│                   NORTH STAR METRIC                    │
│   Monthly Autopilot Fulfillments Completed & Cleared   │
│ (Deliveries completed, verified, and settled with 0    │
│                 unresolved disputes)                   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Customer KPIs

| Metric | Definition | Target (Phase 1) | Target (Phase 3) |
| :--- | :--- | :--- | :--- |
| **Active Subscriptions** | Total active recurring service contracts on the platform | 500 | 25,000 |
| **Daily Poll Response Rate** | % of customers who tap an action (`[DELIVER]`, `[SKIP]`) on the morning WhatsApp prompt | > 65% | > 75% |
| **Autopilot Satisfaction Rate** | % of users who let the default deliver without manual action and don't dispute it | > 92% | > 96% |
| **Subscription Skip Rate** | % of scheduled daily fulfillments explicitly marked `SKIPPED` before cutoff | 12% – 18% | 12% – 18% |
| **30-Day Customer Retention** | % of newly onboarded subscribers active 30 days later | > 80% | > 85% |
| **Invoice Clearance Velocity** | % of monthly invoices paid via UPI within 48 hours of issuance | > 70% | > 88% |

---

## 3. Vendor Operational KPIs

| Metric | Definition | Target (Phase 1) | Target (Phase 3) |
| :--- | :--- | :--- | :--- |
| **Active Vendors** | Vendors actively processing daily fulfillments through RUXS | 15 | 300 |
| **Average Subscribers / Vendor** | Mean number of active recurring households per vendor | 45 | 110 |
| **Cutoff Compliance Rate** | % of days vendor locks preparation exactly at their configured cutoff time | > 95% | > 99% |
| **Monthly Vendor Churn** | % of vendors who discontinue using RUXS per month | < 5% | < 2% |
| **SaaS Conversion Rate** | % of free Starter tier vendors upgrading to Growth (₹499) or Pro (₹1,499) | 15% | 35% |

---

## 4. Operational & Field KPIs

| Metric | Definition | Impact Vector |
| :--- | :--- | :--- |
| **Food Wastage Reduction** | Reduction in prepared but uneaten meals compared to pre-RUXS baseline | Direct Vendor Profit Margin (Target: 15% reduction) |
| **Delivery Completion Rate** | $\frac{\text{Deliveries Marked DELIVERED}}{\text{Total Scheduled Orders after Cutoff}} \times 100$ | Operational Reliability (Target: > 98.5%) |
| **Failed Delivery Rate** | % of orders marked `FAILED` (door locked, customer unreachable, wrong address) | Cost Optimization (Target: < 1.5%) |
| **Asset Loss Rate** | % of circulating returnable assets (20L jars, tiffins) unaccounted for at month-end | Working Capital Leakage (Target: < 0.5%) |
| **Billing Dispute Rate** | $\frac{\text{Invoices Disputed by Customers}}{\text{Total Monthly Invoices Dispatched}} \times 100$ | Platform Trust (Target: < 1.0%) |

---

## 5. Financial & Monetization Metrics

| Metric | Formula / Definition | Target Benchmark |
| :--- | :--- | :--- |
| **GMV (Gross Merchandise Value)** | Total rupee value of all services fulfilled through the RUXS platform | Milestone: ₹10L/mo (Phase 1) → ₹2Cr/mo (Phase 3) |
| **SaaS MRR (Monthly Recurring Revenue)**| $\sum (\text{Active Vendors in Tier} \times \text{Tier Monthly Price})$ | Core Software Business Model |
| **Days Sales Outstanding (DSO)** | Average days between invoice generation and full payment collection | Reduced from informal 14 days to < 2.5 days |
| **Bad Debt / Default Rate** | Uncollectible khata balance over 60 days overdue as a % of total GMV | < 0.8% |
| **WhatsApp Cost Per Active Household**| Monthly Meta Cloud API cost divided by active customer count | Keep under ₹8.00 / active household / month |
