import { db } from "@/lib/db";
import type { SessionUser } from "@/services/identity/session";
import { createUser, assignRole } from "@/services/identity/users";
import {
  createInstitution,
  createSchool,
  createProgram,
  createCohort,
  createCourse,
  createCourseOffering,
  createLesson,
} from "@/services/academic/institution";
import { createAssessment, submitAssessment } from "@/services/assessments/assessments";
import { createEnrollment, markLessonComplete } from "@/services/enrollment/enrollment";
import { createCompetency } from "@/services/academic/competency";
import {
  submitContentForReview,
  approveContent,
  publishContent,
} from "@/services/academic/content-workflow";
import { enterGrade, submitGradeForApproval, approveGrade } from "@/services/gradebook/gradebook";
import {
  createClinicalSite,
  updateClinicalSiteStatus,
  requestPlacement,
  approvePlacement,
  activatePlacement,
  recordEvaluation,
  attestHoursComplete,
  submitCompletionForVerification,
  verifyCompletion,
} from "@/services/externship/externship";
import {
  startOrResumeApplication,
  submitApplication,
  startReview,
  recordDecision,
  confirmOffer,
  assignCohort,
  createEnrollmentFromApplication,
} from "@/services/admissions/admissions";
import { configureTuition } from "@/services/billing/billing";

/**
 * Test fixtures — deliberately built through the real service functions
 * (not raw `db.*.create` calls) wherever practical, so the test suite
 * exercises the same code paths (including Audit Log emission) real
 * usage does. Configuration-driven, per Milestone 10's "avoid Pharmacy
 * Technology hard-coding" instruction: this fixture uses a generic
 * "Test Program" name, not a real program name, to keep the test suite
 * itself demonstrably decoupled from any specific program.
 */

let counter = 0;
function unique(prefix: string) {
  counter += 1;
  return `${prefix}-${counter}`;
}

export async function buildTestUser(overrides?: { name?: string; email?: string; password?: string }) {
  // actorId: null — a system-initiated creation, exactly like
  // bootstrapping the first Administrator in a fresh deployment (see
  // prisma/seed.ts and the module comment in
  // src/services/identity/users.ts). Tests that need to verify audit
  // attribution to a specific actor pass a real actorId explicitly via
  // createUser directly instead of this fixture helper.
  const email = overrides?.email ?? `${unique("user")}@example.test`;
  return createUser({
    name: overrides?.name ?? "Test User",
    email,
    password: overrides?.password ?? "password123",
    actorId: null,
  });
}

export async function buildAcademicStructure(actorId: string) {
  const institution = await createInstitution("Test Institute of Health Sciences", actorId);
  const school = await createSchool(
    { institutionId: institution.id, name: "School of Test Sciences" },
    actorId,
  );
  const program = await createProgram(
    {
      schoolId: school.id,
      name: "Test Program",
      slug: unique("test-program"),
      description: "A generic test program.",
    },
    actorId,
  );
  const cohort = await createCohort({ programId: program.id, name: "Cohort A" }, actorId);
  const course = await createCourse(
    { programId: program.id, title: "Test Course", description: "A generic test course." },
    actorId,
  );
  const courseOffering = await createCourseOffering(
    { courseId: course.id, cohortId: cohort.id, term: "Test Term" },
    actorId,
  );
  const competency = await createCompetency(
    { programId: program.id, name: "Test Competency" },
    actorId,
  );
  const { lesson, version: lessonVersion } = await createLesson(
    {
      courseId: course.id,
      title: "Lesson One",
      content: "Lesson content.",
      competencyIds: [competency.id],
    },
    actorId,
  );
  const { assessment, version: assessmentVersion } = await createAssessment(
    { courseId: course.id, title: "Assessment One", instructions: "Do the thing.", maxScore: 100 },
    actorId,
  );

  // Milestone 13's content lifecycle defaults every Lesson/Assessment
  // Version to Draft (see prisma/schema.prisma) — every existing
  // (Milestone 10) test in this suite presumes content is already
  // deliverable, so this shared fixture walks both first Versions
  // through Draft → Submitted → Approved → Published here (Milestone
  // 14: publishing a version also sets the parent Lesson/Assessment's
  // publishedVersionId pointer — see content-workflow.ts's
  // publishContent), using the same service functions the real
  // Faculty/Program Director/Administrator workflow uses (per this
  // fixture module's own "built through the real service functions"
  // convention). Tests that specifically exercise the content/version
  // lifecycle itself (tests/content-*.test.ts) build their own
  // Draft-status content directly via createLesson/createAssessment
  // instead of this fixture.
  await submitContentForReview("LESSON", lessonVersion.id, actorId);
  await approveContent("LESSON", lessonVersion.id, actorId);
  await publishContent("LESSON", lessonVersion.id, actorId);
  await submitContentForReview("ASSESSMENT", assessmentVersion.id, actorId);
  await approveContent("ASSESSMENT", assessmentVersion.id, actorId);
  await publishContent("ASSESSMENT", assessmentVersion.id, actorId);

  return {
    institution,
    school,
    program,
    cohort,
    course,
    courseOffering,
    lesson,
    lessonVersion,
    assessment,
    assessmentVersion,
    competency,
  };
}

