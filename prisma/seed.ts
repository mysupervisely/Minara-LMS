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
import { createAssessment } from "../src/services/assessments/assessments";
import { createEnrollment } from "../src/services/enrollment/enrollment";
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

  await createLesson(
    {
      courseId: course.id,
      title: "Introduction to Drug Classifications",
      content:
        "This lesson introduces the major drug classification systems used in pharmacy practice, " +
        "including therapeutic classification, mechanism of action, and controlled substance schedules.",
    },
    admin.id,
  );
  await createLesson(
    {
      courseId: course.id,
      title: "Dosage Calculations",
      content:
        "This lesson covers the core dosage calculation methods a pharmacy technician uses daily: " +
        "ratio-proportion, dimensional analysis, and body-weight-based dosing.",
    },
    admin.id,
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
    admin.id,
  );

  // 3. Faculty, Program Director, and Students.
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
