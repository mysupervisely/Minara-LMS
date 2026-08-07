import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { getCourseOfferingById } from "@/services/academic/institution";
import {
  studentCanAccessCourseOffering,
  getLessonCompletionsForStudent,
} from "@/services/enrollment/enrollment";
import { getSubmissionForStudent } from "@/services/assessments/assessments";

export const metadata: Metadata = { title: "Course" };

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ courseOfferingId: string }>;
}) {
  const { courseOfferingId } = await params;
  const user = await requireSessionUserWithRole("STUDENT");

  const allowed = await studentCanAccessCourseOffering(user.id, courseOfferingId);
  if (!allowed) notFound();

  const offering = await getCourseOfferingById(courseOfferingId);
  if (!offering) notFound();

  const completions = await getLessonCompletionsForStudent(user.id, offering.course.id);
  const completedLessonIds = new Set(completions.map((c) => c.lessonId));

  const submissions = await Promise.all(
    offering.course.assessments.map((assessment) =>
      getSubmissionForStudent(assessment.id, user.id),
    ),
  );

  return (
    <div className="stack">
      <p className="muted">
        <Link href="/student">&larr; My Courses</Link>
      </p>
      <h1>{offering.course.title}</h1>
      <p className="muted">
        {offering.course.program.name} &middot; {offering.term}
      </p>
      {offering.course.description ? <p>{offering.course.description}</p> : null}

      <section style={{ padding: 0, border: "none" }}>
        <h2>Lessons</h2>
        {offering.course.lessons.length === 0 ? (
          <p className="muted">No lessons have been published yet.</p>
        ) : (
          <ul>
            {offering.course.lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link href={`/student/courses/${courseOfferingId}/lessons/${lesson.id}`}>
                  {lesson.title}
                </Link>{" "}
                {completedLessonIds.has(lesson.id) ? (
                  <span className="badge badge--approved">Complete</span>
                ) : (
                  <span className="badge badge--draft">Not Started</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Assessments</h2>
        {offering.course.assessments.length === 0 ? (
          <p className="muted">No assessments have been published yet.</p>
        ) : (
          <ul>
            {offering.course.assessments.map((assessment, index) => {
              const submission = submissions[index];
              return (
                <li key={assessment.id}>
                  <Link
                    href={`/student/courses/${courseOfferingId}/assessments/${assessment.id}`}
                  >
                    {assessment.title}
                  </Link>{" "}
                  {submission?.grade?.status === "APPROVED" ? (
                    <span className="badge badge--approved">
                      Grade: {submission.grade.score}/{assessment.maxScore}
                    </span>
                  ) : submission ? (
                    <span className="badge badge--submitted">Submitted</span>
                  ) : (
                    <span className="badge badge--draft">Not Submitted</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
