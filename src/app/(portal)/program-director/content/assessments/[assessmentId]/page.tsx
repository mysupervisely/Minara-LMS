import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole, hasRoleForProgram } from "@/services/identity/authorization";
import { getAssessmentForReview } from "@/services/academic/content-workflow";
import { approveContentAction, returnContentToDraftAction } from "../../../actions";
import { ReturnContentForm } from "../../return-content-form";

export const metadata: Metadata = { title: "Review Assessment" };

export default async function ReviewAssessmentPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  const user = await requireSessionUserWithRole("PROGRAM_DIRECTOR");

  const assessment = await getAssessmentForReview(assessmentId);
  if (!assessment) notFound();

  const isAdministrator = user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
  if (!isAdministrator && !hasRoleForProgram(user, "PROGRAM_DIRECTOR", assessment.course.programId)) {
    notFound();
  }

  const boundApprove = approveContentAction.bind(null, "ASSESSMENT", assessmentId);
  const boundReturn = returnContentToDraftAction.bind(null, "ASSESSMENT", assessmentId);

  return (
    <div className="stack">
      <p className="muted">
        <Link href="/program-director/content">&larr; Curriculum Review</Link>
      </p>
      <h1>{assessment.title}</h1>
      <p className="muted">
        {assessment.course.title} &middot; {assessment.course.program.name}
      </p>

      <div className="card">
        <p>{assessment.instructions}</p>
        <p className="muted">Maximum score: {assessment.maxScore}</p>
        <p className={`badge badge--${assessment.status.toLowerCase()}`}>{assessment.status}</p>
      </div>

      {assessment.status === "SUBMITTED" ? (
        <div className="cluster">
          <form action={boundApprove}>
            <button className="button button--primary" type="submit">
              Approve
            </button>
          </form>
          <ReturnContentForm action={boundReturn} />
        </div>
      ) : (
        <p className="muted">This Assessment is {assessment.status.toLowerCase()}, not awaiting review.</p>
      )}
    </div>
  );
}
