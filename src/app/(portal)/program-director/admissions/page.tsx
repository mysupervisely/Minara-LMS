import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listApplicationsForProgram } from "@/services/admissions/admissions";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Program Director — Admissions" };

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "submitted",
  ACCEPTED: "approved",
  ACCEPTANCE_CONFIRMED: "approved",
  ENROLLED: "published",
  DENIED: "draft",
  WAITLISTED: "submitted",
  DEFERRED: "submitted",
  ACCEPTANCE_DECLINED: "draft",
};

/**
 * Program Director's Admissions view — Phase 6: read-only. The
 * Admissions Workflows doc
 * (docs/milestones/milestone-3-student-journey-core-workflows/03-admissions-workflows.md)
 * flags the exact Decision-authority split between Admissions Staff and
 * Program Director as ⚠️ Needs Verification, so this milestone grants no
 * write authority here — no Decision buttons, no checklist edits, no
 * Cohort assignment, no Enrollment action. Mirrors
 * program-director/externship/page.tsx's Program-scoping derivation.
 */
export default async function ProgramDirectorAdmissionsPage() {
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
      const applications = await listApplicationsForProgram(programId, user);
      return { program, applications };
    }),
  );

  return (
    <div className="stack">
      <h1>Admissions (View Only)</h1>
      <p className="muted">
        Decision authority for this Program&rsquo;s Applications currently sits with Admissions Staff/
        Administrator — see this milestone&rsquo;s ⚠️ Needs Verification notes on the exact Program Director
        approval split.
      </p>

      {byProgram.map(({ program, applications }) =>
        !program || applications.length === 0 ? null : (
          <section key={program.id} style={{ padding: 0, border: "none" }}>
            <h2>{program.name}</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Applicant</th>
                    <th scope="col">Status</th>
                    <th scope="col">Decision Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>{application.applicant.name}</td>
                      <td>
                        <span className={`badge badge--${STATUS_BADGE[application.status] ?? "draft"}`}>
                          {application.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td>{application.decisionReason ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ),
      )}
    </div>
  );
}
