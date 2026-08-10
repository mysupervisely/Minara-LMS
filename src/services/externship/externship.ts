import "server-only";
import { db } from "@/lib/db";
import { recordAuditEvent } from "@/services/audit/audit";
import { hasRoleForProgram } from "@/services/identity/rbac";
import type { SessionUser } from "@/services/identity/session";

/**
 * Clinical & Externship bounded context — Milestone 15's Externship
 * Eligibility & Placement Vertical Slice.
 *
 * Activates the already-declared CLINICAL_COORDINATOR role (see
 * src/domain/roles.ts) rather than introducing a new one, per this
 * milestone's explicit instruction. Reuses the exact approval-gate
 * shape proven three times already (Grade Approval — M10, Content
 * Approval — M13/M14): a Coordinator-owned operational lifecycle
 * (`Placement.status`) plus a separate Coordinator + Program Director
 * joint approval gate (`Placement.completionStatus`) — see the
 * Placement model's comment in prisma/schema.prisma for why these two
 * fields are deliberately never conflated.
 *
 * Authorization: unlike src/services/academic/content-workflow.ts and
 * src/services/gradebook/gradebook.ts (which rely on their caller —
 * the relevant src/app/(portal)/*\/actions.ts — to check scope before
 * calling in), every scoped function here re-derives and enforces its
 * own authorization from the caller's SessionUser directly, per this
 * milestone's explicit "enforce authorization at the service layer...
 * never rely exclusively on page-level protection" instruction. This
 * is a deliberate strengthening of the established pattern, not a
 * silent architecture change — it still funnels through the same
 * canonical `hasRoleForProgram` used everywhere else (ADR-005's "no
 * scattered checks" is about there being one implementation of a
 * check, not one call site for it), and every Server Action calling
 * into this module still performs its own page-level check first, as
 * defense in depth, not as a replacement for the check here.
 *
 * No numeric requirement (required hours, eligibility GPA, evaluation
 * score thresholds, site/preceptor qualifications) appears anywhere in
 * this module. Every place such a number would eventually be enforced
 * instead carries a Coordinator- or Program-Director-entered judgment
 * field — see prisma/schema.prisma's comments on ExternshipEligibility
 * and Placement, and
 * docs/milestones/milestone-15-externship-eligibility-placement-vertical-slice/04-externship-deep-dive.md.
 */

export class ExternshipStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExternshipStateError";
  }
}

export class ExternshipAuthorizationError extends Error {
  constructor(message = "You are not authorized to perform this action.") {
    super(message);
    this.name = "ExternshipAuthorizationError";
  }
}

/** Coordinator-only write scope for a Program (Administrator always passes, via hasRoleForProgram's own bypass). */
function assertCoordinatorForProgram(actor: SessionUser, programId: string): void {
  if (!hasRoleForProgram(actor, "CLINICAL_COORDINATOR", programId)) {
    throw new ExternshipAuthorizationError("You do not coordinate externships for this Program.");
  }
}

/** Program Director-only write scope — the second signer on Completion Verification. */
function assertProgramDirectorForProgram(actor: SessionUser, programId: string): void {
  if (!hasRoleForProgram(actor, "PROGRAM_DIRECTOR", programId)) {
    throw new ExternshipAuthorizationError("You do not oversee this Program.");
  }
}

/** Read scope shared by Coordinator and Program Director — Phase 9's "PD may review, not modify, Coordinator-only operational information." */
function assertOversightForProgram(actor: SessionUser, programId: string): void {
  if (
    hasRoleForProgram(actor, "CLINICAL_COORDINATOR", programId) ||
    hasRoleForProgram(actor, "PROGRAM_DIRECTOR", programId)
  ) {
    return;
  }
  throw new ExternshipAuthorizationError("You do not have oversight of this Program's externship activity.");
}

/** A Student may always see their own record; anyone with oversight of the Program may see it too. Fails closed otherwise — a Student may never reach another Student's record this way. */
function assertStudentOrOversight(actor: SessionUser, studentId: string, programId: string): void {
  if (actor.id === studentId) return;
  try {
    assertOversightForProgram(actor, programId);
    return;
  } catch {
    // fall through to the shared denial below
  }
  throw new ExternshipAuthorizationError("You may not view this Student's externship information.");
}

// ── Clinical Sites ──────────────────────────────────────────────────────

export interface CreateClinicalSiteInput {
  programId: string;
  name: string;
  employerName: string;
  contactName?: string;
  contactInfo?: string;
  capacity?: number;
}

