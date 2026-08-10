import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listEnrollmentsForStudent } from "@/services/enrollment/enrollment";
import { getEligibilityForStudent, getCurrentPlacementForStudent } from "@/services/externship/externship";

export const metadata: Metadata = { title: "My Externship" };

const ELIGIBILITY_BADGE: Record<string, string> = {
  ELIGIBLE: "approved",
  NOT_YET_ELIGIBLE: "draft",
  BLOCKED: "draft",
  REQUIREMENTS_PENDING_VERIFICATION: "draft",
};
const PLACEMENT_BADGE: Record<string, string> = {
  REQUESTED: "draft",
  APPROVED: "submitted",
  ACTIVE: "active",
  COMPLETED: "published",
};
const COMPLETION_BADGE: Record<string, string> = {
  NOT_SUBMITTED: "draft",
  SUBMITTED: "submitted",
  VERIFIED: "approved",
  RETURNED: "draft",
};

/**
 * My Externship — a read-only Student view, per Milestone 15's
 * Recommendation (Phase 10): eligibility, placement, site, placement
 * status, evaluation status, and completion status, all resolved
 * server-side from this Student's own id (never a client-supplied
 * studentId) via getEligibilityForStudent/getCurrentPlacementForStudent
 * in src/services/externship/externship.ts, which independently fail
 * closed if this Student's id doesn't match the record's studentId —
 * the same fail-closed guarantee Milestone 14 established for Lesson/
 * Assessment delivery, applied here a third time.
 *
 * Deliberately excludes Coordinator-internal eligibility notes and any
 * form/action — a Student cannot self-approve eligibility or completion
 * here, per this milestone's explicit instruction; every action that
 * changes this page's data happens in the Coordinator or Program
 * Director portal.
 *
 * Only rendered for Programs where `requiresExternship` is true — a
 * Student in a Program that doesn't require one sees a plain statement
 * to that effect, not an empty or confusing "eligibility" screen.
 */
export default async function StudentExternshipPage() {
  const user = await requireSessionUserWithRole("STUDENT");

  const enrollments = await listEnrollmentsForStudent(user.id);
  const externshipEnrollments = enrollments.filter((e) => e.program.requiresExternship);

  const sections = await Promise.all(
    externshipEnrollments.map(async (enrollment) => {
      const [eligibility, placement] = await Promise.all([
        getEligibilityForStudent(user.id, enrollment.programId, user),
        getCurrentPlacementForStudent(user.id, enrollment.programId, user),
      ]);
      return { enrollment, eligibility, placement };
    }),
  );

  return (
    <div className="stack">
      <h1>My Externship</h1>

      {sections.length === 0 ? (
        <p className="muted">
          None of your current Programs require an externship/clinical placement component.
        </p>
      ) : (
        sections.map(({ enrollment, eligibility, placement }) => {
          return (
            <section key={enrollment.id} style={{ padding: 0, border: "none" }}>
                <h2>{enrollment.program.name}</h2>

                <h3>Eligibility</h3>
                <p>
                  <span className={`badge badge--${ELIGIBILITY_BADGE[eligibility.status]}`}>
                    {eligibility.status.replaceAll("_", " ")}
                  </span>
                </p>

                <h3>Placement</h3>
                {!placement ? (
                  <p className="muted">No Placement has been recorded yet.</p>
                ) : (
                  <div className="card">
                    <p>
                      <strong>{placement.clinicalSite.name}</strong> — {placement.clinicalSite.employerName}
                    </p>
                    <p>
                      Placement status:{" "}
                      <span className={`badge badge--${PLACEMENT_BADGE[placement.status] ?? "draft"}`}>
                        {placement.status}
                      </span>
                    </p>
                    <p>
                      {placement.evaluations.length} evaluation
                      {placement.evaluations.length === 1 ? "" : "s"} recorded
                    </p>
                    <p>
                      Completion status:{" "}
                      <span
                        className={`badge badge--${COMPLETION_BADGE[placement.completionStatus] ?? "draft"}`}
                      >
                        {placement.completionStatus.replaceAll("_", " ")}
                      </span>
                    </p>
                    {placement.completionStatus === "VERIFIED" ? (
                      <p className="muted">
                        Verified{placement.completionVerifiedAt ? ` on ${placement.completionVerifiedAt.toLocaleDateString()}` : ""}.
                      </p>
                    ) : null}
                  </div>
                )}
              </section>
          );
        })
      )}
    </div>
  );
}
