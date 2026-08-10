import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listCompletionVerificationQueueForProgram } from "@/services/externship/externship";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Program Director — Completion Verification" };

/**
 * Externship Completion Verification queue — the Program Director's half
 * of Milestone 15's joint approval gate (see
 * docs/milestones/milestone-15-externship-eligibility-placement-vertical-slice/05-milestone-15-recommendation.md).
 * Mirrors program-director/page.tsx's Grade Approvals queue shape
 * exactly — same Program-scoping derivation, same Administrator fallback.
 */
export default async function ProgramDirectorExternshipQueuePage() {
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

  const queueByProgram = await Promise.all(
    scopedProgramIds.map(async (programId) => {
      const program = await db.program.findUnique({ where: { id: programId } });
      const queue = await listCompletionVerificationQueueForProgram(programId, user);
      return { program, queue };
    }),
  );

  const totalPending = queueByProgram.reduce((sum, p) => sum + p.queue.length, 0);

  return (
    <div className="stack">
      <h1>Externship Completion Verification</h1>
      <p className="muted">
        {totalPending} Placement{totalPending === 1 ? "" : "s"} awaiting Completion Verification.
      </p>

      {queueByProgram.map(({ program, queue }) =>
        queue.length === 0 || !program ? null : (
          <section key={program.id} style={{ padding: 0, border: "none" }}>
            <h2>{program.name}</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Student</th>
                    <th scope="col">Clinical Site</th>
                    <th scope="col">Submitted By</th>
                    <th scope="col">
                      <span className="sr-only">Review</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((placement) => (
                    <tr key={placement.id}>
                      <td>{placement.student.name}</td>
                      <td>{placement.clinicalSite.name}</td>
                      <td>{placement.completionSubmittedBy?.name ?? "—"}</td>
                      <td>
                        <Link href={`/program-director/externship/${placement.id}`}>Review</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ),
      )}

      {totalPending === 0 ? <p className="muted">Nothing is pending Completion Verification right now.</p> : null}
    </div>
  );
}
