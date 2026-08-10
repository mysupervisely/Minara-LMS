import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listEligibilityQueueForProgram } from "@/services/externship/externship";
import { listPrograms } from "@/services/academic/institution";
import { db } from "@/lib/db";
import { ActionForm } from "@/components/action-form";
import { determineEligibilityAction } from "../actions";

export const metadata: Metadata = { title: "Clinical Coordinator — Eligibility Queue" };

const ELIGIBILITY_BADGE: Record<string, string> = {
  ELIGIBLE: "approved",
  NOT_YET_ELIGIBLE: "draft",
  BLOCKED: "draft",
  REQUIREMENTS_PENDING_VERIFICATION: "draft",
};

/**
 * Eligibility Queue — implements the Coordinator Portal's Eligibility
 * Queue screen. Per the Externship Deep Dive item 1, there is no
 * automated eligibility computation: this screen surfaces every actively
 * enrolled Student in the Program and whatever determination (if any) a
 * Coordinator has recorded, never a computed pass/fail. A Student with no
 * determination yet reads plainly as "Requirements Pending Verification"
 * — not silently treated as ineligible or eligible.
 */
export default async function CoordinatorEligibilityPage() {
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

  const [queueByProgram, programs] = await Promise.all([
    Promise.all(
      programIds.map(async (programId) => ({
        programId,
        queue: await listEligibilityQueueForProgram(programId, user),
      })),
    ),
    listPrograms(),
  ]);

  return (
    <div className="stack">
      <h1>Eligibility Queue</h1>
      <p className="muted">
        Eligibility is a Coordinator judgment call against each Student&rsquo;s existing academic record — this
        platform does not compute or invent an eligibility rule. ⚠️ Needs Verification: the specific prerequisite
        courses/competencies for externship eligibility remain pending confirmation from Minara-Curriculum (see
        docs/milestones/milestone-15-externship-eligibility-placement-vertical-slice/04-externship-deep-dive.md).
      </p>

      {queueByProgram.map(({ programId, queue }) => {
        const program = programs.find((p) => p.id === programId);
        if (!program) return null;
        return (
          <section key={programId} style={{ padding: 0, border: "none" }}>
            <h2>{program.name}</h2>
            {queue.length === 0 ? (
              <p className="muted">No actively enrolled Students in this Program yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Student</th>
                      <th scope="col">Status</th>
                      <th scope="col">Notes</th>
                      <th scope="col">Determine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map(({ student, eligibility }) => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>
                          <span
                            className={`badge badge--${
                              ELIGIBILITY_BADGE[eligibility?.status ?? "REQUIREMENTS_PENDING_VERIFICATION"]
                            }`}
                          >
                            {(eligibility?.status ?? "REQUIREMENTS_PENDING_VERIFICATION").replaceAll("_", " ")}
                          </span>
                        </td>
                        <td>{eligibility?.notes ?? "—"}</td>
                        <td style={{ minWidth: "20rem" }}>
                          <ActionForm action={determineEligibilityAction} submitLabel="Record Determination">
                            <input type="hidden" name="studentId" value={student.id} />
                            <input type="hidden" name="programId" value={programId} />
                            <div className="field">
                              <label htmlFor={`eligibility-status-${student.id}`}>Status</label>
                              <select id={`eligibility-status-${student.id}`} name="status" required>
                                <option value="ELIGIBLE">Eligible</option>
                                <option value="NOT_YET_ELIGIBLE">Not Yet Eligible</option>
                                <option value="BLOCKED">Blocked</option>
                              </select>
                            </div>
                            <div className="field">
                              <label htmlFor={`eligibility-notes-${student.id}`}>Notes</label>
                              <textarea id={`eligibility-notes-${student.id}`} name="notes" />
                            </div>
                          </ActionForm>
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
