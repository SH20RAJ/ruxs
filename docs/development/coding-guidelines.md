# Coding Guidelines & Code Quality Standards: RUXS

**Classification:** `[CONFIRMED ENGINEERING DIRECTIVE]`

---

## 1. TypeScript Strictness & Type Hygiene

* **Strict Mode:** TypeScript `strict: true` must remain enabled.
* **No `any` Types:** The use of `any` is forbidden. Use `unknown` with explicit type narrowing or Zod schemas.
* **Paise Currency Types:** To prevent unit confusion, represent monetary amounts using branded types or explicit integer names:
  ```typescript
  export type Paise = number & { readonly __brand: unique symbol };
  
  export function toPaise(rupees: number): Paise {
    return Math.round(rupees * 100) as Paise;
  }
  ```

---

## 2. Input Validation via Zod Schemas

Every API route and server action must validate incoming request payloads against a Zod schema before invoking business logic:

```typescript
import { z } from "zod";

export const SkipFulfillmentSchema = z.object({
  fulfillmentId: z.string().uuid(),
  action: z.literal("SKIP"),
  reason: z.string().max(200).optional(),
});

export type SkipFulfillmentInput = z.infer<typeof SkipFulfillmentSchema>;
```

---

## 3. Standardized Error Envelopes

API responses must follow a predictable, typed envelope structure:

### Successful Response Envelope
```json
{
  "success": true,
  "data": {
    "fulfillmentId": "84828482-4821-4821-8421-482184218421",
    "status": "SKIPPED",
    "cutoffTime": "2026-10-11T10:00:00Z"
  }
}
```

### Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "CUTOFF_EXCEEDED",
    "message": "Fulfillment cannot be skipped after the 10:00 AM cutoff window.",
    "details": {
      "cutoffTime": "2026-10-11T10:00:00Z",
      "receivedTime": "2026-10-11T10:04:12Z"
    }
  }
}
```

---

## 4. File Organization & Naming Conventions

* **File Naming:** Kebab-case for all files (`daily-fulfillment.service.ts`, `cutoff-enforcer.worker.ts`).
* **Component Naming:** PascalCase for React components (`KitchenBatchCounter.tsx`).
* **Directory Structure:**
  ```
  app/
    api/              # Next.js App Router Route Handlers
    (customer)/       # Customer Route Group
    (vendor)/         # Vendor Portal Route Group
    (driver)/         # Driver Run Sheet Route Group
  src/
    modules/          # Domain Bounded Contexts
      fulfillment/    # Entities, Services, State Machines, Repositories
      khata/          # Ledger Engines, Calculators
      subscriptions/  # Cadence Parsers, Generators
    shared/           # Zod Schemas, Database Client, Edge Middleware
  ```