export async function createClinicalSite(input: CreateClinicalSiteInput, actor: SessionUser) {
  assertCoordinatorForProgram(actor, input.programId);

  const site = await db.clinicalSite.create({
    data: {
      programId: input.programId,
      name: input.name,
      employerName: input.employerName,
      contactName: input.contactName,
      contactInfo: input.contactInfo,
      capacity: input.capacity ?? 1,
      status: "PENDING",
      createdById: actor.id,
    },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "CLINICAL_SITE_CREATED",
    entityType: "ClinicalSite",
    entityId: site.id,
    metadata: { programId: input.programId, name: input.name, employerName: input.employerName },
  });

  return site;
}

const SITE_STATUSES = ["PENDING", "ACTIVE", "INACTIVE"] as const;
export type ClinicalSiteStatus = (typeof SITE_STATUSES)[number];

export async function updateClinicalSiteStatus(
  siteId: string,
  status: ClinicalSiteStatus,
  actor: SessionUser,
) {
  const site = await db.clinicalSite.findUnique({ where: { id: siteId } });
  if (!site) throw new ExternshipStateError("Clinical Site not found.");
  assertCoordinatorForProgram(actor, site.programId);
  if (!SITE_STATUSES.includes(status)) {
    throw new ExternshipStateError("Invalid Clinical Site status.");
  }

  const updated = await db.clinicalSite.update({ where: { id: siteId }, data: { status } });

  await recordAuditEvent({
    actorId: actor.id,
    action: "CLINICAL_SITE_STATUS_CHANGED",
    entityType: "ClinicalSite",
    entityId: siteId,
    metadata: { from: site.status, to: status },
  });

  return updated;
}

export async function listClinicalSitesForProgram(programId: string, actor: SessionUser) {
  assertOversightForProgram(actor, programId);
  return db.clinicalSite.findMany({ where: { programId }, orderBy: { createdAt: "asc" } });
}

// ── Eligibility ──────────────────────────────────────────────────────────
//
// Per the Externship Deep Dive item 1: there is no automated eligibility
// rule engine, and this module never invents one. `determineEligibility`
// records a Coordinator's own judgment; `getEligibilityForStudent`
// returns a synthetic "Requirements Pending Verification" result — never
// a fabricated Eligible/Blocked default — when no determination has ever
// been recorded.

const ELIGIBILITY_STATUSES = ["ELIGIBLE", "NOT_YET_ELIGIBLE", "BLOCKED"] as const;
export type DeterminedEligibilityStatus = (typeof ELIGIBILITY_STATUSES)[number];
export type EligibilityStatus = DeterminedEligibilityStatus | "REQUIREMENTS_PENDING_VERIFICATION";

export interface EligibilityView {
  status: EligibilityStatus;
  notes: string | null;
  determinedAt: Date | null;
  determinedByName: string | null;
}

export async function determineEligibility(
  input: { studentId: string; programId: string; status: DeterminedEligibilityStatus; notes?: string },
  actor: SessionUser,
) {
  assertCoordinatorForProgram(actor, input.programId);
  if (!ELIGIBILITY_STATUSES.includes(input.status)) {
    throw new ExternshipStateError("Invalid eligibility status.");
  }

  const record = await db.externshipEligibility.upsert({
    where: { studentId_programId: { studentId: input.studentId, programId: input.programId } },
    update: {
      status: input.status,
      notes: input.notes?.trim() || null,
      determinedById: actor.id,
      determinedAt: new Date(),
    },
    create: {
      studentId: input.studentId,
      programId: input.programId,
      status: input.status,
      notes: input.notes?.trim() || null,
      determinedById: actor.id,
    },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "ELIGIBILITY_DETERMINED",
    entityType: "ExternshipEligibility",
    entityId: record.id,
    metadata: { studentId: input.studentId, programId: input.programId, status: input.status },
  });

  return record;
}

/** Fail-closed like every other scoped read here — a Student may only ask about themself; a Coordinator/Program Director only about their own Program. */
export async function getEligibilityForStudent(
  studentId: string,
  programId: string,
  actor: SessionUser,
): Promise<EligibilityView> {
  assertStudentOrOversight(actor, studentId, programId);

  const row = await db.externshipEligibility.findUnique({
    where: { studentId_programId: { studentId, programId } },
    include: { determinedBy: { select: { name: true } } },
  });
  if (!row) {
    return {
      status: "REQUIREMENTS_PENDING_VERIFICATION",
      notes: null,
      determinedAt: null,
      determinedByName: null,
    };
  }
  return {
    status: row.status as DeterminedEligibilityStatus,
    notes: row.notes,
    determinedAt: row.determinedAt,
    determinedByName: row.determinedBy.name,
  };
}

