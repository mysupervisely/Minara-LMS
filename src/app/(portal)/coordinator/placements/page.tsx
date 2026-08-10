import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listPlacementsForProgram, listClinicalSitesForProgram } from "@/services/externship/externship";
import { listPrograms } from "@/services/academic/institution";
import { db } from "@/lib/db";
import { ActionForm } from "@/components/action-form";
import { requestPlacementAction, approvePlacementAction, activatePlacementAction } from "../actions";

export const metadata: Metadata = { title: "Clinical Coordinator — Placements" };

const PLACEMENT_BADGE: Record<string, string> = {
  REQUESTED: "draft",
  APPROVED: "submitted",
  ACTIVE: "active",
  COMPLETED: "published",
};

/**
 * Placements — implements the Coordinator Portal's Placements screen:
 * Placement Request through Student Assignment
 * (docs/milestones/milestone-3-student-journey-core-workflows/04-externship-management-workflow.md).
 * Site Approval and Student Assignment/Orientation are collapsed into
 * `status` transitions REQUESTED → APPROVED → ACTIVE, Coordinator-only,
 * per this milestone's narrowing (Externship Deep Dive #2).
 */
export default async function CoordinatorPlacementsPage() {
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

  const [dataByProgram, programs] = await Promise.all([
    Promise.all(
      programIds.map(async (programId) => {
        const [placements, sites, enrollments] = await Promise.all([
          listPlacementsForProgram(programId, user),
          listClinicalSitesForProgram(programId, user),
          db.enrollment.findMany({ where: { programId, status: "ACTIVE" }, include: { student: true } }),
        ]);
        return { programId, placements, sites, enrollments };
      }),
    ),
    listPrograms(),
  ]);

  return (
    <div className="stack">
      <h1>Placements</h1>

      {dataByProgram.map(({ programId, placements, sites, enrollments }) => {
        const program = programs.find((p) => p.id === programId);
        if (!program) return null;
        const activeSites = sites.filter((s) => s.status === "ACTIVE");
        return (
          <section key={programId} style={{ padding: 0, border: "none" }}>
            <h2>{program.name}</h2>

            {placements.length === 0 ? (
              <p className="muted">No Placements recorded for this Program yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Student</th>
                      <th scope="col">Clinical Site</th>
                      <th scope="col">Status</th>
                      <th scope="col">Completion</th>
                      <th scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {placements.map((placement) => (
                      <tr key={placement.id}>
                        <td>{placement.student.name}</td>
                        <td>{placement.clinicalSite.name}</td>
                        <td>
                          <span className={`badge badge--${PLACEMENT_BADGE[placement.status] ?? "draft"}`}>
                            {placement.status}
                          </span>
                        </td>
                        <td>{placement.completionStatus.replaceAll("_", " ")}</td>
                        <td style={{ display: "flex", gap: "0.5rem" }}>
                          <Link href={`/coordinator/placements/${placement.id}`}>Manage</Link>
                          {placement.status === "REQUESTED" ? (
                            <form action={approvePlacementAction.bind(null, placement.id)}>
                              <button className="button button--secondary" type="submit">
                                Approve
                              </button>
                            </form>
                          ) : null}
                          {placement.status === "APPROVED" ? (
                            <form action={activatePlacementAction.bind(null, placement.id)}>
                              <button className="button button--secondary" type="submit">
                                Activate
                              </button>
                            </form>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h3>Request a New Placement</h3>
            {activeSites.length === 0 ? (
              <p className="muted">Approve at least one Clinical Site before requesting a Placement.</p>
            ) : (
              <ActionForm action={requestPlacementAction} submitLabel="Request Placement">
                <input type="hidden" name="programId" value={programId} />
                <div className="field">
                  <label htmlFor={`placement-student-${programId}`}>Student</label>
                  <select id={`placement-student-${programId}`} name="studentId" required defaultValue="">
                    <option value="" disabled>
                      Select a Student&hellip;
                    </option>
                    {enrollments.map((e) => (
                      <option key={e.student.id} value={e.student.id}>
                        {e.student.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor={`placement-site-${programId}`}>Clinical Site</label>
                  <select id={`placement-site-${programId}`} name="clinicalSiteId" required defaultValue="">
                    <option value="" disabled>
                      Select a Site&hellip;
                    </option>
                    {activeSites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.employerName})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor={`placement-preceptor-name-${programId}`}>Preceptor name (optional)</label>
                  <input id={`placement-preceptor-name-${programId}`} name="preceptorName" />
                </div>
                <div className="field">
                  <label htmlFor={`placement-preceptor-contact-${programId}`}>
                    Preceptor contact (optional)
                  </label>
                  <input id={`placement-preceptor-contact-${programId}`} name="preceptorContact" />
                </div>
              </ActionForm>
            )}
          </section>
        );
      })}
    </div>
  );
}
