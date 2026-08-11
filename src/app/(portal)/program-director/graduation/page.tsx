import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listGraduationCandidatesForProgram } from "@/services/graduation/graduation";
import { db } from "@/lib/db";
import { submitForGraduationReviewAction } from "../actions";

export const metadata: Metadata = { title: "Program Director — Graduation Candidates" };

const REQUEST_BADGE: Record<string, string> = {
  SUBMITTED: "submitted",
  APPROVED: "approved",
  RETURNED: "draft",
  CERTIFICATE_ISSUED: "published",
};

/**
 * Graduation Candidates — implements the Certificate & Graduation
 * Workflow's "Completion Verification -> Academic Review" span
 * (docs/milestones/milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md)
 * for the Program Director: every actively-enrolled Student in the
 * Program, with their live eligibility (never a stale, persisted value —
 * see src/services/graduation/graduation.ts) and any existing Graduation
 * Request. Mirrors program-director/page.tsx's Program-scoping
 * derivation and Administrator fallback exactly.
 */
export default async function ProgramDirectorGraduationPage() {
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
      const candidates = await listGraduationCandidatesForProgram(programId, user);
      return { program, candidates };
    }),
  );

  return (
    <div className="stack">
      <h1>Graduation Candidates</h1>
      <p className="muted">
        Eligibility is computed live from each Student&rsquo;s current academic record and (where the Program
        requires it) Verified externship completion — never a stored, potentially stale determination.
      </p>

      {byProgram.map(({ program, candidates }) =>
        !program || candidates.length === 0 ? null : (
          <section key={program.id} style={{ padding: 0, border: "none" }}>
            <h2>{program.name}</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Student</th>
                    <th scope="col">Eligibility</th>
                    <th scope="col">Missing Requirements</th>
                    <th scope="col">Graduation Request</th>
                    <th scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(({ student, eligibility, graduationRequest }) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>
                        <span className={`badge badge--${eligibility.eligible ? "approved" : "draft"}`}>
                          {eligibility.eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
                        </span>
                      </td>
                      <td>
                        {eligibility.missingRequirements.length === 0
                          ? "—"
                          : eligibility.missingRequirements.join(" ")}
                      </td>
                      <td>
                        {graduationRequest ? (
                          <span className={`badge badge--${REQUEST_BADGE[graduationRequest.status] ?? "draft"}`}>
                            {graduationRequest.status.replaceAll("_", " ")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {graduationRequest?.status === "SUBMITTED" || graduationRequest?.status === "APPROVED" ? (
                          <Link href={`/program-director/graduation/${graduationRequest.id}`}>Review</Link>
                        ) : eligibility.eligible &&
                          (!graduationRequest || graduationRequest.status === "RETURNED") ? (
                          <form
                            action={submitForGraduationReviewAction.bind(null, student.id, program.id)}
                          >
                            <button className="button button--secondary" type="submit">
                              Submit for Review
                            </button>
                          </form>
                        ) : (
                          "—"
                        )}
                      </td>
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
