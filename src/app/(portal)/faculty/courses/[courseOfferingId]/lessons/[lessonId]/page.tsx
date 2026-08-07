import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import {
  facultyCanAccessCourseOffering,
  getCourseOfferingById,
  getLessonById,
  getLatestLessonVersion,
  listLessonVersions,
} from "@/services/academic/institution";
import { listCompetenciesForProgram } from "@/services/academic/competency";
import { ActionForm } from "@/components/action-form";
import {
  updateLessonDraftAction,
  submitLessonForReviewAction,
  createNewLessonVersionAction,
} from "../../../../actions";

export const metadata: Metadata = { title: "Lesson" };

/**
 * Faculty "Current published version" / "Create new version" / "Edit
 * draft version" / "Submit new version for review" / "View version
 * status" / "See returned version reason" capabilities — Milestone 14.
 *
 * The latest LessonVersion is what this page shows and, when Draft,
 * edits — during an active edit cycle it is unambiguously "the version
 * being worked on," since createNewLessonVersion refuses to start a
 * second one while one is already in flight (see that function's
 * comment). Once the latest version reaches PUBLISHED, this page shows
 * it read-only and offers "Create New Version" instead of an edit
 * form — Faculty can never edit a Published version, by construction:
 * the edit form only ever targets a version whose status is DRAFT.
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
    getLessonById(lessonId),
  ]);
  if (!offering || !lesson || lesson.courseId !== offering.course.id) notFound();

  const [latest, history, competencies] = await Promise.all([
    getLatestLessonVersion(lessonId),
    listLessonVersions(lessonId),
    listCompetenciesForProgram(offering.course.program.id),
  ]);
  if (!latest) notFound();

  const taggedIds = new Set(latest.competencies.map((c) => c.id));
  const isPublishedPointer = lesson.publishedVersionId === latest.id;

  const boundUpdate = updateLessonDraftAction.bind(null, lessonId, courseOfferingId);
  const boundSubmit = submitLessonForReviewAction.bind(null, lessonId, courseOfferingId);
  const boundCreateVersion = createNewLessonVersionAction.bind(null, lessonId, courseOfferingId);

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
              <label htmlFor="content">Content</label>
              <textarea id="content" name="content" rows={8} defaultValue={latest.content} required />
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
          <p style={{ whiteSpace: "pre-wrap" }}>{latest.content}</p>
          {latest.competencies.length > 0 ? (
            <p className="muted">
              Competencies: {latest.competencies.map((c) => c.name).join(", ")}
            </p>
          ) : null}
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
                    {v.id === lesson.publishedVersionId ? (
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
