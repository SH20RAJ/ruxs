# Architecture Specification: Progressive Web App (PWA) Foundation

**Classification:** `[CONFIRMED ARCHITECTURAL SPECIFICATION]`

---

## 1. PWA Strategic Objectives

RUXS must offer an **installable, app-like standalone mobile experience** without the friction of Apple App Store or Google Play Store downloads:
1. Instant installation via browser "Add to Home Screen" prompt.
2. Fast launch time via pre-cached application shell.
3. Offline awareness: graceful offline indicators without fake offline financial mutations.
4. Seamless deep-linking from WhatsApp notifications directly into the installed standalone PWA.

---

## 2. Web App Manifest Specification (`public/manifest.webmanifest`)

```json
{
  "name": "RUXS — Everyday Life on Autopilot",
  "short_name": "RUXS",
  "description": "Hyper-local household operations platform for recurring essentials.",
  "start_url": "/",
  "id": "/",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#09090b",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

---

## 3. Service Worker & Caching Boundaries

### Safe Offline Caching Candidates
* **Application Shell:** HTML layout skeleton, bundled CSS, Google Fonts (`Inter`), static UI icons.
* **Cached Views:** User profile header, inactive navigation bars, basic static FAQs.

### Strictly Excluded from Offline Caching
* **Digital Khata:** Balances must always reflect server-verified ledger totals.
* **Fulfillment Mutation Actions:** Skips and order confirmations cannot be queued blindly offline because they depend on strict server-side cutoff time validation.
* **Payment Views:** UPI intent generation requires active server connectivity to the payment gateway.
