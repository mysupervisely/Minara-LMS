import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { getCompetencyProgressForStudent } from "@/services/academic/competency";

export const metadata: Metadata = { title: "My Competencies" };

/**
 * Student "View completion status" extended to Competency Progress —
 * Milestone 13, per
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/04-portal-impact-review.md.
 * A derived, read-only view: see
 * src/services/academic/competency.ts's getCompetencyProgressForStudent
 * for what "in progress" means here (deliberately course-level, not
 * lesson-level, granularity — a named simplification, not a bug).
 */
export default async function StudentCompetenciesPage() {
  const user = await requireSessionUserWithRole("STUDENT");
  const progress = await getCompetencyProgressForStudent(user.id);

  return (
    <div className="stack">
      <h1>My Competencies</h1>
      <p className="muted">
        Competencies reflected here are drawn from Lessons in Courses where you have at least one
        approved Grade.
      </p>

      {progress.length === 0 ? (
        <p className="muted">No Competencies in progress yet.</p>
      ) : (
        <div className="card-grid">
          {progress.map((competency) => (
            <article className="card" key={competency.id}>
              <h3>{competency.name}</h3>
              <span className="badge badge--approved">In Progress</span>
              {competency.lessonTitles.length > 0 ? (
                <p className="muted">Via: {competency.lessonTitles.join(", ")}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
