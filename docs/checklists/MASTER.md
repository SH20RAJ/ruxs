# RUXS Master Engineering Roadmap & Checklist

**Brand:** RUXS  
**Domain:** [ruxs.in](https://ruxs.in)  
**Status:** In Active Execution  

This master checklist represents the complete execution roadmap for RUXS. Checkboxes in this master list must only be checked when their underlying feature checklist in `docs/checklists/` is 100% complete and verified.

---

## Foundation
- [x] [00-foundation](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/00-foundation.md) — Repository audit, documentation, checklists & engineering standards
- [x] [01-brand-and-shell](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/01-brand-and-shell.md) — RUXS branding, modern responsive app shell, mobile-first navigation & PWA metadata

## Identity & Access
- [x] [02-authentication](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/02-authentication.md) — Passwordless Phone OTP authentication & edge session management

## Core Domain & Operations
- [x] [03-database](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/03-database.md) — PostgreSQL schema, Drizzle ORM migrations, indexes & tenant RLS
- [x] [04-vendor-onboarding](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/04-vendor-onboarding.md) — Vendor profile setup, UPI ID, service zones & operating hours
- [x] [05-customer-onboarding](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/05-customer-onboarding.md) — Customer address capture, society/tower selection & phone link
- [ ] [06-services](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/06-services.md) — Service catalog (Tiffin, Water, Milk), units, pricing & configurable cutoffs
- [ ] [07-subscriptions](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/07-subscriptions.md) — Recurring schedule engine (Daily, Weekdays, Alternate Days)
- [ ] [08-daily-fulfillment](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/08-daily-fulfillment.md) — 11-State fulfillment FSM & daily midnight generator
- [ ] [09-cutoff-engine](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/09-cutoff-engine.md) — Automated cutoff locking, batch counter & late skip policies
- [ ] [10-khata](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/10-khata.md) — Append-only double-entry transactional financial ledger in integer Paise
- [ ] [11-billing](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/11-billing.md) — Monthly statement derivation, itemization & automated invoice generation
- [ ] [12-payments](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/12-payments.md) — UPI-first payment provider abstraction & idempotent webhook reconciliation

## Communication & Interface
- [ ] [13-whatsapp](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/13-whatsapp.md) — Meta Cloud API interactive buttons, webhooks & session management
- [ ] [14-notifications](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/14-notifications.md) — Multi-channel event-driven notifications (In-app, Push, SMS fallback)
- [ ] [15-pwa](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/15-pwa.md) — Installable PWA manifest, service worker, icons & offline shell

## Logistics & Physical Assets
- [ ] [16-assets](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/16-assets.md) — Returnable physical container accounting (20L jars, tiffins, deposits)
- [ ] [17-delivery](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/17-delivery.md) — Driver run sheets, society/tower sequencing & delivery verification
- [ ] [18-vacation-mode](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/18-vacation-mode.md) — Multi-service bulk pause windows & automated billing freeze

## Household & Social
- [ ] [19-households](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/19-households.md) — Shared household accounts, roommate permissions & service visibility
- [ ] [20-expense-splitting](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/20-expense-splitting.md) — Splitwise-style roommate billing & P2P UPI settlements

## Reliability & Governance
- [ ] [21-disputes](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/21-disputes.md) — Ledger dispute management, evidence timeline & compensating entries
- [ ] [26-security](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/26-security.md) — Security hardening, rate limiting, HMAC signatures & DPDP compliance
- [ ] [27-testing](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/27-testing.md) — Unit & integration test suites for ledgers and state machines
- [ ] [28-performance](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/28-performance.md) — Edge latency optimization, bundle audits & database query indexing

## Dashboards & Portals
- [ ] [22-vendor-dashboard](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/22-vendor-dashboard.md) — Live kitchen prep counter, customer management & collection views
- [ ] [23-customer-dashboard](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/23-customer-dashboard.md) — 1-Tap daily actions, Khata inspection & invoice payments
- [ ] [24-admin](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/24-admin.md) — Platform admin console, vendor approvals & global oversight
- [ ] [25-analytics](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/25-analytics.md) — Operational KPIs, food waste metrics & financial reports

## Release & Launch
- [ ] [29-deployment](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/29-deployment.md) — Cloudflare Workers edge deployment, staging environments & CI/CD
- [ ] [30-launch-readiness](file:///Users/shaswatraj/Desktop/ruxx/docs/checklists/30-launch-readiness.md) — Launch audit, operational checklists & beachhead rollout
