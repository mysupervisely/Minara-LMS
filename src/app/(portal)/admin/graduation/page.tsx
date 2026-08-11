import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listCertificateIssuanceQueueForProgram, listIssuedCertificates } from "@/services/graduation/graduation";

export const metadata: Metadata = { title: "Certificate Issuance" };

/**
 * Certificate Issuance — the Administrator's institution-wide queue of
 * Program-Director-approved Graduation Requests awaiting the
 * institutional act of record, plus a history of Certificates already
 * issued. Mirrors admin/content/page.tsx's Publishing Queue pattern
 * (institution-wide Administrator authority, distinct from Program-
 * scoped approval) — the same authority split, applied to a fifth
 * approval gate.
 */
export default async function AdminGraduationPage() {
  const user = await requireSessionUserWithRole("ADMINISTRATOR");

  const [pending, issued] = await Promise.all([
    listCertificateIssuanceQueueForProgram(user),
    listIssuedCertificates(user),
  ]);

  return (
    <div className="stack">
      <h1>Certificate Issuance</h1>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Awaiting Issuance</h2>
        {pending.length === 0 ? (
          <p className="muted">No Graduation Request is awaiting Certificate issuance right now.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Program</th>
                  <th scope="col">Approved</th>
                  <th scope="col">
                    <span className="sr-only">Issue</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pending.map((request) => (
                  <tr key={request.id}>
                    <td>{request.student.name}</td>
                    <td>{request.program.name}</td>
                    <td>{request.approvedAt?.toLocaleString()}</td>
                    <td>
                      <Link href={`/admin/graduation/${request.id}`}>Review &amp; Issue</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Issued Certificates</h2>
        {issued.length === 0 ? (
          <p className="muted">No Certificate has been issued yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Program</th>
                  <th scope="col">Credential</th>
                  <th scope="col">Issued</th>
                  <th scope="col">Issued By</th>
                </tr>
              </thead>
              <tbody>
                {issued.map((certificate) => (
                  <tr key={certificate.id}>
                    <td>{certificate.student.name}</td>
                    <td>{certificate.program.name}</td>
                    <td>{certificate.credentialNumber}</td>
                    <td>{certificate.issuedAt.toLocaleString()}</td>
                    <td>{certificate.issuedBy.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
