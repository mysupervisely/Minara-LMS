import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { facultyCanAccessCourse } from "@/services/academic/institution";
import { getSubmissionById } from "@/services/assessments/assessments";
import { enterGradeAction, submitGradeForApprovalAction } from "../../actions";
import { GradeForm } from "./grade-form";

export const metadata: Metadata = { title: "Review Submission" };

export default async function FacultySubmissionPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const user = await requireSessionUserWithRole("FACULTY");

  const submission = await getSubmissionById(submissionId);
  if (!submission) notFound();

  const allowed = await facultyCanAccessCourse(user.id, submission.assessmentVersion.assessment.course.id);
  if (!allowed) notFound();

  const boundEnterGrade = enterGradeAction.bind(null, submissionId);
  const boundSubmitForApproval = submission.grade
    ? submitGradeForApprovalAction.bind(null, submissionId, submission.grade.id)
    : null;

  return (
    <div className="stack">
      <p className="muted">
        <Link href="/faculty">&larr; My Sections</Link>
      </p>
      <h1>{submission.assessmentVersion.title}</h1>
      <p className="muted">
        Version {submission.assessmentVersion.versionNumber} &middot; {submission.student.name}{" "}
        &middot; submitted {submission.submittedAt.toLocaleString()}
      </p>

      <div className="card">
        <h2>Response</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{submission.content}</p>
      </div>

      {submission.grade?.status && submission.grade.status !== "DRAFT" ? (
        <p className={`badge badge--${submission.grade.status.toLowerCase()}`}>
          {submission.grade.status === "SUBMITTED"
            ? "Submitted for Program Director approval"
            : "Approved"}
        </p>
      ) : (
        <GradeForm
          action={boundEnterGrade}
          maxScore={submission.assessmentVersion.maxScore}
          defaultScore={submission.grade?.score}
          defaultFeedback={submission.grade?.feedback}
        />
      )}

      {submission.grade?.status === "DRAFT" && boundSubmitForApproval ? (
        <form action={boundSubmitForApproval}>
          <button className="button button--secondary" type="submit">
            Submit Grade for Program Director Approval
          </button>
        </form>
      ) : null}
    </div>
  );
}
