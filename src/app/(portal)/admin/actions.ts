"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSessionUserWithRole, requireAdministrator } from "@/services/identity/authorization";
import {
  createInstitution,
  createSchool,
  createProgram,
  createCohort,
  createCourse,
  createCourseOffering,
  createLesson,
} from "@/services/academic/institution";
import { createAssessment } from "@/services/assessments/assessments";
import { createUser, assignRole } from "@/services/identity/users";
import { createEnrollment } from "@/services/enrollment/enrollment";
import { RoleSchema } from "@/domain/roles";

export interface ActionState {
  error?: string;
  success?: string;
}

async function requireAdmin() {
  const user = await requireSessionUserWithRole("ADMINISTRATOR");
  requireAdministrator(user);
  return user;
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}

// ── Institution structure ────────────────────────────────────────────────

const InstitutionSchema = z.object({ name: z.string().trim().min(1, "Name is required.") });

export async function createInstitutionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = InstitutionSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  await createInstitution(parsed.data.name, user.id);
  revalidatePath("/admin/institution");
  return { success: "Institution created." };
}

const SchoolSchema = z.object({
  institutionId: z.string().min(1, "Select an Institution."),
  name: z.string().trim().min(1, "Name is required."),
});

export async function createSchoolAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = SchoolSchema.safeParse({
    institutionId: formData.get("institutionId"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  await createSchool(parsed.data, user.id);
  revalidatePath("/admin/institution");
  return { success: "School created." };
}

const ProgramSchema = z.object({
  schoolId: z.string().min(1, "Select a School."),
  name: z.string().trim().min(1, "Name is required."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens."),
  description: z.string().trim().optional(),
  requiresExternship: z.coerce.boolean().optional(),
});

export async function createProgramAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = ProgramSchema.safeParse({
    schoolId: formData.get("schoolId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    requiresExternship: formData.get("requiresExternship") === "on",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  await createProgram(parsed.data, user.id);
  revalidatePath("/admin/institution");
  revalidatePath("/");
  revalidatePath("/programs");
  return { success: "Program created." };
}

const CohortSchema = z.object({
  programId: z.string().min(1, "Select a Program."),
  name: z.string().trim().min(1, "Name is required."),
});

export async function createCohortAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = CohortSchema.safeParse({
    programId: formData.get("programId"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  await createCohort(parsed.data, user.id);
  revalidatePath("/admin/institution");
  return { success: "Cohort created." };
}

const CourseSchema = z.object({
  programId: z.string().min(1, "Select a Program."),
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().optional(),
});

export async function createCourseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = CourseSchema.safeParse({
    programId: formData.get("programId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  await createCourse(parsed.data, user.id);
  revalidatePath("/admin/institution");
  return { success: "Course created." };
}

const CourseOfferingSchema = z.object({
  courseId: z.string().min(1, "Select a Course."),
  cohortId: z.string().min(1, "Select a Cohort."),
  term: z.string().trim().min(1, "Term is required."),
});

export async function createCourseOfferingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = CourseOfferingSchema.safeParse({
    courseId: formData.get("courseId"),
    cohortId: formData.get("cohortId"),
    term: formData.get("term"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  await createCourseOffering(parsed.data, user.id);
  revalidatePath("/admin/institution");
  return { success: "Course Offering created." };
}

const LessonSchema = z.object({
  courseId: z.string().min(1, "Select a Course."),
  title: z.string().trim().min(1, "Title is required."),
  content: z.string().trim().min(1, "Content is required."),
});

export async function createLessonAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = LessonSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  await createLesson(parsed.data, user.id);
  revalidatePath("/admin/institution");
  return { success: "Lesson created." };
}

const AssessmentSchema = z.object({
  courseId: z.string().min(1, "Select a Course."),
  title: z.string().trim().min(1, "Title is required."),
  instructions: z.string().trim().min(1, "Instructions are required."),
  maxScore: z.coerce.number().int().min(1).max(1000).optional(),
});

export async function createAssessmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = AssessmentSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    instructions: formData.get("instructions"),
    maxScore: formData.get("maxScore") || undefined,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  await createAssessment(parsed.data, user.id);
  revalidatePath("/admin/institution");
  return { success: "Assessment created." };
}

// ── Users & Roles ─────────────────────────────────────────────────────────

const CreateUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function createUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  try {
    await createUser({ ...parsed.data, actorId: user.id });
  } catch {
    return { error: "A user with that email already exists." };
  }

  revalidatePath("/admin/users");
  return { success: "User created." };
}

const AssignRoleSchema = z.object({
  userId: z.string().min(1, "Select a User."),
  role: RoleSchema,
  programId: z.string().optional(),
  courseOfferingId: z.string().optional(),
});

export async function assignRoleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = AssignRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    programId: formData.get("programId") || undefined,
    courseOfferingId: formData.get("courseOfferingId") || undefined,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  await assignRole({
    userId: parsed.data.userId,
    role: parsed.data.role,
    programId: parsed.data.programId ?? null,
    courseOfferingId: parsed.data.courseOfferingId ?? null,
    actorId: user.id,
  });

  revalidatePath("/admin/users");
  return { success: "Role assigned." };
}

// ── Enrollment ────────────────────────────────────────────────────────────

const EnrollmentSchema = z.object({
  studentId: z.string().min(1, "Select a Student."),
  programId: z.string().min(1, "Select a Program."),
  cohortId: z.string().min(1, "Select a Cohort."),
});

export async function createEnrollmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = EnrollmentSchema.safeParse({
    studentId: formData.get("studentId"),
    programId: formData.get("programId"),
    cohortId: formData.get("cohortId"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  try {
    await createEnrollment(parsed.data, user.id);
  } catch {
    return { error: "This Student may already be enrolled in that Program." };
  }

  revalidatePath("/admin/enrollments");
  return { success: "Enrollment created." };
}
