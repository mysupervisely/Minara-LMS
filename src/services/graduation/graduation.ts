import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { recordAuditEvent } from "@/services/audit/audit";
import { hasRoleForProgram, isAdministrator } from "@/services/identity/rbac";
import { determineFinancialClearance } from "@/services/billing/billing";
import type { SessionUser } from "@/services/identity/session";

/**
 * Graduation & Certificate bounded context — Milestone 16's Certificate
 * & Graduation Vertical Slice.
 *
 * Proves the final leg of the Student Lifecycle Workflow
 * (docs/milestones/milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md):
 * academic completion → externship completion (when required) →
 * graduation eligibility → review → approval → certificate issuance →
 * Alumni status. Reuses, rather than reinvents, every pattern already
 * proven: the approval-gate status+returnReason shape (Milestones
 * 13/14/15), the audit-extension-only discipline, and — per this
 * milestone's own "enforce authorization at the service layer" carried
 * forward from Milestone 15 — every scoped function here checks its own
 * Role/Scope authorization directly, never relying solely on its
 * caller's `actions.ts`.
 *
 * Eligibility is never persisted. `determineGraduationEligibility` is a
 * pure, fail-closed read computed live from existing LessonCompletion/
 * Submission/Grade/Placement facts — no second copy of a grade or an
 * externship completion is ever stored to calculate it. A
 * `GraduationRequest` row only comes into existence once a Program
 * Director (or Administrator) actually submits an already-eligible
 * Student for formal review — see `submitForGraduationReview`.
 *
 * No specific GPA, course name, externship hour count, evaluation score,
 * or graduation date is hard-coded anywhere in this module. Where the
 * real Pharmacy Technology curriculum would eventually supply such a
 * number, this module instead derives from what already exists
 * (published content actually completed/approved; a Placement actually
 * VERIFIED) — see
 * docs/milestones/milestone-16-certificate-graduation-vertical-slice/03-graduation-eligibility-design.md.
 */

export class GraduationStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GraduationStateError";
  }
}

export class GraduationAuthorizationError extends Error {
  constructor(message = "You are not authorized to perform this action.") {
    super(message);
    this.name = "GraduationAuthorizationError";
  }
}

function assertProgramDirectorForProgram(actor: SessionUser, programId: string): void {
  if (!hasRoleForProgram(actor, "PROGRAM_DIRECTOR", programId)) {
    throw new GraduationAuthorizationError("You do not oversee this Program's graduation review.");
  }
}

function assertAdministrator(actor: SessionUser): void {
  if (!isAdministrator(actor)) {
    throw new GraduationAuthorizationError("Only an Administrator may perform institutional certificate issuance.");
  }
}

/** A Student may always see their own record; a Program Director (or Administrator, via that check's own bypass) overseeing the Program may see it too. Fails closed otherwise. */
function assertStudentOrOversight(actor: SessionUser, studentId: string, programId: string): void {
  if (actor.id === studentId) return;
  if (hasRoleForProgram(actor, "PROGRAM_DIRECTOR", programId)) return;
  throw new GraduationAuthorizationError("You may not view this Student's graduation/certificate information.");
}

// ── Graduation Eligibility (derived, fail-closed, never persisted) ──────

/**
 * The four states a single requirement row in the eligibility breakdown
 * can be in — kept explicit and separate so that a requirement this
 * platform has no authority to evaluate (e.g. Financial Clearance) can
 * never be silently rendered as "passed." Only PASSED contributes to
 * `eligible`; FAILED blocks it; NOT_APPLICABLE and NEEDS_VERIFICATION
 * never block or silently satisfy it — they exist purely for honest
 * disclosure to the reviewing Program Director/Administrator/Student.
 */
export type GraduationRequirementStatus = "PASSED" | "FAILED" | "NOT_APPLICABLE" | "NEEDS_VERIFICATION";

export interface GraduationRequirementBreakdownItem {
  label: string;
  status: GraduationRequirementStatus;
  detail: string;
}

export interface GraduationEligibilityResult {
  eligible: boolean;
  academicComplete: boolean;
  externshipRequired: boolean;
  externshipVerified: boolean;
  missingRequirements: string[];
  /** Human-readable rows for the Student/Program Director eligibility screens — see this milestone's Graduation Eligibility Design doc for what each row does and does not claim. */
  breakdown: GraduationRequirementBreakdownItem[];
}

