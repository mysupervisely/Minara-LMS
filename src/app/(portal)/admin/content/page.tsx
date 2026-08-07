import type { Metadata } from "next";
import { requireSessionUserWithRole, requireAdministrator } from "@/services/identity/authorization";
import { listApprovedContent } from "@/services/academic/content-workflow";
import { publishContentAction } from "../actions";

export const metadata: Metadata = { title: "Publishing Queue" };

/**
 * Administrator "Publish or trigger the existing publishing workflow"
 * capability — Milestone 13/14, per
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/04-portal-impact-review.md.
 * Every Approved Lesson/Assessment *Version* across every Program,
 * institution-wide — the Administrator's authority is not Program-
 * scoped, per ADR-005 and the existing Admin foundation screens.
 * Publishing here is what flips the parent Lesson/Assessment's
 * `publishedVersionId` pointer (see
 * src/services/academic/content-workflow.ts's publishContent) — the
 * single switch that makes a version the one Students receive.
 */
export default async function AdminContentPage() {
  const user = await requireSessionUserWithRole("ADMINISTRATOR");
  requireAdministrator(user);

  const { lessonVersions, assessmentVersions } = await listApprovedContent();

  return (
    <div className="stack">
      <h1>Publishing Queue</h1>
      <p className="muted">
        Approved Lesson/Assessment Versions, awaiting Publish. Once published, each becomes the live
        version visible to enrolled Students — a newer version never silently replaces a Published one;
        it must independently reach Approved and be published here.
      </p>

      {lessonVersions.length === 0 && assessmentVersions.length === 0 ? (
        <p className="muted">Nothing is awaiting publish right now.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">Title</th>
                <th scope="col">Version</th>
                <th scope="col">Course</th>
                <th scope="col">Program</th>
                <th scope="col">
                  <span className="sr-only">Publish</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lessonVersions.map((version) => {
                const boundPublish = publishContentAction.bind(null, "LESSON", version.id);
                return (
                  <tr key={version.id}>
                    <td>Lesson</td>
                    <td>{version.title}</td>
                    <td>v{version.versionNumber}</td>
                    <td>{version.lesson.course.title}</td>
                    <td>{version.lesson.course.program.name}</td>
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
              {assessmentVersions.map((version) => {
                const boundPublish = publishContentAction.bind(null, "ASSESSMENT", version.id);
                return (
                  <tr key={version.id}>
                    <td>Assessment</td>
                    <td>{version.title}</td>
                    <td>v{version.versionNumber}</td>
                    <td>{version.assessment.course.title}</td>
                    <td>{version.assessment.course.program.name}</td>
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
