import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { getPlacementById } from "@/services/externship/externship";
import {
  approvePlacementAction,
  activatePlacementAction,
  attestHoursCompleteAction,
  submitCompletionForVerificationAction,
  recordEvaluationAction,
} from "../../actions";
import { EvaluationForm } from "./evaluation-form";

export const metadata: Metadata = { title: "Manage Placement" };

const PLACEMENT_BADGE: Record<string, string> = {
  REQUESTED: "draft",
  APPROVED: "submitted",
  ACTIVE: "active",
  COMPLETED: "published",
};
const COMPLETION_BADGE: Record<string, string> = {
  NOT_SUBMITTED: "draft",
  SUBMITTED: "submitted",
  VERIFIED: "approved",
  RETURNED: "draft",
};

/**
 * Placement detail — Orientation Status / Hour Log / Midpoint Evaluation
 * / Final Evaluation / Completion Verification, per the Coordinator
 * Portal's secondary navigation
 * (docs/milestones/milestone-4-information-architecture/06-clinical-coordinator-portal.md),
 * collapsed into one page for this narrow slice. `getPlacementById`
 * fails closed (throws ExternshipAuthorizationError, surfaced by the
 * nearest error boundary) if this Coordinator does not oversee the
 * Placement's Program — the service-layer check runs regardless of
 * this page's own role gate above it.
 */
export default async function CoordinatorPlacementDetailPage({
  params,
}: {
  params: Promise<{ placementId: string }>;
}) {
  const { placementId } = await params;
  const user = await requireSessionUserWithRole("CLINICAL_COORDINATOR");

  const placement = await getPlacementById(placementId, user);
  if (!placement) notFound();

  const hasFinalEvaluation = placement.evaluations.some((e) => e.type === "FINAL");
  const canSubmitCompletion =
    placement.status === "ACTIVE" &&
    ["NOT_SUBMITTED", "RETURNED"].includes(placement.completionStatus) &&
    hasFinalEvaluation &&
    placement.hoursAttestedAt !== null;

  return (
    <div className="stack">
      <p className="muted">
        <Link href="/coordinator/placements">&larr; Placements</Link>
      </p>
      <h1>
        {placement.student.name} &middot; {placement.clinicalSite.name}
      </h1>
      <p className="muted">{placement.clinicalSite.employerName}</p>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Status</h2>
        <p>
          Placement:{" "}
          <span className={`badge badge--${PLACEMENT_BADGE[placement.status] ?? "draft"}`}>
            {placement.status}
          </span>{" "}
          &middot; Completion Verification:{" "}
          <span className={`badge badge--${COMPLETION_BADGE[placement.completionStatus] ?? "draft"}`}>
            {placement.completionStatus.replaceAll("_", " ")}
          </span>
        </p>
        {placement.completionReturnReason ? (
          <p className="alert alert--error" role="alert">
            Returned by the Program Director: {placement.completionReturnReason}
          </p>
        ) : null}
        <p>Hours attested: {placement.hoursAttestedAt ? placement.hoursAttestedAt.toLocaleString() : "Not yet"}</p>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {placement.status === "REQUESTED" ? (
            <form action={approvePlacementAction.bind(null, placement.id)}>
              <button className="button button--secondary" type="submit">
                Approve Placement
              </button>
            </form>
          ) : null}
          {placement.status === "APPROVED" ? (
            <form action={activatePlacementAction.bind(null, placement.id)}>
              <button className="button button--secondary" type="submit">
                Activate Placement
              </button>
            </form>
          ) : null}
          {placement.status === "ACTIVE" && !placement.hoursAttestedAt ? (
            <form action={attestHoursCompleteAction.bind(null, placement.id)}>
              <button className="button button--secondary" type="submit">
                Attest Hours Complete
              </button>
            </form>
          ) : null}
        </div>
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Evaluations</h2>
        {placement.evaluations.length === 0 ? (
          <p className="muted">No Evaluations recorded yet.</p>
        ) : (
          <ul>
            {placement.evaluations.map((evaluation) => (
              <li key={evaluation.id}>
                <strong>{evaluation.type === "MIDPOINT" ? "Midpoint" : "Final"}</strong>{" "}
                <span className={`badge badge--${evaluation.outcome === "SATISFACTORY" ? "active" : "draft"}`}>
                  {evaluation.outcome.replaceAll("_", " ")}
                </span>
                <p>{evaluation.content}</p>
                <p className="muted">{evaluation.createdAt.toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}

        {placement.status === "ACTIVE" ? (
          <div className="card-grid">
            <div>
              <h3>Midpoint Evaluation</h3>
              <EvaluationForm action={recordEvaluationAction.bind(null, placement.id, "MIDPOINT")} label="Midpoint" />
            </div>
            <div>
              <h3>Final Evaluation</h3>
              <EvaluationForm action={recordEvaluationAction.bind(null, placement.id, "FINAL")} label="Final" />
            </div>
          </div>
        ) : (
          <p className="muted">Evaluations can only be recorded while the Placement is Active.</p>
        )}
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Completion Verification</h2>
        <p className="muted">
          Requires a Final Evaluation and an hours-complete attestation on record — no specific hour count is
          enforced by this platform (⚠️ Needs Verification, pending Minara-Curriculum).
        </p>
        {canSubmitCompletion ? (
          <form action={submitCompletionForVerificationAction.bind(null, placement.id)}>
            <button className="button button--primary" type="submit">
              Submit for Completion Verification
            </button>
          </form>
        ) : placement.completionStatus === "SUBMITTED" ? (
          <p className="muted">Awaiting Program Director review.</p>
        ) : placement.completionStatus === "VERIFIED" ? (
          <p className="muted">Verified by {placement.completionVerifiedBy?.name} on{" "}
            {placement.completionVerifiedAt?.toLocaleString()}.</p>
        ) : (
          <p className="muted">
            Not yet ready to submit — record a Final Evaluation and attest hours complete first.
          </p>
        )}
      </section>
    </div>
  );
}
