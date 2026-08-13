import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicCheckoutView } from "@/services/billing/billing";
import { formatCents } from "@/lib/money";
import { completeTestPaymentAction, failTestPaymentAction } from "./actions";

export const metadata: Metadata = { title: "Secure Checkout" };

/**
 * The mock payment provider's simulated hosted-checkout page — see
 * src/services/billing/payment-provider.ts's header comment for why a
 * mock provider was selected for this milestone, and
 * docs/milestones/milestone-18-tuition-billing-payments-vertical-slice/05-payment-provider-architecture.md
 * for the full architecture. Deliberately outside both the (public)
 * marketing site and the (portal) authenticated shell — no Minara nav,
 * no Minara session required, representing having left Minara's own
 * domain entirely, the same as a real provider's hosted checkout page
 * would be. Never collects, displays, or stores a card number, CVV, or
 * any other raw payment credential — this milestone's brief explicitly
 * prohibits that, and this page proves it by never asking for one.
 */
export default async function CheckoutPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const view = await getPublicCheckoutView(sessionId);
  if (!view) notFound();

  return (
    <main id="main-content" style={{ maxWidth: "28rem", margin: "4rem auto", padding: "0 1rem" }}>
      <div className="card">
        <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
          Simulated Secure Checkout — no real payment is processed
        </p>
        <h1 style={{ fontSize: "1.5rem" }}>{view.description}</h1>
        <p style={{ fontSize: "1.75rem", fontWeight: 700 }}>{formatCents(view.amountCents, view.currency)}</p>

        {view.status === "PENDING" ? (
          <>
            <p className="muted">
              This test checkout never asks for a card number — no raw payment credentials are ever collected or
              stored by Minara-LMS.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
              <form action={completeTestPaymentAction.bind(null, sessionId)}>
                <button className="button button--primary" type="submit">
                  Complete Test Payment
                </button>
              </form>
              <form action={failTestPaymentAction.bind(null, sessionId)}>
                <button className="button button--secondary" type="submit">
                  Simulate Failed Payment
                </button>
              </form>
            </div>
          </>
        ) : view.status === "SUCCEEDED" ? (
          <p className="alert alert--success" role="status">
            Payment confirmed. You may return to Minara-LMS.
          </p>
        ) : (
          <p className="alert alert--error" role="alert">
            This payment did not succeed. You may return to Minara-LMS and try again.
          </p>
        )}
      </div>
    </main>
  );
}
