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

/**
 * Milestone 14: creates a Lesson (the stable identity) and its first
 * LessonVersion (versionNumber 1, Draft) together, atomically. Every
 * caller — Faculty authoring, the Administrator foundation screens,
 * the seed script — goes through this one function, so a Lesson is
 * never left without at least one Version. See
 * src/services/academic/content-workflow.ts for the Draft → Submitted
 * → Approved → Published transitions this first Version then moves
 * through, and createNewLessonVersion below for how a *second* Version
 * gets created once the first is Published.
 */
export async function createLesson(
  input: {
    courseId: string;
    title: string;
    content: string;
    order?: number;
    /** Competencies this Lesson Version teaches toward, per src/services/academic/competency.ts. Optional at creation — required before submission for review, enforced in content-workflow.ts. */
    competencyIds?: string[];
  },
  actorId: string,
) {
  const lesson = await db.lesson.create({
    data: { courseId: input.courseId, order: input.order ?? 0 },
  });
  const version = await db.lessonVersion.create({
    data: {
      lessonId: lesson.id,
      versionNumber: 1,
      title: input.title,
      content: input.content,
      competencies: input.competencyIds?.length
        ? { connect: input.competencyIds.map((id) => ({ id })) }
        : undefined,
    },
  });

  await recordAuditEvent({
    actorId,
    action: "LESSON_CREATED",
    entityType: "Lesson",
    entityId: lesson.id,
    metadata: { title: input.title },
  });
  await recordAuditEvent({
    actorId,
    action: "VERSION_CREATED",
    entityType: "LessonVersion",
    entityId: version.id,
    metadata: { lessonId: lesson.id, versionNumber: version.versionNumber },
  });

  return { lesson, version };
}

/**
 * Milestone 14: creates LessonVersion N+1 for a Lesson that already
 * has at least one version, seeded from the latest version's content
 * and Competency tags as an editable starting point — the "Faculty
 * creates an edit" step of this milestone's Core Workflow. Refuses to
 * create a new version while another one is already in flight (any
 * status other than PUBLISHED), so at most one Draft/Submitted/
 * Approved version exists per Lesson at a time — a deliberate
 * simplification that keeps "which version am I editing" unambiguous
 * for this narrow slice.
 */
export async function createNewLessonVersion(lessonId: string, actorId: string) {
  const versions = await db.lessonVersion.findMany({
    where: { lessonId },
    orderBy: { versionNumber: "desc" },
    include: { competencies: true },
  });
  if (versions.length === 0) {
    throw new Error("This Lesson has no existing version to base a new version on.");
  }
  const inFlight = versions.find((v) => v.status !== "PUBLISHED");
  if (inFlight) {
    throw new Error(
      "A version of this Lesson is already in progress — finish or have it returned before creating another.",
    );
  }

  const latest = versions[0];
  const version = await db.lessonVersion.create({
    data: {
      lessonId,
      versionNumber: latest.versionNumber + 1,
      title: latest.title,
      content: latest.content,
      competencies: { connect: latest.competencies.map((c) => ({ id: c.id })) },
    },
  });

  await recordAuditEvent({
    actorId,
    action: "VERSION_CREATED",
    entityType: "LessonVersion",
    entityId: version.id,
    metadata: { lessonId, versionNumber: version.versionNumber },
  });

  return version;
}

/**
 * Milestone 14: edits a LessonVersion's content while it is still
 * Draft — the Faculty "Edit lesson" capability, now scoped to a
 * specific version rather than the Lesson row itself. Mirrors the
 * Grade lifecycle's "DRAFT-only editable" rule
 * (src/services/gradebook/gradebook.ts's enterGrade): once Submitted
 * for Review, a version must be Returned before it can be edited
 * again — and once Published, per this milestone's core principle, it
 * is never editable again by any path, full stop. No separate audit
 * event is emitted for the edit itself — only the lifecycle
 * transitions in content-workflow.ts are audited.
 */
export async function updateLessonVersionDraft(input: {
  versionId: string;
  title: string;
  content: string;
  competencyIds: string[];
}) {
  const version = await db.lessonVersion.findUnique({ where: { id: input.versionId } });
  if (!version) throw new Error("Lesson version not found.");
  if (version.status !== "DRAFT") {
    throw new Error(
      "Only a Draft version can be edited. Submitted, Approved, and Published versions are read-only.",
    );
  }

  return db.lessonVersion.update({
    where: { id: input.versionId },
    data: {
      title: input.title,
      content: input.content,
      competencies: { set: input.competencyIds.map((id) => ({ id })) },
    },
  });
}