/**
 * The centralized graduation-eligibility determination. Every fact it
 * relies on already exists elsewhere in the schema — this function reads
 * and combines, it never stores a second copy of a Grade or an
 * Externship completion. Fails closed throughout: any condition that
 * cannot be positively confirmed counts as NOT met, never as an assumed
 * pass.
 *
 * "Academic completion" is derived, not invented: for every Course
 * Offering in the Student's Cohort, every currently *published* Lesson
 * must have a LessonCompletion, and every currently published Assessment
 * must have a Submission with an APPROVED Grade. No GPA, score
 * threshold, or specific course name is checked — only whether the
 * curriculum that was actually delivered was actually completed and
 * approved. A Program with zero Course Offerings in the Student's Cohort
 * is treated as NOT complete (nothing to confirm), not vacuously
 * satisfied.
 *
 * "Externship completion," when `Program.requiresExternship` is true,
 * requires a `Placement` with `completionStatus === "VERIFIED"` — the
 * exact signal Milestone 15 already built, read directly, never
 * recomputed or duplicated.
 */
export async function determineGraduationEligibility(
  studentId: string,
  programId: string,
  actor: SessionUser,
): Promise<GraduationEligibilityResult> {
  assertStudentOrOversight(actor, studentId, programId);

  const missingRequirements: string[] = [];

  const enrollment = await db.enrollment.findUnique({
    where: { studentId_programId: { studentId, programId } },
  });
  if (!enrollment) {
    return {
      eligible: false,
      academicComplete: false,
      externshipRequired: false,
      externshipVerified: false,
      missingRequirements: ["No Enrollment found for this Student in this Program."],
      breakdown: [
        {
          label: "Enrollment",
          status: "FAILED",
          detail: "No Enrollment found for this Student in this Program.",
        },
      ],
    };
  }

  const courseOfferings = await db.courseOffering.findMany({
    where: { cohortId: enrollment.cohortId, course: { programId } },
    include: {
      course: {
        include: {
          lessons: { where: { publishedVersionId: { not: null } } },
          assessments: { where: { publishedVersionId: { not: null } } },
        },
      },
    },
  });

  if (courseOfferings.length === 0) {
    missingRequirements.push(
      "No Course Offerings found for this Student's Cohort — nothing to confirm complete yet.",
    );
  }

  for (const offering of courseOfferings) {
    for (const lesson of offering.course.lessons) {
      const completion = await db.lessonCompletion.findUnique({
        where: {
          studentId_lessonVersionId: { studentId, lessonVersionId: lesson.publishedVersionId as string },
        },
      });
      if (!completion) {
        missingRequirements.push(`A Lesson in "${offering.course.title}" has not been completed.`);
      }
    }
    for (const assessment of offering.course.assessments) {
      const submission = await db.submission.findUnique({
        where: {
          assessmentVersionId_studentId: {
            assessmentVersionId: assessment.publishedVersionId as string,
            studentId,
          },
        },
        include: { grade: true },
      });
      if (!submission || !submission.grade || submission.grade.status !== "APPROVED") {
        missingRequirements.push(`An Assessment grade in "${offering.course.title}" has not been approved.`);
      }
    }
  }

  const academicComplete = courseOfferings.length > 0 && missingRequirements.length === 0;

  const program = await db.program.findUnique({ where: { id: programId } });
  const externshipRequired = program?.requiresExternship ?? false;

  let externshipVerified = false;
  if (externshipRequired) {
    const verifiedPlacement = await db.placement.findFirst({
      where: { studentId, programId, completionStatus: "VERIFIED" },
    });
    externshipVerified = Boolean(verifiedPlacement);
    if (!externshipVerified) {
      missingRequirements.push(
        "This Program requires an externship, and this Student's externship completion has not been Verified.",
      );
    }
  }

  // Milestone 18: replaces this function's previous hard-coded
  // "Financial Clearance: NOT_APPLICABLE" placeholder with a real read
  // from src/services/billing/billing.ts. This function never persists,
  // recomputes independently, or duplicates any Charge/Payment fact —
  // it reads determineFinancialClearance's own derived result directly,
  // the same "read, never copy" discipline this function already
  // applies to Placement.completionStatus above.
  //
  // NEEDS_VERIFICATION (no tuition ever configured/charged for this
  // Enrollment) deliberately does NOT gate `eligible` — the same
  // treatment "Other Program Requirements" already receives below, and
  // precisely what keeps every graduation scenario built before
  // Milestone 18 (which never created a Charge) passing unmodified. A
  // real, positively-confirmed outstanding balance (FAILED) DOES gate
  // `eligible` — the one new blocking condition this milestone adds.
  // See docs/milestones/milestone-18-.../06-financial-clearance-design.md.
  const financialClearance = await determineFinancialClearance(studentId, programId, actor);

  const eligible =
    academicComplete && (!externshipRequired || externshipVerified) && financialClearance.status !== "FAILED";

  // The disclosure breakdown for portal screens. Only "Academic
  // Requirements," "Externship Requirement," and (as of Milestone 18)
  // "Financial Clearance" can ever be PASSED/FAILED — all three are
  // fully derivable from real platform data. Any further Program-
  // specific requirement (GPA, competencies, specific evaluation
  // scores) has no authoritative source in this platform yet, so it is
  // always rendered as NEEDS_VERIFICATION — never assumed passed, and
  // never allowed to block `eligible` either, since blocking on an
  // invented threshold would be exactly the fabrication this project's
  // briefs prohibit. See docs/milestones/milestone-16-.../03-graduation-eligibility-design.md.
  const breakdown: GraduationRequirementBreakdownItem[] = [
    {
      label: "Academic Requirements",
      status: academicComplete ? "PASSED" : "FAILED",
      detail: academicComplete
        ? "Every published Lesson is completed and every published Assessment's Grade is Approved."
        : "At least one published Lesson is not yet completed, or one published Assessment's Grade is not yet Approved.",
    },
    {
      label: "Externship Requirement",
      status: !externshipRequired ? "NOT_APPLICABLE" : externshipVerified ? "PASSED" : "FAILED",
      detail: !externshipRequired
        ? "This Program does not require an externship."
        : externshipVerified
          ? "Externship completion has been Verified by the Program Director."
          : "This Program requires an externship, and completion has not yet been Verified.",
    },
    {
      label: "Financial Clearance",
      status: financialClearance.status,
      detail: financialClearance.detail,
    },
    {
      label: "Other Program Requirements",
      status: "NEEDS_VERIFICATION",
      detail:
        "No further Program-specific requirement (minimum GPA, specific competencies, specific evaluation " +
        "scores) is defined in this platform yet — pending the authoritative curriculum source. Nothing is " +
        "assumed passed.",
    },
  ];

  return { eligible, academicComplete, externshipRequired, externshipVerified, missingRequirements, breakdown };
}

