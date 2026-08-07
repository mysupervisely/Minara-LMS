import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import { buildFullScenario, buildTestUser, buildAcademicStructure } from "./helpers/fixtures";
import { login } from "@/services/identity/auth";
import { getSessionUser } from "@/services/identity/session";
import {
  requireSessionUser,
  requireSessionUserWithRole,
  hasRoleForProgram,
  hasRoleForCourseOffering,
  isAdministrator,
} from "@/services/identity/authorization";
import { studentCanAccessCourseOffering } from "@/services/enrollment/enrollment";
import { facultyCanAccessCourseOffering, facultyCanAccessCourse } from "@/services/academic/institution";
import { TestRedirectSignal } from "./setup";

/**
 * Permission (RBAC boundary) tests — Milestone 10's "Permission tests"
 * testing requirement, covering ADR-005 and
 * docs/milestones/milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md's
 * `(Role, Scope)` model. These verify the platform fails closed: a
 * Role Assignment grants exactly its own scope, never more.
 */
describe("Permissions / RBAC boundaries", () => {
  beforeEach(resetDatabase);

  it("redirects to /login when there is no session at all", async () => {
    await expect(requireSessionUser()).rejects.toThrow(TestRedirectSignal);
    await expect(requireSessionUser()).rejects.toMatchObject({ destination: "/login" });
  });

  it("redirects a Student away from a role-specific page they don't hold", async () => {
    const scenario = await buildFullScenario();
    await login(scenario.student.email, "password123");

    await expect(requireSessionUserWithRole("FACULTY")).rejects.toThrow(TestRedirectSignal);
  });

  it("lets an Administrator through every role-specific page, per the Administrator override", async () => {
    const scenario = await buildFullScenario();
    await login(scenario.admin.email, "password123");

    const user = await requireSessionUserWithRole("FACULTY");
    expect(isAdministrator(user)).toBe(true);
  });

  it("a Program Director's authority is scoped to their own Program, never another one", async () => {
    const scenario = await buildFullScenario();
    const otherProgram = await buildAcademicStructure(scenario.admin.id);

    await login(scenario.programDirector.email, "password123");
    const user = (await getSessionUser())!;

    expect(hasRoleForProgram(user, "PROGRAM_DIRECTOR", scenario.program.id)).toBe(true);
    expect(hasRoleForProgram(user, "PROGRAM_DIRECTOR", otherProgram.program.id)).toBe(false);
  });

  it("a Faculty Instructor's authority is scoped to their own Course Offering, never another one", async () => {
    const scenario = await buildFullScenario();
    const otherStructure = await buildAcademicStructure(scenario.admin.id);

    await login(scenario.faculty.email, "password123");
    const user = (await getSessionUser())!;

    expect(hasRoleForCourseOffering(user, "FACULTY", scenario.courseOffering.id)).toBe(true);
    expect(hasRoleForCourseOffering(user, "FACULTY", otherStructure.courseOffering.id)).toBe(false);

    expect(await facultyCanAccessCourseOffering(scenario.faculty.id, scenario.courseOffering.id)).toBe(
      true,
    );
    expect(
      await facultyCanAccessCourseOffering(scenario.faculty.id, otherStructure.courseOffering.id),
    ).toBe(false);
    expect(await facultyCanAccessCourse(scenario.faculty.id, otherStructure.course.id)).toBe(false);
  });

  it("a Student cannot access a Course Offering belonging to a Cohort they aren't enrolled in", async () => {
    const scenario = await buildFullScenario();
    const otherStructure = await buildAcademicStructure(scenario.admin.id);

    expect(await studentCanAccessCourseOffering(scenario.student.id, scenario.courseOffering.id)).toBe(
      true,
    );
    expect(
      await studentCanAccessCourseOffering(scenario.student.id, otherStructure.courseOffering.id),
    ).toBe(false);
  });

  it("a User with no Role Assignments at all is denied every scoped check", async () => {
    const bystander = await buildTestUser({ email: "bystander@example.test" });
    const scenario = await buildFullScenario();

    expect(
      await studentCanAccessCourseOffering(bystander.id, scenario.courseOffering.id),
    ).toBe(false);
    expect(
      await facultyCanAccessCourseOffering(bystander.id, scenario.courseOffering.id),
    ).toBe(false);
  });
});
