import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listEnrollmentsForStudent } from "@/services/enrollment/enrollment";
import { determineGraduationEligibility, getGraduationRequestForStudent } from "@/services/graduation/graduation";

export const metadata: Metadata = { title: "Graduation & Certificate" };

const REQUEST_BADGE: Record<string, string> = {
  SUBMITTED: "submitted",
  APPROVED: "approved",
  RETURNED: "draft",
  CERTIFICATE_ISSUED: "published",
};

/**
 * My Graduation & Certificate — a read-only Student view, per this
 * milestone's Student Portal requirement: current academic status,
 * graduation eligibility, missing requirements, submitted/approval
 * status, certificate issued status and details, and Alumni status.
 * Every value is resolved server-side from this Student's own id (never
 * a client-supplied studentId) via
 * src/services/graduation/graduation.ts, which independently fails
 * closed if this Student's id doesn't match the record's studentId — the
 * same fail-closed guarantee Milestones 14/15 established, applied here
 * a third time. No form or action on this page — a Student cannot
 * self-submit, self-approve, or self-issue, per this milestone's
 * explicit instruction.
 */
export default async function StudentGraduationPage() {
  const user = await requireSessionUserWithRole("STUDENT");

  const enrollments = await listEnrollmentsForStudent(user.id);

  const sections = await Promise.all(
    enrollments.map(async (enrollment) => {
      const [eligibility, graduationRequest] = await Promise.all([
        determineGraduationEligibility(user.id, enrollment.programId, user),
        getGraduationRequestForStudent(user.id, enrollment.programId, user),
      ]);
      return { enrollment, eligibility, graduationRequest };
    }),
  );

  return (
    <div className="stack">
      <h1>Graduation &amp; Certificate</h1>

      {sections.length === 0 ? (
        <p className="muted">You are not currently enrolled in a program.</p>
      ) : (
        sections.map(({ enrollment, eligibility, graduationRequest }) => (
          <section key={enrollment.id} style={{ padding: 0, border: "none" }}>
            <h2>{enrollment.program.name}</h2>

            {enrollment.status === "ALUMNI" ? (
              <p className="badge badge--approved">ALUMNI</p>
            ) : null}

            <h3>Eligibility</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Requirement</th>
                    <th scope="col">Status</th>
                    <th scope="col">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibility.breakdown.map((item) => (
                    <tr key={item.label}>
                      <td>{item.label}</td>
                      <td>
                        <span
                          className={`badge badge--${
                            item.status === "PASSED"
                              ? "approved"
                              : item.status === "FAILED"
                                ? "draft"
                                : "submitted"
                          }`}
                        >
                          {item.status === "NEEDS_VERIFICATION"
                            ? "⚠️ NEEDS VERIFICATION"
                            : item.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td>{item.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!eligibility.eligible && eligibility.missingRequirements.length > 0 ? (
              <div className="alert alert--error" role="alert">
                <p>Outstanding requirements:</p>
                <ul>
                  {eligibility.missingRequirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {graduationRequest ? (
              <>
                <h3>Graduation Request</h3>
                <p>
                  <span className={`badge badge--${REQUEST_BADGE[graduationRequest.status] ?? "draft"}`}>
                    {graduationRequest.status.replaceAll("_", " ")}
                  </span>
                </p>
                {graduationRequest.status === "RETURNED" && graduationRequest.returnReason ? (
                  <p className="alert alert--error" role="alert">
                    Returned by the Program Director: {graduationRequest.returnReason}
                  </p>
                ) : null}
              </>
            ) : null}

            {graduationRequest?.certificate ? (
              <>
                <h3>Certificate</h3>
                <div className="card">
                  <p>
                    <strong>Credential:</strong> {graduationRequest.certificate.credentialNumber}
                  </p>
                  <p>
                    <strong>Issued:</strong> {graduationRequest.certificate.issuedAt.toLocaleDateString()}
                  </p>
                </div>
              </>
            ) : null}
          </section>
        ))
      )}
    </div>
  );
}