/** A full, ready-to-use scenario: one Program with one Course Offering, an enrolled Student, an assigned Faculty Instructor, and a Program Director overseeing the Program. */
export async function buildFullScenario() {
  const admin = await buildTestUser({ name: "Ada Admin", email: unique("admin") + "@example.test" });
  await assignRole({ userId: admin.id, role: "ADMINISTRATOR", actorId: null });
  const structure = await buildAcademicStructure(admin.id);

  const student = await buildTestUser({ name: "Sam Student" });
  await createEnrollment(
    { studentId: student.id, programId: structure.program.id, cohortId: structure.cohort.id },
    admin.id,
  );

  const faculty = await buildTestUser({ name: "Fay Faculty" });
  await assignRole({
    userId: faculty.id,
    role: "FACULTY",
    courseOfferingId: structure.courseOffering.id,
    actorId: admin.id,
  });

  const programDirector = await buildTestUser({ name: "Pat Director" });
  await assignRole({
    userId: programDirector.id,
    role: "PROGRAM_DIRECTOR",
    programId: structure.program.id,
    actorId: admin.id,
  });

  return { admin, student, faculty, programDirector, ...structure };
}

export async function getUserWithRoles(userId: string) {
  return db.user.findUniqueOrThrow({ where: { id: userId }, include: { roleAssignments: true } });
}

/**
 * Milestone 15: src/services/externship/externship.ts's functions take a
 * full SessionUser (id + roleAssignments), not a plain actorId string —
 * per that module's service-layer-enforced-authorization design — so
 * tests calling it directly need this shape without going through a real
 * cookie-backed login/getSessionUser() round trip for every actor. Same
 * projection prisma/seed.ts's own `actorFor` builds, kept as a separate
 * small copy here rather than a shared module, consistent with this
 * being a test-only helper file.
 */
export async function actorFor(userId: string): Promise<SessionUser> {
  const user = await getUserWithRoles(userId);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roleAssignments: user.roleAssignments.map((ra) => ({
      id: ra.id,
      role: ra.role as SessionUser["roleAssignments"][number]["role"],
      programId: ra.programId,
      courseOfferingId: ra.courseOfferingId,
    })),
  };
}

/**
 * A full scenario extended for Milestone 15 (Externship Eligibility &
 * Placement Vertical Slice): the Program is flipped to
 * `requiresExternship: true` after creation (rather than threading a new
 * parameter through buildAcademicStructure, which every other existing
 * test still calls expecting today's default), and a Clinical Coordinator
 * — CLINICAL_COORDINATOR, Program-scoped, per src/domain/roles.ts — is
 * added alongside the existing Student/Faculty/Program Director/
 * Administrator cast.
 */