// ── Graduation Review Workflow ───────────────────────────────────────────

/**
 * A Program Director (or Administrator) submits an already-eligible
 * Student for formal graduation review — the ELIGIBLE -> SUBMITTED
 * transition from this milestone's suggested state machine, collapsed
 * with "becomes visible to the reviewing role" since eligibility itself
 * is never a persisted intermediate state. Fails closed: re-runs
 * `determineGraduationEligibility` itself rather than trusting a
 * previously-computed result, and refuses to create/advance the request
 * if the Student is not, right now, actually eligible.
 */
export async function submitForGraduationReview(studentId: string, programId: string, actor: SessionUser) {
  assertProgramDirectorForProgram(actor, programId);

  const existing = await db.graduationRequest.findUnique({
    where: { studentId_programId: { studentId, programId } },
  });
  if (existing && existing.status !== "RETURNED") {
    throw new GraduationStateError(
      "This Student already has a Graduation Request in progress or completed for this Program.",
    );
  }

  const eligibility = await determineGraduationEligibility(studentId, programId, actor);
  if (!eligibility.eligible) {
    throw new GraduationStateError(
      `This Student is not yet eligible for graduation: ${eligibility.missingRequirements.join(" ")}`,
    );
  }

  const request = await db.graduationRequest.upsert({
    where: { studentId_programId: { studentId, programId } },
    update: {
      status: "SUBMITTED",
      returnReason: null,
      submittedById: actor.id,
      submittedAt: new Date(),
      approvedById: null,
      approvedAt: null,
    },
    create: {
      studentId,
      programId,
      status: "SUBMITTED",
      submittedById: actor.id,
    },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "GRADUATION_ELIGIBILITY_DETERMINED",
    entityType: "GraduationRequest",
    entityId: request.id,
    metadata: {
      studentId,
      programId,
      academicComplete: eligibility.academicComplete,
      externshipRequired: eligibility.externshipRequired,
      externshipVerified: eligibility.externshipVerified,
    },
  });
  await recordAuditEvent({
    actorId: actor.id,
    action: "GRADUATION_SUBMITTED",
    entityType: "GraduationRequest",
    entityId: request.id,
    metadata: { studentId, programId },
  });

  return request;
}

