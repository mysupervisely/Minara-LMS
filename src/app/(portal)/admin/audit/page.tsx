import type { Metadata } from "next";
import { requireSessionUserWithRole, requireAdministrator } from "@/services/identity/authorization";
import { listAuditLog } from "@/services/audit/audit";

export const metadata: Metadata = { title: "Audit Log" };

/**
 * Audit Log Viewer — implements Milestone 10, Phase 9 ("every important
 * action must create an audit record") and ADR-005: Administrator-only,
 * per the Permission Framework
 * (docs/milestones/milestone-2-user-roles-permission-architecture/02-permission-framework.md).
 */
export default async function AdminAuditPage() {
  const user = await requireSessionUserWithRole("ADMINISTRATOR");
  requireAdministrator(user);

  const entries = await listAuditLog(200);

  return (
    <div className="stack">
      <h1>Audit Log</h1>
      <p className="muted">
        The most recent {entries.length} recorded events, newest first. Every entry is
        append-only — see docs/milestones/milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md.
      </p>

      {entries.length === 0 ? (
        <p className="muted">No events recorded yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Actor</th>
                <th scope="col">Action</th>
                <th scope="col">Entity</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.createdAt.toLocaleString()}</td>
                  <td>{entry.actorName ?? "System"}</td>
                  <td>{entry.action}</td>
                  <td>
                    {entry.entityType}
                    {entry.entityId ? ` (${entry.entityId.slice(0, 8)}…)` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