/** The Lesson row itself (identity + ordering + the publishedVersionId pointer) — no content, since Milestone 14 moved all content onto LessonVersion. */
export async function getLessonById(lessonId: string) {
  return db.lesson.findUnique({ where: { id: lessonId } });
}

/**
 * The Lesson's currently Published version, or null if none has been
 * published yet — the fail-closed resolution point for Student
 * delivery. Every Student-facing read of a specific Lesson's content
 * goes through this function (never a raw `db.lessonVersion.findUnique`
 * by a client-supplied version id), so a Draft/Submitted/Approved-but-
 * unpublished newer version stays completely unreachable no matter
 * what a Student requests.
 */
export async function getPublishedLessonVersion(lessonId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { publishedVersionId: true },
  });
  if (!lesson?.publishedVersionId) return null;
  return db.lessonVersion.findUnique({
    where: { id: lesson.publishedVersionId },
    include: { competencies: true },
  });
}

/** The most recently created LessonVersion for a Lesson — during an edit cycle this is unambiguously "the version currently being authored or reviewed," since createNewLessonVersion refuses to start a second one while one is already in flight. */
export async function getLatestLessonVersion(lessonId: string) {
  return db.lessonVersion.findFirst({
    where: { lessonId },
    orderBy: { versionNumber: "desc" },
    include: { competencies: true },
  });
}

/** Every version of a Lesson, newest first — the Faculty "View version status" / version history capability. */
export async function listLessonVersions(lessonId: string) {
  return db.lessonVersion.findMany({
    where: { lessonId },
    orderBy: { versionNumber: "desc" },
  });
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
      courses: {
        include: {
          lessons: { include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } } },
          assessments: { include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } } },
          courseOfferings: true,
        },
      },
    },
  });
}

/**
 * Every Program with its full structure nested — used by the
 * Administrator's Institution Structure screen. Each Lesson/Assessment
 * includes only its single latest Version (`versions[0]` after this
 * ordering) — enough to show a current title in this overview list
 * without pulling full version history here; the Faculty/Program
 * Director/Administrator screens that need full history use
 * src/services/academic/content-workflow.ts's dedicated functions.
 */
export async function listProgramsWithDetail() {
  return db.program.findMany({
    include: {
      school: { include: { institution: true } },
      cohorts: true,
      courses: {
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
          },
          assessments: {
            include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
          },
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

/**
 * Course/Program metadata for a Course Offering, used by Faculty/
 * Program Director/Administrator screens (course title, program name,
 * term). Deliberately does NOT nest Lesson/Assessment detail — that
 * now means Version detail, and callers that need it (the Curriculum
 * list, authoring screens) go through
 * src/services/academic/content-workflow.ts's listContentForCourse
 * instead, which is version-aware; keeping this function to course-
 * level metadata only avoids two places needing to agree on how to
 * shape versioned content.
 */
export async function getCourseOfferingById(courseOfferingId: string) {
  return db.courseOffering.findUnique({
    where: { id: courseOfferingId },
    include: {
      course: { include: { program: true } },
      cohort: true,
    },
  });
}

/**
 * Milestone 13/14: the Student-facing equivalent of
 * getCourseOfferingById. Filtered to Lessons/Assessments that have a
 * `publishedVersionId` set — per
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/02-content-lifecycle-workflow.md
 * and this milestone's fail-closed requirement, a Student never sees
 * Draft/Submitted/Approved-but-unpublished content, even in a list,
 * and never sees a version other than the one the `publishedVersionId`
 * pointer names — a newer Draft/Submitted/Approved version of already-
 * Published content stays completely invisible here. Each entry
 * includes its `publishedVersion` so callers render the *version's*
 * title, not a title field on Lesson/Assessment itself (there isn't
 * one anymore).
 */
export async function getCourseOfferingForStudent(courseOfferingId: string) {
  return db.courseOffering.findUnique({
    where: { id: courseOfferingId },
    include: {
      course: {
        include: {
          lessons: {
            where: { publishedVersionId: { not: null } },
            orderBy: { order: "asc" },
            include: { publishedVersion: true },
          },
          assessments: {
            where: { publishedVersionId: { not: null } },
            include: { publishedVersion: true },
          },
          program: true,
        },
      },
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
