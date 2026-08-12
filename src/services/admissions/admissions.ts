import "server-only";
import { db } from "@/lib/db";
import { recordAuditEvent } from "@/services/audit/audit";
import { hasRoleForProgram, isAdministrator, hasAnyRole } from "@/services/identity/rbac";
import { createEnrollment } from "@/services/enrollment/enrollment";
import type { SessionUser } from "@/services/identity/session";

/**
 * Admissions bounded context — Milestone 17's Admissions & Enrollment
 * Vertical Slice.
 *
 * Implements the exact stage sequence
 * docs/milestones/milestone-3-student-journey-core-workflows/03-admissions-workflows.md
 * already defines — Application Started (DRAFT) -> Document Collection
 * (SUBMITTED/UNDER_REVIEW, tracked via ApplicationRequirement) ->
 * Admissions Review (UNDER_REVIEW) -> Decision (ACCEPTED/DENIED/
 * WAITLISTED/DEFERRED) -> Applicant Response (ACCEPTANCE_CONFIRMED/
 * ACCEPTANCE_DECLINED) -> Enrollment (ENROLLED) — no new terminology
 * invented. Follows Milestone 15/16's service-layer-enforced-
 * authorization pattern throughout: every function accepts a full
 * SessionUser and asserts its own Role/Scope via
 * @/services/identity/rbac, never trusting its `actions.ts` caller
 * alone.
 *
 * Per this milestone's own instruction, Program Director admissions
 * involvement is read-only in this slice — the Admissions Workflows doc
 * flags the exact PD/Admissions-Staff decision authority split as
 * ⚠️ Needs Verification, so no decision-making authority is granted to
 * Program Director here (see listApplicationsForProgram, read-only).
 * Admissions Staff is institution-wide, per src/domain/roles.ts's
 * ROLE_SCOPE (fixed since Milestone 10, unchanged by this milestone) —
 * there is no per-program Admissions Staff scope to enforce.
 *
 * No Pharmacy Technology (or any other Program's) admission requirement
 * is hard-coded anywhere in this module — see
 * docs/milestones/milestone-17-admissions-enrollment-vertical-slice/03-application-domain-workflow.md.
 */

export class ApplicationStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApplicationStateError";
  }
}

export class ApplicationAuthorizationError extends Error {
  constructor(message = "You are not authorized to perform this action.") {
    super(message);
    this.name = "ApplicationAuthorizationError";
  }
}

function assertAdmissionsStaffOrAdmin(actor: SessionUser): void {
  if (!hasAnyRole(actor, "ADMISSIONS_STAFF") && !isAdministrator(actor)) {
    throw new ApplicationAuthorizationError("Only Admissions Staff or an Administrator may perform this action.");
  }
}

/** An Applicant may always act on their own Application. Fails closed otherwise. */
function assertApplicant(actor: SessionUser, applicantId: string): void {
  if (actor.id !== applicantId) {
    throw new ApplicationAuthorizationError("You may only act on your own Application.");
  }
}

/** Read access: the Applicant themself, Admissions Staff/Administrator (institution-wide), or a Program Director overseeing this Application's Program (read-only elsewhere in this module). */
function assertReadAccess(actor: SessionUser, applicantId: string, programId: string): void {
  if (actor.id === applicantId) return;
  if (hasAnyRole(actor, "ADMISSIONS_STAFF") || isAdministrator(actor)) return;
  if (hasRoleForProgram(actor, "PROGRAM_DIRECTOR", programId)) return;
  throw new ApplicationAuthorizationError("You may not view this Application.");
}

const ACTIVE_STATUSES = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "WAITLISTED", "DEFERRED", "ACCEPTED", "ACCEPTANCE_CONFIRMED"];

// ── Applicant-facing: start, save, submit ──────────────────────────────

/**
 * Starts a new Application, or resumes an existing non-terminal one for
 * the same (applicant, program) pair — a returning Applicant visiting
 * `/apply` again should resume their Draft, not accumulate duplicates.
 * Seeds the starter checklist with exactly two generic, non-invented
 * rows (see this module's header comment) rather than any real
 * Pharmacy Technology document list.
 */
export async function startOrResumeApplication(applicantId: string, programId: string, actor: SessionUser) {
  assertApplicant(actor, applicantId);

  const existing = await db.application.findFirst({
    where: { applicantId, programId, status: { in: ACTIVE_STATUSES } },
  });
  if (existing) return existing;

  const application = await db.application.create({
    data: {
      applicantId,
      programId,
      requirements: {
        create: [
          { label: "Supporting Documents", status: "NEEDS_VERIFICATION" },
          { label: "Program-Specific Requirements", status: "NEEDS_VERIFICATION" },
        ],
      },
    },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "APPLICATION_CREATED",
    entityType: "Application",
    entityId: application.id,
    metadata: { applicantId, programId },
  });

  return application;
}

