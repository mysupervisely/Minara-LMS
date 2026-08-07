import "server-only";
import { db } from "@/lib/db";
import { recordAuditEvent } from "@/services/audit/audit";

/**
 * Academic bounded context — Institution / School / Program / Cohort /
 * Course / Course Offering / Lesson.
 *
 * Implements Milestone 10, Phase 5 ("Institution Structure Foundation")
 * and part of Phase 6/7 (Lesson delivery). Deliberately narrow, per that
 * phase's instruction: "Do not build full curriculum management yet" —
 * there is no Module layer, no content versioning, and no
 * Minara-Curriculum integration. See prisma/schema.prisma's comments for
 * the full list of documented simplifications.
 *
 * Configuration-driven, not Pharmacy-Technology-hard-coded: nothing in
 * this module references "Pharmacy Technology," "PharmTech," or any
 * other program name — every Institution/School/Program/Course is data
 * created through these functions (or the seed script, which is itself
 * just a caller of these functions), per this milestone's explicit
 * "Avoid Pharmacy Technology hard-coding... Use configuration-driven
 * design" instruction.
 */

export async function createInstitution(name: string, actorId: string) {
  const institution = await db.institution.create({ data: { name } });
  await recordAuditEvent({
    actorId,
    action: "INSTITUTION_CREATED",
    entityType: "Institution",
    entityId: institution.id,
    metadata: { name },
  });
  return institution;
}

export async function createSchool(input: { institutionId: string; name: string }, actorId: string) {
  const school = await db.school.create({ data: input });
  await recordAuditEvent({
    actorId,
    action: "SCHOOL_CREATED",
    entityType: "School",
    entityId: school.id,
    metadata: { name: input.name },
  });
  return school;
}

export async function createProgram(
  input: {
    schoolId: string;
    name: string;
    slug: string;
    description?: string;
    requiresExternship?: boolean;
  },
  actorId: string,
) {
  const program = await db.program.create({
    data: {
      schoolId: input.schoolId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      requiresExternship: input.requiresExternship ?? false,
    },
  });
  await recordAuditEvent({
    actorId,
    action: "PROGRAM_CREATED",
    entityType: "Program",
    entityId: program.id,
    metadata: { name: input.name, slug: input.slug },
  });
  return program;
}

export async function createCohort(input: { programId: string; name: string }, actorId: string) {
  const cohort = await db.cohort.create({ data: input });
  await recordAuditEvent({
    actorId,
    action: "COHORT_CREATED",
    entityType: "Cohort",
    entityId: cohort.id,
    metadata: { name: input.name },
  });
  return cohort;
}

export async function createCourse(
  input: { programId: string; title: string; description?: string; order?: number },
  actorId: string,
) {
  const course = await db.course.create({
    data: {
      programId: input.programId,
      title: input.title,
      description: input.description,
      order: input.order ?? 0,
    },
  });
  await recordAuditEvent({
    actorId,
    action: "COURSE_CREATED",
    entityType: "Course",
    entityId: course.id,
    metadata: { title: input.title },
  });
  return course;
}

export async function createCourseOffering(
  input: { courseId: string; cohortId: string; term: string },
  actorId: string,
) {
  const offering = await db.courseOffering.create({ data: input });
  await recordAuditEvent({
    actorId,
    action: "COURSE_OFFERING_CREATED",
    entityType: "CourseOffering",
    entityId: offering.id,
    metadata: { term: input.term },
  });
  return offering;
}

export async function createLesson(
  input: { courseId: string; title: string; content: string; order?: number },
  actorId: string,
) {
  const lesson = await db.lesson.create({
    data: {
      courseId: input.courseId,
      title: input.title,
      content: input.content,
      order: input.order ?? 0,
    },
  });
  await recordAuditEvent({
    actorId,
    action: "LESSON_CREATED",
    entityType: "Lesson",
    entityId: lesson.id,
    metadata: { title: input.title },
  });
  return lesson;
}

// ── Read helpers ────────────────────────────────────────────────────────

export async function listInstitutions() {
  return db.institution.findMany({
    include: { schools: { include: { programs: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function listPrograms() {
  return db.program.findMany({
    include: { school: { include: { institution: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getProgramBySlug(slug: string) {
  return db.program.findUnique({
    where: { slug },
    include: { school: { include: { institution: true } }, courses: true },
  });
}

export async function getProgramById(programId: string) {
  return db.program.findUnique({
    where: { id: programId },
    include: {
      school: true,
      cohorts: true,
      courses: { include: { lessons: true, assessments: true, courseOfferings: true } },
    },
  });
}

/** Every Program with its full structure nested — used by the Administrator's Institution Structure screen. */
export async function listProgramsWithDetail() {
  return db.program.findMany({
    include: {
      school: { include: { institution: true } },
      cohorts: true,
      courses: {
        include: {
          lessons: { orderBy: { order: "asc" } },
          assessments: true,
          courseOfferings: { include: { cohort: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

/** Every Course Offering across every Program — used to populate the Administrator's Role Assignment scope selector. */
export async function listAllCourseOfferings() {
  return db.courseOffering.findMany({
    include: { course: { include: { program: true } }, cohort: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function listCourseOfferingsForProgram(programId: string) {
  return db.courseOffering.findMany({
    where: { course: { programId } },
    include: { course: true, cohort: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCourseOfferingById(courseOfferingId: string) {
  return db.courseOffering.findUnique({
    where: { id: courseOfferingId },
    include: {
      course: { include: { lessons: { orderBy: { order: "asc" } }, assessments: true, program: true } },
      cohort: true,
    },
  });
}

/** Every Course Offering a Faculty Instructor holds a Teaching Assignment for (a FACULTY-role RoleAssignment scoped to that Course Offering). */
export async function listCourseOfferingsForFaculty(facultyUserId: string) {
  return db.courseOffering.findMany({
    where: { roleAssignments: { some: { userId: facultyUserId, role: "FACULTY" } } },
    include: { course: { include: { program: true } }, cohort: true },
  });
}

/** True if this User holds a FACULTY Teaching Assignment for this Course Offering. */
export async function facultyCanAccessCourseOffering(
  facultyUserId: string,
  courseOfferingId: string,
): Promise<boolean> {
  const assignment = await db.roleAssignment.findFirst({
    where: { userId: facultyUserId, role: "FACULTY", courseOfferingId },
    select: { id: true },
  });
  return Boolean(assignment);
}

/** True if this User holds a FACULTY Teaching Assignment for any Course Offering of this Course — used to authorize per-Submission review, since a Submission belongs to a Course's Assessment, not directly to a Course Offering. */
export async function facultyCanAccessCourse(
  facultyUserId: string,
  courseId: string,
): Promise<boolean> {
  const assignment = await db.roleAssignment.findFirst({
    where: {
      userId: facultyUserId,
      role: "FACULTY",
      courseOffering: { courseId },
    },
    select: { id: true },
  });
  return Boolean(assignment);
}

/** The roster of Students enrolled in a Course Offering's Cohort. */
export async function listRosterForCourseOffering(courseOfferingId: string) {
  const offering = await db.courseOffering.findUnique({
    where: { id: courseOfferingId },
    select: { cohortId: true },
  });
  if (!offering) return [];

  const enrollments = await db.enrollment.findMany({
    where: { cohortId: offering.cohortId, status: "ACTIVE" },
    include: { student: true },
  });
  return enrollments;
}
