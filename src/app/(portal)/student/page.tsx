import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import {
  listEnrollmentsForStudent,
  listCourseOfferingsForStudent,
  getLessonCompletionsForStudent,
} from "@/services/enrollment/enrollment";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Student Dashboard" };

/**
 * Student Dashboard — implements
 * docs/milestones/milestone-4-information-architecture/02-student-portal.md's
 * Dashboard screen, narrowed to this vertical slice's scope: enrolled
 * courses and progress. Payments, Certificates, AI Tutor, and the rest
 * of the full Student Portal are explicitly out of scope for Milestone
 * 10.
 */
export default async function StudentDashboardPage() {
  const user = await requireSessionUserWithRole("STUDENT");

  const [enrollments, courseOfferings] = await Promise.all([
    listEnrollmentsForStudent(user.id),
    listCourseOfferingsForStudent(user.id),
  ]);

  const progressByOffering = await Promise.all(
    courseOfferings.map(async (offering) => {
      const lessonCount = await db.lesson.count({ where: { courseId: offering.courseId } });
      const completions = await getLessonCompletionsForStudent(user.id, offering.courseId);
      return { offering, lessonCount, completedCount: completions.length };
    }),
  );

  return (
    <div className="stack">
      <h1>Welcome, {user.name.split(" ")[0]}</h1>

      <section style={{ padding: 0, border: "none" }}>
        <h2>My Enrollments</h2>
        {enrollments.length === 0 ? (
          <p className="muted">You are not currently enrolled in a program.</p>
        ) : (
          <ul>
            {enrollments.map((enrollment) => (
              <li key={enrollment.id}>
                {enrollment.program.name} — Cohort {enrollment.cohort.name}{" "}
                <span className="badge badge--active">{enrollment.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>My Courses</h2>
        {progressByOffering.length === 0 ? (
          <p className="muted">No courses are available yet for your cohort.</p>
        ) : (
          <div className="card-grid">
            {progressByOffering.map(({ offering, lessonCount, completedCount }) => (
              <article className="card" key={offering.id}>
                <h3>
                  <Link href={`/student/courses/${offering.id}`}>{offering.course.title}</Link>
                </h3>
                <p className="muted">{offering.term}</p>
                <p>
                  {completedCount} of {lessonCount} lessons complete
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