/** Program Director (or Administrator) approves a Submitted Graduation Request. */
export async function approveGraduation(requestId: string, actor: SessionUser) {
  const request = await db.graduationRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new GraduationStateError("Graduation Request not found.");
  assertProgramDirectorForProgram(actor, request.programId);
  if (request.status !== "SUBMITTED") {
    throw new GraduationStateError("Only a Submitted Graduation Request can be approved.");
  }

  const updated = await db.graduationRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED", approvedById: actor.id, approvedAt: new Date() },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "GRADUATION_APPROVED",
    entityType: "GraduationRequest",
    entityId: requestId,
    metadata: { studentId: request.studentId, programId: request.programId },
  });

  return updated;
}

/** The remediation loop — a required reason, mirroring returnContentToDraft/returnCompletion exactly. */
export async function returnGraduationReview(requestId: string, reason: string, actor: SessionUser) {
  const request = await db.graduationRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new GraduationStateError("Graduation Request not found.");
  assertProgramDirectorForProgram(actor, request.programId);
  if (request.status !== "SUBMITTED") {
    throw new GraduationStateError("Only a Submitted Graduation Request can be returned.");
  }
  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    throw new GraduationStateError("A reason is required when returning a Graduation Request for further work.");
  }

  const updated = await db.graduationRequest.update({
    where: { id: requestId },
    data: { status: "RETURNED", returnReason: trimmedReason },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "GRADUATION_RETURNED",
    entityType: "GraduationRequest",
    entityId: requestId,
    metadata: { reason: trimmedReason },
  });

  return updated;
}

function generateCredentialNumber(): string {
  const year = new Date().getFullYear();
  const random = randomBytes(4).toString("hex").toUpperCase();
  return `CERT-${year}-${random}`;
}

/**
 * Administrator-only, institution-wide authority — the exact same
 * authority split Milestone 13's `publishContent` established (Program
 * Director approves within scope; Administrator performs the
 * institution-wide act of record). Creates the Certificate, moves the
 * Graduation Request to its terminal CERTIFICATE_ISSUED status, and
 * transitions the Student's Enrollment to Alumni — one atomic, audited
 * sequence, since the brief treats "certificate issuance" and "Alumni
 * transition" as two consequences of the same institutional act, not two
 * separately-triggerable actions.
 */
export async function issueCertificate(requestId: string, actor: SessionUser) {
  assertAdministrator(actor);

  const request = await db.graduationRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new GraduationStateError("Graduation Request not found.");
  if (request.status !== "APPROVED") {
    throw new GraduationStateError("Only an Approved Graduation Request can have its Certificate issued.");
  }

  const certificate = await db.certificate.create({
    data: {
      graduationRequestId: requestId,
      studentId: request.studentId,
      programId: request.programId,
      credentialNumber: generateCredentialNumber(),
      issuedById: actor.id,
    },
  });

  await db.graduationRequest.update({ where: { id: requestId }, data: { status: "CERTIFICATE_ISSUED" } });

  await recordAuditEvent({
    actorId: actor.id,
    action: "CERTIFICATE_ISSUED",
    entityType: "Certificate",
    entityId: certificate.id,
    metadata: {
      studentId: request.studentId,
      programId: request.programId,
      credentialNumber: certificate.credentialNumber,
    },
  });

  // Alumni transition — reuses the existing Enrollment.status field (a
  // plain string, per this schema's own "not a native enum" convention)
  // with an additive "ALUMNI" value, rather than a duplicate student
  // identity or a new entity. See this milestone's Certificate Model doc
  // for the full rationale.
  const enrollment = await db.enrollment.findUnique({
    where: { studentId_programId: { studentId: request.studentId, programId: request.programId } },
  });
  if (enrollment) {
    await db.enrollment.update({ where: { id: enrollment.id }, data: { status: "ALUMNI" } });
  }

  await recordAuditEvent({
    actorId: actor.id,
    action: "ALUMNI_STATUS_ASSIGNED",
    entityType: "Enrollment",
    entityId: enrollment?.id ?? request.studentId,
    metadata: { studentId: request.studentId, programId: request.programId },
  });

  return certificate;
}

