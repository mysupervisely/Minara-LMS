import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { facultyCanAccessCourseOffering, getCourseOfferingById } from "@/services/academic/institution";
import {
  getAssessmentById,
  getLatestAssessmentVersion,
  listAssessmentVersions,
} from "@/services/assessments/assessments";
import { ActionForm } from "@/components/action-form";
import {
  updateAssessmentDraftAction,
  submitAssessmentForReviewAction,
  createNewAssessmentVersionAction,
} from "../../../../actions";

export const metadata: Metadata = { title: "Assessment" };

/**
 * Faculty version capabilities for Assessment definitions — Milestone
 * 14. See the sibling Lesson page's comment for the shared "latest
 * version is unambiguous" reasoning and the "Faculty can never edit a
 * Published version" guarantee.
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
    getAssessmentById(assessmentId),
  ]);
  if (!offering || !assessment || assessment.courseId !== offering.course.id) notFound();

  const [latest, history] = await Promise.all([
    getLatestAssessmentVersion(assessmentId),
    listAssessmentVersions(assessmentId),
  ]);
  if (!latest) notFound();

  const isPublishedPointer = assessment.publishedVersionId === latest.id;

  const boundUpdate = updateAssessmentDraftAction.bind(null, assessmentId, courseOfferingId);
  const boundSubmit = submitAssessmentForReviewAction.bind(null, assessmentId, courseOfferingId);
  const boundCreateVersion = createNewAssessmentVersionAction.bind(null, assessmentId, courseOfferingId);

  return (
    <div className="stack">
      <p className="muted">
        <Link href={`/faculty/courses/${courseOfferingId}`}>&larr; {offering.course.title}</Link>
      </p>
      <h1>{latest.title}</h1>
      <p>
        <span className="muted">Version {latest.versionNumber}</span>{" "}
        <span className={`badge badge--${latest.status.toLowerCase()}`}>{latest.status}</span>
        {isPublishedPointer ? (
          <span className="badge badge--approved" style={{ marginLeft: "0.5rem" }}>
            Currently delivered to Students
          </span>
        ) : null}
      </p>

      {latest.returnReason ? (
        <p className="alert alert--error" role="alert">
          Returned for revision: {latest.returnReason}
        </p>
      ) : null}

      {latest.status === "DRAFT" ? (
        <>
          <ActionForm action={boundUpdate} submitLabel="Save">
            <div className="field">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" defaultValue={latest.title} required />
            </div>
            <div className="field">
              <label htmlFor="instructions">Instructions</label>
              <textarea
                id="instructions"
                name="instructions"
                rows={6}
                defaultValue={latest.instructions}
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
                defaultValue={latest.maxScore}
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
          <p>{latest.instructions}</p>
          <p className="muted">Maximum score: {latest.maxScore}</p>
        </div>
      )}

      {latest.status === "PUBLISHED" ? (
        <form action={boundCreateVersion}>
          <button className="button button--primary" type="submit">
            Create New Version
          </button>
        </form>
      ) : null}

      <section style={{ padding: 0, border: "none" }}>
        <h2>Version History</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Version</th>
                <th scope="col">Status</th>
                <th scope="col">Created</th>
                <th scope="col">Published</th>
              </tr>
            </thead>
            <tbody>
              {history.map((v) => (
                <tr key={v.id}>
                  <td>
                    v{v.versionNumber}
                    {v.id === assessment.publishedVersionId ? (
                      <span className="muted"> — live</span>
                    ) : null}
                  </td>
                  <td>
                    <span className={`badge badge--${v.status.toLowerCase()}`}>{v.status}</span>
                  </td>
                  <td>{v.createdAt.toLocaleString()}</td>
                  <td>{v.publishedAt ? v.publishedAt.toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
