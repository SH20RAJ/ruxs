# Architecture Specification: Authentication & Identity

**Classification:** `[CONFIRMED PRODUCT REQUIREMENT]`

---

## 1. Phone-First, Passwordless Philosophy

In the Indian hyper-local market, passwords create unacceptable onboarding drop-off. Over 98% of target consumers and vendors authenticate via their **10-digit mobile number**.

RUXS establishes a **Passwordless Phone-First Authentication System**:
* Primary Login: 6-digit One-Time Password (OTP) dispatched via WhatsApp (fastest, cheapest) or SMS fallback.
* Magic Direct-Access Links: Secure, cryptographically signed, short-lived URLs dispatched in WhatsApp notifications allowing customers to view statements or pay invoices with zero login friction.
* Web Session Management: Cryptographically signed JWT tokens stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies validated at the Cloudflare edge.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Web Browser (ruxs.in)
    participant Edge as Cloudflare Edge Auth
    participant AuthAPI as Next.js Auth Service
    participant Redis as Redis OTP Cache
    participant WA as WhatsApp Cloud API

    Client->>Edge: POST /api/auth/otp/request { phone: "+919876543210" }
    Edge->>Edge: Rate limit check (Max 3 OTP requests / 15 mins / IP)
    Edge->>AuthAPI: Forward request
    
    AuthAPI->>AuthAPI: Generate secure 6-digit OTP (e.g. 482910)
    AuthAPI->>Redis: SET otp:+919876543210 482910 EX 300 (5 mins)
    AuthAPI->>WA: Send OTP via WhatsApp Template
    AuthAPI-->>Client: HTTP 200 { status: "OTP_SENT" }

    Client->>AuthAPI: POST /api/auth/otp/verify { phone: "+919876543210", code: "482910" }
    AuthAPI->>Redis: GET otp:+919876543210
    Redis-->>AuthAPI: "482910" (Matches!)
    AuthAPI->>Redis: DEL otp:+919876543210 (Single-use consumption)
    
    AuthAPI->>AuthAPI: Issue Session JWT (Sub: user_id, Role, TenantId)
    AuthAPI-->>Client: Set-Cookie: ruxs_session=JWT; HttpOnly; Secure
```

---

## 2. Stateless Edge Session Architecture

To ensure sub-20ms authentication checks on Cloudflare Workers edge nodes without querying a central database on every HTTP request:
1. **Signed JWT Claims:**
   ```json
   {
     "sub": "usr_94819481-4821-4821-8421-482184218421",
     "phone": "+919876543210",
     "role": "CUSTOMER",
     "tenant_id": "ten_84128412-4821-4821-8421-482184218421",
     "household_id": "hsh_12341234-4821-4821-8421-482184218421",
     "iat": 1789472000,
     "exp": 1792064000
   }
   ```
2. **Edge Verification:** Cloudflare Workers verify the JWT signature using a shared secret or public JWKS key in memory.
3. **Revocation List:** Token revocations (e.g., user logs out, account suspended) write the `jti` (JWT ID) to Cloudflare KV / Redis with a matching TTL.

---

## 3. Magic One-Time Invoice Links (Deep-Links)

When sending a monthly statement on WhatsApp:
* URL format: `https://ruxs.in/pay/inv_8492?token=SIGNATURE`
* The token is an HMAC-SHA256 signature containing `invoice_id` and expiration timestamp.
* Clicking the link opens a **Scoped Read/Pay Session** directly in mobile Safari/Chrome. The customer can inspect their line items and trigger UPI payment without re-entering an OTP.
* Scoped sessions cannot access account settings, alter addresses, or inspect other invoices.
