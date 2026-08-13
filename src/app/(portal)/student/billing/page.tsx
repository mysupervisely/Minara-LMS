import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listEnrollmentsForStudent } from "@/services/enrollment/enrollment";
import { getBillingSummaryForStudent } from "@/services/billing/billing";
import { formatCents } from "@/lib/money";
import { startPaymentAction } from "./actions";

export const metadata: Metadata = { title: "Billing & Payments" };

const CLEARANCE_BADGE: Record<string, string> = {
  PASSED: "approved",
  FAILED: "draft",
  NEEDS_VERIFICATION: "submitted",
};

const PAYMENT_BADGE: Record<string, string> = {
  PENDING: "submitted",
  SUCCEEDED: "approved",
  FAILED: "draft",
  REFUNDED: "draft",
};

/**
 * Student Billing & Payments — Phase 11: tuition/charge description,
 * amount charged, amount paid, outstanding balance, payment status,
 * payment history, receipt/reference (a SUCCEEDED Payment's own id
 * doubles as its receipt reference — no separate Receipt model, per
 * this milestone's own "derived view" suggestion), financial-clearance
 * status, and a "Pay Now" action when a balance is outstanding.
 * Self-only — every read here is scoped to the authenticated Student's
 * own id at the service layer.
 */
export default async function StudentBillingPage() {
  const user = await requireSessionUserWithRole("STUDENT");
  const enrollments = await listEnrollmentsForStudent(user.id);

  const sections = await Promise.all(
    enrollments.map(async (enrollment) => ({
      enrollment,
      billing: await getBillingSummaryForStudent(user.id, enrollment.programId, user),
    })),
  );

  return (
    <div className="stack">
      <h1>Billing &amp; Payments</h1>

      {sections.length === 0 ? (
        <p className="muted">You are not currently enrolled in a Program.</p>
      ) : (
        sections.map(({ enrollment, billing }) => (
          <section key={enrollment.id} style={{ padding: 0, border: "none" }}>
            <h2>{enrollment.program.name}</h2>
            <p>
              <span className={`badge badge--${CLEARANCE_BADGE[billing.clearance.status] ?? "draft"}`}>
                Financial Clearance:{" "}
                {billing.clearance.status === "NEEDS_VERIFICATION" ? "⚠️ Needs Verification" : billing.clearance.status}
              </span>
            </p>

            {billing.charges.length === 0 ? (
              <p className="muted">No Charge has been recorded for this Enrollment yet.</p>
            ) : (
              billing.charges.map((charge) => (
                <div key={charge.id} className="card" style={{ marginBottom: "1rem" }}>
                  <p style={{ margin: "0 0 0.5rem 0" }}>
                    <strong>{charge.description}</strong>
                  </p>
                  <ul>
                    <li>Charged: {formatCents(charge.amountCents, charge.currency)}</li>
                    <li>Paid: {formatCents(charge.paidCents, charge.currency)}</li>
                    <li>
                      <strong>Balance: {formatCents(charge.balanceCents, charge.currency)}</strong>
                    </li>
                  </ul>

                  {charge.balanceCents > 0 ? (
                    <form action={startPaymentAction.bind(null, charge.id)}>
                      <button className="button button--primary" type="submit">
                        Pay Now
                      </button>
                    </form>
                  ) : (
                    <p className="alert alert--success" role="status">
                      Paid in full.
                    </p>
                  )}

                  {charge.payments.length > 0 ? (
                    <>
                      <h3>Payment History</h3>
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th scope="col">Date</th>
                              <th scope="col">Amount</th>
                              <th scope="col">Status</th>
                              <th scope="col">Receipt Reference</th>
                            </tr>
                          </thead>
                          <tbody>
                            {charge.payments.map((payment) => (
                              <tr key={payment.id}>
                                <td>{payment.createdAt.toLocaleString()}</td>
                                <td>{formatCents(payment.amountCents, payment.currency)}</td>
                                <td>
                                  <span className={`badge badge--${PAYMENT_BADGE[payment.status] ?? "draft"}`}>
                                    {payment.status}
                                  </span>
                                </td>
                                <td>{payment.status === "SUCCEEDED" ? payment.id : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : null}
                </div>
              ))
            )}
          </section>
        ))
      )}
    </div>
  );
}
