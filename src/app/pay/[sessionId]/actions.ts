"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { getPublicCheckoutView, processPaymentWebhookPayload } from "@/services/billing/billing";
import { signMockWebhookPayload } from "@/services/billing/payment-provider";

/**
 * These two Server Actions stand in for what a real payment provider's
 * own server would do after processing a real card — construct a
 * signed confirmation event and deliver it. They call
 * processPaymentWebhookPayload directly (in-process) rather than making
 * this app issue an HTTP request to its own /api/webhooks/payments
 * route — the identical, real verification/idempotency logic runs
 * either way (both paths converge on the same function), this just
 * avoids the self-HTTP-call fragility of a server calling its own public
 * URL from inside a Server Action. The real Route Handler at
 * /api/webhooks/payments still exists and is exercised directly by this
 * milestone's own tests and browser verification, proving the genuine
 * HTTP surface a real provider would call.
 *
 * No Minara session/auth is required here — this page represents having
 * left Minara's authenticated context entirely, the same as a real
 * hosted-checkout page would be on the provider's own domain.
 */

async function confirm(sessionId: string, outcome: "SUCCEEDED" | "FAILED") {
  const view = await getPublicCheckoutView(sessionId);
  if (!view) throw new Error("Unknown checkout session.");

  const { rawBody, signature } = signMockWebhookPayload({
    eventId: randomUUID(),
    providerSessionId: sessionId,
    outcome,
    amountCents: view.amountCents,
  });

  const result = await processPaymentWebhookPayload(rawBody, signature);
  if (!result.ok) {
    throw new Error(result.reason ?? "Payment confirmation failed.");
  }

  redirect(`/pay/${sessionId}`);
}

export async function completeTestPaymentAction(sessionId: string, _formData: FormData): Promise<void> {
  await confirm(sessionId, "SUCCEEDED");
}

export async function failTestPaymentAction(sessionId: string, _formData: FormData): Promise<void> {
  await confirm(sessionId, "FAILED");
}