/** Every actively-enrolled Student in a Program, with their current eligibility determination (or its absence) — the Coordinator's Eligibility Queue. */
export async function listEligibilityQueueForProgram(programId: string, actor: SessionUser) {
  assertOversightForProgram(actor, programId);

  const [enrollments, eligibilities] = await Promise.all([
    db.enrollment.findMany({
      where: { programId, status: "ACTIVE" },
      include: { student: true },
      orderBy: { createdAt: "asc" },
    }),
    db.externshipEligibility.findMany({ where: { programId } }),
  ]);
  const byStudent = new Map(eligibilities.map((e) => [e.studentId, e]));

  return enrollments.map((enrollment) => ({
    student: enrollment.student,
    eligibility: byStudent.get(enrollment.studentId) ?? null,
  }));
}

// ── Placements ───────────────────────────────────────────────────────────

export interface RequestPlacementInput {
  studentId: string;
  programId: string;
  clinicalSiteId: string;
  preceptorName?: string;
  preceptorContact?: string;
}

/** Student eligibility -> Site selection -> Placement creation. Mirrors Milestone 14's "at most one non-terminal record in flight" rule, applied here to a Student's Placements within a Program. */
export async function requestPlacement(input: RequestPlacementInput, actor: SessionUser) {
  assertCoordinatorForProgram(actor, input.programId);

  const site = await db.clinicalSite.findUnique({ where: { id: input.clinicalSiteId } });
  if (!site || site.programId !== input.programId) {
    throw new ExternshipStateError("Clinical Site not found in this Program.");
  }

  const existingActive = await db.placement.findFirst({
    where: {
      studentId: input.studentId,
      programId: input.programId,
      status: { in: ["REQUESTED", "APPROVED", "ACTIVE"] },
    },
  });
  if (existingActive) {
    throw new ExternshipStateError(
      "This Student already has an in-progress Placement for this Program — placement conflicts are not supported in this vertical slice.",
    );
  }

  const placement = await db.placement.create({
    data: {
      studentId: input.studentId,
      programId: input.programId,
      clinicalSiteId: input.clinicalSiteId,
      preceptorName: input.preceptorName,
      preceptorContact: input.preceptorContact,
      status: "REQUESTED",
      requestedById: actor.id,
    },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "PLACEMENT_CREATED",
    entityType: "Placement",
    entityId: placement.id,
    metadata: { studentId: input.studentId, programId: input.programId, clinicalSiteId: input.clinicalSiteId },
  });

  return placement;
}

async function transitionPlacementStatus(
  placementId: string,
  allowedFrom: string[],
  to: string,
  actor: SessionUser,
) {
  const placement = await db.placement.findUnique({ where: { id: placementId } });
  if (!placement) throw new ExternshipStateError("Placement not found.");
  assertCoordinatorForProgram(actor, placement.programId);
  if (!allowedFrom.includes(placement.status)) {
    throw new ExternshipStateError(
      `Only a Placement in ${allowedFrom.join(" or ")} status can move to ${to}.`,
    );
  }

  const updated = await db.placement.update({ where: { id: placementId }, data: { status: to } });

  await recordAuditEvent({
    actorId: actor.id,
    action: "PLACEMENT_STATUS_CHANGED",
    entityType: "Placement",
    entityId: placementId,
    metadata: { from: placement.status, to },
  });

  return updated;
}

/** Site approval — Coordinator-only in this narrow slice (see the Externship Deep Dive's #2). */
export async function approvePlacement(placementId: string, actor: SessionUser) {
  return transitionPlacementStatus(placementId, ["REQUESTED"], "APPROVED", actor);
}

/** Student Assignment / Orientation collapse into this single transition for this slice — orientation tracking itself is out of scope. */
export async function activatePlacement(placementId: string, actor: SessionUser) {
  return transitionPlacementStatus(placementId, ["APPROVED"], "ACTIVE", actor);
}

/** The Coordinator's single "hours complete" attestation, standing in for the itemized Hours Log the Deep Dive defers — no specific hour count is recorded or enforced anywhere in this codebase. */
export async function attestHoursComplete(placementId: string, actor: SessionUser) {
  const placement = await db.placement.findUnique({ where: { id: placementId } });
  if (!placement) throw new ExternshipStateError("Placement not found.");
  assertCoordinatorForProgram(actor, placement.programId);
  if (placement.status !== "ACTIVE") {
    throw new ExternshipStateError("Hours can only be attested for an Active Placement.");
  }

  const updated = await db.placement.update({
    where: { id: placementId },
    data: { hoursAttestedAt: new Date(), hoursAttestedById: actor.id },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "PLACEMENT_STATUS_CHANGED",
    entityType: "Placement",
    entityId: placementId,
    metadata: { event: "hours_attested" },
  });

  return updated;
}

