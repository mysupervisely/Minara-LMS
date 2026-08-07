import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import {
  listContentPendingReviewForProgram,
  listApprovedContent,
} from "@/services/academic/content-workflow";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Curriculum Review" };

/**
 * Program Director "Review submitted content" / "Curriculum oversight"
 * capabilities — Milestone 13, per
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/04-portal-impact-review.md.
 * Mirrors the existing Grade Approvals dashboard's pattern
 * (src/app/(portal)/program-director/page.tsx): every Program the
 * Program Director oversees, or every Program at all for an
 * Administrator (per requireSessionUserWithRole's fallback).
 */
export default async function ProgramDirectorContentPage() {
  const user = await requireSessionUserWithRole("PROGRAM_DIRECTOR");

  const programIds = Array.from(
    new Set(
      user.roleAssignments
        .filter((ra) => ra.role === "PROGRAM_DIRECTOR" && ra.programId)
        .map((ra) => ra.programId as string),
    ),
  );

  const isAdministrator = user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
  const scopedProgramIds = isAdministrator
    ? (await db.program.findMany({ select: { id: true } })).map((p) => p.id)
    : programIds;

  const byProgram = await Promise.all(
    scopedProgramIds.map(async (programId) => {
      const program = await db.program.findUnique({ where: { id: programId } });
      const pending = await listContentPendingReviewForProgram(programId);
      const approved = await listApprovedContent(programId);
      return { program, pending, approved };
    }),
  );

  const totalPending = byProgram.reduce(
    (sum, p) => sum + p.pending.lessons.length + p.pending.assessments.length,
    0,
  );

  return (
    <div className="stack">
      <h1>Curriculum Review</h1>
      <p className="muted">
        {totalPending} item{totalPending === 1 ? "" : "s"} awaiting your review.
      </p>

      {byProgram.map(({ program, pending, approved }) => {
        if (!program) return null;
        const hasContent =
          pending.lessons.length > 0 ||
          pending.assessments.length > 0 ||
          approved.lessons.length > 0 ||
          approved.assessments.length > 0;
        if (!hasContent) return null;

        return (
          <section key={program.id} style={{ padding: 0, border: "none" }}>
            <h2>{program.name}</h2>

            {pending.lessons.length > 0 || pending.assessments.length > 0 ? (
              <>
                <h3>Submitted for Review</h3>
                <ul>
                  {pending.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      Lesson &middot;{" "}
                      <Link href={`/program-director/content/lessons/${lesson.id}`}>
                        {lesson.title}
                      </Link>{" "}
                      <span className="muted">— {lesson.course.title}</span>
                    </li>
                  ))}
                  {pending.assessments.map((assessment) => (
                    <li key={assessment.id}>
                      Assessment &middot;{" "}
                      <Link href={`/program-director/content/assessments/${assessment.id}`}>
                        {assessment.title}
                      </Link>{" "}
                      <span className="muted">— {assessment.course.title}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {approved.lessons.length > 0 || approved.assessments.length > 0 ? (
              <>
                <h3>Approved — awaiting Administrator Publish</h3>
                <ul>
                  {approved.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      Lesson &middot; {lesson.title}{" "}
                      <span className="muted">
                        — {lesson.course.title} — Competencies:{" "}
                        {lesson.competencies.map((c) => c.name).join(", ") || "none"}
                      </span>
                    </li>
                  ))}
                  {approved.assessments.map((assessment) => (
                    <li key={assessment.id}>
                      Assessment &middot; {assessment.title}{" "}
                      <span className="muted">— {assessment.course.title}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        );
      })}

      {totalPending === 0 ? <p className="muted">Nothing is pending review right now.</p> : null}
    </div>
  );
}
