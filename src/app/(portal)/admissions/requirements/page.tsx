import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listApplicationsForAdmissions } from "@/services/admissions/admissions";

export const metadata: Metadata = { title: "Admissions — Requirements Queue" };

/**
 * Requirements Needing Attention — a cross-Application view (Phase 5's
 * suggested `/admissions/requirements` route) of every checklist item
 * currently MISSING or ⚠️ Needs Verification, across every active
 * Application. Never silently drops these into "passed" — see
 * src/services/admissions/admissions.ts's REQUIREMENT_STATUSES.
 */
export default async function AdmissionsRequirementsPage() {
  const user = await requireSessionUserWithRole("ADMISSIONS_STAFF");
  const applications = await listApplicationsForAdmissions(user);

  const rows = applications.flatMap((application) =>
    application.requirements
      .filter((r) => r.status === "MISSING" || r.status === "NEEDS_VERIFICATION")
      .map((requirement) => ({ application, requirement })),
  );

  return (
    <div className="stack">
      <h1>Requirements Needing Attention</h1>
      {rows.length === 0 ? (
        <p className="muted">Nothing is currently Missing or Needing Verification.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Applicant</th>
                <th scope="col">Program</th>
                <th scope="col">Requirement</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="sr-only">Review</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ application, requirement }) => (
                <tr key={requirement.id}>
                  <td>{application.applicant.name}</td>
                  <td>{application.program.name}</td>
                  <td>{requirement.label}</td>
                  <td>
                    <span className="badge badge--draft">
                      {requirement.status === "NEEDS_VERIFICATION" ? "⚠️ Needs Verification" : "Missing"}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admissions/applications/${application.id}`}>Review</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
