import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole, hasRoleForProgram } from "@/services/identity/authorization";
import { getGraduationRequestById, determineGraduationEligibility } from "@/services/graduation/graduation";
import { approveGraduationAction, returnGraduationReviewAction } from "../../actions";
import { ReturnGraduationForm } from "../return-graduation-form";

export const metadata: Metadata = { title: "Review Graduation Candidate" };

/**
 * Graduation candidate review — Program Director sees the requirements
 * breakdown that supported the eligibility determination at submission
 * time, then approves or returns with a required reason, per Phase 6/7
 * of this milestone's core vertical slice. Re-computes eligibility live
 * (rather than trusting only the audited snapshot from submission) so
 * the Program Director always reviews the Student's current standing.
 */
export default async function ProgramDirectorGraduationDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const user = await requireSessionUserWithRole("PROGRAM_DIRECTOR");

  const request = await getGraduationRequestById(requestId, user);
  if (!request) notFound();

  const isAdministrator = user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
  if (!isAdministrator && !hasRoleForProgram(user, "PROGRAM_DIRECTOR", request.programId)) {
    notFound();
  }

  const eligibility = await determineGraduationEligibility(request.studentId, request.programId, user);

  return (
    <div className="stack">
      <p className="muted">
        <Link href="/program-director/graduation">&larr; Graduation Candidates</Link>
      </p>
      <h1>
        {request.student.name} &middot; {request.program.name}
      </h1>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Status</h2>
        <span className="badge badge--submitted">{request.status.replaceAll("_", " ")}</span>
        <p className="muted">
          Submitted by {request.submittedBy.name} on {request.submittedAt.toLocaleString()}
        </p>
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Requirements Supporting This Decision</h2>
        <ul>
          <li>Academic completion: {eligibility.academicComplete ? "Met" : "Not met"}</li>
          <li>
            Externship required: {eligibility.externshipRequired ? "Yes" : "No"}
            {eligibility.externshipRequired
              ? ` — Verified: ${eligibility.externshipVerified ? "Yes" : "No"}`
              : ""}
          </li>
        </ul>
        {eligibility.missingRequirements.length > 0 ? (
          <p className="alert alert--error" role="alert">
            {eligibility.missingRequirements.join(" ")}
          </p>
        ) : null}
      </section>

      {request.status === "SUBMITTED" ? (
        <section style={{ padding: 0, border: "none" }}>
          <h2>Decision</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <form action={approveGraduationAction.bind(null, request.id)}>
              <button className="button button--primary" type="submit">
                Approve Graduation
              </button>
            </form>
            <ReturnGraduationForm action={returnGraduationReviewAction.bind(null, request.id)} />
          </div>
        </section>
      ) : (
        <section style={{ padding: 0, border: "none" }}>
          <h2>Decision</h2>
          <p className="muted">
            {request.status === "APPROVED"
              ? "Approved — awaiting institutional Certificate issuance."
              : request.status === "CERTIFICATE_ISSUED"
                ? "Certificate already issued."
                : `Returned: ${request.returnReason}`}
          </p>
        </section>
      )}
    </div>
  );
}