export async function saveApplicationDraft(applicationId: string, notes: string, actor: SessionUser) {
  const application = await db.application.findUnique({ where: { id: applicationId } });
  if (!application) throw new ApplicationStateError("Application not found.");
  assertApplicant(actor, application.applicantId);
  if (application.status !== "DRAFT") {
    throw new ApplicationStateError("Only a Draft Application can be edited.");
  }

  return db.application.update({
    where: { id: applicationId },
    data: { applicantNotes: notes.trim() || null },
  });
}

/** DRAFT -> SUBMITTED. Fails closed: an Applicant cannot silently revert a Submitted Application back to Draft (no such transition exists anywhere in this module). */
export async function submitApplication(applicationId: string, actor: SessionUser) {
  const application = await db.application.findUnique({ where: { id: applicationId } });
  if (!application) throw new ApplicationStateError("Application not found.");
  assertApplicant(actor, application.applicantId);
  if (application.status !== "DRAFT") {
    throw new ApplicationStateError("Only a Draft Application can be submitted.");
  }

  const updated = await db.application.update({
    where: { id: applicationId },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "APPLICATION_SUBMITTED",
    entityType: "Application",
    entityId: applicationId,
    metadata: { applicantId: application.applicantId, programId: application.programId },
  });

  return updated;
}

// ── Admissions Staff: review, checklist, decision ───────────────────────

/** SUBMITTED -> UNDER_REVIEW. Admissions Staff/Administrator only. */
export async function startReview(applicationId: string, actor: SessionUser) {
  assertAdmissionsStaffOrAdmin(actor);
  const application = await db.application.findUnique({ where: { id: applicationId } });
  if (!application) throw new ApplicationStateError("Application not found.");
  if (application.status !== "SUBMITTED") {
    throw new ApplicationStateError("Only a Submitted Application can move into review.");
  }

  const updated = await db.application.update({ where: { id: applicationId }, data: { status: "UNDER_REVIEW" } });

  await recordAuditEvent({
    actorId: actor.id,
    action: "APPLICATION_REVIEW_STARTED",
    entityType: "Application",
    entityId: applicationId,
  });

  return updated;
}

/** WAITLISTED or DEFERRED -> UNDER_REVIEW, per the Admissions Workflows doc's "Spot Opens" / "Future Cohort Opens" re-entry branches. Admissions Staff/Administrator only. */
export async function reopenForReview(applicationId: string, actor: SessionUser) {
  assertAdmissionsStaffOrAdmin(actor);
  const application = await db.application.findUnique({ where: { id: applicationId } });
  if (!application) throw new ApplicationStateError("Application not found.");
  if (application.status !== "WAITLISTED" && application.status !== "DEFERRED") {
    throw new ApplicationStateError("Only a Waitlisted or Deferred Application can be reopened for review.");
  }

  const updated = await db.application.update({ where: { id: applicationId }, data: { status: "UNDER_REVIEW" } });

  await recordAuditEvent({
    actorId: actor.id,
    action: "APPLICATION_REOPENED_FOR_REVIEW",
    entityType: "Application",
    entityId: applicationId,
    metadata: { previousStatus: application.status },
  });

  return updated;
}

const REQUIREMENT_STATUSES = ["RECEIVED", "MISSING", "NEEDS_VERIFICATION", "NOT_APPLICABLE"] as const;
export type RequirementStatus = (typeof REQUIREMENT_STATUSES)[number];

export async function addRequirement(applicationId: string, label: string, actor: SessionUser) {
  assertAdmissionsStaffOrAdmin(actor);
  const trimmed = label.trim();
  if (!trimmed) throw new ApplicationStateError("A requirement label is required.");

  const requirement = await db.applicationRequirement.create({
    data: { applicationId, label: trimmed, status: "NEEDS_VERIFICATION", updatedById: actor.id },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "REQUIREMENT_UPDATED",
    entityType: "ApplicationRequirement",
    entityId: requirement.id,
    metadata: { applicationId, label: trimmed, status: "NEEDS_VERIFICATION", added: true },
  });

  return requirement;
}

/** Fail-closed by construction: `status` is validated against the fixed four-state union above — never freeform, never silently defaulted to RECEIVED. */
export async function updateRequirementStatus(
  requirementId: string,
  status: RequirementStatus,
  note: string | null,
  actor: SessionUser,
) {
  assertAdmissionsStaffOrAdmin(actor);
  if (!REQUIREMENT_STATUSES.includes(status)) {
    throw new ApplicationStateError("Invalid requirement status.");
  }

  const requirement = await db.applicationRequirement.findUnique({ where: { id: requirementId } });
  if (!requirement) throw new ApplicationStateError("Requirement not found.");

  const updated = await db.applicationRequirement.update({
    where: { id: requirementId },
    data: { status, note: note?.trim() || null, updatedById: actor.id },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "REQUIREMENT_UPDATED",
    entityType: "ApplicationRequirement",
    entityId: requirementId,
    metadata: { applicationId: requirement.applicationId, label: requirement.label, status },
  });

  return updated;
}

