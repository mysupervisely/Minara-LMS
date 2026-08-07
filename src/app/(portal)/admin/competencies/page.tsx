import type { Metadata } from "next";
import { requireSessionUserWithRole, requireAdministrator } from "@/services/identity/authorization";
import { listPrograms } from "@/services/academic/institution";
import { db } from "@/lib/db";
import { ActionForm } from "@/components/action-form";
import { createCompetencyAction } from "../actions";

export const metadata: Metadata = { title: "Competencies" };

/**
 * Minimal Competency management — Milestone 13, per
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/04-portal-impact-review.md.
 * Deliberately kept to a single named record scoped to a Program, per
 * this milestone's Domain Impact Review — not the full Milestone 11
 * Competency Mapping chain (Course Outcome / Program Competency /
 * Program Learning Outcome / Institution Mission), which remains
 * Future.
 */
export default async function AdminCompetenciesPage() {
  const user = await requireSessionUserWithRole("ADMINISTRATOR");
  requireAdministrator(user);

  const programs = await listPrograms();
  const competencies = await db.competency.findMany({
    include: { program: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="stack">
      <h1>Competencies</h1>
      <p className="muted">
        Program-scoped Competencies Faculty tag Lessons with — see{" "}
        <code>docs/milestones/milestone-12-curriculum-delivery-vertical-slice/03-domain-impact-review.md</code>
        .
      </p>

      {competencies.length === 0 ? (
        <p className="muted">No Competency has been created yet.</p>
      ) : (
        <ul>
          {competencies.map((c) => (
            <li key={c.id}>
              {c.name} <span className="muted">— {c.program.name}</span>
            </li>
          ))}
        </ul>
      )}

      <ActionForm action={createCompetencyAction} submitLabel="Create Competency">
        <div className="field">
          <label htmlFor="competency-program">Program</label>
          <select id="competency-program" name="programId" required disabled={programs.length === 0}>
            <option value="">Select a Program&hellip;</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="competency-name">Name</label>
          <input id="competency-name" name="name" required />
        </div>
      </ActionForm>
    </div>
  );
}
