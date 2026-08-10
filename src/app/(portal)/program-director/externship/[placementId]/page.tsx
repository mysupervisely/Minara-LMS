import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole, hasRoleForProgram } from "@/services/identity/authorization";
import { getPlacementById } from "@/services/externship/externship";
import { verifyCompletionAction, returnCompletionAction } from "../../actions";
import { ReturnCompletionForm } from "../return-completion-form";

export const metadata: Metadata = { title: "Review Externship Completion" };

/**
 * Externship Completion review — Program Director reviews the Placement,
 * its Evaluations, and the Coordinator's hours attestation, then
 * approves or returns with a required reason, per Phase 9's "review
 * placement, review evaluation status, review completion information,
 * approve/verify completion." The Program Director cannot edit any
 * Coordinator-only operational field here (no evaluation-editing or
 * hours-attestation control on this page) — only the completion
 * verification decision itself, per Phase 9's explicit constraint.
 */
export default async function ProgramDirectorExternshipDetailPage({
  params,
}: {
  params: Promise<{ placementId: string }>;
}) {
  const { placementId } = await params;
  const user = await requireSessionUserWithRole("PROGRAM_DIRECTOR");

  const placement = await getPlacementById(placementId, user);
  if (!placement) notFound();

  const isAdministrator = user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
  if (!isAdministrator && !hasRoleForProgram(user, "PROGRAM_DIRECTOR", placement.programId)) {
    notFound();
  }

  return (
    <div className="stack">
      <p className="muted">
        <Link href="/program-director/externship">&larr; Completion Verification</Link>
      </p>
      <h1>
        {placement.student.name} &middot; {placement.clinicalSite.name}
      </h1>
      <p className="muted">{placement.clinicalSite.employerName}</p>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Placement</h2>
        <p>Status: {placement.status}</p>
        <p>Requested by: {placement.requestedBy.name}</p>
        <p>Hours attested: {placement.hoursAttestedAt ? placement.hoursAttestedAt.toLocaleString() : "Not yet"}</p>
        {placement.hoursAttestedBy ? <p>Attested by: {placement.hoursAttestedBy.name}</p> : null}
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Evaluations</h2>
        {placement.evaluations.length === 0 ? (
          <p className="muted">No Evaluations recorded.</p>
        ) : (
          <ul>
            {placement.evaluations.map((evaluation) => (
              <li key={evaluation.id}>
                <strong>{evaluation.type === "MIDPOINT" ? "Midpoint" : "Final"}</strong> —{" "}
                {evaluation.outcome.replaceAll("_", " ")}
                <p>{evaluation.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Completion Verification</h2>
        <p>Submitted by: {placement.completionSubmittedBy?.name ?? "—"}</p>
        <p>
          Submitted at:{" "}
          {placement.completionSubmittedAt ? placement.completionSubmittedAt.toLocaleString() : "—"}
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <form action={verifyCompletionAction.bind(null, placement.id)}>
            <button className="button button--primary" type="submit">
              Verify Completion
            </button>
          </form>
          <ReturnCompletionForm action={returnCompletionAction.bind(null, placement.id)} />
        </div>
      </section>
    </div>
  );
}
