import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listUsers } from "@/services/identity/users";
import { listPrograms, listAllCourseOfferings } from "@/services/academic/institution";
import { ROLE_LABELS, ROLES, ROLE_SCOPE, IMPLEMENTED_ROLES } from "@/domain/roles";
import { ActionForm } from "@/components/action-form";
import { createUserAction, assignRoleAction } from "../actions";

export const metadata: Metadata = { title: "Users & Roles" };

/**
 * User Accounts & Role Assignments — implements Milestone 10, Phase 3
 * ("User account creation") and Phase 4 ("Implement role-based access
 * control... Create the foundation so future roles can be added").
 *
 * All seven Roles from src/domain/roles.ts appear in the role selector
 * below — originally so Admissions Staff, Clinical Coordinator, and
 * Employer Partner could be assigned even before a portal existed for
 * them, matching Milestone 10's explicit instruction to build RBAC so
 * those roles can be added later without rework. Clinical Coordinator
 * (Milestone 15) and Admissions Staff (Milestone 17) now both have
 * working portals; only Employer Partner remains unimplemented.
 */
export default async function AdminUsersPage() {
  await requireSessionUserWithRole("ADMINISTRATOR");

  const [users, programs, courseOfferings] = await Promise.all([
    listUsers(),
    listPrograms(),
    listAllCourseOfferings(),
  ]);

  return (
    <div className="stack">
      <h1>Users &amp; Roles</h1>

      <section style={{ padding: 0, border: "none" }}>
        <h2>All Users</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Roles</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.roleAssignments.length === 0
                      ? "—"
                      : u.roleAssignments
                          .map((ra) => ROLE_LABELS[ra.role as keyof typeof ROLE_LABELS])
                          .join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Create User</h2>
        <ActionForm action={createUserAction} submitLabel="Create User">
          <div className="field">
            <label htmlFor="user-name">Full name</label>
            <input id="user-name" name="name" required />
          </div>
          <div className="field">
            <label htmlFor="user-email">Email</label>
            <input id="user-email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="user-password">Temporary password</label>
            <input id="user-password" name="password" type="password" required minLength={8} />
            <span className="hint">At least 8 characters. Share this with the user directly.</span>
          </div>
        </ActionForm>
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Assign a Role</h2>
        <p className="muted">
          Every Role is scoped: Administrator is institution-wide; Program Director and the
          not-yet-built Admissions Staff/Clinical Coordinator/Employer Partner roles scope to a
          Program; Faculty scopes to a Course Offering; Student scopes to themself.
        </p>
        <ActionForm action={assignRoleAction} submitLabel="Assign Role">
          <div className="field">
            <label htmlFor="assign-user">User</label>
            <select id="assign-user" name="userId" required disabled={users.length === 0}>
              <option value="">Select a User&hellip;</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="assign-role">Role</label>
            <select id="assign-role" name="role" required defaultValue="">
              <option value="" disabled>
                Select a Role&hellip;
              </option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                  {!IMPLEMENTED_ROLES.includes(role) ? " (no portal yet)" : ""}
                </option>
              ))}
            </select>
            <span className="hint">
              Scope: choose a Program below for a Program-scoped role (
              {ROLES.filter((r) => ROLE_SCOPE[r] === "program").map((r) => ROLE_LABELS[r]).join(", ")}
              ), or a Course Offering for Faculty. Leave both blank for Administrator or Student.
            </span>
          </div>
          <div className="field">
            <label htmlFor="assign-program">Program (if applicable)</label>
            <select id="assign-program" name="programId" defaultValue="">
              <option value="">None</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="assign-course-offering">Course Offering (Faculty only)</label>
            <select id="assign-course-offering" name="courseOfferingId" defaultValue="">
              <option value="">None</option>
              {courseOfferings.map((co) => (
                <option key={co.id} value={co.id}>
                  {co.course.title} — {co.cohort.name} ({co.course.program.name})
                </option>
              ))}
            </select>
          </div>
        </ActionForm>
      </section>
    </div>
  );
}
