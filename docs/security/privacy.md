# Privacy Architecture & DPDP Act Compliance: RUXS

**Brand:** RUXS (`ruxs.in`)  
**Classification:** `[CONFIRMED PRIVACY SPECIFICATION]`

---

## 1. Regulatory Context: India's DPDP Act 2023

RUXS operates in India and processes domestic household data. Under the **Digital Personal Data Protection (DPDP) Act 2023**, RUXS acts as a **Data Fiduciary**, with local vendors acting as joint data processors.

The platform is designed around four foundational privacy tenets:
1. **Notice & Purpose Limitation:** Data collected is strictly used to fulfill the recurring service contract.
2. **Data Minimization:** Only operational essentials (phone, delivery address, order history) are captured.
3. **Temporal Access Restriction:** Field delivery workers only see customer details while actively fulfilling an assigned run sheet.
4. **Customer Erasure Rights:** Clear data retention schedules and deletion capabilities.

---

## 2. Personally Identifiable Information (PII) Inventory

| Data Element | Sensitivity | Storage Location | Access Control |
| :--- | :---: | :--- | :--- |
| **Phone Number (MSISDN)** | High | PostgreSQL (Encrypted at rest) | Vendor Admin, Customer, Platform Admin |
| **Residential Address** | High | PostgreSQL (Encrypted at rest) | Vendor Admin, Assigned Driver (Active Shift Only) |
| **Delivery Gate Code** | Medium | PostgreSQL | Assigned Driver (Active Shift Only) |
| **Doorstep Drop Photos** | Medium | Cloudflare R2 (Private Bucket)| Customer & Vendor Admin via pre-signed URL |
| **UPI Virtual Payment Address**| Medium | Encrypted in DB / Gateway Vault| Customer & Billing Service |

---

## 3. Privacy Safeguards for Field Delivery Staff

To prevent harassment or unauthorized collection of customer contact information:
* **Shift-Scoped Visibility:** A delivery boy can only view customer addresses for stops assigned to their active `DeliveryRun`. Once the shift is marked `RECONCILED`, driver access to customer records is automatically revoked.
* **Driver Phone Number Masking (Roadmap - Phase 3):** Calls between delivery personnel and customers will route through a virtual cloud telephony proxy (e.g., Exotel or Twilio), concealing both parties' real phone numbers.

---

## 4. User Rights & Data Retention Policy

* **Right to Data Portability:** Customers can download a complete CSV/PDF export of their entire Digital Khata ledger and order history at any time.
* **Right to Erasure (Account Deletion):**
  * When a customer requests account deletion:
    1. Active subscriptions are terminated.
    2. Pending physical asset returns are reconciled.
    3. Outstanding Khata balances must be cleared.
    4. Personal identifiers (name, phone, exact address) are pseudonymized in historical records.
    5. Immutable ledger entries are retained in an anonymized format for 7 years to satisfy Indian tax and accounting legal compliance.
