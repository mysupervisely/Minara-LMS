import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Administrator Overview" };

export default async function AdminOverviewPage() {
  const user = await requireSessionUserWithRole("ADMINISTRATOR");

  const [institutionCount, programCount, userCount, enrollmentCount, pendingGrades] =
    await Promise.all([
      db.institution.count(),
      db.program.count(),
      db.user.count(),
      db.enrollment.count(),
      db.grade.count({ where: { status: "SUBMITTED" } }),
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
