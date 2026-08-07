import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listUsers } from "@/services/identity/users";
import { listProgramsWithDetail } from "@/services/academic/institution";
import { ActionForm } from "@/components/action-form";
import { createEnrollmentAction } from "../actions";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Enrollments" };

/**
 * Manual Enrollment — implements the MVP's "Administrator-provisioned
 * Enrollment" scope
 * (docs/milestones/milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md)
 * standing in for the full, not-yet-built self-service Admissions
 * pipeline, per this milestone's explicit "Out of Scope: Admissions
 * automation."
 */
export default async function AdminEnrollmentsPage() {
  await requireSessionUserWithRole("ADMINISTRATOR");

  const [enrollments, users, programs] = await Promise.all([
    db.enrollment.findMany({
      include: { student: true, program: true, cohort: true },
      orderBy: { createdAt: "desc" },
    }),
    listUsers(),
    listProgramsWithDetail(),
  ]);

  return (
    <div className="stack">
      <h1>Enrollments</h1>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Current Enrollments</h2>
        {enrollments.length === 0 ? (
          <p className="muted">No Student is enrolled yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Program</th>
                  <th scope="col">Cohort</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    <td>{e.student.name}</td>
                    <td>{e.program.name}</td>
                    <td>{e.cohort.name}</td>
                    <td>
                      <span className="badge badge--active">{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Create Enrollment</h2>
        <p className="muted">
          Enrolling a User automatically grants them the Student Role if they don&apos;t already
          hold it.
        </p>
        <ActionForm action={createEnrollmentAction} submitLabel="Create Enrollment">
          <div className="field">
            <label htmlFor="enroll-student">Student</label>
            <select id="enroll-student" name="studentId" required disabled={users.length === 0}>
              <option value="">Select a User&hellip;</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="enroll-program">Program</label>
            <select id="enroll-program" name="programId" required disabled={programs.length === 0}>
              <option value="">Select a Program&hellip;</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="enroll-cohort">Cohort</label>
            <select id="enroll-cohort" name="cohortId" required>
              <option value="">Select a Cohort&hellip;</option>
              {programs.map((p) =>
                p.cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({p.name})
                  </option>
                )),
              )}
            </select>
          </div>
        </ActionForm>
      </section>
    </div>
  );
}
