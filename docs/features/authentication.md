# Feature Specification: Authentication & User Sessions

**Classification:** `[CONFIRMED PRODUCT REQUIREMENT]`

## 1. Goal
Provide zero-password, phone-first OTP authentication for consumers and vendors, with edge-verifiable stateless sessions and deep-link token authorization.

## 2. Requirements
* **Phone Login:** 10-digit Indian mobile number input with E.164 normalization (+91).
* **OTP Dispatch:** Primary via WhatsApp template; fallback via transactional SMS.
* **Session Management:** Secure, HttpOnly, SameSite=Lax JWT cookies verified at Cloudflare edge.
* **Magic Deep-Links:** Cryptographically signed tokens embedded in WhatsApp links allowing direct invoice viewing and payment without interactive login.

See also [Architecture: Authentication](file:///Users/shaswatraj/Desktop/ruxx/docs/architecture/authentication.md).
