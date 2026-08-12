import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { getApplicationById, listCohortsForProgram } from "@/services/admissions/admissions";
import { startReviewAction, reopenForReviewAction, createEnrollmentFromApplicationAction } from "../../actions";
import { RequirementStatusForm, AddRequirementForm, DecisionForm, CohortForm } from "./application-forms";

export const metadata: Metadata = { title: "Review Application" };

const REQUIREMENT_LABEL: Record<string, string> = {
  RECEIVED: "Received",
  MISSING: "Missing",
  NEEDS_VERIFICATION: "⚠️ Needs Verification",
  NOT_APPLICABLE: "Not Applicable",
};

/**
 * Application review — Phase 5: view checklist, mark requirements
 * received/verified, move into review, record a Decision, see audit
 * history (the audit trail itself is on /admin/audit, per this
 * milestone's "no parallel audit log" instruction — reconstructed there,
 * not duplicated here).
 */
export default async function AdmissionsApplicationDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const user = await requireSessionUserWithRole("ADMISSIONS_STAFF");

  const application = await getApplicationById(applicationId, user);
  if (!application) notFound();

  const cohorts = await listCohortsForProgram(application.programId, user);

  return (
    <div className="stack">
      <p className="muted">
        <Link href="/admissions/applications">&larr; Applications</Link>
      </p>
      <h1>
        {application.applicant.name} &middot; {application.program.name}
      </h1>
      <p>
        <span className="badge badge--submitted">{application.status.replaceAll("_", " ")}</span>
      </p>
      {application.applicantNotes ? (
        <section style={{ padding: 0, border: "none" }}>
          <h2>Applicant Notes</h2>
          <p>{application.applicantNotes}</p>
        </section>
      ) : null}

      <section style={{ padding: 0, border: "none" }}>
        <h2>Checklist</h2>
        <div className="stack" style={{ gap: "0.75rem" }}>
          {application.requirements.map((requirement) => (
            <div key={requirement.id} className="card">
              <p style={{ margin: "0 0 0.5rem 0" }}>
                <strong>{requirement.label}</strong> — {REQUIREMENT_LABEL[requirement.status] ?? requirement.status}
                {requirement.note ? ` (${requirement.note})` : ""}
              </p>
              <RequirementStatusForm
                requirementId={requirement.id}
                applicationId={application.id}
                currentStatus={requirement.status}
                currentNote={requirement.note ?? ""}
              />
            </div>
          ))}
        </div>
        <AddRequirementForm applicationId={application.id} />
      </section>

      {application.status === "SUBMITTED" ? (
        <form action={startReviewAction.bind(null, application.id)}>
          <button className="button button--primary" type="submit">
            Move Into Review
          </button>
        </form>
      ) : null}

      {(application.status === "WAITLISTED" || application.status === "DEFERRED") ? (
        <form action={reopenForReviewAction.bind(null, application.id)}>
          <button className="button button--primary" type="submit">
            Reopen for Review
          </button>
        </form>
      ) : null}

      {application.status === "UNDER_REVIEW" ? (
        <section style={{ padding: 0, border: "none" }}>
          <h2>Decision</h2>
          <div className="stack" style={{ gap: "0.75rem" }}>
            <DecisionForm applicationId={application.id} decision="ACCEPTED" label="Accept" buttonClass="button--primary" />
            <DecisionForm applicationId={application.id} decision="WAITLISTED" label="Waitlist" buttonClass="button--secondary" />
            <DecisionForm applicationId={application.id} decision="DEFERRED" label="Defer" buttonClass="button--secondary" />
            <DecisionForm applicationId={application.id} decision="DENIED" label="Deny" buttonClass="button--secondary" />
          </div>
        </section>
      ) : null}

      {["DENIED", "WAITLISTED", "DEFERRED", "ACCEPTED", "ACCEPTANCE_CONFIRMED"].includes(application.status) &&
      application.decisionReason ? (
        <p className="muted">Decision note: {application.decisionReason}</p>
      ) : null}

      {application.status === "ACCEPTED" || application.status === "ACCEPTANCE_CONFIRMED" ? (
        <section style={{ padding: 0, border: "none" }}>
          <h2>Cohort Assignment</h2>
          {application.cohort ? <p>Assigned: {application.cohort.name}</p> : null}
          <CohortForm applicationId={application.id} cohorts={cohorts} currentCohortId={application.cohortId} />
        </section>
      ) : null}

      {application.status === "ACCEPTANCE_CONFIRMED" ? (
        <section style={{ padding: 0, border: "none" }}>
          <h2>Enrollment</h2>
          {application.cohortId ? (
            <form action={createEnrollmentFromApplicationAction.bind(null, application.id)}>
              <button className="button button--primary" type="submit">
                Complete Enrollment
              </button>
            </form>
          ) : (
            <p className="muted">Assign a Cohort above before completing enrollment.</p>
          )}
        </section>
      ) : null}

      {application.status === "ENROLLED" && application.enrollment ? (
        <p className="alert alert--success" role="status">
          Enrolled — {application.applicant.name} now has Student Portal access.
        </p>
      ) : null}
    </div>
  );
}
