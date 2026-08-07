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
 * Curriculum Delivery Vertical Slice lifecycle out of the box, not just
 * its Draft state.
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
} from "../src/services/academic/institution";
import { createAssessment, submitAssessment } from "../src/services/assessments/assessments";
import { createEnrollment } from "../src/services/enrollment/enrollment";
import { createCompetency } from "../src/services/academic/competency";
import {
  submitContentForReview,
  approveContent,
  publishContent,
} from "../src/services/academic/content-workflow";
import { enterGrade, submitGradeForApproval, approveGrade } from "../src/services/gradebook/gradebook";
import { db } from "../src/lib/db";

const DEMO_PASSWORD = "minara-demo-2026";

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

  const lesson1 = await createLesson(
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
  const lesson2 = await createLesson(
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
  const assessment = await createAssessment(
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

  // Walk each item through Draft → Submitted → Approved → Published,
  // through the same content-workflow.ts functions the Faculty/Program
  // Director/Administrator portal screens call.
  for (const contentId of [lesson1.id, lesson2.id]) {
    await submitContentForReview("LESSON", contentId, faculty.id);
    await approveContent("LESSON", contentId, programDirector.id);
    await publishContent("LESSON", contentId, admin.id);
  }
  await submitContentForReview("ASSESSMENT", assessment.id, faculty.id);
  await approveContent("ASSESSMENT", assessment.id, programDirector.id);
  await publishContent("ASSESSMENT", assessment.id, admin.id);

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

  console.log("Seed complete. Demo accounts (all use the same password):\n");
  console.log(`  Administrator     admin@minara.edu`);
  console.log(`  Faculty           faculty@minara.edu`);
  console.log(`  Program Director  director@minara.edu`);
  console.log(`  Student           student@minara.edu`);
  console.log(`  Password (all)    ${DEMO_PASSWORD}\n`);
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
