import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listPlacementsForProgram } from "@/services/externship/externship";
import { listPrograms } from "@/services/academic/institution";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Clinical Coordinator — Completion Verification" };

const COMPLETION_BADGE: Record<string, string> = {
  NOT_SUBMITTED: "draft",
  SUBMITTED: "submitted",
  VERIFIED: "approved",
  RETURNED: "draft",
};

/**
 * Completion Verification — the Coordinator's own read-only tracking
 * view of every Placement that has ever been submitted for Completion
 * Verification, across the Coordinator's Program(s). Submission itself
 * happens from a Placement's detail page; verifying/returning is
 * Program Director authority, at
 * src/app/(portal)/program-director/externship (Phase 9).
 */
export default async function CoordinatorCompletionPage() {
  const user = await requireSessionUserWithRole("CLINICAL_COORDINATOR");

  const isAdministrator = user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
  const programIds = isAdministrator
    ? (await db.program.findMany({ select: { id: true } })).map((p) => p.id)
    : Array.from(
        new Set(
          user.roleAssignments
            .filter((ra) => ra.role === "CLINICAL_COORDINATOR" && ra.programId)
            .map((ra) => ra.programId as string),
        ),
      );

  const [placementsByProgram, programs] = await Promise.all([
    Promise.all(
      programIds.map(async (programId) => ({
        programId,
        placements: (await listPlacementsForProgram(programId, user)).filter(
          (p) => p.completionStatus !== "NOT_SUBMITTED",
        ),
      })),
    ),
    listPrograms(),
  ]);

  return (
    <div className="stack">
      <h1>Completion Verification</h1>

      {placementsByProgram.map(({ programId, placements }) => {
        const program = programs.find((p) => p.id === programId);
        if (!program) return null;
        return (
          <section key={programId} style={{ padding: 0, border: "none" }}>
            <h2>{program.name}</h2>
            {placements.length === 0 ? (
              <p className="muted">No Placement has been submitted for Completion Verification yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Student</th>
                      <th scope="col">Site</th>
                      <th scope="col">Status</th>
                      <th scope="col">
                        <span className="sr-only">Manage</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {placements.map((placement) => (
                      <tr key={placement.id}>
                        <td>{placement.student.name}</td>
                        <td>{placement.clinicalSite.name}</td>
                        <td>
                          <span
                            className={`badge badge--${COMPLETION_BADGE[placement.completionStatus] ?? "draft"}`}
                          >
                            {placement.completionStatus.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td>
                          <Link href={`/coordinator/placements/${placement.id}`}>Manage</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
