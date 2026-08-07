import type { Metadata } from "next";
import { requireSessionUserWithRole, requireAdministrator } from "@/services/identity/authorization";
import { listApprovedContent } from "@/services/academic/content-workflow";
import { publishContentAction } from "../actions";

export const metadata: Metadata = { title: "Publishing Queue" };

/**
 * Administrator "Publish curriculum" capability — Milestone 13, per
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/04-portal-impact-review.md.
 * Every Approved Lesson/Assessment across every Program, institution-
 * wide — the Administrator's authority is not Program-scoped, per
 * ADR-005 and the existing Admin foundation screens.
 */
export default async function AdminContentPage() {
  const user = await requireSessionUserWithRole("ADMINISTRATOR");
  requireAdministrator(user);

  const { lessons, assessments } = await listApprovedContent();

  return (
    <div className="stack">
      <h1>Publishing Queue</h1>
      <p className="muted">
        Approved Lessons and Assessments, awaiting Publish. Once published, this content becomes
        visible to enrolled Students.
      </p>

      {lessons.length === 0 && assessments.length === 0 ? (
        <p className="muted">Nothing is awaiting publish right now.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">Title</th>
                <th scope="col">Course</th>
                <th scope="col">Program</th>
                <th scope="col">
                  <span className="sr-only">Publish</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => {
                const boundPublish = publishContentAction.bind(null, "LESSON", lesson.id);
                return (
                  <tr key={lesson.id}>
                    <td>Lesson</td>
                    <td>{lesson.title}</td>
                    <td>{lesson.course.title}</td>
                    <td>{lesson.course.program.name}</td>
                    <td>
                      <form action={boundPublish}>
                        <button className="button button--primary" type="submit">
                          Publish
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {assessments.map((assessment) => {
                const boundPublish = publishContentAction.bind(null, "ASSESSMENT", assessment.id);
                return (
                  <tr key={assessment.id}>
                    <td>Assessment</td>
                    <td>{assessment.title}</td>
                    <td>{assessment.course.title}</td>
                    <td>{assessment.course.program.name}</td>
                    <td>
                      <form action={boundPublish}>
                        <button className="button button--primary" type="submit">
                          Publish
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
