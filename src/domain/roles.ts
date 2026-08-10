/**
 * Role definitions — the platform-wide canonical list of Roles.
 *
 * Source: docs/milestones/milestone-2-user-roles-permission-architecture/01-role-definitions.md
 *
 * All seven roles are declared here — per Milestone 10, Phase 4:
 * "Create the foundation so future roles can be added: Admissions Staff,
 * Clinical Coordinator, Employer Partner." Only the first four
 * (STUDENT, FACULTY, PROGRAM_DIRECTOR, ADMINISTRATOR) had working UI and
 * service logic through Milestone 14 — the remaining three were modeled
 * so a later milestone could wire them up without touching this file's
 * shape, only adding to it.
 *
 * Milestone 15 (Externship Eligibility & Placement Vertical Slice) is
 * that later milestone for CLINICAL_COORDINATOR: it now has a working
 * Coordinator Portal (src/app/(portal)/coordinator) and service logic
 * (src/services/externship/externship.ts), and is added to
 * IMPLEMENTED_ROLES below. This is *activating* an already-declared
 * Role, not introducing a new one — its shape (ROLES, ROLE_LABELS,
 * ROLE_SCOPE) was fixed since Milestone 10 and required zero changes
 * here. ADMISSIONS_STAFF and EMPLOYER_PARTNER remain declared but not
 * implemented, per this milestone's explicit "no new RBAC roles"
 * constraint and its deliberate exclusion of Employer self-service
 * access (see the Externship Deep Dive).
 *
 * Role values are plain strings, not a database enum, per the schema
 * comment in prisma/schema.prisma — this file (not the database) is the
 * single source of truth for which values are valid, enforced at every
 * boundary via `RoleSchema` below (Security Development Practices —
 * "validate at every boundary").
 */

import { z } from "zod";

export const ROLES = [
  "STUDENT",
  "FACULTY",
  "PROGRAM_DIRECTOR",
  "ADMINISTRATOR",
  "ADMISSIONS_STAFF",
  "CLINICAL_COORDINATOR",
  "EMPLOYER_PARTNER",
] as const;

export type Role = (typeof ROLES)[number];

/** Roles with working implementation — STUDENT/FACULTY/PROGRAM_DIRECTOR/ADMINISTRATOR since Milestone 10, CLINICAL_COORDINATOR since Milestone 15. */
export const IMPLEMENTED_ROLES: Role[] = [
  "STUDENT",
  "FACULTY",
  "PROGRAM_DIRECTOR",
  "ADMINISTRATOR",
  "CLINICAL_COORDINATOR",
];

export const RoleSchema = z.enum(ROLES);

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty Instructor",
  PROGRAM_DIRECTOR: "Program Director",
  ADMINISTRATOR: "Administrator",
  ADMISSIONS_STAFF: "Admissions Staff",
  CLINICAL_COORDINATOR: "Clinical/Externship Coordinator",
  EMPLOYER_PARTNER: "Employer Partner",
};

/**
 * Where each Role's authority is scoped, per
 * docs/milestones/milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md.
 * Used by the authorization service to know which scope field
 * (programId / courseOfferingId / neither) a RoleAssignment for this
 * Role should carry.
 */
export const ROLE_SCOPE: Record<
  Role,
  "institution" | "program" | "courseOffering" | "self"
> = {
  ADMINISTRATOR: "institution",
  PROGRAM_DIRECTOR: "program",
  ADMISSIONS_STAFF: "institution",
  FACULTY: "courseOffering",
  CLINICAL_COORDINATOR: "program",
  EMPLOYER_PARTNER: "program",
  STUDENT: "self",
};

/** The default landing route for each Role after login. */
export const ROLE_HOME_ROUTE: Record<Role, string> = {
  STUDENT: "/student",
  FACULTY: "/faculty",
  PROGRAM_DIRECTOR: "/program-director",
  ADMINISTRATOR: "/admin",
  ADMISSIONS_STAFF: "/admin",
  CLINICAL_COORDINATOR: "/coordinator",
  EMPLOYER_PARTNER: "/admin",
};
