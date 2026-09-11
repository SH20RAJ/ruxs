# Architecture Specification: Observability & Audit Logging

**Classification:** `[CONFIRMED ARCHITECTURAL SPECIFICATION]`

---

## 1. Observability Principles for MVP

For the initial phases, RUXS avoids overengineered distributed tracing platforms (e.g. Datadog, Jaeger, OpenTelemetry agents) that add latency to edge isolates. Instead, we adhere to **lightweight, high-fidelity structured logging and audit trails**:

1. **Correlation IDs:** Every incoming HTTP request and webhook ingestion receives a unique `X-Request-Id` (UUID v4) propagated across log statements.
2. **Structured JSON Output:** Server logs are output as structured JSON to standard out, automatically collected by Cloudflare Logs / Logpush.
3. **Immutable Operational Audit Trail:** High-impact business actions (vendor overrides, late skips, dispute settlements) write an explicit database record to `audit_logs`.

---

## 2. Structured Log Format

```json
{
  "timestamp": "2026-10-11T08:30:14.284Z",
  "level": "INFO",
  "requestId": "8482-4821-4821-8421",
  "tenantId": "ten_sharma_kitchen",
  "userId": "usr_rahul_sharma",
  "event": "FulfillmentSkipped",
  "details": {
    "fulfillmentId": "ful_94821048",
    "cutoffTime": "2026-10-11T10:00:00Z",
    "receivedTime": "2026-10-11T08:30:14Z",
    "source": "WHATSAPP_BUTTON"
  }
}
```

---

## 3. Database AuditLog Schema

```typescript
interface AuditLogRecord {
  id: string;                         // UUID
  tenant_id: string;
  actor_user_id?: string;
  actor_role: "SYSTEM" | "CUSTOMER" | "VENDOR_ADMIN" | "DELIVERY_STAFF" | "PLATFORM_ADMIN";
  ip_address?: string;
  action: string;                     // e.g., "VENDOR_CUTOFF_OVERRIDE"
  target_entity_type: "FULFILLMENT" | "SUBSCRIPTION" | "KHATA" | "INVOICE" | "PAYMENT";
  target_entity_id: string;
  previous_state_json?: Record<string, any>;
  new_state_json?: Record<string, any>;
  rationale?: string;
  created_at: Date;
}
```
