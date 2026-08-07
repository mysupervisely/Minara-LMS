import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listApprovedGradesForStudent } from "@/services/gradebook/gradebook";

export const metadata: Metadata = { title: "My Grades" };

/**
 * Per the Permission Framework, a Student sees only APPROVED grades —
 * a Faculty-entered Draft or Submitted-for-approval grade is not yet
 * official and is not shown here, per the Business Rules Catalog's
 * grade lifecycle rules.
 */
export default async function StudentGradesPage() {
  const user = await requireSessionUserWithRole("STUDENT");
  const grades = await listApprovedGradesForStudent(user.id);

  return (
    <div className="stack">
      <h1>My Grades</h1>
      {grades.length === 0 ? (
        <p className="muted">No approved grades yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Approved grades</caption>
            <thead>
              <tr>
                <th scope="col">Course</th>
                <th scope="col">Assessment</th>
                <th scope="col">Score</th>
                <th scope="col">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id}>
                  <td>{grade.submission.assessmentVersion.assessment.course.title}</td>
                  <td>
                    {grade.submission.assessmentVersion.title}{" "}
                    <span className="muted">v{grade.submission.assessmentVersion.versionNumber}</span>
                  </td>
                  <td>
                    {grade.score} / {grade.submission.assessmentVersion.maxScore}
                  </td>
                  <td>{grade.feedback ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
