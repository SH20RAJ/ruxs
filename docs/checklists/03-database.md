# Checklist 03: PostgreSQL Database & Drizzle ORM Setup

## Goal
Set up edge-compatible Drizzle ORM schema, relational tables, migrations, and PostgreSQL Row-Level Security.

## Requirements
- [x] Define core schema tables: tenants, users, services, products, subscriptions, fulfillments, khata_entries
- [x] Enforce foreign keys, unique constraints, and composite indexes
- [x] Implement tenant isolation queries and context injection
- [x] Configure migrations and database client for edge runtime

## Implementation
- [x] Database/model
- [x] Server-side logic
- [x] UI
- [x] Validation
- [x] Error handling
- [x] Tests
- [x] Documentation

## Acceptance Criteria
- [x] Schema matches data-model.md specifications
- [x] Integer Paise used for all financial amounts
- [x] Migrations run cleanly

## Verification
- [x] Local test passed
- [x] Build passed
- [x] Relevant tests passed
- [x] Manual verification passed

## Git
- Commit: feat: setup edge drizzle orm schema, integer paise tables and tenant isolation
- Push: origin main
- Branch: main

