# Architecture Specification: Codebase Folder Structure

**Classification:** `[CONFIRMED ARCHITECTURAL SPECIFICATION]`

---

## 1. Modular Directory Organization

RUXS follows a domain-oriented modular Next.js App Router structure:

```
ruxx/
├── app/                              # Next.js App Router Entry Points
│   ├── (auth)/                       # Authentication Route Group
│   │   ├── login/page.tsx            # Phone OTP Login Page
│   │   └── verify/page.tsx           # OTP Verification Screen
│   ├── (customer)/                   # Customer Route Group
│   │   ├── dashboard/page.tsx        # Customer Command Center
│   │   ├── khata/page.tsx            # Digital Khata Ledger View
│   │   └── pay/[id]/page.tsx         # Direct UPI Payment Link Screen
│   ├── (vendor)/                     # Vendor Portal Route Group
│   │   ├── vendor/page.tsx           # Live Kitchen Batch Prep Dashboard
│   │   ├── vendor/customers/page.tsx # Customer Roster Management
│   │   └── vendor/services/page.tsx  # Service & Cutoff Configuration
│   ├── (driver)/                     # Driver Route Group
│   │   └── driver/run/page.tsx       # Live Sequenced Delivery Run Sheet
│   ├── api/                          # HTTP Route Handlers
│   │   ├── auth/                     # OTP Request & Verification Handlers
│   │   ├── webhooks/                 # Ingress Webhooks (WhatsApp, Payments)
│   │   └── crons/                    # Scheduled Worker Triggers
│   ├── layout.tsx                    # Global RootLayout with App Shell
│   ├── globals.css                   # Global CSS & Tailwind Directives
│   ├── loading.tsx                   # Suspense Fallback
│   ├── error.tsx                     # Global Error Boundary
│   └── not-found.tsx                 # 404 Route
├── src/                              # Core Domain & Shared Libraries
│   ├── modules/                      # Domain Bounded Contexts
│   │   ├── subscriptions/            # Subscription models, services, recurrence
│   │   ├── fulfillment/              # Daily fulfillment FSM & generators
│   │   ├── cutoff/                   # Cutoff window evaluators & batch counters
│   │   ├── khata/                    # Double-entry ledger calculations
│   │   ├── assets/                   # Physical container holding calculations
│   │   ├── billing/                  # Monthly invoice derivation
│   │   ├── payments/                 # Gateway adapters & webhook verification
│   │   └── whatsapp/                 # Meta Cloud API client & template builders
│   ├── shared/                       # Cross-cutting Utilities
│   │   ├── db/                       # Database client, Drizzle schema & migrations
│   │   ├── auth/                     # JWT session encoding & edge guards
│   │   ├── types/                    # Domain entities, Money/Paise types
│   │   └── validators/               # Zod validation schemas
├── docs/                             # Executable Documentation System
└── public/                           # Static Assets, PWA Manifest & App Icons
```
