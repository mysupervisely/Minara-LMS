# Payment-Provider Architecture

**Status:** Implemented
**Milestone:** 18 — Tuition, Billing & Payments Vertical Slice
**Date:** 2026-08-13
**Implementation:** `src/services/billing/payment-provider.ts`

## The Boundary

```
Minara Billing Service (billing.ts)
        │  only ever calls
        ▼
PaymentProviderAdapter (interface)
        │  implemented by
        ▼
MockPaymentProvider  ←— the one adapter this milestone ships
```

`billing.ts` never imports a provider SDK, never branches on `provider
=== "stripe"` or similar, and never constructs a provider-specific
request shape. It calls exactly two methods —
`createCheckoutSession({ amountCents, currency })` and
`verifyAndParseWebhook(rawBody, signatureHeader)` — and everything
downstream (charge creation, balance calculation, financial clearance,
graduation integration) is expressed purely in terms of Minara's own
`PENDING`/`SUCCEEDED`/`FAILED`/`REFUNDED` states, never a provider's
native vocabulary. Swapping in a real provider later means writing one
new class implementing `PaymentProviderAdapter` and changing the single
`export const paymentProvider = new MockPaymentProvider()` line — no
change to `billing.ts`'s business logic, its Prisma models, or any
portal page.

## Why a Mock Provider Was Selected

No real payment-provider account (Stripe or otherwise) exists in this
sandboxed development environment, and none could be created without
real business/legal setup outside this milestone's scope. This
milestone's own brief explicitly anticipates this: *"If webhook
infrastructure is unavailable in the current local environment, create
the correct architecture and test it through provider-test fixtures/
mocks where appropriate."* `MockPaymentProvider` is exactly that — it
implements the *real* contract (hosted-checkout redirect, HMAC-signed
webhook confirmation, verifiable/rejectable signatures) a real provider's
adapter would, so the architecture itself is proven, not merely
described.

## What the Mock Simulates, and What It Does Not

- **Simulates:** a checkout-session identifier generation
  (`createCheckoutSession`), a hosted-checkout page the browser is
  redirected to (`/pay/[sessionId]`, deliberately outside both the
  public marketing site and the authenticated portal — no Minara nav, no
  Minara session required, representing having left Minara's own
  domain), and a signed webhook confirmation event.
- **Does not simulate:** collecting a card number, CVV, or any other
  payment credential — the checkout page never asks for one, and no
  field for one exists anywhere in this schema. This is not merely a
  simplification of a real integration; it is a hard requirement this
  milestone's brief states directly ("Minara should not store raw card
  numbers"), honored by never having a place to type one in.

## Webhook Signing

```ts
signature = HMAC-SHA256(PAYMENT_WEBHOOK_SECRET, rawBody)
```

Verified with a constant-time comparison (`timingSafeEqual`) — a naive
`===` string comparison leaks timing information an attacker could use
to forge a valid signature byte-by-byte, the same defensive-comparison
discipline `src/services/identity/session.ts` already applies to session
token hashes. `PAYMENT_WEBHOOK_SECRET` is an environment variable (see
`.env.example`), never committed, following the exact same convention
`SESSION_SECRET` already established. A real provider integration would
set this to that provider's own webhook signing secret (e.g. Stripe's)
— no code change, only a configuration change.

## Two Callers, One Verification Path

`src/services/billing/billing.ts`'s `processPaymentWebhookPayload` is
called from two places:

1. **`src/app/pay/[sessionId]/actions.ts`** — the mock checkout page's
   own "Complete Test Payment"/"Simulate Failed Payment" buttons, which
   construct a signed event in-process and call it directly (standing in
   for what a real provider's own server would send).
2. **`src/app/api/webhooks/payments/route.ts`** — a real Next.js Route
   Handler, POSTed to over genuine HTTP, that a real provider (or this
   milestone's own tests/browser verification) calls with the identical
   payload shape and signature scheme.

Both paths converge on the exact same function — the same signature
verification, the same idempotency guarantee — so the mock checkout
page's convenience (avoiding a server calling its own public URL from
inside a Server Action, a known fragility pattern) never diverges from
what the real, externally-callable HTTP surface does. This milestone's
own test suite and browser verification exercise the Route Handler path
directly, over real HTTP, proving it independently of the mock
checkout page's own shortcut.

## Current / Planned / Future

| Element | Status |
|---|---|
| `PaymentProviderAdapter` interface, provider-agnostic `billing.ts` | **Implemented** |
| `MockPaymentProvider` (hosted-checkout simulation, HMAC-signed webhooks) | **Implemented** |
| Real Route Handler at `/api/webhooks/payments`, genuinely callable over HTTP | **Implemented** |
| A real provider adapter (Stripe or otherwise) | **Future** — no account exists in this environment; the boundary is ready for one |
