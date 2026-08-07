import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { facultyCanAccessCourseOffering, getCourseOfferingById } from "@/services/academic/institution";
import { getAssessmentForReview } from "@/services/academic/content-workflow";
import { ActionForm } from "@/components/action-form";
import { updateAssessmentDraftAction, submitAssessmentForReviewAction } from "../../../../actions";

export const metadata: Metadata = { title: "Assessment" };

/**
 * Faculty "Edit lesson"-equivalent for Assessment definitions, plus
 * "Submit for approval" / "View status" — Milestone 13. See the
 * sibling Lesson page's comment for the shared Draft-only-editable
 * rule.
 */
export default async function FacultyAssessmentPage({
  params,
}: {
  params: Promise<{ courseOfferingId: string; assessmentId: string }>;
}) {
  const { courseOfferingId, assessmentId } = await params;
  const user = await requireSessionUserWithRole("FACULTY");

  const allowed = await facultyCanAccessCourseOffering(user.id, courseOfferingId);
  if (!allowed) notFound();

  const [offering, assessment] = await Promise.all([
    getCourseOfferingById(courseOfferingId),
    getAssessmentForReview(assessmentId),
  ]);
  if (!offering || !assessment || assessment.courseId !== offering.course.id) notFound();

  const boundUpdate = updateAssessmentDraftAction.bind(null, assessmentId, courseOfferingId);
  const boundSubmit = submitAssessmentForReviewAction.bind(null, assessmentId, courseOfferingId);

  return (
    <div className="stack">
      <p className="muted">
        <Link href={`/faculty/courses/${courseOfferingId}`}>&larr; {offering.course.title}</Link>
      </p>
      <h1>{assessment.title}</h1>
      <p>
        <span className={`badge badge--${assessment.status.toLowerCase()}`}>{assessment.status}</span>
      </p>

      {assessment.returnReason ? (
        <p className="alert alert--error" role="alert">
          Returned for revision: {assessment.returnReason}
        </p>
      ) : null}

      {assessment.status === "DRAFT" ? (
        <>
          <ActionForm action={boundUpdate} submitLabel="Save">
            <div className="field">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" defaultValue={assessment.title} required />
            </div>
            <div className="field">
              <label htmlFor="instructions">Instructions</label>
              <textarea
                id="instructions"
                name="instructions"
                rows={6}
                defaultValue={assessment.instructions}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="maxScore">Maximum score</label>
              <input
                id="maxScore"
                name="maxScore"
                type="number"
                min={1}
                max={1000}
                defaultValue={assessment.maxScore}
              />
            </div>
          </ActionForm>

          <form action={boundSubmit}>
            <button className="button button--secondary" type="submit">
              Submit for Review
            </button>
          </form>
        </>
      ) : (
        <div className="card">
          <p>{assessment.instructions}</p>
          <p className="muted">Maximum score: {assessment.maxScore}</p>
        </div>
      )}
    </div>
  );
}
