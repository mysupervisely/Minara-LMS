import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listChargesForAdmin } from "@/services/billing/billing";
import { formatCents } from "@/lib/money";
import { db } from "@/lib/db";
import { ActionForm } from "@/components/action-form";
import { configureTuitionAction } from "./actions";

export const metadata: Metadata = { title: "Billing & Tuition" };

const PAYMENT_BADGE: Record<string, string> = {
  PENDING: "submitted",
  SUCCEEDED: "approved",
  FAILED: "draft",
  REFUNDED: "draft",
};

/**
 * Administrator's narrow financial-management view — Phase 12: view
 * charges, payments, balances, payment status, financial-clearance
 * state, and (via the linked Audit Log) relevant history. No advanced
 * accounting reports; no offline/manual-payment recording (this
 * milestone's brief leaves it out as not necessary for the vertical
 * slice). Institution-wide, matching ADMINISTRATOR's ROLE_SCOPE.
 */
export default async function AdminBillingPage() {
  const user = await requireSessionUserWithRole("ADMINISTRATOR");

  const [charges, cohorts] = await Promise.all([
    listChargesForAdmin(user),
    db.cohort.findMany({
      include: { program: true, tuitionConfiguration: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="stack">
      <h1>Billing &amp; Tuition</h1>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Tuition Configuration</h2>
        <p className="muted">
          Configure the tuition rate for a Cohort. Changing a rate never retroactively affects a Student who was
          already charged — see this Program&rsquo;s existing Charges below, which freeze the amount at the moment
          of enrollment.
        </p>
        {cohorts.length === 0 ? (
          <p className="muted">No Cohort exists yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Cohort</th>
                  <th scope="col">Program</th>
                  <th scope="col">Current Rate</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort) => (
                  <tr key={cohort.id}>
                    <td>{cohort.name}</td>
                    <td>{cohort.program.name}</td>
                    <td>
                      {cohort.tuitionConfiguration
                        ? formatCents(cohort.tuitionConfiguration.amountCents, cohort.tuitionConfiguration.currency)
                        : "Not configured"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ActionForm action={configureTuitionAction} submitLabel="Save Tuition Configuration">
          <div className="field">
            <label htmlFor="cohortId">Cohort</label>
            <select id="cohortId" name="cohortId" required disabled={cohorts.length === 0}>
              <option value="">Select a Cohort&hellip;</option>
              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name} — {cohort.program.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="amountDollars">Tuition Amount (USD)</label>
            <input id="amountDollars" name="amountDollars" type="number" min="0" step="0.01" required />
            <span className="hint">
              ⚠️ Demo/configurable value only — not official MIHS pricing. See this milestone&rsquo;s Needs
              Verification document.
            </span>
          </div>
          <div className="field">
            <label htmlFor="description">Description (optional)</label>
            <input id="description" name="description" placeholder="e.g. Tuition — Fall 2026 Cohort" />
          </div>
        </ActionForm>
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Charges &amp; Payments</h2>
        {charges.length === 0 ? (
          <p className="muted">No Student Charge has been created yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Program</th>
                  <th scope="col">Description</th>
                  <th scope="col">Charged</th>
                  <th scope="col">Paid</th>
                  <th scope="col">Balance</th>
                  <th scope="col">Latest Payment</th>
                </tr>
              </thead>
              <tbody>
                {charges.map((charge) => {
                  const paidCents = charge.payments
                    .filter((p) => p.status === "SUCCEEDED")
                    .reduce((sum, p) => sum + p.amountCents, 0);
                  const balanceCents = charge.amountCents - paidCents;
                  const latestPayment = charge.payments[charge.payments.length - 1];
                  return (
                    <tr key={charge.id}>
                      <td>{charge.student.name}</td>
                      <td>{charge.program.name}</td>
                      <td>{charge.description}</td>
                      <td>{formatCents(charge.amountCents, charge.currency)}</td>
                      <td>{formatCents(paidCents, charge.currency)}</td>
                      <td>{formatCents(balanceCents, charge.currency)}</td>
                      <td>
                        {latestPayment ? (
                          <span className={`badge badge--${PAYMENT_BADGE[latestPayment.status] ?? "draft"}`}>
                            {latestPayment.status}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="muted">
          For a full attributable history of every charge/payment/clearance event, see the{" "}
          <a href="/admin/audit">Audit Log</a>.
        </p>
      </section>
    </div>
  );
}