const DECISION_ACTIONS = {
  ACCEPTED: "APPLICATION_ACCEPTED",
  DENIED: "APPLICATION_DENIED",
  WAITLISTED: "APPLICATION_WAITLISTED",
  DEFERRED: "APPLICATION_DEFERRED",
} as const;
export type Decision = keyof typeof DECISION_ACTIONS;

/**
 * UNDER_REVIEW -> ACCEPTED | DENIED | WAITLISTED | DEFERRED. Admissions
 * Staff/Administrator only — Program Director has no decision authority
 * in this slice (see this module's header comment). No requirement-
 * completeness gate is enforced here: this milestone does not invent an
 * automated "all requirements RECEIVED" acceptance rule (explicitly out
 * of scope — "no automated acceptance decisions"), so a human reviewer
 * always makes the call, informed by (never blocked by) the checklist.
 */
export async function recordDecision(applicationId: string, decision: Decision, reason: string | null, actor: SessionUser) {
  assertAdmissionsStaffOrAdmin(actor);
  const application = await db.application.findUnique({ where: { id: applicationId } });
  if (!application) throw new ApplicationStateError("Application not found.");
  if (application.status !== "UNDER_REVIEW") {
    throw new ApplicationStateError("Only an Application Under Review can receive a Decision.");
  }

  const updated = await db.application.update({
    where: { id: applicationId },
    data: {
      status: decision,
      decisionReason: reason?.trim() || null,
      decisionAt: new Date(),
      decidedById: actor.id,
    },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: DECISION_ACTIONS[decision],
    entityType: "Application",
    entityId: applicationId,
    metadata: { applicantId: application.applicantId, programId: application.programId, reason: reason?.trim() || null },
  });

  return updated;
}

/** Admissions Staff/Administrator only — the minimum needed to enroll into a Cohort, no capacity-management engine. */
export async function assignCohort(applicationId: string, cohortId: string, actor: SessionUser) {
  assertAdmissionsStaffOrAdmin(actor);
  const application = await db.application.findUnique({ where: { id: applicationId } });
  if (!application) throw new ApplicationStateError("Application not found.");
  if (application.status !== "ACCEPTED" && application.status !== "ACCEPTANCE_CONFIRMED") {
    throw new ApplicationStateError("A Cohort can only be assigned to an Accepted Application.");
  }

  const cohort = await db.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort || cohort.programId !== application.programId) {
    throw new ApplicationStateError("That Cohort does not belong to this Application's Program.");
  }

  const updated = await db.application.update({ where: { id: applicationId }, data: { cohortId } });

  await recordAuditEvent({
    actorId: actor.id,
    action: "APPLICATION_COHORT_ASSIGNED",
    entityType: "Application",
    entityId: applicationId,
    metadata: { cohortId },
  });

  return updated;
}

// ── Applicant-facing: respond to offer ──────────────────────────────────

/** ACCEPTED -> ACCEPTANCE_CONFIRMED. Applicant only — this is their own decision to accept the offer. */
export async function confirmOffer(applicationId: string, actor: SessionUser) {
  const application = await db.application.findUnique({ where: { id: applicationId } });
  if (!application) throw new ApplicationStateError("Application not found.");
  assertApplicant(actor, application.applicantId);
  if (application.status !== "ACCEPTED") {
    throw new ApplicationStateError("Only an Accepted Application's offer can be confirmed.");
  }

  const updated = await db.application.update({ where: { id: applicationId }, data: { status: "ACCEPTANCE_CONFIRMED" } });

  await recordAuditEvent({
    actorId: actor.id,
    action: "OFFER_CONFIRMED",
    entityType: "Application",
    entityId: applicationId,
  });

  return updated;
}

/** ACCEPTED -> ACCEPTANCE_DECLINED (terminal). Applicant only. */
export async function declineOffer(applicationId: string, actor: SessionUser) {
  const application = await db.application.findUnique({ where: { id: applicationId } });
  if (!application) throw new ApplicationStateError("Application not found.");
  assertApplicant(actor, application.applicantId);
  if (application.status !== "ACCEPTED") {
    throw new ApplicationStateError("Only an Accepted Application's offer can be declined.");
  }

  const updated = await db.application.update({ where: { id: applicationId }, data: { status: "ACCEPTANCE_DECLINED" } });

  await recordAuditEvent({
    actorId: actor.id,
    action: "OFFER_DECLINED",
    entityType: "Application",
    entityId: applicationId,
  });

  return updated;
}

