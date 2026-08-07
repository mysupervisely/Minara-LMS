import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { facultyCanAccessCourseOffering, getCourseOfferingById } from "@/services/academic/institution";
import { ActionForm } from "@/components/action-form";
import { createAssessmentDraftAction } from "../../../../actions";

export const metadata: Metadata = { title: "Draft an Assessment" };

/**
 * Faculty "Create curriculum" capability, applied to Assessment
 * definitions — Milestone 13. Reuses Milestone 10's existing
 * Assessment shape (title, instructions, maxScore) unchanged; only the
 * Draft → Submitted → Approved → Published gate on top is new, per
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/03-domain-impact-review.md.
 */
export default async function NewAssessmentPage({
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

  const boundCreate = createAssessmentDraftAction.bind(null, courseOfferingId, offering.course.id);

  return (
    <div className="stack">
      <p className="muted">
        <Link href={`/faculty/courses/${courseOfferingId}`}>&larr; {offering.course.title}</Link>
      </p>
      <h1>Draft an Assessment</h1>

      <ActionForm action={boundCreate} submitLabel="Save Draft">
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required />
        </div>
        <div className="field">
          <label htmlFor="instructions">Instructions</label>
          <textarea id="instructions" name="instructions" rows={6} required />
        </div>
        <div className="field">
          <label htmlFor="maxScore">Maximum score</label>
          <input id="maxScore" name="maxScore" type="number" min={1} max={1000} defaultValue={100} />
        </div>
      </ActionForm>
    </div>
  );
}
