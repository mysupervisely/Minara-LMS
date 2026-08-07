import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { studentCanAccessCourseOffering } from "@/services/enrollment/enrollment";
import {
  getSubmissionForStudent,
  getSubmissionHistoryForStudent,
  getPublishedAssessmentVersion,
} from "@/services/assessments/assessments";
import { submitAssessmentAction } from "@/app/(portal)/student/actions";
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
  // (S-1) and Milestone 14's identical requirement — see the matching
  // service-layer check in
  // src/services/assessments/assessments.ts's submitAssessment.
  const version = await getPublishedAssessmentVersion(assessmentId);
  if (!version) notFound();

  const [submission, history] = await Promise.all([
    getSubmissionForStudent(assessmentId, user.id),
    getSubmissionHistoryForStudent(assessmentId, user.id),
  ]);
  const boundSubmit = submitAssessmentAction.bind(null, courseOfferingId, assessmentId);

  // A Submission (and its Grade) against an earlier version of this
  // same Assessment — Milestone 14's "historical Submission remains
  // associated with Version 1" requirement, made visible.
  const priorSubmission = history.find((h) => h.assessmentVersionId !== version.id);

  return (
    <div className="stack">
      <p className="muted">
        <Link href={`/student/courses/${courseOfferingId}`}>&larr; Back to course</Link>
      </p>
      <h1>{version.title}</h1>
      <p>{version.instructions}</p>
      <p className="muted">Maximum score: {version.maxScore}</p>

      {submission?.grade?.status === "APPROVED" ? (
        <div className="card">
          <h2>Grade</h2>
          <p>
            <strong>
              {submission.grade.score} / {version.maxScore}
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

      {priorSubmission ? (
        <p className="muted">
          You previously attempted an earlier version of this Assessment (v
          {priorSubmission.assessmentVersion.versionNumber}) on{" "}
          {priorSubmission.submittedAt.toLocaleString()}
          {priorSubmission.grade?.status === "APPROVED"
            ? ` — graded ${priorSubmission.grade.score}/${priorSubmission.assessmentVersion.maxScore}`
            : ""}
          . The Assessment has since been updated; that historical record is preserved and
          unaffected.
        </p>
      ) : null}
    </div>
  );
}
