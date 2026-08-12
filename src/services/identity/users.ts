import "server-only";
import { db } from "@/lib/db";
import { hashPassword } from "@/services/identity/password";
import { recordAuditEvent } from "@/services/audit/audit";
import type { Role } from "@/domain/roles";

/**
 * User account creation and Role Assignment management.
 *
 * Per Milestone 10, Phase 3 ("User account creation") and Phase 4
 * ("Implement role-based access control"). Through Milestone 16, this
 * milestone's MVP scope decision held: "manual, Administrator-
 * provisioned Enrollment"
 * (docs/milestones/milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md),
 * so account creation happened only through the Administrator
 * foundation (see src/app/(portal)/admin), consistent with
 * docs/milestones/milestone-4-information-architecture/08-administrator-portal.md's
 * User Accounts and Role Assignments screens.
 *
 * Milestone 17 (Admissions & Enrollment Vertical Slice) adds the one
 * narrow exception `registerApplicant` below — self-service account
 * creation, scoped only to the public `/apply` flow. It creates a plain
 * User with zero Role Assignments (an "Applicant" is not a Role; see
 * prisma/schema.prisma's Admissions bounded context comment) — no
 * Role is auto-granted here, unlike `createEnrollment`'s STUDENT grant,
 * because holding an Application confers no platform access on its own.
 * Every other account-creation path in this codebase (Faculty, Program
 * Director, Administrator, Clinical Coordinator, Admissions Staff)
 * remains Administrator-provisioned, unchanged.
 *
 * `actorId` accepts `null` in `createUser`/`assignRole` specifically to
 * support bootstrapping the very first Administrator account in a
 * fresh deployment (see prisma/seed.ts), and now also a self-registering
 * Applicant — in both cases there is, by definition, no existing
 * authenticated actor to attribute the creation to. A null actor is
 * recorded as a system/self-initiated event, per
 * src/services/audit/audit.ts, never silently omitted from the trail.
 */

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  actorId: string | null;
}

export class EmailAlreadyRegisteredError extends Error {
  constructor(message = "An account with this email already exists. Try logging in instead.") {
    super(message);
    this.name = "EmailAlreadyRegisteredError";
  }
}

export async function createUser(input: CreateUserInput) {
  const passwordHash = await hashPassword(input.password);

  const user = await db.user.create({
    data: {
      email: input.email.toLowerCase().trim(),
      passwordHash,
      name: input.name,
    },
  });

  await recordAuditEvent({
    actorId: input.actorId,
    action: "USER_CREATED",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email },
  });

  return user;
}

/**
 * Milestone 17: the one public, self-service account-creation entry
 * point in this codebase — see this module's header comment. Grants no
 * Role Assignment; the created User can log in immediately (Phase 1's
 * "create an account or sign in") but has no portal access until an
 * Enrollment or a staff-assigned Role gives them one.
 */
export async function registerApplicant(input: {
  email: string;
  password: string;
  name: string;
}) {
  const existing = await db.user.findUnique({ where: { email: input.email.toLowerCase().trim() } });
  if (existing) {
    throw new EmailAlreadyRegisteredError();
  }
  return createUser({ ...input, actorId: null });
}

export interface AssignRoleInput {
  userId: string;
  role: Role;
  programId?: string | null;
  courseOfferingId?: string | null;
  actorId: string | null;
}

export async function assignRole(input: AssignRoleInput) {
  const assignment = await db.roleAssignment.create({
    data: {
      userId: input.userId,
      role: input.role,
      programId: input.programId ?? null,
      courseOfferingId: input.courseOfferingId ?? null,
    },
  });

  await recordAuditEvent({
    actorId: input.actorId,
    action: "ROLE_ASSIGNED",
    entityType: "RoleAssignment",
    entityId: assignment.id,
    metadata: {
      userId: input.userId,
      role: input.role,
      programId: input.programId ?? null,
      courseOfferingId: input.courseOfferingId ?? null,
    },
  });

  return assignment;
}

export async function listUsers() {
  return db.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { roleAssignments: true },
  });
}

export async function getUserById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: { roleAssignments: true },
  });
}
