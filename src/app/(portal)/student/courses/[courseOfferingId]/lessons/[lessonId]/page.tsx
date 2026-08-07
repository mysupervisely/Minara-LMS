import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { studentCanAccessCourseOffering } from "@/services/enrollment/enrollment";
import { db } from "@/lib/db";
import { markLessonCompleteAction } from "../../../../actions";

export const metadata: Metadata = { title: "Lesson" };

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ courseOfferingId: string; lessonId: string }>;
}) {
  const { courseOfferingId, lessonId } = await params;
  const user = await requireSessionUserWithRole("STUDENT");

  const allowed = await studentCanAccessCourseOffering(user.id, courseOfferingId);
  if (!allowed) notFound();

  const lesson = await db.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) notFound();

  const completion = await db.lessonCompletion.findUnique({
    where: { studentId_lessonId: { studentId: user.id, lessonId } },
  });

  const boundMarkComplete = markLessonCompleteAction.bind(null, courseOfferingId, lessonId);

  return (
    <div className="stack">
      <p className="muted">
        <Link href={`/student/courses/${courseOfferingId}`}>&larr; Back to course</Link>
      </p>
      <h1>{lesson.title}</h1>

      <div className="card">
        <p style={{ whiteSpace: "pre-wrap" }}>{lesson.content}</p>
      </div>

      {completion ? (
        <p className="alert alert--success" role="status">
          Completed {completion.completedAt.toLocaleString()}
        </p>
      ) : (
        <form action={boundMarkComplete}>
          <button className="button button--primary" type="submit">
            Mark Lesson Complete
          </button>
        </form>
      )}
    </div>
  );
}
