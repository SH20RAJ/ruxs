# Product & Operational Risks Matrix: RUXS

**Classification:** `[CONFIRMED PRODUCT REQUIREMENT]`

---

## 1. Risk Analysis Matrix

| # | Risk Description | Prob. | Impact | Mitigation Strategy | MVP Treatment |
| :- | :--- | :-: | :-: | :--- | :--- |
| **R1** | **Low Vendor Tech Literacy**<br>Vendors struggle to configure complex software or misinterpret dashboard numbers. | High | High | Radical simplification: Giant buttons, minimal text, one-screen daily prep counter. Dedicated 15-minute field onboarding by operations team. | Single-page vendor dashboard with just 1 number: *Total meals to prepare today*. |
| **R2** | **WhatsApp Dependency & Policy Risk**<br>Meta restricts template messages, increases conversation pricing, or bans phone numbers. | Med | Critical | Strict compliance with Meta Business policies. Graceful fallback to Web PWA push notifications and SMS fallback. | Adhere strictly to Meta utility message template guidelines; capture user opt-in during onboarding. |
| **R3** | **Low Customer Daily Engagement**<br>Customers ignore the 8:30 AM morning WhatsApp prompt. | High | Med | **Autopilot Default:** If no action is taken by cutoff, default state is `CONFIRMED`. System explicitly trains users: *"No action needed if you want regular delivery"*. | Implement autopilot default with prominent cutoff countdown warnings. |
| **R4** | **Payment Collection Failures**<br>Customers delay paying monthly bills despite receiving digital invoice links. | Med | High | Automated WhatsApp reminder cadence (Day 1, Day 3, Day 5). Configurable service suspension trigger on Day 7 if overdue. | Send clean itemized invoices on the 1st with embedded UPI intent links; enable manual cash reconciliation. |
| **R5** | **Asset Tracking Inaccuracies**<br>Delivery boys forget to record collected water cans or tiffin boxes at doorstep. | High | High | Frictionless driver UI: Big `[+1]`, `[-1]` steppers on run sheet. Default assumes `1 Full In = 1 Empty Out` unless driver explicitly changes it. | Stepper interface defaulting to equal swap (1 delivered = 1 collected). |
| **R6** | **Late Cancellation Disputes**<br>Customer claims they messaged on WhatsApp, but system marked them past cutoff. | Med | Med | System timestamps all webhook receipts to the millisecond. Clear UI messaging: *"Skip registered after 10:00 AM cutoff"*. | Transparent audit logs visible to both customer and vendor. |
| **R7** | **Multi-Tenant Data Leakage**<br>Vendor A accidentally views customer lists, revenues, or pricing of Vendor B. | Low | Critical | Database-level row-level security (RLS), scoped tenant queries, automated integration tests verifying tenant isolation. | Strict tenant authorization middleware on every API route and database query. |
| **R8** | **Operational Support Burden**<br>Early users overwhelm the founders with complaints about missing tiffins or bad food. | High | Med | Clear boundary: RUXS is software infrastructure, not food manufacturer. Vendor contact card prominently displayed on all invoices and WhatsApp menus. | 1-tap "Call Vendor" button in WhatsApp message to resolve food quality directly. |
| **R9** | **Route Sequencing Complexity**<br>Drivers find algorithmic route suggestions counter-intuitive to their local habits. | Med | Low | Defer algorithmic TSP routing. Allow manual drag-and-drop or simple society/tower grouping. | Group strictly by Apartment Society and Tower; no complex GPS routing in Phase 1. |
| **R10**| **Complex Service Variation Overload**<br>Attempting to handle too many variations (low salt, jain, half-roti, gluten-free) breaks the schema. | High | Med | Normalize variations into discrete Add-ons rather than infinite custom meal types. | Fixed variants: Regular vs. Jain, plus integer Add-ons (+Rotis). |
