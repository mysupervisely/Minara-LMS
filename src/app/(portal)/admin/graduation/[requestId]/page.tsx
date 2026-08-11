import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { getGraduationRequestById } from "@/services/graduation/graduation";
import { issueCertificateAction } from "../../actions";

export const metadata: Metadata = { title: "Issue Certificate" };

/**
 * Certificate issuance detail — the Administrator's final institutional
 * act of record, per this milestone's Phase 8. Only reachable for an
 * APPROVED Graduation Request; issuing here creates the Certificate and
 * transitions the Student's Enrollment to Alumni in one atomic,
 * audited step (src/services/graduation/graduation.ts's issueCertificate).
 */
export default async function AdminGraduationDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const user = await requireSessionUserWithRole("ADMINISTRATOR");

  const request = await getGraduationRequestById(requestId, user);
  if (!request) notFound();

  return (
    <div className="stack">
      <p className="muted">
        <Link href="/admin/graduation">&larr; Certificate Issuance</Link>
      </p>
      <h1>
        {request.student.name} &middot; {request.program.name}
      </h1>
      <p className="muted">
        Approved by {request.approvedBy?.name} on {request.approvedAt?.toLocaleString()}
      </p>

      {request.status === "APPROVED" ? (
        <form action={issueCertificateAction.bind(null, request.id)}>
          <button className="button button--primary" type="submit">
            Issue Certificate
          </button>
        </form>
      ) : request.status === "CERTIFICATE_ISSUED" && request.certificate ? (
        <section style={{ padding: 0, border: "none" }}>
          <h2>Certificate Issued</h2>
          <p>Credential: {request.certificate.credentialNumber}</p>
          <p>Issued: {request.certificate.issuedAt.toLocaleString()}</p>
        </section>
      ) : (
        <p className="muted">This Graduation Request is not yet Approved — nothing to issue.</p>
      )}
    </div>
  );
}
