import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Payment Provider boundary — Milestone 18 (Tuition, Billing & Payments
 * Vertical Slice).
 *
 * `src/services/billing/billing.ts` (Minara's core billing logic) only
 * ever talks to the `PaymentProviderAdapter` interface below — never to
 * a specific provider's SDK or API shape directly. This is the
 * "Minara Billing Service → Payment Provider Adapter → External
 * Provider" boundary this milestone's brief requires: swapping in a real
 * provider later means writing one new class that implements this same
 * interface, not touching `billing.ts`, its state machine, or its
 * balance/financial-clearance logic at all.
 *
 * `MockPaymentProvider` is the one adapter implemented in this
 * milestone. A real provider account (Stripe or otherwise) does not
 * exist in this sandboxed development environment, and this milestone's
 * own brief explicitly permits testing "through provider-test
 * fixtures/mocks where appropriate" when real webhook infrastructure
 * isn't available — so this milestone proves the full architecture
 * (hosted-checkout redirect, signed webhook confirmation, idempotent
 * event handling) against a mock that behaves like a real hosted-
 * checkout provider would, without needing real credentials or a public
 * internet-facing endpoint. See
 * docs/milestones/milestone-18-tuition-billing-payments-vertical-slice/05-payment-provider-architecture.md
 * for the full rationale.
 */

export interface CheckoutSession {
  /** This provider's own identifier for the checkout attempt — stored as Payment.providerSessionId, used to look the Payment back up when a confirmation arrives. */
  providerSessionId: string;
  /** Where to send the browser to complete payment — a real provider's hosted checkout URL; the mock's own simulated checkout page. */
  checkoutUrl: string;
}

export interface WebhookEvent {
  eventId: string;
  providerSessionId: string;
  outcome: "SUCCEEDED" | "FAILED";
  amountCents: number;
}

export interface PaymentProviderAdapter {
  readonly name: string;
  createCheckoutSession(input: { amountCents: number; currency: string }): Promise<CheckoutSession>;
  /** Verifies a webhook payload's authenticity and parses it — never trust an unverified payload as proof of payment. */
  verifyAndParseWebhook(rawBody: string, signatureHeader: string | null): WebhookEvent | null;
}

/**
 * Every environment needs this secret to sign/verify simulated webhook
 * events — generated per environment via `.env` (never committed; see
 * `.env.example`), the same convention `SESSION_SECRET` already
 * established. A real provider's webhook secret (e.g. Stripe's signing
 * secret) would be configured identically — one more environment
 * variable, no code change to how `billing.ts` calls this adapter.
 */
function getWebhookSecret(): string {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "PAYMENT_WEBHOOK_SECRET is not set. Copy .env.example to .env and provide a value for local development.",
    );
  }
  return secret;
}

function signPayload(rawBody: string): string {
  return createHmac("sha256", getWebhookSecret()).update(rawBody).digest("hex");
}

/**
 * Constant-time signature comparison — a naive `===` string comparison
 * leaks timing information an attacker could use to forge a valid
 * signature byte-by-byte. Mirrors the same defensive-comparison
 * discipline `src/services/identity/session.ts` already applies to
 * session token hashes.
 */
function signaturesMatch(expected: string, actual: string): boolean {
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(actual, "hex");
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

/** Builds a signed webhook payload the way this mock provider's own "hosted checkout" page uses to confirm a test payment — exported so both the checkout-completion Server Action and this module's own tests can construct a genuine, correctly-signed event without duplicating the signing logic. */
export function signMockWebhookPayload(event: WebhookEvent): { rawBody: string; signature: string } {
  const rawBody = JSON.stringify(event);
  return { rawBody, signature: signPayload(rawBody) };
}

export class MockPaymentProvider implements PaymentProviderAdapter {
  readonly name = "mock";

  async createCheckoutSession(input: { amountCents: number; currency: string }): Promise<CheckoutSession> {
    void input; // the mock does not need the amount to generate a session id — a real provider's SDK call would use it
    const providerSessionId = `cs_mock_${randomBytes(12).toString("hex")}`;
    // A real provider's checkoutUrl would be on that provider's own
    // domain, generated from *their* session id, before Minara ever
    // creates its own Payment row — this mock's simulated hosted-
    // checkout page mirrors that ordering exactly, keyed by
    // providerSessionId rather than Minara's internal Payment id, so no
    // chicken-and-egg dependency on an id that doesn't exist yet. See
    // the Payment Provider Architecture doc for the full rationale.
    return { providerSessionId, checkoutUrl: `/pay/${providerSessionId}` };
  }

  verifyAndParseWebhook(rawBody: string, signatureHeader: string | null): WebhookEvent | null {
    if (!signatureHeader) return null;
    const expected = signPayload(rawBody);
    if (!signaturesMatch(expected, signatureHeader)) return null;

    try {
      const parsed = JSON.parse(rawBody) as Partial<WebhookEvent>;
      if (
        typeof parsed.eventId !== "string" ||
        typeof parsed.providerSessionId !== "string" ||
        (parsed.outcome !== "SUCCEEDED" && parsed.outcome !== "FAILED") ||
        typeof parsed.amountCents !== "number"
      ) {
        return null;
      }
      return {
        eventId: parsed.eventId,
        providerSessionId: parsed.providerSessionId,
        outcome: parsed.outcome,
        amountCents: parsed.amountCents,
      };
    } catch {
      return null;
    }
  }
}

/** The one adapter instance `billing.ts` calls through — swapping providers means changing this one line, not `billing.ts`'s logic. */
export const paymentProvider: PaymentProviderAdapter = new MockPaymentProvider();
