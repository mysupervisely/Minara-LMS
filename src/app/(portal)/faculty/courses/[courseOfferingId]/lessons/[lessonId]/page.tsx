import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { facultyCanAccessCourseOffering, getCourseOfferingById } from "@/services/academic/institution";
import { getLessonForReview } from "@/services/academic/content-workflow";
import { listCompetenciesForProgram } from "@/services/academic/competency";
import { ActionForm } from "@/components/action-form";
import { updateLessonDraftAction, submitLessonForReviewAction } from "../../../../actions";

export const metadata: Metadata = { title: "Lesson" };

/**
 * Faculty "Edit lesson" / "Submit for approval" / "View status"
 * capabilities — Milestone 13. A Draft (or Returned) Lesson is
 * editable here; once Submitted, Approved, or Published it is
 * read-only — per
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/02-content-lifecycle-workflow.md.
 */
export default async function FacultyLessonPage({
  params,
}: {
  params: Promise<{ courseOfferingId: string; lessonId: string }>;
}) {
  const { courseOfferingId, lessonId } = await params;
  const user = await requireSessionUserWithRole("FACULTY");

  const allowed = await facultyCanAccessCourseOffering(user.id, courseOfferingId);
  if (!allowed) notFound();

  const [offering, lesson] = await Promise.all([
    getCourseOfferingById(courseOfferingId),
    getLessonForReview(lessonId),
  ]);
  if (!offering || !lesson || lesson.courseId !== offering.course.id) notFound();

  const competencies = await listCompetenciesForProgram(offering.course.program.id);
  const taggedIds = new Set(lesson.competencies.map((c) => c.id));

  const boundUpdate = updateLessonDraftAction.bind(null, lessonId, courseOfferingId);
  const boundSubmit = submitLessonForReviewAction.bind(null, lessonId, courseOfferingId);

  return (
    <div className="stack">
      <p className="muted">
        <Link href={`/faculty/courses/${courseOfferingId}`}>&larr; {offering.course.title}</Link>
      </p>
      <h1>{lesson.title}</h1>
      <p>
        <span className={`badge badge--${lesson.status.toLowerCase()}`}>{lesson.status}</span>
      </p>

      {lesson.returnReason ? (
        <p className="alert alert--error" role="alert">
          Returned for revision: {lesson.returnReason}
        </p>
      ) : null}

      {lesson.status === "DRAFT" ? (
        <>
          <ActionForm action={boundUpdate} submitLabel="Save">
            <div className="field">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" defaultValue={lesson.title} required />
            </div>
            <div className="field">
              <label htmlFor="content">Content</label>
              <textarea id="content" name="content" rows={8} defaultValue={lesson.content} required />
            </div>
            <fieldset style={{ marginBottom: "1rem" }}>
              <legend>Competencies</legend>
              {competencies.length === 0 ? (
                <p className="muted">No Competencies exist for this Program yet.</p>
              ) : (
                competencies.map((competency) => (
                  <label key={competency.id} className="checkbox-option">
                    <input
                      type="checkbox"
                      name="competencyIds"
                      value={competency.id}
                      defaultChecked={taggedIds.has(competency.id)}
                    />{" "}
                    {competency.name}
                  </label>
                ))
              )}
            </fieldset>
          </ActionForm>

          <form action={boundSubmit}>
            <button className="button button--secondary" type="submit">
              Submit for Review
            </button>
          </form>
        </>
      ) : (
        <div className="card">
          <p style={{ whiteSpace: "pre-wrap" }}>{lesson.content}</p>
          {lesson.competencies.length > 0 ? (
            <p className="muted">
              Competencies: {lesson.competencies.map((c) => c.name).join(", ")}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