// ── Evaluations ──────────────────────────────────────────────────────────

const EVALUATION_TYPES = ["MIDPOINT", "FINAL"] as const;
export type EvaluationType = (typeof EVALUATION_TYPES)[number];
const EVALUATION_OUTCOMES = ["SATISFACTORY", "CONCERNS_IDENTIFIED"] as const;
export type EvaluationOutcome = (typeof EVALUATION_OUTCOMES)[number];

export interface RecordEvaluationInput {
  placementId: string;
  type: EvaluationType;
  content: string;
  outcome?: EvaluationOutcome;
}

/**
 * Covers both Midpoint and Final Evaluation — the model is identical
 * for both (per the Deep Dive's #13/#14), so this single function
 * serves both rather than duplicating near-identical code. Always
 * recorded by the Coordinator, on the Employer/Preceptor's behalf — see
 * the Evaluation model's schema comment for why.
 */
export async function recordEvaluation(input: RecordEvaluationInput, actor: SessionUser) {
  const placement = await db.placement.findUnique({ where: { id: input.placementId } });
  if (!placement) throw new ExternshipStateError("Placement not found.");
  assertCoordinatorForProgram(actor, placement.programId);
  if (placement.status !== "ACTIVE") {
    throw new ExternshipStateError("Evaluations can only be recorded for an Active Placement.");
  }
  if (!EVALUATION_TYPES.includes(input.type)) {
    throw new ExternshipStateError("Invalid evaluation type.");
  }
  const content = input.content.trim();
  if (!content) {
    throw new ExternshipStateError("Evaluation content is required.");
  }
  const outcome = input.outcome ?? "SATISFACTORY";
  if (!EVALUATION_OUTCOMES.includes(outcome)) {
    throw new ExternshipStateError("Invalid evaluation outcome.");
  }

  const evaluation = await db.evaluation.create({
    data: {
      placementId: input.placementId,
      type: input.type,
      content,
      outcome,
      recordedById: actor.id,
    },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "EVALUATION_CREATED",
    entityType: "Evaluation",
    entityId: evaluation.id,
    metadata: { placementId: input.placementId, type: input.type, outcome },
  });

  return evaluation;
}

// ── Completion Verification ─────────────────────────────────────────────
//
// The exact same shape as LessonVersion/AssessmentVersion's
// DRAFT-analogous "NOT_SUBMITTED" -> SUBMITTED -> APPROVED-analogous
// "VERIFIED" state machine, with a required-reason return loop — see
// src/services/academic/content-workflow.ts, reused here for a fourth
// approval gate rather than reinvented, per this milestone's explicit
// "do not create a second workflow engine" instruction (extended in
// spirit to "do not invent a second shape for the same pattern").

/** Coordinator submits a Placement's completion for Program Director review. Requires a Final Evaluation and an hours-complete attestation to already exist — structural gates, never a specific number. */
export async function submitCompletionForVerification(placementId: string, actor: SessionUser) {
  const placement = await db.placement.findUnique({
    where: { id: placementId },
    include: { evaluations: true },
  });
  if (!placement) throw new ExternshipStateError("Placement not found.");
  assertCoordinatorForProgram(actor, placement.programId);
  if (placement.status !== "ACTIVE") {
    throw new ExternshipStateError("Only an Active Placement can be submitted for Completion Verification.");
  }
  if (!["NOT_SUBMITTED", "RETURNED"].includes(placement.completionStatus)) {
    throw new ExternshipStateError("This Placement's completion has already been submitted or verified.");
  }
  if (!placement.evaluations.some((e) => e.type === "FINAL")) {
    throw new ExternshipStateError("Record a Final Evaluation before submitting for Completion Verification.");
  }
  if (!placement.hoursAttestedAt) {
    throw new ExternshipStateError(
      "Attest that required hours are complete before submitting for Completion Verification.",
    );
  }

  const updated = await db.placement.update({
    where: { id: placementId },
    data: {
      completionStatus: "SUBMITTED",
      completionReturnReason: null,
      completionSubmittedAt: new Date(),
      completionSubmittedById: actor.id,
    },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "EXTERNSHIP_COMPLETION_SUBMITTED",
    entityType: "Placement",
    entityId: placementId,
    metadata: {},
  });

  return updated;
}

