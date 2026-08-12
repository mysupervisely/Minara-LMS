import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Admissions Overview" };

/**
 * Admissions Staff dashboard — institution-wide, per ADMISSIONS_STAFF's
 * established "institution" ROLE_SCOPE (src/domain/roles.ts). Mirrors
 * admin/page.tsx's StatCard-grid shape.
 */
export default async function AdmissionsOverviewPage() {
  const user = await requireSessionUserWithRole("ADMISSIONS_STAFF");

  const [submitted, underReview, awaitingResponse, needingAttention] = await Promise.all([
    db.application.count({ where: { status: "SUBMITTED" } }),
    db.application.count({ where: { status: "UNDER_REVIEW" } }),
    db.application.count({ where: { status: "ACCEPTED" } }),
    db.applicationRequirement.count({ where: { status: { in: ["MISSING", "NEEDS_VERIFICATION"] } } }),
  ]);

  return (
    <div className="stack">
      <h1>Welcome, {user.name.split(" ")[0]}</h1>
      <div className="card-grid">
        <StatCard label="Awaiting Review" value={submitted} href="/admissions/applications" />
        <StatCard label="Under Review" value={underReview} href="/admissions/applications" />
        <StatCard label="Awaiting Applicant Response" value={awaitingResponse} href="/admissions/applications" />
        <StatCard label="Requirements Needing Attention" value={needingAttention} href="/admissions/requirements" />
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="card" style={{ textDecoration: "none", color: "inherit" }}>
      <p className="muted" style={{ margin: 0 }}>
        {label}
      </p>
      <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>{value}</p>
    </Link>
  );
}
