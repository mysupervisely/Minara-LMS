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
 * Program Director "See submitted versions" / "Review the new
 * version" capabilities — Milestone 13/14, per
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/04-portal-impact-review.md.
 * Mirrors the existing Grade Approvals dashboard's pattern
 * (src/app/(portal)/program-director/page.tsx): every Program the
 * Program Director oversees, or every Program at all for an
 * Administrator (per requireSessionUserWithRole's fallback). Every row
 * here is a specific Lesson/Assessment *Version* — Milestone 14 made
 * that the unit of review, not the Lesson/Assessment itself.
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
    (sum, p) => sum + p.pending.lessonVersions.length + p.pending.assessmentVersions.length,
    0,
  );

  return (
    <div className="stack">
      <h1>Curriculum Review</h1>
      <p className="muted">
        {totalPending} version{totalPending === 1 ? "" : "s"} awaiting your review.
      </p>

      {byProgram.map(({ program, pending, approved }) => {
        if (!program) return null;
        const hasContent =
          pending.lessonVersions.length > 0 ||
          pending.assessmentVersions.length > 0 ||
          approved.lessonVersions.length > 0 ||
          approved.assessmentVersions.length > 0;
        if (!hasContent) return null;

        return (
          <section key={program.id} style={{ padding: 0, border: "none" }}>
            <h2>{program.name}</h2>

            {pending.lessonVersions.length > 0 || pending.assessmentVersions.length > 0 ? (
              <>
                <h3>Submitted for Review</h3>
                <ul>
                  {pending.lessonVersions.map((version) => (
                    <li key={version.id}>
                      Lesson &middot;{" "}
                      <Link href={`/program-director/content/lessons/${version.id}`}>
                        {version.title}
                      </Link>{" "}
                      <span className="muted">
                        v{version.versionNumber} — {version.lesson.course.title}
                      </span>
                    </li>
                  ))}
                  {pending.assessmentVersions.map((version) => (
                    <li key={version.id}>
                      Assessment &middot;{" "}
                      <Link href={`/program-director/content/assessments/${version.id}`}>
                        {version.title}
                      </Link>{" "}
                      <span className="muted">
                        v{version.versionNumber} — {version.assessment.course.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {approved.lessonVersions.length > 0 || approved.assessmentVersions.length > 0 ? (
              <>
                <h3>Approved — awaiting Administrator Publish</h3>
                <ul>
                  {approved.lessonVersions.map((version) => (
                    <li key={version.id}>
                      Lesson &middot; {version.title}{" "}
                      <span className="muted">
                        v{version.versionNumber} — {version.lesson.course.title} — Competencies:{" "}
                        {version.competencies.map((c) => c.name).join(", ") || "none"}
                      </span>
                    </li>
                  ))}
                  {approved.assessmentVersions.map((version) => (
                    <li key={version.id}>
                      Assessment &middot; {version.title}{" "}
                      <span className="muted">
                        v{version.versionNumber} — {version.assessment.course.title}
                      </span>
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
