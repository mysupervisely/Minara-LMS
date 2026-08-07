import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole, hasRoleForProgram } from "@/services/identity/authorization";
import { getAssessmentVersionForReview } from "@/services/academic/content-workflow";
import { approveContentAction, returnContentToDraftAction } from "../../../actions";
import { ReturnContentForm } from "../../return-content-form";

export const metadata: Metadata = { title: "Review Assessment Version" };

export default async function ReviewAssessmentVersionPage({
  params,
}: {
  params: Promise<{ assessmentVersionId: string }>;
}) {
  const { assessmentVersionId } = await params;
  const user = await requireSessionUserWithRole("PROGRAM_DIRECTOR");

  const version = await getAssessmentVersionForReview(assessmentVersionId);
  if (!version) notFound();

  const isAdministrator = user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
  if (
    !isAdministrator &&
    !hasRoleForProgram(user, "PROGRAM_DIRECTOR", version.assessment.course.programId)
  ) {
    notFound();
  }

  const boundApprove = approveContentAction.bind(null, "ASSESSMENT", assessmentVersionId);
  const boundReturn = returnContentToDraftAction.bind(null, "ASSESSMENT", assessmentVersionId);

  return (
    <div className="stack">
      <p className="muted">
        <Link href="/program-director/content">&larr; Curriculum Review</Link>
      </p>
      <h1>
        {version.title} <span className="muted">v{version.versionNumber}</span>
      </h1>
      <p className="muted">
        {version.assessment.course.title} &middot; {version.assessment.course.program.name}
      </p>

      <div className="card">
        <p>{version.instructions}</p>
        <p className="muted">Maximum score: {version.maxScore}</p>
        <p className={`badge badge--${version.status.toLowerCase()}`}>{version.status}</p>
      </div>

      {version.status === "SUBMITTED" ? (
        <div className="cluster">
          <form action={boundApprove}>
            <button className="button button--primary" type="submit">
              Approve
            </button>
          </form>
          <ReturnContentForm action={boundReturn} />
        </div>
      ) : (
        <p className="muted">This version is {version.status.toLowerCase()}, not awaiting review.</p>
      )}
    </div>
  );
}
