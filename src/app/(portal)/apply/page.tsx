import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUser } from "@/services/identity/authorization";
import { listApplicationsForApplicant } from "@/services/admissions/admissions";

export const metadata: Metadata = { title: "My Applications" };

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
 * My Applications — the Applicant's own landing page, per Phase 4. This
 * is the one authenticated area reachable with zero Role Assignments
 * (see requireSessionUser, not requireSessionUserWithRole) — an
 * Applicant is a User, not a Role, per
 * src/services/admissions/admissions.ts's header comment.
 */
export default async function MyApplicationsPage() {
  const user = await requireSessionUser();
  const applications = await listApplicationsForApplicant(user.id, user);

  return (
    <div className="stack">
      <h1>My Applications</h1>
      {applications.length === 0 ? (
        <p className="muted">
          You don&apos;t have any Applications yet. Visit <Link href="/programs">Programs</Link> to apply.
        </p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Program</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>{application.program.name}</td>
                  <td>
                    <span className={`badge badge--${STATUS_BADGE[application.status] ?? "draft"}`}>
                      {application.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td>
                    <Link href={`/apply/${application.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted">
        <Link href="/programs">Browse Programs</Link>
      </p>
    </div>
  );
}