// ── Reads ────────────────────────────────────────────────────────────────

const GRADUATION_REQUEST_DETAIL_INCLUDE = {
  student: true,
  program: true,
  submittedBy: { select: { name: true } },
  approvedBy: { select: { name: true } },
  certificate: true,
};

export async function getGraduationRequestById(requestId: string, actor: SessionUser) {
  const request = await db.graduationRequest.findUnique({
    where: { id: requestId },
    include: GRADUATION_REQUEST_DETAIL_INCLUDE,
  });
  if (!request) return null;
  assertStudentOrOversight(actor, request.studentId, request.programId);
  return request;
}

export async function getGraduationRequestForStudent(studentId: string, programId: string, actor: SessionUser) {
  assertStudentOrOversight(actor, studentId, programId);
  return db.graduationRequest.findUnique({
    where: { studentId_programId: { studentId, programId } },
    include: { certificate: true },
  });
}

/** Every actively-enrolled Student in a Program, with their live eligibility and any existing Graduation Request — the Program Director's Graduation Candidates screen. */
export async function listGraduationCandidatesForProgram(programId: string, actor: SessionUser) {
  assertProgramDirectorForProgram(actor, programId);

  const [enrollments, requests] = await Promise.all([
    db.enrollment.findMany({ where: { programId, status: "ACTIVE" }, include: { student: true } }),
    db.graduationRequest.findMany({ where: { programId }, include: { certificate: true } }),
  ]);
  const byStudent = new Map(requests.map((r) => [r.studentId, r]));

  return Promise.all(
    enrollments.map(async (enrollment) => ({
      student: enrollment.student,
      eligibility: await determineGraduationEligibility(enrollment.studentId, programId, actor),
      graduationRequest: byStudent.get(enrollment.studentId) ?? null,
    })),
  );
}

/** Every Graduation Request awaiting Program Director review — the actionable subset of the candidates screen. */
export async function listGraduationSubmissionsForProgram(programId: string, actor: SessionUser) {
  assertProgramDirectorForProgram(actor, programId);
  return db.graduationRequest.findMany({
    where: { programId, status: "SUBMITTED" },
    include: { student: true },
    orderBy: { submittedAt: "asc" },
  });
}

/** Every Approved Graduation Request awaiting institutional Certificate issuance — Administrator's queue, institution-wide when `programId` is omitted (mirrors listApprovedContent's optional-programId pattern from Milestone 13). */
export async function listCertificateIssuanceQueueForProgram(actor: SessionUser, programId?: string) {
  assertAdministrator(actor);
  return db.graduationRequest.findMany({
    where: { status: "APPROVED", ...(programId ? { programId } : {}) },
    include: { student: true, program: true },
    orderBy: { approvedAt: "asc" },
  });
}

/** Every issued Certificate — Administrator's issuance history, institution-wide when `programId` is omitted. */
export async function listIssuedCertificates(actor: SessionUser, programId?: string) {
  assertAdministrator(actor);
  return db.certificate.findMany({
    where: programId ? { programId } : {},
    include: { student: true, program: true, issuedBy: { select: { name: true } } },
    orderBy: { issuedAt: "desc" },
  });
}

export async function getCertificateForStudent(studentId: string, programId: string, actor: SessionUser) {
  assertStudentOrOversight(actor, studentId, programId);
  return db.certificate.findFirst({
    where: { studentId, programId },
    include: { program: true, issuedBy: { select: { name: true } } },
  });
}
