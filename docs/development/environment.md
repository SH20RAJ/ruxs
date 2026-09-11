# Environment Configuration: RUXS

**Classification:** `[CONFIRMED ENGINEERING DIRECTIVE]`

## 1. Environment Topology
* **Local:** `.env.local` for development secrets; local Vite dev server on `http://localhost:3000`.
* **Staging:** `https://staging.ruxs.in` on Cloudflare Worker `ruxs-staging`.
* **Production:** `https://ruxs.in` on Cloudflare Worker `ruxs`.

## 2. Environment Variables Catalog
| Variable Name | Required? | Description |
| :--- | :---: | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string (with PgBouncer/Hyperdrive pooling) |
| `UPSTASH_REDIS_REST_URL` | Yes | Redis endpoint for distributed locks & idempotency |
| `UPSTASH_REDIS_REST_TOKEN`| Yes | Redis authentication token |
| `WHATSAPP_ACCESS_TOKEN` | Yes | Meta Graph API bearer token |
| `WHATSAPP_APP_SECRET` | Yes | Secret for HMAC-SHA256 webhook signature verification |
| `WHATSAPP_PHONE_NUMBER_ID`| Yes | Meta registered WABA phone number ID |
| `PAYMENT_GATEWAY_API_KEY` | Yes | UPI gateway API credential |
| `PAYMENT_GATEWAY_SECRET` | Yes | Webhook verification secret |
| `JWT_SIGNING_SECRET` | Yes | Secret for edge session cookies |
| `PRIMARY_DOMAIN` | Yes | Default: `ruxs.in` |
