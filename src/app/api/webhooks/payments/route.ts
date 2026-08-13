import { NextResponse } from "next/server";
import { processPaymentWebhookPayload } from "@/services/billing/billing";

/**
 * The real, authoritative payment-confirmation endpoint — Milestone 18's
 * "successful payment must be confirmed through an authoritative
 * provider-side mechanism such as a signed webhook." A real payment
 * provider (or, in this milestone's mock-provider architecture, this
 * milestone's own tests and browser verification) POSTs a signed event
 * here; the client/browser redirect back to Minara is never itself
 * treated as proof of payment — see src/app/pay/[sessionId]/page.tsx,
 * which only ever displays status read fresh from the database.
 *
 * Delegates entirely to processPaymentWebhookPayload
 * (src/services/billing/billing.ts) — the same function
 * src/app/pay/[sessionId]/actions.ts's Server Actions call in-process
 * for the mock checkout page's own "Complete Test Payment" button. Both
 * paths converge on identical signature verification and idempotency
 * logic; this Route Handler is what proves that logic works over a
 * genuine HTTP request, the real integration surface a production
 * payment provider would call.
 */
export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const signature = request.headers.get("x-minara-signature");

  const result = await processPaymentWebhookPayload(rawBody, signature);

  if (!result.ok) {
    // Deliberately generic — never echo back why verification failed in
    // detail (least-privilege information handling, the same discipline
    // src/services/identity/auth.ts's login failure message already
    // applies).
    return NextResponse.json({ error: "Webhook rejected." }, { status: 400 });
  }

  return NextResponse.json({ received: true, idempotent: result.idempotent }, { status: 200 });
}
