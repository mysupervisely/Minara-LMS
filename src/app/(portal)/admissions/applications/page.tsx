import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listApplicationsForAdmissions } from "@/services/admissions/admissions";

export const metadata: Metadata = { title: "Admissions — Applications" };

const STATUS_BADGE: Record<string, string> = {
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

const ACTIVE = ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "ACCEPTANCE_CONFIRMED", "WAITLISTED", "DEFERRED"];
const TERMINAL = ["ENROLLED", "DENIED", "ACCEPTANCE_DECLINED"];

/**
 * Applications queue — Phase 5: "View submitted applications within
 * authorized scope." Institution-wide, per ADMISSIONS_STAFF's ROLE_SCOPE
 * (no cross-program restriction to enforce for this role — see this
 * milestone's RBAC design doc).
 */
export default async function AdmissionsApplicationsPage() {
  const user = await requireSessionUserWithRole("ADMISSIONS_STAFF");
  const applications = await listApplicationsForAdmissions(user);

  const active = applications.filter((a) => ACTIVE.includes(a.status));
  const terminal = applications.filter((a) => TERMINAL.includes(a.status));

  return (
    <div className="stack">
      <h1>Applications</h1>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Active</h2>
        {active.length === 0 ? (
          <p className="muted">No Application currently needs attention.</p>
        ) : (
          <ApplicationTable applications={active} />
        )}
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>History</h2>
        {terminal.length === 0 ? (
          <p className="muted">No Application has reached a final outcome yet.</p>
        ) : (
          <ApplicationTable applications={terminal} />
        )}
      </section>
    </div>
  );

  function ApplicationTable({ applications: rows }: { applications: typeof applications }) {
    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Applicant</th>
              <th scope="col">Program</th>
              <th scope="col">Status</th>
              <th scope="col">Requirements</th>
              <th scope="col">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((application) => {
              const attention = application.requirements.filter(
                (r) => r.status === "MISSING" || r.status === "NEEDS_VERIFICATION",
              ).length;
              return (
                <tr key={application.id}>
                  <td>{application.applicant.name}</td>
                  <td>{application.program.name}</td>
                  <td>
                    <span className={`badge badge--${STATUS_BADGE[application.status] ?? "draft"}`}>
                      {application.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td>{attention === 0 ? "—" : `${attention} needing attention`}</td>
                  <td>
                    <Link href={`/admissions/applications/${application.id}`}>Review</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}