/**
 * Program Director verifies completion — the joint Coordinator +
 * Program Director authority the Externship Deep Dive (#15) names as
 * the least architecturally novel part of this whole slice. This is
 * the one place `completionStatus` and `status` are linked: verifying
 * completion is what finally moves the Placement itself to COMPLETED.
 */
export async function verifyCompletion(placementId: string, actor: SessionUser) {
  const placement = await db.placement.findUnique({ where: { id: placementId } });
  if (!placement) throw new ExternshipStateError("Placement not found.");
  assertProgramDirectorForProgram(actor, placement.programId);
  if (placement.completionStatus !== "SUBMITTED") {
    throw new ExternshipStateError("Only a submitted Completion can be verified.");
  }

  const updated = await db.placement.update({
    where: { id: placementId },
    data: {
      completionStatus: "VERIFIED",
      completionVerifiedAt: new Date(),
      completionVerifiedById: actor.id,
      status: "COMPLETED",
    },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "EXTERNSHIP_COMPLETION_VERIFIED",
    entityType: "Placement",
    entityId: placementId,
    metadata: {},
  });

  return updated;
}

/** The remediation loop — a required reason, mirroring returnContentToDraft exactly. The Placement itself stays Active; only completionStatus moves, so a Coordinator can address the concern and resubmit. */
export async function returnCompletion(placementId: string, reason: string, actor: SessionUser) {
  const placement = await db.placement.findUnique({ where: { id: placementId } });
  if (!placement) throw new ExternshipStateError("Placement not found.");
  assertProgramDirectorForProgram(actor, placement.programId);
  if (placement.completionStatus !== "SUBMITTED") {
    throw new ExternshipStateError("Only a submitted Completion can be returned.");
  }
  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    throw new ExternshipStateError("A reason is required when returning a Completion for further work.");
  }

  const updated = await db.placement.update({
    where: { id: placementId },
    data: { completionStatus: "RETURNED", completionReturnReason: trimmedReason },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "EXTERNSHIP_COMPLETION_RETURNED",
    entityType: "Placement",
    entityId: placementId,
    metadata: { reason: trimmedReason },
  });

  return updated;
}

// ── Program-scoped reads ────────────────────────────────────────────────

const PLACEMENT_DETAIL_INCLUDE = {
  student: true,
  clinicalSite: true,
  evaluations: { orderBy: { createdAt: "asc" as const } },
  requestedBy: { select: { name: true } },
  hoursAttestedBy: { select: { name: true } },
  completionSubmittedBy: { select: { name: true } },
  completionVerifiedBy: { select: { name: true } },
};

/** Every Placement in a Program — the Coordinator's/Program Director's Placements queue. */
export async function listPlacementsForProgram(programId: string, actor: SessionUser) {
  assertOversightForProgram(actor, programId);
  return db.placement.findMany({
    where: { programId },
    include: PLACEMENT_DETAIL_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

/** Every Placement awaiting Program Director Completion Verification — the Program Director's review queue (Phase 9). */
export async function listCompletionVerificationQueueForProgram(programId: string, actor: SessionUser) {
  assertOversightForProgram(actor, programId);
  return db.placement.findMany({
    where: { programId, completionStatus: "SUBMITTED" },
    include: PLACEMENT_DETAIL_INCLUDE,
    orderBy: { completionSubmittedAt: "asc" },
  });
}

/** A single Placement with full detail — fails closed for anyone outside the Student themself or that Program's Coordinator/Program Director/Administrator. */
export async function getPlacementById(placementId: string, actor: SessionUser) {
  const placement = await db.placement.findUnique({
    where: { id: placementId },
    include: PLACEMENT_DETAIL_INCLUDE,
  });
  if (!placement) return null;
  assertStudentOrOversight(actor, placement.studentId, placement.programId);
  return placement;
}

/** Every Placement a specific Student holds in a Program, newest first — used by both the Coordinator's per-Student view and the Student's own "My Externship" page. */
export async function listPlacementsForStudent(studentId: string, programId: string, actor: SessionUser) {
  assertStudentOrOversight(actor, studentId, programId);
  return db.placement.findMany({
    where: { studentId, programId },
    include: PLACEMENT_DETAIL_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

/** The Student's most recent Placement in a Program — what the read-only "My Externship" view shows as the current status. */
export async function getCurrentPlacementForStudent(
  studentId: string,
  programId: string,
  actor: SessionUser,
) {
  assertStudentOrOversight(actor, studentId, programId);
  return db.placement.findFirst({
    where: { studentId, programId },
    include: PLACEMENT_DETAIL_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}
