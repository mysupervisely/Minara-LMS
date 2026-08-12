import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Administrator Overview" };

export default async function AdminOverviewPage() {
  const user = await requireSessionUserWithRole("ADMINISTRATOR");

  const [
    institutionCount,
    programCount,
    userCount,
    enrollmentCount,
    pendingGrades,
    clinicalSiteCount,
    placementCount,
    graduationRequestsAwaitingIssuance,
    certificatesIssued,
    applicationsAwaitingAdmissions,
  ] = await Promise.all([
    db.institution.count(),
    db.program.count(),
    db.user.count(),
    db.enrollment.count(),
    db.grade.count({ where: { status: "SUBMITTED" } }),
    db.clinicalSite.count(),
    db.placement.count(),
    db.graduationRequest.count({ where: { status: "APPROVED" } }),
    db.certificate.count(),
    db.application.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
  ]);

  return (
    <div className="stack">
      <h1>Welcome, {user.name.split(" ")[0]}</h1>
      <div className="card-grid">
        <StatCard label="Institutions" value={institutionCount} href="/admin/institution" />
        <StatCard label="Programs" value={programCount} href="/admin/institution" />
        <StatCard label="Users" value={userCount} href="/admin/users" />
        <StatCard label="Enrollments" value={enrollmentCount} href="/admin/enrollments" />
        <StatCard label="Grades Awaiting Approval" value={pendingGrades} href="/program-director" />
        {/* Milestone 15 — Externship Eligibility & Placement Vertical Slice.
            Reuses the Coordinator Portal itself for Administrator oversight
            (per this milestone's "do not build a separate administrative
            workflow if existing patterns can be extended") — an
            Administrator reaching /coordinator/* passes every scope check
            there via hasRoleForProgram's own Administrator bypass. */}
        <StatCard label="Clinical Sites" value={clinicalSiteCount} href="/coordinator/sites" />
        <StatCard label="Externship Placements" value={placementCount} href="/coordinator/placements" />
        {/* Milestone 16 — Certificate & Graduation Vertical Slice. */}
        <StatCard
          label="Graduation Requests Awaiting Certificate"
          value={graduationRequestsAwaitingIssuance}
          href="/admin/graduation"
        />
        <StatCard label="Certificates Issued" value={certificatesIssued} href="/admin/graduation" />
        {/* Milestone 17 — Admissions & Enrollment Vertical Slice. Reuses
            the Admissions Portal itself for Administrator oversight, the
            same "administrator reaches another role's portal directly"
            pattern Milestone 15's Clinical Sites/Placements cards above
            already established. */}
        <StatCard label="Applications Awaiting Admissions" value={applicationsAwaitingAdmissions} href="/admissions/applications" />
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
