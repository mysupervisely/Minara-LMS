import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import {
  facultyCanAccessCourseOffering,
  getCourseOfferingById,
  listRosterForCourseOffering,
} from "@/services/academic/institution";
import { listSubmissionsForCourseOffering } from "@/services/assessments/assessments";
import { listContentForCourse } from "@/services/academic/content-workflow";

export const metadata: Metadata = { title: "Section" };

export default async function FacultyCoursePage({
  params,
}: {
  params: Promise<{ courseOfferingId: string }>;
}) {
  const { courseOfferingId } = await params;
  const user = await requireSessionUserWithRole("FACULTY");

  const allowed = await facultyCanAccessCourseOffering(user.id, courseOfferingId);
  if (!allowed) notFound();

  const [offering, roster, submissions] = await Promise.all([
    getCourseOfferingById(courseOfferingId),
    listRosterForCourseOffering(courseOfferingId),
    listSubmissionsForCourseOffering(courseOfferingId),
  ]);
  if (!offering) notFound();

  const { lessons, assessments } = await listContentForCourse(offering.course.id);

  return (
    <div className="stack">
      <p className="muted">
        <Link href="/faculty">&larr; My Sections</Link>
      </p>
      <h1>{offering.course.title}</h1>
      <p className="muted">
        {offering.cohort.name} &middot; {offering.term}
      </p>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Curriculum</h2>
        <p className="muted">
          Draft, review, and publish this Course&rsquo;s Lessons and Assessments — per{" "}
          <Link href="/admin/audit">the Audit Log</Link>, every step is tracked.
        </p>

        <h3>Lessons</h3>
        {lessons.length === 0 ? (
          <p className="muted">No Lessons yet.</p>
        ) : (
          <ul>
            {lessons.map((lesson) => {
              const latest = lesson.versions[0];
              if (!latest) return null;
              return (
                <li key={lesson.id}>
                  <Link href={`/faculty/courses/${courseOfferingId}/lessons/${lesson.id}`}>
                    {latest.title}
                  </Link>{" "}
                  <span className="muted">v{latest.versionNumber}</span>{" "}
                  <span className={`badge badge--${latest.status.toLowerCase()}`}>{latest.status}</span>
                  {latest.competencies.length === 0 ? (
                    <span className="muted"> &middot; no Competency tagged</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        <p>
          <Link href={`/faculty/courses/${courseOfferingId}/lessons/new`}>+ Draft a new Lesson</Link>
        </p>

        <h3>Assessments</h3>
        {assessments.length === 0 ? (
          <p className="muted">No Assessments yet.</p>
        ) : (
          <ul>
            {assessments.map((assessment) => {
              const latest = assessment.versions[0];
              if (!latest) return null;
              return (
                <li key={assessment.id}>
                  <Link href={`/faculty/courses/${courseOfferingId}/assessments/${assessment.id}`}>
                    {latest.title}
                  </Link>{" "}
                  <span className="muted">v{latest.versionNumber}</span>{" "}
                  <span className={`badge badge--${latest.status.toLowerCase()}`}>
                    {latest.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <p>
          <Link href={`/faculty/courses/${courseOfferingId}/assessments/new`}>
            + Draft a new Assessment
          </Link>
        </p>
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Roster</h2>
        {roster.length === 0 ? (
          <p className="muted">No Students are enrolled in this Cohort yet.</p>
        ) : (
          <ul>
            {roster.map((enrollment) => (
              <li key={enrollment.id}>{enrollment.student.name}</li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Submissions</h2>
        {submissions.length === 0 ? (
          <p className="muted">No Students have submitted work yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Assessment</th>
                  <th scope="col">Submitted</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Review</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{submission.student.name}</td>
                    <td>
                      {submission.assessmentVersion.title}{" "}
                      <span className="muted">v{submission.assessmentVersion.versionNumber}</span>
                    </td>
                    <td>{submission.submittedAt.toLocaleDateString()}</td>
                    <td>
                      {submission.grade ? (
                        <span className={`badge badge--${submission.grade.status.toLowerCase()}`}>
                          {submission.grade.status}
                        </span>
                      ) : (
                        <span className="badge badge--draft">Ungraded</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/faculty/submissions/${submission.id}`}>Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
