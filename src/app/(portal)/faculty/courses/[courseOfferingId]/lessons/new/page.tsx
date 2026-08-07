import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { facultyCanAccessCourseOffering, getCourseOfferingById } from "@/services/academic/institution";
import { listCompetenciesForProgram } from "@/services/academic/competency";
import { ActionForm } from "@/components/action-form";
import { createLessonDraftAction } from "../../../../actions";

export const metadata: Metadata = { title: "Draft a Lesson" };

/**
 * Faculty "Create curriculum" capability — Milestone 13, per
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/04-portal-impact-review.md.
 * A new Lesson always starts Draft; it isn't visible to any Student
 * until it's Submitted, Approved, and Published (see the Lesson editor
 * page for those next steps).
 */
export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ courseOfferingId: string }>;
}) {
  const { courseOfferingId } = await params;
  const user = await requireSessionUserWithRole("FACULTY");

  const allowed = await facultyCanAccessCourseOffering(user.id, courseOfferingId);
  if (!allowed) notFound();

  const offering = await getCourseOfferingById(courseOfferingId);
  if (!offering) notFound();

  const competencies = await listCompetenciesForProgram(offering.course.program.id);
  const boundCreate = createLessonDraftAction.bind(null, courseOfferingId, offering.course.id);

  return (
    <div className="stack">
      <p className="muted">
        <Link href={`/faculty/courses/${courseOfferingId}`}>&larr; {offering.course.title}</Link>
      </p>
      <h1>Draft a Lesson</h1>

      <ActionForm action={boundCreate} submitLabel="Save Draft">
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required />
        </div>
        <div className="field">
          <label htmlFor="content">Content</label>
          <textarea id="content" name="content" rows={8} required />
        </div>
        <fieldset style={{ marginBottom: "1rem" }}>
          <legend>Competencies</legend>
          {competencies.length === 0 ? (
            <p className="muted">
              No Competencies exist for this Program yet. An Administrator can create one from{" "}
              <Link href="/admin/competencies">Competencies</Link> — at least one is required before this
              Lesson can be submitted for review.
            </p>
          ) : (
            competencies.map((competency) => (
              <label key={competency.id} className="checkbox-option">
                <input type="checkbox" name="competencyIds" value={competency.id} /> {competency.name}
              </label>
            ))
          )}
        </fieldset>
      </ActionForm>
    </div>
  );
}
