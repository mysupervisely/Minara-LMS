import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import {
  listClinicalSitesForProgram,
  listEligibilityQueueForProgram,
  listPlacementsForProgram,
} from "@/services/externship/externship";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Clinical Coordinator — Dashboard" };

/**
 * Clinical/Externship Coordinator Portal — Dashboard. Implements
 * docs/milestones/milestone-4-information-architecture/06-clinical-coordinator-portal.md's
 * Dashboard screen, narrowed to this milestone's slice: pipeline health
 * across whichever Program(s) this Coordinator holds a CLINICAL_COORDINATOR
 * Role Assignment for (or every Program, for an Administrator reaching
 * this page — the same fallback pattern
 * src/app/(portal)/program-director/page.tsx already establishes).
 */
export default async function CoordinatorDashboardPage() {
  const user = await requireSessionUserWithRole("CLINICAL_COORDINATOR");

  const programIds = Array.from(
    new Set(
      user.roleAssignments
        .filter((ra) => ra.role === "CLINICAL_COORDINATOR" && ra.programId)
        .map((ra) => ra.programId as string),
    ),
  );
  const isAdministrator = user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
  const scopedProgramIds = isAdministrator
    ? (await db.program.findMany({ select: { id: true } })).map((p) => p.id)
    : programIds;

  const byProgram = await Promise.all(
    scopedProgramIds.map(async (programId) => {
      const program = await db.program.findUnique({ where: { id: programId } });
      const [sites, eligibilityQueue, placements] = await Promise.all([
        listClinicalSitesForProgram(programId, user),
        listEligibilityQueueForProgram(programId, user),
        listPlacementsForProgram(programId, user),
      ]);
      return {
        program,
        siteCount: sites.length,
        pendingEligibilityCount: eligibilityQueue.filter((e) => e.eligibility === null).length,
        activePlacementCount: placements.filter((p) => p.status === "ACTIVE").length,
        awaitingVerificationCount: placements.filter((p) => p.completionStatus === "SUBMITTED").length,
      };
    }),
  );

  return (
    <div className="stack">
      <h1>Clinical Coordinator Dashboard</h1>
      <p className="muted">
        Milestone 15&rsquo;s narrow Externship Eligibility &amp; Placement slice — see{" "}
        <Link href="/coordinator/sites">Sites</Link>, <Link href="/coordinator/eligibility">Eligibility Queue</Link>,{" "}
        <Link href="/coordinator/placements">Placements</Link>, and{" "}
        <Link href="/coordinator/completion">Completion Verification</Link>.
      </p>

      {byProgram.length === 0 ? (
        <p className="muted">No Program is assigned to you as Clinical Coordinator yet.</p>
      ) : (
        <div className="card-grid">
          {byProgram.map(({ program, ...counts }) =>
            !program ? null : (
              <article className="card" key={program.id}>
                <h3>{program.name}</h3>
                <p>{counts.siteCount} Clinical Site(s)</p>
                <p>{counts.pendingEligibilityCount} Student(s) awaiting an eligibility determination</p>
                <p>{counts.activePlacementCount} Active Placement(s)</p>
                <p>{counts.awaitingVerificationCount} Completion(s) awaiting Program Director review</p>
              </article>
            ),
          )}
        </div>
      )}
    </div>
  );
}
