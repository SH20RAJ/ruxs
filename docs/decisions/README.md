# Architecture Decision Records (ADR) Index: RUXS

Architecture Decision Records (ADRs) capture significant architectural choices, context, evaluated alternatives, and consequences for the RUXS platform.

## ADR Log

| ADR # | Title | Date | Status | Summary |
| :---: | :--- | :---: | :---: | :--- |
| [ADR-001](file:///Users/shaswatraj/Desktop/ruxx/docs/decisions/ADR-001-initial-architecture.md) | Initial Architecture & Runtime Selection | 2026-09-11 | **ACCEPTED** | Next.js App Router with Vinext on Cloudflare Workers, PostgreSQL for transactional ledgers, and Redis for idempotency. |

---

## ADR Template Guide

When proposing an architectural change, create a new document `ADR-XXX-<name>.md` using this format:
1. **Title:** Short noun phrase.
2. **Status:** `PROPOSED`, `ACCEPTED`, `DEPRECATED`, or `SUPERSEDED`.
3. **Context:** What is the technical or business problem being solved?
4. **Decision:** What is the chosen technical direction?
5. **Alternatives Considered:** What other options were evaluated and why were they rejected?
6. **Consequences:** Positive benefits, negative trade-offs, and downstream operational implications.
