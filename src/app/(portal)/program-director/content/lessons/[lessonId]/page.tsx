import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole, hasRoleForProgram } from "@/services/identity/authorization";
import { getLessonForReview } from "@/services/academic/content-workflow";
import { approveContentAction, returnContentToDraftAction } from "../../../actions";
import { ReturnContentForm } from "../../return-content-form";

export const metadata: Metadata = { title: "Review Lesson" };

export default async function ReviewLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const user = await requireSessionUserWithRole("PROGRAM_DIRECTOR");

  const lesson = await getLessonForReview(lessonId);
  if (!lesson) notFound();

  const isAdministrator = user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
  if (!isAdministrator && !hasRoleForProgram(user, "PROGRAM_DIRECTOR", lesson.course.programId)) {
    notFound();
  }

  const boundApprove = approveContentAction.bind(null, "LESSON", lessonId);
  const boundReturn = returnContentToDraftAction.bind(null, "LESSON", lessonId);

  return (
    <div className="stack">
      <p className="muted">
        <Link href="/program-director/content">&larr; Curriculum Review</Link>
      </p>
      <h1>{lesson.title}</h1>
      <p className="muted">
        {lesson.course.title} &middot; {lesson.course.program.name}
      </p>

      <div className="card">
        <p style={{ whiteSpace: "pre-wrap" }}>{lesson.content}</p>
        <p className="muted">
          Competencies:{" "}
          {lesson.competencies.length > 0 ? lesson.competencies.map((c) => c.name).join(", ") : "none"}
        </p>
        <p className={`badge badge--${lesson.status.toLowerCase()}`}>{lesson.status}</p>
      </div>

      {lesson.status === "SUBMITTED" ? (
        <div className="cluster">
          <form action={boundApprove}>
            <button className="button button--primary" type="submit">
              Approve
            </button>
          </form>
          <ReturnContentForm action={boundReturn} />
        </div>
      ) : (
        <p className="muted">This Lesson is {lesson.status.toLowerCase()}, not awaiting review.</p>
      )}
    </div>
  );
}
