import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { studentCanAccessCourseOffering } from "@/services/enrollment/enrollment";
import { getSubmissionForStudent } from "@/services/assessments/assessments";
import { submitAssessmentAction } from "@/app/(portal)/student/actions";
import { db } from "@/lib/db";
import { SubmitAssessmentForm } from "./submit-assessment-form";

export const metadata: Metadata = { title: "Assessment" };

export default async function StudentAssessmentPage({
  params,
}: {
  params: Promise<{ courseOfferingId: string; assessmentId: string }>;
}) {
  const { courseOfferingId, assessmentId } = await params;
  const user = await requireSessionUserWithRole("STUDENT");

  const allowed = await studentCanAccessCourseOffering(user.id, courseOfferingId);
  if (!allowed) notFound();

  // Fail-closed, per this milestone's Product Requirements Document
  // (S-1) — see the matching service-layer check in
  // src/services/assessments/assessments.ts's submitAssessment.
  const assessment = await db.assessment.findUnique({ where: { id: assessmentId } });
  if (!assessment || assessment.status !== "PUBLISHED") notFound();

  const submission = await getSubmissionForStudent(assessmentId, user.id);
  const boundSubmit = submitAssessmentAction.bind(null, courseOfferingId, assessmentId);

  return (
    <div className="stack">
      <p className="muted">
        <Link href={`/student/courses/${courseOfferingId}`}>&larr; Back to course</Link>
      </p>
      <h1>{assessment.title}</h1>
      <p>{assessment.instructions}</p>
      <p className="muted">Maximum score: {assessment.maxScore}</p>

      {submission?.grade?.status === "APPROVED" ? (
        <div className="card">
          <h2>Grade</h2>
          <p>
            <strong>
              {submission.grade.score} / {assessment.maxScore}
            </strong>
          </p>
          {submission.grade.feedback ? <p>{submission.grade.feedback}</p> : null}
        </div>
      ) : null}

      <SubmitAssessmentForm action={boundSubmit} defaultValue={submission?.content} />

      {submission && submission.grade?.status !== "APPROVED" ? (
        <p className="muted">
          Submitted {submission.submittedAt.toLocaleString()}. You may resubmit until your Faculty
          Instructor reviews it.
        </p>
      ) : null}
    </div>
  );
}
