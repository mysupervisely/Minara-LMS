/**
 * Local Development seed script.
 *
 * Populates a fresh database with one realistic scenario — chosen to
 * reflect ADR-008 (Pharmacy Technology First Launch) as sample data,
 * NOT as hard-coded application logic. Every entity below is created
 * through the same generic service functions
 * (src/services/academic/institution.ts, src/services/identity/users.ts,
 * etc.) any Program would go through — nothing in those functions or
 * anywhere else in this codebase branches on "Pharmacy Technology" by
 * name, per Milestone 10's "avoid Pharmacy Technology hard-coding" /
 * "configuration-driven design" instruction. This script is simply one
 * chosen configuration, run once, for demonstration purposes.
 *
 * Milestone 13 update: Lessons and the Assessment are now drafted by
 * Faculty, walked through Submitted → Approved → Published by Program
 * Director and Administrator (the same service functions the real
 * portal screens use), and one Grade is carried all the way to
 * Approved — so a freshly seeded database demonstrates the full
 * Curriculum Delivery Vertical Slice lifecycle out of the box.
 *
 * Milestone 14 update: every Lesson/Assessment created below is now a
 * Lesson/Assessment *identity* plus its first Version — createLesson/
 * createAssessment return `{ lesson, version }` /
 * `{ assessment, version }`. The seed additionally walks Lesson 1
 * through this milestone's exact "critical demonstration": the Student
 * completes Version 1, Faculty then drafts and publishes Version 2, and
 * the Student's Version 1 completion remains on record, untouched, even
 * though Version 2 is now what the Course delivers — so a freshly
 * seeded database proves "a published educational record can evolve
 * without rewriting history" out of the box, not only under test.
 *
 * Milestone 15 update: the Program below already carried
 * `requiresExternship: true` since it was first created (recorded for
 * future phases per Milestone 10's schema comment) — this milestone is
 * that future phase. The seed now also activates a Clinical Coordinator,
 * records a Clinical Site, and walks one Placement all the way to a
 * Program-Director-verified Completion, through the same
 * src/services/externship/externship.ts functions the real Coordinator/
 * Program Director portal screens call — so a freshly seeded database
 * demonstrates the full Externship Eligibility & Placement lifecycle out
 * of the box too.
 *
 * Run with: npm run db:seed
 * Safe to re-run against an empty database; not idempotent against a
 * database that already has data (it will create duplicates or fail on
 * unique constraints) — this is a Local Development convenience script,
 * not a migration.
 */

import { createUser, assignRole } from "../src/services/identity/users";
import {
  createInstitution,
  createSchool,
  createProgram,
  createCohort,
  createCourse,
  createCourseOffering,
  createLesson,
  createNewLessonVersion,
  updateLessonVersionDraft,
} from "../src/services/academic/institution";
import { createAssessment, submitAssessment } from "../src/services/assessments/assessments";
import { createEnrollment, markLessonComplete } from "../src/services/enrollment/enrollment";
import { createCompetency } from "../src/services/academic/competency";
import {
  submitContentForReview,
  approveContent,
  publishContent,
} from "../src/services/academic/content-workflow";
import { enterGrade, submitGradeForApproval, approveGrade } from "../src/services/gradebook/gradebook";
import {
  createClinicalSite,
  updateClinicalSiteStatus,
  determineEligibility,
  requestPlacement,
  approvePlacement,
  activatePlacement,
  recordEvaluation,
  attestHoursComplete,
  submitCompletionForVerification,
  verifyCompletion,
} from "../src/services/externship/externship";
import { db } from "../src/lib/db";
import type { SessionUser } from "../src/services/identity/session";

const DEMO_PASSWORD = "minara-demo-2026";

/**
 * externship.ts's functions take a full SessionUser (id + roleAssignments)
 * rather than a plain actorId string, per that module's own
 * service-layer-enforced-authorization design — this reconstructs that
 * shape from the database directly, the same projection
 * src/services/identity/session.ts's getSessionUser builds from a real
 * cookie-backed session, since this script has no HTTP request/cookie to
 * read one from.
 */
async function actorFor(userId: string): Promise<SessionUser> {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    include: { roleAssignments: true },
  });
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