// ── Enrollment handoff ───────────────────────────────────────────────────

/**
 * ACCEPTANCE_CONFIRMED -> ENROLLED. Admissions Staff/Administrator
 * only — an applicant cannot self-enroll even after confirming their
 * offer (see this module's tests for that exact boundary). Fails closed
 * unless a Cohort has already been assigned (Phase 8) — enrollment
 * cannot be created from an ineligible Application. Reuses the existing
 * `createEnrollment` (src/services/enrollment/enrollment.ts) rather than
 * a second enrollment mechanism — it already grants the STUDENT Role
 * and emits ENROLLMENT_CREATED; this function only adds the trace-back
 * link and the Application-side transition, then its own
 * ENROLLMENT_CREATED_FROM_APPLICATION event. The Application row itself
 * is never deleted or overwritten — its full history is preserved.
 */
export async function createEnrollmentFromApplication(applicationId: string, actor: SessionUser) {
  assertAdmissionsStaffOrAdmin(actor);
  const application = await db.application.findUnique({ where: { id: applicationId } });
  if (!application) throw new ApplicationStateError("Application not found.");
  if (application.status !== "ACCEPTANCE_CONFIRMED") {
    throw new ApplicationStateError("Only an Application whose offer was Confirmed can be enrolled.");
  }
  if (!application.cohortId) {
    throw new ApplicationStateError("A Cohort must be assigned before this Application can be enrolled.");
  }

  const created = await createEnrollment(
    { studentId: application.applicantId, programId: application.programId, cohortId: application.cohortId },
    actor.id,
  );

  // Re-fetched (not returned as-is from createEnrollment) so the caller
  // gets back the row actually reflecting the sourceApplicationId
  // trace-back link just set below — createEnrollment itself knows
  // nothing about Applications, per this module's "reuse, don't modify"
  // instruction.
  const enrollment = await db.enrollment.update({
    where: { id: created.id },
    data: { sourceApplicationId: applicationId },
  });
  await db.application.update({ where: { id: applicationId }, data: { status: "ENROLLED" } });

  await recordAuditEvent({
    actorId: actor.id,
    action: "ENROLLMENT_CREATED_FROM_APPLICATION",
    entityType: "Enrollment",
    entityId: enrollment.id,
    metadata: { applicationId, applicantId: application.applicantId, programId: application.programId },
  });

  return enrollment;
}

// ── Reads ────────────────────────────────────────────────────────────────

const APPLICATION_DETAIL_INCLUDE = {
  applicant: true,
  program: true,
  cohort: true,
  decidedBy: { select: { name: true } },
  requirements: { orderBy: { createdAt: "asc" as const } },
  enrollment: true,
};

export async function getApplicationById(applicationId: string, actor: SessionUser) {
  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: APPLICATION_DETAIL_INCLUDE,
  });
  if (!application) return null;
  assertReadAccess(actor, application.applicantId, application.programId);
  return application;
}

/** An Applicant's own Applications only — fails closed via assertApplicant. */
export async function listApplicationsForApplicant(applicantId: string, actor: SessionUser) {
  assertApplicant(actor, applicantId);
  return db.application.findMany({
    where: { applicantId },
    include: { program: true, requirements: true, enrollment: true },
    orderBy: { createdAt: "desc" },
  });
}

/** Admissions Staff/Administrator only — institution-wide, per ADMISSIONS_STAFF's established "institution" ROLE_SCOPE (src/domain/roles.ts, unchanged since Milestone 10). */
export async function listApplicationsForAdmissions(actor: SessionUser, status?: string) {
  assertAdmissionsStaffOrAdmin(actor);
  return db.application.findMany({
    where: status ? { status } : {},
    include: { applicant: true, program: true, requirements: true },
    orderBy: { createdAt: "asc" },
  });
}

/** Read-only for a Program Director scoped to their own Program (or Admissions Staff/Administrator, institution-wide) — Program Director has no write authority anywhere in this module. */
export async function listApplicationsForProgram(programId: string, actor: SessionUser) {
  if (
    !hasRoleForProgram(actor, "PROGRAM_DIRECTOR", programId) &&
    !hasAnyRole(actor, "ADMISSIONS_STAFF") &&
    !isAdministrator(actor)
  ) {
    throw new ApplicationAuthorizationError("You may not view this Program's Applications.");
  }
  return db.application.findMany({
    where: { programId },
    include: { applicant: true, requirements: true },
    orderBy: { createdAt: "asc" },
  });
}

/** Small helper for the Cohort-assignment control — Admissions Staff/Administrator only. */
export async function listCohortsForProgram(programId: string, actor: SessionUser) {
  assertAdmissionsStaffOrAdmin(actor);
  return db.cohort.findMany({ where: { programId }, orderBy: { name: "asc" } });
}
