import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listPendingApprovalsForProgram } from "@/services/gradebook/gradebook";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Program Director — Approvals" };

/**
 * Program Director Approvals — implements
 * docs/milestones/milestone-4-information-architecture/04-program-director-portal.md's
 * Grade Approvals screen, the approval-gate half of ADR-011's vertical
 * slice: every Grade shown here was submitted by a Faculty Instructor
 * (Faculty Workflows §Approval Points) and becomes official only once
 * acted on here.
 */
export default async function ProgramDirectorDashboardPage() {
  const user = await requireSessionUserWithRole("PROGRAM_DIRECTOR");

  const programIds = Array.from(
    new Set(
      user.roleAssignments
        .filter((ra) => ra.role === "PROGRAM_DIRECTOR" && ra.programId)
        .map((ra) => ra.programId as string),
    ),
  );

  // Administrators reach this page too (per requireSessionUserWithRole's
  // fallback), in which case show every Program's pending approvals.
  const isAdministrator = user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
  const scopedProgramIds = isAdministrator
    ? (await db.program.findMany({ select: { id: true } })).map((p) => p.id)
    : programIds;

  const pendingByProgram = await Promise.all(
    scopedProgramIds.map(async (programId) => {
      const program = await db.program.findUnique({ where: { id: programId } });
      const pending = await listPendingApprovalsForProgram(programId);
      return { program, pending };
    }),
  );

  const totalPending = pendingByProgram.reduce((sum, p) => sum + p.pending.length, 0);

  return (
    <div className="stack">
      <h1>Grade Approvals</h1>
      <p className="muted">
        {totalPending} grade{totalPending === 1 ? "" : "s"} awaiting your approval.
      </p>

      {pendingByProgram.map(({ program, pending }) =>
        pending.length === 0 || !program ? null : (
          <section key={program.id} style={{ padding: 0, border: "none" }}>
            <h2>{program.name}</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Student</th>
                    <th scope="col">Course</th>
                    <th scope="col">Assessment</th>
                    <th scope="col">Score</th>
                    <th scope="col">Entered By</th>
                    <th scope="col">
                      <span className="sr-only">Review</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((grade) => (
                    <tr key={grade.id}>
                      <td>{grade.submission.student.name}</td>
                      <td>{grade.submission.assessmentVersion.assessment.course.title}</td>
                      <td>
                        {grade.submission.assessmentVersion.title}{" "}
                        <span className="muted">v{grade.submission.assessmentVersion.versionNumber}</span>
                      </td>
                      <td>
                        {grade.score} / {grade.submission.assessmentVersion.maxScore}
                      </td>
                      <td>{grade.enteredBy.name}</td>
                      <td>
                        <Link href={`/program-director/approvals/${grade.id}`}>Review</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ),
      )}

      {totalPending === 0 ? <p className="muted">Nothing is pending approval right now.</p> : null}
    </div>
  );
}
