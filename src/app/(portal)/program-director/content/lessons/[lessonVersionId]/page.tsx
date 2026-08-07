import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole, hasRoleForProgram } from "@/services/identity/authorization";
import { getLessonVersionForReview } from "@/services/academic/content-workflow";
import { approveContentAction, returnContentToDraftAction } from "../../../actions";
import { ReturnContentForm } from "../../return-content-form";

export const metadata: Metadata = { title: "Review Lesson Version" };

export default async function ReviewLessonVersionPage({
  params,
}: {
  params: Promise<{ lessonVersionId: string }>;
}) {
  const { lessonVersionId } = await params;
  const user = await requireSessionUserWithRole("PROGRAM_DIRECTOR");

  const version = await getLessonVersionForReview(lessonVersionId);
  if (!version) notFound();

  const isAdministrator = user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
  if (
    !isAdministrator &&
    !hasRoleForProgram(user, "PROGRAM_DIRECTOR", version.lesson.course.programId)
  ) {
    notFound();
  }

  const boundApprove = approveContentAction.bind(null, "LESSON", lessonVersionId);
  const boundReturn = returnContentToDraftAction.bind(null, "LESSON", lessonVersionId);

  return (
    <div className="stack">
      <p className="muted">
        <Link href="/program-director/content">&larr; Curriculum Review</Link>
      </p>
      <h1>
        {version.title} <span className="muted">v{version.versionNumber}</span>
      </h1>
      <p className="muted">
        {version.lesson.course.title} &middot; {version.lesson.course.program.name}
      </p>

      <div className="card">
        <p style={{ whiteSpace: "pre-wrap" }}>{version.content}</p>
        <p className="muted">
          Competencies:{" "}
          {version.competencies.length > 0 ? version.competencies.map((c) => c.name).join(", ") : "none"}
        </p>
        <p className={`badge badge--${version.status.toLowerCase()}`}>{version.status}</p>
      </div>

      {version.status === "SUBMITTED" ? (
        <div className="cluster">
          <form action={boundApprove}>
            <button className="button button--primary" type="submit">
              Approve
            </button>
          </form>
          <ReturnContentForm action={boundReturn} />
        </div>
      ) : (
        <p className="muted">This version is {version.status.toLowerCase()}, not awaiting review.</p>
      )}
    </div>
  );
}