export async function buildExternshipScenario() {
  const scenario = await buildFullScenario();
  await db.program.update({ where: { id: scenario.program.id }, data: { requiresExternship: true } });

  const coordinator = await buildTestUser({ name: "Cody Coordinator" });
  await assignRole({
    userId: coordinator.id,
    role: "CLINICAL_COORDINATOR",
    programId: scenario.program.id,
    actorId: scenario.admin.id,
  });

  return { ...scenario, coordinator };
}

/**
 * Milestone 16 (Certificate & Graduation Vertical Slice): walks a
 * scenario's Student through the single Lesson and single Assessment
 * `buildAcademicStructure` creates — completing the Lesson, submitting
 * the Assessment, and carrying its Grade all the way to Approved —
 * through the exact same service functions the real Student/Faculty/
 * Program Director portal screens use. This is what
 * determineGraduationEligibility's "academic completion" checks for; it
 * duplicates no fact, only exercises the real completion/grading path.
 */
export async function completeAcademicWork(
  scenario: Awaited<ReturnType<typeof buildFullScenario>>,
) {
  await markLessonComplete({ studentId: scenario.student.id, lessonId: scenario.lesson.id });

  const submission = await submitAssessment({
    assessmentId: scenario.assessment.id,
    studentId: scenario.student.id,
    courseOfferingId: scenario.courseOffering.id,
    content: "A complete answer.",
  });
  const grade = await enterGrade({
    submissionId: submission.id,
    score: 90,
    enteredById: scenario.faculty.id,
  });
  await submitGradeForApproval(grade.id, scenario.faculty.id);
  await approveGrade(grade.id, scenario.programDirector.id);

  return { submission, grade };
}

/**
 * Milestone 18: the same academic-completion walk as completeAcademicWork
 * above, generalized to an arbitrary studentId — needed because
 * buildEnrolledApplicant's Student is a fresh self-registered Applicant,
 * not the scenario's own pre-built `student`. completeAcademicWork itself
 * is left untouched (still hardcodes scenario.student.id) so every
 * existing Milestone 16 test that calls it keeps working unmodified.
 */
export async function completeAcademicWorkForStudent(
  scenario: Awaited<ReturnType<typeof buildFullScenario>>,
  studentId: string,
) {
  await markLessonComplete({ studentId, lessonId: scenario.lesson.id });

  const submission = await submitAssessment({
    assessmentId: scenario.assessment.id,
    studentId,
    courseOfferingId: scenario.courseOffering.id,
    content: "A complete answer.",
  });
  const grade = await enterGrade({
    submissionId: submission.id,
    score: 90,
    enteredById: scenario.faculty.id,
  });
  await submitGradeForApproval(grade.id, scenario.faculty.id);
  await approveGrade(grade.id, scenario.programDirector.id);

  return { submission, grade };
}

/**
 * Milestone 16: walks a `buildExternshipScenario` Student's Placement all
 * the way to a Program-Director-Verified Completion — the exact signal
 * determineGraduationEligibility reads directly, via the real Milestone
 * 15 service functions, never recomputed or duplicated here.
 */
export async function verifyExternshipForStudent(
  scenario: Awaited<ReturnType<typeof buildExternshipScenario>>,
) {
  const coordinator = await actorFor(scenario.coordinator.id);
  const programDirector = await actorFor(scenario.programDirector.id);

  const site = await createClinicalSite(
    { programId: scenario.program.id, name: "Test Site", employerName: "Test Employer" },
    coordinator,
  );
  await updateClinicalSiteStatus(site.id, "ACTIVE", coordinator);
  const placement = await requestPlacement(
    { studentId: scenario.student.id, programId: scenario.program.id, clinicalSiteId: site.id },
    coordinator,
  );
  await approvePlacement(placement.id, coordinator);
  await activatePlacement(placement.id, coordinator);
  await recordEvaluation(
    { placementId: placement.id, type: "FINAL", content: "Ready.", outcome: "SATISFACTORY" },
    coordinator,
  );
  await attestHoursComplete(placement.id, coordinator);
  await submitCompletionForVerification(placement.id, coordinator);
  await verifyCompletion(placement.id, programDirector);

  return placement;
}

