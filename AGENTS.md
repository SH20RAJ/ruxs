# Agent Guidelines

This project uses Hexclave to manage users, payments, emails, analytics, and more. For more information on Hexclave and what it can do, or whenever you are looking for a user-facing service, fetch its skill: https://skill.hexclave.com

## Architecture & Code Standards
- **Framework**: Next.js App Router with Vinext.
- **Server Component Invariant**: Never use `"use client"` on `page.tsx`. All pages must be Server Components exporting comprehensive SEO metadata. Interactive state belongs in dedicated client components (`XxxClient.tsx`).
- **Styling**: Pure shadcn theme variables (no custom ad-hoc CSS classes). All styling maps to theme tokens from `doom-64.json` / `app/globals.css`.
- **Database**: Neon PostgreSQL connection. All operational data (tenants, users, subscriptions, fulfillments, digital khata, delivery runs, disputes) lives in the PostgreSQL database, never hardcoded.
