import "server-only";
import { db } from "@/lib/db";

/**
 * Audit service — the platform-wide implementation of ADR-005 (RBAC and
 * Audit-First Security Model) and
 * docs/milestones/milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md.
 *
 * Every module that performs a Create, Edit, or Approve action of
 * consequence calls `recordAuditEvent` — this is the platform's single
 * write path into the AuditLog table. No other module should write to
 * `db.auditLog` directly; centralizing the write path here is what makes
 * it possible to guarantee every entry is attributed and timestamped
 * consistently.
 *
 * Immutability: nothing in this module — or anywhere else in the
 * codebase — updates or deletes an AuditLog row. This is an
 * application-layer convention rather than a database-enforced one,
 * since SQLite has no row-level permission system; the Database
 * Architecture Strategy (Milestone 8, Doc 4) recommends enforcing this
 * at the database level in a production Postgres deployment. That
 * remains a documented limitation of this vertical slice — see the
 * Milestone 10 deliverables summary.
 */

export type AuditAction =
  | "USER_LOGIN"
  | "USER_LOGIN_FAILED"
  | "USER_LOGOUT"
  | "USER_CREATED"
  | "ROLE_ASSIGNED"
  | "ROLE_REVOKED"
  | "INSTITUTION_CREATED"
  | "SCHOOL_CREATED"
  | "PROGRAM_CREATED"
  | "COHORT_CREATED"
  | "COURSE_CREATED"
  | "COURSE_OFFERING_CREATED"
  | "LESSON_CREATED"
  | "ASSESSMENT_CREATED"
  | "ENROLLMENT_CREATED"
  | "LESSON_COMPLETED"
  | "ASSESSMENT_SUBMITTED"
  | "GRADE_ENTERED"
  | "GRADE_SUBMITTED_FOR_APPROVAL"
  | "GRADE_APPROVED"
  | "GRADE_REJECTED"
  | "COMPETENCY_CREATED"
  // Milestone 14 — Content Versioning Vertical Slice: the version
  // lifecycle (Draft → Submitted → Approved → Published) at Lesson
  // Version / Assessment Version granularity, per this milestone's
  // explicit request for "VERSION_CREATED, VERSION_SUBMITTED,
  // VERSION_APPROVED, VERSION_RETURNED, VERSION_PUBLISHED." These
  // supersede Milestone 13's CONTENT_SUBMITTED_FOR_REVIEW /
  // CONTENT_RETURNED_TO_DRAFT / CONTENT_APPROVED / CONTENT_PUBLISHED,
  // which were about the Lesson/Assessment row directly — now that
  // every transition operates on a specific Version instead, these
  // more precise names replace them going forward. Historical AuditLog
  // rows already written under the old names remain in the database
  // and readable exactly as before (this type only governs new
  // writes; see recordAuditEvent below) — nothing here rewrites
  // history, consistent with this milestone's own core principle.
  // VERSION_CREATED fires for every version, including a Lesson's or
  // Assessment's very first (alongside the existing LESSON_CREATED /
  // ASSESSMENT_CREATED, which marks the *parent entity's* creation —
  // two distinct, complementary facts, not a duplicate).
  | "VERSION_CREATED"
  | "VERSION_SUBMITTED"
  | "VERSION_APPROVED"
  | "VERSION_RETURNED"
  | "VERSION_PUBLISHED"
  // Milestone 15 — Externship Eligibility & Placement Vertical Slice.
  // Extends this same union rather than a second audit mechanism, per
  // this milestone's explicit instruction. ELIGIBILITY_DETERMINED
  // covers a Coordinator's eligibility determination (there is no
  // automated eligibility computation to log — see
  // src/services/externship/externship.ts). PLACEMENT_STATUS_CHANGED
  // covers every step of a Placement's own lifecycle
  // (REQUESTED→APPROVED→ACTIVE→COMPLETED); EXTERNSHIP_COMPLETION_* is
  // the separate Coordinator+Program Director joint approval gate on
  // that same Placement (see the Placement model's comment in
  // prisma/schema.prisma for why these are deliberately two distinct
  // state machines, not one).
  | "ELIGIBILITY_DETERMINED"
  | "CLINICAL_SITE_CREATED"
  | "CLINICAL_SITE_STATUS_CHANGED"
  | "PLACEMENT_CREATED"
  | "PLACEMENT_STATUS_CHANGED"
  | "EVALUATION_CREATED"
  | "EXTERNSHIP_COMPLETION_SUBMITTED"
  | "EXTERNSHIP_COMPLETION_VERIFIED"
  | "EXTERNSHIP_COMPLETION_RETURNED"
  // Milestone 16 — Certificate & Graduation Vertical Slice. Extends this
  // same union rather than a second audit mechanism, per this
  // milestone's explicit instruction. GRADUATION_ELIGIBILITY_DETERMINED
  // is emitted as part of submitForGraduationReview (the moment a live
  // eligibility computation gates a real, consequential action) — see
  // src/services/graduation/graduation.ts; eligibility itself is never
  // persisted, so there is no separate "determination" row to audit
  // independent of that submission.
  | "GRADUATION_ELIGIBILITY_DETERMINED"
  | "GRADUATION_SUBMITTED"
  | "GRADUATION_APPROVED"
  | "GRADUATION_RETURNED"
  | "CERTIFICATE_ISSUED"
  | "ALUMNI_STATUS_ASSIGNED"
  // Milestone 17 — Admissions & Enrollment Vertical Slice. Extends this
  // same union a sixth time rather than a parallel admissions audit log,
  // per this milestone's explicit instruction. Names follow this
  // milestone's own brief verbatim where given.
  // ENROLLMENT_CREATED_FROM_APPLICATION is a distinct action from the
  // pre-existing ENROLLMENT_CREATED (still emitted by createEnrollment
  // itself, unmodified) — two complementary facts on the same audit
  // trail, exactly like VERSION_CREATED alongside LESSON_CREATED above,
  // never a replacement for the original event.
  | "APPLICATION_CREATED"
  | "APPLICATION_SUBMITTED"
  | "APPLICATION_REVIEW_STARTED"
  | "APPLICATION_REOPENED_FOR_REVIEW"
  | "REQUIREMENT_UPDATED"
  | "APPLICATION_ACCEPTED"
  | "APPLICATION_DENIED"
  | "APPLICATION_WAITLISTED"
  | "APPLICATION_DEFERRED"
  | "APPLICATION_COHORT_ASSIGNED"
  | "OFFER_CONFIRMED"
  | "OFFER_DECLINED"
  | "ENROLLMENT_CREATED_FROM_APPLICATION";

export interface RecordAuditEventInput {
  /** The acting User's id, or null for a system-initiated event (e.g. a failed login for an unknown email). */
  actorId: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function recordAuditEvent(input: RecordAuditEventInput) {
  return db.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
}

export interface AuditLogEntryView {
  id: string;
  actorName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

/**
 * Reads the audit trail. Per the Permission Framework
 * (docs/milestones/milestone-2-user-roles-permission-architecture/02-permission-framework.md),
 * this is Administrator-only under current conceptual scope — callers
 * (server actions / pages) are responsible for enforcing that via
 * `requireRole` before calling this function; this function does not
 * re-check authorization itself, consistent with the centralized
 * enforcement pattern in `src/services/identity/authorization.ts`.
 */
export async function listAuditLog(limit = 100): Promise<AuditLogEntryView[]> {
  const rows = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { actor: { select: { name: true } } },
  });

  return rows.map((row) => ({
    id: row.id,
    actorName: row.actor?.name ?? null,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    metadata: row.metadata ? (JSON.parse(row.metadata) as Record<string, unknown>) : null,
    createdAt: row.createdAt,
  }));
}