/** A buildExternshipScenario, walked all the way to graduation-eligible: complete academic work + a Verified externship Placement. */
export async function buildGraduationReadyScenario() {
  const scenario = await buildExternshipScenario();
  await completeAcademicWork(scenario);
  await verifyExternshipForStudent(scenario);
  return scenario;
}

/**
 * Milestone 17 (Admissions & Enrollment Vertical Slice): a buildFullScenario
 * plus one Admissions Staff User. Institution-wide, per ADMISSIONS_STAFF's
 * ROLE_SCOPE (src/domain/roles.ts) — no programId on the Role Assignment,
 * unlike Program Director/Clinical Coordinator's scenario additions.
 */
export async function buildAdmissionsScenario() {
  const scenario = await buildFullScenario();

  const admissionsStaff = await buildTestUser({ name: "Ada Admissions" });
  await assignRole({ userId: admissionsStaff.id, role: "ADMISSIONS_STAFF", actorId: scenario.admin.id });

  return { ...scenario, admissionsStaff };
}

/**
 * A self-registering Applicant (via src/services/identity/users.ts's
 * registerApplicant — the one self-service account-creation exception in
 * this codebase, no Role Assignment) with a started Application against
 * the given scenario's Program.
 */
export async function startApplicationFor(scenario: Awaited<ReturnType<typeof buildAdmissionsScenario>>) {
  const applicant = await createUser({
    name: unique("Applicant"),
    email: unique("applicant") + "@example.test",
    password: "test-password-123",
    actorId: null,
  });
  const applicantActor = await actorFor(applicant.id);
  const application = await startOrResumeApplication(applicant.id, scenario.program.id, applicantActor);
  return { applicant, applicantActor, application };
}

/**
 * Milestone 18 (Tuition, Billing & Payments Vertical Slice): configures
 * tuition for a buildAdmissionsScenario's Cohort (Administrator-only,
 * via the real configureTuition service function) — a generic,
 * explicitly-non-authoritative test amount, per this milestone's own
 * "do not hard-code Pharmacy Technology tuition" instruction.
 */
export async function configureTuitionForScenario(
  scenario: Awaited<ReturnType<typeof buildAdmissionsScenario>>,
  amountCents = 500000,
) {
  const admin = await actorFor(scenario.admin.id);
  return configureTuition(
    { cohortId: scenario.cohort.id, amountCents, description: "Test Tuition — not official pricing" },
    admin,
  );
}

/**
 * Walks a fresh self-registered Applicant all the way through the real
 * Milestone 17 flow (submit -> review -> accept -> confirm offer ->
 * Cohort assignment -> Enrollment) to a real Enrollment — the exact path
 * that triggers Milestone 18's createChargeForEnrollment hook. Returns
 * the Enrollment plus (if tuition was configured for the Cohort before
 * this ran) the resulting StudentCharge.
 */
export async function buildEnrolledApplicant(scenario: Awaited<ReturnType<typeof buildAdmissionsScenario>>) {
  const { applicant, applicantActor, application } = await startApplicationFor(scenario);
  const admissionsStaff = await actorFor(scenario.admissionsStaff.id);

  await submitApplication(application.id, applicantActor);
  await startReview(application.id, admissionsStaff);
  await recordDecision(application.id, "ACCEPTED", null, admissionsStaff);
  await confirmOffer(application.id, applicantActor);
  await assignCohort(application.id, scenario.cohort.id, admissionsStaff);
  const enrollment = await createEnrollmentFromApplication(application.id, admissionsStaff);

  const charge = await db.studentCharge.findUnique({
    where: { enrollmentId_category: { enrollmentId: enrollment.id, category: "TUITION" } },
  });

  return { applicant, applicantActor, application, enrollment, charge, admissionsStaff };
}
