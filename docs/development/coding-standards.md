# Coding Standards & Best Practices: RUXS

> **Canonical Document:** See detailed conventions in [coding-guidelines.md](file:///Users/shaswatraj/Desktop/ruxx/docs/development/coding-guidelines.md).

## Quick Reference
1. **TypeScript:** Strict mode enabled. Zero usage of `any`.
2. **Financial Values:** Always stored and computed as integer **Paise** (`₹1 = 100 paise`).
3. **Database Transactions:** Multi-entity mutations must occur inside serializable ACID transactions.
4. **Validation:** Ingress JSON validated with Zod before hitting service layers.
5. **Errors:** Standardized `{ success: boolean, error?: { code, message, details } }` envelopes.
