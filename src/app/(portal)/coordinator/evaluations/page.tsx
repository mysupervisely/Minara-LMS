import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listPlacementsForProgram } from "@/services/externship/externship";
import { listPrograms } from "@/services/academic/institution";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Clinical Coordinator — Evaluations" };

/**
 * Evaluations — a cross-Placement, read-only view of every Midpoint/Final
 * Evaluation recorded across this Coordinator's Program(s), per the
 * Coordinator Portal's Evaluations screen. Recording a new Evaluation
 * happens on a specific Placement's detail page (a Evaluation must be
 * tied to exactly one Placement) — this screen is for review, not entry.
 */
export default async function CoordinatorEvaluationsPage() {
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
        placements: await listPlacementsForProgram(programId, user),
      })),
    ),
    listPrograms(),
  ]);

  return (
    <div className="stack">
      <h1>Evaluations</h1>
      <p className="muted">Record a new Midpoint or Final Evaluation from the relevant Placement&rsquo;s page.</p>

      {placementsByProgram.map(({ programId, placements }) => {
        const program = programs.find((p) => p.id === programId);
        const evaluations = placements.flatMap((p) =>
          p.evaluations.map((e) => ({ ...e, placement: p })),
        );
        if (!program) return null;
        return (
          <section key={programId} style={{ padding: 0, border: "none" }}>
            <h2>{program.name}</h2>
            {evaluations.length === 0 ? (
              <p className="muted">No Evaluations recorded yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Student</th>
                      <th scope="col">Site</th>
                      <th scope="col">Type</th>
                      <th scope="col">Outcome</th>
                      <th scope="col">Recorded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations
                      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                      .map((evaluation) => (
                        <tr key={evaluation.id}>
                          <td>
                            <Link href={`/coordinator/placements/${evaluation.placement.id}`}>
                              {evaluation.placement.student.name}
                            </Link>
                          </td>
                          <td>{evaluation.placement.clinicalSite.name}</td>
                          <td>{evaluation.type === "MIDPOINT" ? "Midpoint" : "Final"}</td>
                          <td>
                            <span
                              className={`badge badge--${evaluation.outcome === "SATISFACTORY" ? "active" : "draft"}`}
                            >
                              {evaluation.outcome.replaceAll("_", " ")}
                            </span>
                          </td>
                          <td>{evaluation.createdAt.toLocaleString()}</td>
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
