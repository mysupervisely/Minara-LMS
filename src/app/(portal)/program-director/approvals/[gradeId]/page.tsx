import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole, hasRoleForProgram } from "@/services/identity/authorization";
import { getGradeForApproval } from "@/services/gradebook/gradebook";
import { approveGradeAction, rejectGradeAction } from "../../actions";

export const metadata: Metadata = { title: "Review Grade" };

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ gradeId: string }>;
}) {
  const { gradeId } = await params;
  const user = await requireSessionUserWithRole("PROGRAM_DIRECTOR");

  const grade = await getGradeForApproval(gradeId);
  if (!grade) notFound();

  const programId = grade.submission.assessment.course.programId;
  const isAdministrator = user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
  if (!isAdministrator && !hasRoleForProgram(user, "PROGRAM_DIRECTOR", programId)) {
    notFound();
  }

  const boundApprove = approveGradeAction.bind(null, gradeId);
  const boundReject = rejectGradeAction.bind(null, gradeId);

  return (
    <div className="stack">
      <p className="muted">
        <Link href="/program-director">&larr; Approvals</Link>
      </p>
      <h1>{grade.submission.assessment.title}</h1>
      <p className="muted">
        {grade.submission.student.name} &middot; {grade.submission.assessment.course.title} &middot;{" "}
        {grade.submission.assessment.course.program.name}
      </p>

      <div className="card">
        <h2>Submitted Response</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{grade.submission.content}</p>
      </div>

      <div className="card">
        <h2>Grade</h2>
        <p>
          <strong>
            {grade.score} / {grade.submission.assessment.maxScore}
          </strong>
        </p>
        {grade.feedback ? <p>{grade.feedback}</p> : null}
        <p className="muted">Entered by {grade.enteredBy.name}</p>
        <p className={`badge badge--${grade.status.toLowerCase()}`}>{grade.status}</p>
      </div>

      {grade.status === "SUBMITTED" ? (
        <div className="cluster">
          <form action={boundApprove}>
            <button className="button button--primary" type="submit">
              Approve
            </button>
          </form>
          <form action={boundReject}>
            <button className="button button--secondary" type="submit">
              Reject (return to Faculty)
            </button>
          </form>
        </div>
      ) : (
        <p className="muted">This grade has already been {grade.status.toLowerCase()}.</p>
      )}
    </div>
  );
}
