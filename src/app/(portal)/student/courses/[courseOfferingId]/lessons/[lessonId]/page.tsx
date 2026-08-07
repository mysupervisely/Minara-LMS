import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import {
  studentCanAccessCourseOffering,
  getCompletionForStudent,
  getCompletionHistoryForStudent,
} from "@/services/enrollment/enrollment";
import { getPublishedLessonVersion } from "@/services/academic/institution";
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

  // Fail-closed, per this milestone's Product Requirements Document
  // (S-1) and Milestone 14's identical requirement: only the Lesson's
  // currently *published* version is ever reachable here — a Draft/
  // Submitted/Approved-but-unpublished newer version stays completely
  // invisible, even to a direct request, because the version id is
  // resolved server-side from the publishedVersionId pointer, never
  // accepted from the URL or any client input. See
  // src/services/enrollment/enrollment.ts's markLessonComplete for the
  // matching service-layer check on the write path.
  const version = await getPublishedLessonVersion(lessonId);
  if (!version) notFound();

  const [completion, history] = await Promise.all([
    getCompletionForStudent(lessonId, user.id),
    getCompletionHistoryForStudent(lessonId, user.id),
  ]);

  // A completion recorded against an earlier version of this same
  // Lesson — Milestone 14's "Students continue seeing historical
  // activity tied to the version they actually used" requirement, made
  // visible rather than only internally consistent.
  const priorCompletion = history.find((h) => h.lessonVersionId !== version.id);

  const boundMarkComplete = markLessonCompleteAction.bind(null, courseOfferingId, lessonId);

  return (
    <div className="stack">
      <p className="muted">
        <Link href={`/student/courses/${courseOfferingId}`}>&larr; Back to course</Link>
      </p>
      <h1>{version.title}</h1>

      <div className="card">
        <p style={{ whiteSpace: "pre-wrap" }}>{version.content}</p>
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

      {priorCompletion ? (
        <p className="muted">
          You completed an earlier version of this Lesson on{" "}
          {priorCompletion.completedAt.toLocaleString()}. The Lesson has since been updated; your
          historical completion record is preserved and unaffected.
        </p>
      ) : null}
    </div>
  );
}
