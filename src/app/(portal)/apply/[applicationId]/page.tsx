import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUser } from "@/services/identity/authorization";
import { getApplicationById } from "@/services/admissions/admissions";
import { DraftForm } from "../draft-form";
import { submitApplicationAction, confirmOfferAction, declineOfferAction } from "../actions";

export const metadata: Metadata = { title: "My Application" };

const REQUIREMENT_LABEL: Record<string, string> = {
  RECEIVED: "Received",
  MISSING: "Missing",
  NEEDS_VERIFICATION: "⚠️ Needs Verification",
  NOT_APPLICABLE: "Not Applicable",
};

/**
 * The Applicant's own Application — Phase 4: start/save/submit, view
 * status, view checklist, see decision, confirm/decline an offer, see
 * enrollment completion. Internal admissions notes/decision reasoning
 * beyond the Decision itself are never exposed here — only what Phase 4
 * explicitly lists.
 */
export default async function MyApplicationDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const user = await requireSessionUser();

  const application = await getApplicationById(applicationId, user);
  if (!application) notFound();
  // getApplicationById's own read-access check also allows Admissions
  // Staff/Administrator/overseeing Program Director to read this row —
  // this specific page is the Applicant's own view only, so it narrows
  // further, the same double-check pattern
  // program-director/graduation/[requestId]/page.tsx already uses.
  if (application.applicantId !== user.id) notFound();

  return (
    <div className="stack">
      <p className="muted">
        <Link href="/apply">&larr; My Applications</Link>
      </p>
      <h1>{application.program.name}</h1>
      <p>
        <span className="badge badge--submitted">{application.status.replaceAll("_", " ")}</span>
      </p>

      {application.status === "DRAFT" ? (
        <section style={{ padding: 0, border: "none" }}>
          <h2>Your Application</h2>
          <DraftForm applicationId={application.id} initialNotes={application.applicantNotes ?? ""} />
          <form action={submitApplicationAction.bind(null, application.id)}>
            <button className="button button--primary" type="submit">
              Submit Application
            </button>
          </form>
        </section>
      ) : null}

      <section style={{ padding: 0, border: "none" }}>
        <h2>Checklist</h2>
        {application.requirements.length === 0 ? (
          <p className="muted">No checklist items yet.</p>
        ) : (
          <ul>
            {application.requirements.map((requirement) => (
              <li key={requirement.id}>
                {requirement.label}: {REQUIREMENT_LABEL[requirement.status] ?? requirement.status}
              </li>
            ))}
          </ul>
        )}
      </section>

      {["DENIED", "WAITLISTED", "DEFERRED"].includes(application.status) ? (
        <section style={{ padding: 0, border: "none" }}>
          <h2>Decision</h2>
          <p>{application.decisionReason ?? "No additional notes were provided."}</p>
        </section>
      ) : null}

      {application.status === "ACCEPTED" ? (
        <section style={{ padding: 0, border: "none" }}>
          <h2>You&rsquo;ve Been Accepted</h2>
          {application.decisionReason ? <p>{application.decisionReason}</p> : null}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <form action={confirmOfferAction.bind(null, application.id)}>
              <button className="button button--primary" type="submit">
                Confirm Offer
              </button>
            </form>
            <form action={declineOfferAction.bind(null, application.id)}>
              <button className="button button--secondary" type="submit">
                Decline Offer
              </button>
            </form>
          </div>
        </section>
      ) : null}

      {application.status === "ACCEPTANCE_CONFIRMED" ? (
        <p className="alert alert--success" role="status">
          You&rsquo;ve confirmed your offer. The Admissions team will complete your enrollment shortly.
        </p>
      ) : null}

      {application.status === "ACCEPTANCE_DECLINED" ? (
        <p className="muted">You declined this offer.</p>
      ) : null}

      {application.status === "ENROLLED" ? (
        <p className="alert alert--success" role="status">
          Perseverance to continue — you&rsquo;re enrolled! Visit your <Link href="/student">Student Portal</Link>.
        </p>
      ) : null}
    </div>
  );
}