async function main() {
  console.log("Seeding Minara-LMS local development database...\n");

  // 1. Bootstrap the first Administrator. actorId: null here is the one
  // legitimate case for a null actor outside a test — see the module
  // comment in src/services/identity/users.ts.
  const admin = await createUser({
    name: "Alex Administrator",
    email: "admin@minara.edu",
    password: DEMO_PASSWORD,
    actorId: null,
  });
  await assignRole({ userId: admin.id, role: "ADMINISTRATOR", actorId: null });

  // 2. Institution structure.
  const institution = await createInstitution("Minara Institute of Health Sciences", admin.id);
  const school = await createSchool(
    { institutionId: institution.id, name: "School of Pharmacy Sciences" },
    admin.id,
  );
  const program = await createProgram(
    {
      schoolId: school.id,
      name: "Pharmacy Technology",
      slug: "pharmacy-technology",
      description:
        "Prepares students for real careers as pharmacy technicians, combining coursework with a supervised externship. Minara-LMS's first launch program, per ADR-008.",
      requiresExternship: true,
    },
    admin.id,
  );
  const cohort = await createCohort({ programId: program.id, name: "Fall 2026 Cohort" }, admin.id);

  const course = await createCourse(
    {
      programId: program.id,
      title: "Pharmacology Fundamentals",
      description: "An introduction to drug classifications, dosage calculations, and safe handling.",
    },
    admin.id,
  );
  const courseOffering = await createCourseOffering(
    { courseId: course.id, cohortId: cohort.id, term: "Fall 2026" },
    admin.id,
  );

  // 3. Faculty and Program Director — created before content so the
  // Curriculum Delivery Vertical Slice below is authored/reviewed by
  // the same accounts a real Faculty/Program Director would use.
  const faculty = await createUser(
    { name: "Fatima Faculty", email: "faculty@minara.edu", password: DEMO_PASSWORD, actorId: admin.id },
  );
  await assignRole({
    userId: faculty.id,
    role: "FACULTY",
    courseOfferingId: courseOffering.id,
    actorId: admin.id,
  });

  const programDirector = await createUser({
    name: "Priya Director",
    email: "director@minara.edu",
    password: DEMO_PASSWORD,
    actorId: admin.id,
  });
  await assignRole({
    userId: programDirector.id,
    role: "PROGRAM_DIRECTOR",
    programId: program.id,
    actorId: admin.id,
  });

  // 4. Competency, and Curriculum content drafted by Faculty — Milestone
  // 13's Curriculum Delivery Vertical Slice.
  const competency = await createCompetency(
    { programId: program.id, name: "Identify drug classification systems" },
    admin.id,
  );
  const dosageCompetency = await createCompetency(
    { programId: program.id, name: "Perform pharmacy dosage calculations" },
    admin.id,
  );

  const { lesson: lesson1, version: lesson1v1 } = await createLesson(
    {
      courseId: course.id,
      title: "Introduction to Drug Classifications",
      content:
        "This lesson introduces the major drug classification systems used in pharmacy practice, " +
        "including therapeutic classification, mechanism of action, and controlled substance schedules.",
      competencyIds: [competency.id],
    },
    faculty.id,
  );
  const { version: lesson2v1 } = await createLesson(
    {
      courseId: course.id,
      title: "Dosage Calculations",
      content:
        "This lesson covers the core dosage calculation methods a pharmacy technician uses daily: " +
        "ratio-proportion, dimensional analysis, and body-weight-based dosing.",
      competencyIds: [dosageCompetency.id],
    },
    faculty.id,
  );
  const { assessment, version: assessmentV1 } = await createAssessment(
    {
      courseId: course.id,
      title: "Pharmacology Fundamentals — Quiz 1",
      instructions:
        "In your own words, explain the difference between therapeutic classification and mechanism " +
        "of action, and give one example of each.",
      maxScore: 100,
    },
    faculty.id,
  );

  // Walk each Version 1 through Draft → Submitted → Approved →
  // Published, through the same content-workflow.ts functions the
  // Faculty/Program Director/Administrator portal screens call.
  for (const versionId of [lesson1v1.id, lesson2v1.id]) {
    await submitContentForReview("LESSON", versionId, faculty.id);
    await approveContent("LESSON", versionId, programDirector.id);
    await publishContent("LESSON", versionId, admin.id);
  }
  await submitContentForReview("ASSESSMENT", assessmentV1.id, faculty.id);
  await approveContent("ASSESSMENT", assessmentV1.id, programDirector.id);
  await publishContent("ASSESSMENT", assessmentV1.id, admin.id);

  // 5. Student — enrolled, then carried through Assessment Submission →
  // Grade Entry → Grade Approval, so the seeded database demonstrates a
  // Competency Progress signal (src/services/academic/competency.ts)
  // out of the box, not just Published content with nothing done yet.
  const student = await createUser({
    name: "Sam Student",
    email: "student@minara.edu",
    password: DEMO_PASSWORD,
    actorId: admin.id,
  });
  await createEnrollment(
    { studentId: student.id, programId: program.id, cohortId: cohort.id },
    admin.id,
  );

  // Student completes Lesson 1's Version 1 *before* Version 2 exists —
  // this ordering matters, it is what makes the demo below a genuine
  // "historical activity predates the new version" scenario rather
  // than a coincidence.
  await markLessonComplete({ studentId: student.id, lessonId: lesson1.id });

  const submission = await submitAssessment({
    assessmentId: assessment.id,
    studentId: student.id,
    courseOfferingId: courseOffering.id,
    content:
      "Therapeutic classification groups drugs by what condition they treat (e.g., antihypertensives); " +
      "mechanism of action groups drugs by how they work at the cellular level (e.g., ACE inhibitors).",
  });
  const grade = await enterGrade({
    submissionId: submission.id,
    score: 95,
    feedback: "Clear and accurate — nice work.",
    enteredById: faculty.id,
  });
  await submitGradeForApproval(grade.id, faculty.id);
  await approveGrade(grade.id, programDirector.id);

  // 6. Milestone 14's critical demonstration, seeded directly: Faculty
  // drafts a Version 2 of Lesson 1 (a copy of Version 1's content,
  // lightly revised), which goes through the identical Draft →
  // Submitted → Approved → Published cycle and becomes the new
  // publishedVersionId. Version 1 — including the Student's completion
  // of it above — is never modified.
  const lesson1v2 = await createNewLessonVersion(lesson1.id, faculty.id);
  await updateLessonVersionDraft({
    versionId: lesson1v2.id,
    title: lesson1v2.title,
    content: `${lesson1v2.content}\n\nUpdate: added a note on high-alert medication classifications.`,
    competencyIds: [competency.id],
  });
  await submitContentForReview("LESSON", lesson1v2.id, faculty.id);
  await approveContent("LESSON", lesson1v2.id, programDirector.id);
  await publishContent("LESSON", lesson1v2.id, admin.id);

  // 7. Milestone 15's Externship Eligibility & Placement Vertical Slice —
  // activates the already-declared CLINICAL_COORDINATOR role (see
  // src/domain/roles.ts) and walks one Placement through the full
  // narrow slice this milestone built: eligibility determination → site
  // → placement request → approval → activation → midpoint evaluation →
  // final evaluation → hours-complete attestation → Coordinator submits
  // for Completion Verification → Program Director verifies it. No
  // specific hour count, GPA, or evaluation score threshold appears
  // anywhere below — every judgment call here is exactly that, a
  // judgment call recorded by the Coordinator/Program Director, never a
  // platform-enforced number (see this milestone's Externship Deep
  // Dive).
  const coordinator = await createUser({
    name: "Cody Coordinator",
    email: "coordinator@minara.edu",
    password: DEMO_PASSWORD,
    actorId: admin.id,
  });
  await assignRole({
    userId: coordinator.id,
    role: "CLINICAL_COORDINATOR",
    programId: program.id,
    actorId: admin.id,
  });

  const coordinatorActor = await actorFor(coordinator.id);
  const programDirectorActor = await actorFor(programDirector.id);

  const site = await createClinicalSite(
    {
      programId: program.id,
      name: "Riverbend Community Pharmacy",
      employerName: "Riverbend Health Partners",
      contactName: "Jordan Preceptor",
      contactInfo: "jordan@riverbendhealth.example",
      capacity: 2,
    },
    coordinatorActor,
  );
  await updateClinicalSiteStatus(site.id, "ACTIVE", coordinatorActor);

  await determineEligibility(
    {
      studentId: student.id,
      programId: program.id,
      status: "ELIGIBLE",
      notes: "Reviewed academic record: Pharmacology Fundamentals grade approved.",
    },
    coordinatorActor,
  );

  const placement = await requestPlacement(
    {
      studentId: student.id,
      programId: program.id,
      clinicalSiteId: site.id,
      preceptorName: "Jordan Preceptor",
      preceptorContact: "jordan@riverbendhealth.example",
    },
    coordinatorActor,
  );
  await approvePlacement(placement.id, coordinatorActor);
  await activatePlacement(placement.id, coordinatorActor);

  await recordEvaluation(
    {
      placementId: placement.id,
      type: "MIDPOINT",
      content: "Demonstrates strong attention to detail during prescription intake.",
      outcome: "SATISFACTORY",
    },
    coordinatorActor,
  );
  await recordEvaluation(
    {
      placementId: placement.id,
      type: "FINAL",
      content: "Consistently accurate dosage calculations; ready for independent practice.",
      outcome: "SATISFACTORY",
    },
    coordinatorActor,
  );
  await attestHoursComplete(placement.id, coordinatorActor);
  await submitCompletionForVerification(placement.id, coordinatorActor);
  await verifyCompletion(placement.id, programDirectorActor);

  console.log("Seed complete. Demo accounts (all use the same password):\n");
  console.log(`  Administrator       admin@minara.edu`);
  console.log(`  Faculty             faculty@minara.edu`);
  console.log(`  Program Director    director@minara.edu`);
  console.log(`  Clinical Coordinator coordinator@minara.edu`);
  console.log(`  Student             student@minara.edu`);
  console.log(`  Password (all)      ${DEMO_PASSWORD}\n`);
  console.log(
    "Lesson 1 now has two Versions — v1 (Published, completed by the Student before v2 existed) " +
      "and v2 (Published, now the live version delivered to Students; the Student has not yet " +
      "completed it) — demonstrating Milestone 14's versioning guarantee out of the box.",
  );
  console.log(
    "The Student's externship Placement at Riverbend Community Pharmacy has been carried through " +
      "eligibility, activation, both evaluations, and a Program-Director-verified Completion — " +
      "demonstrating Milestone 15's full narrow slice out of the box.",
  );
  console.log("Assessment id for manual testing:", assessment.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
