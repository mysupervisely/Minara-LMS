import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listInstitutions, listProgramsWithDetail } from "@/services/academic/institution";
import { ActionForm } from "@/components/action-form";
import {
  createInstitutionAction,
  createSchoolAction,
  createProgramAction,
  createCohortAction,
  createCourseAction,
  createCourseOfferingAction,
  createLessonAction,
  createAssessmentAction,
} from "../actions";

export const metadata: Metadata = { title: "Institution Structure" };

/**
 * Institution Structure Foundation — implements Milestone 10, Phase 5:
 * Institution, School, Program, Course, Course Offering / Section, and
 * (for Phase 6/7) Lesson and Assessment creation. Deliberately not full
 * curriculum management (no content versioning, no Minara-Curriculum
 * integration) — see prisma/schema.prisma's comments.
 *
 * Every option in every select below is read from the database, not
 * hard-coded — creating a Pharmacy Technology program here is no
 * different from creating any other program, per this milestone's
 * "avoid Pharmacy Technology hard-coding" instruction.
 */
export default async function AdminInstitutionPage() {
  await requireSessionUserWithRole("ADMINISTRATOR");

  const institutions = await listInstitutions();
  const programs = await listProgramsWithDetail();
  const schools = institutions.flatMap((i) => i.schools.map((s) => ({ ...s, institutionName: i.name })));
  const cohorts = programs.flatMap((p) => p.cohorts.map((c) => ({ ...c, programName: p.name })));
  const courses = programs.flatMap((p) => p.courses.map((c) => ({ ...c, programName: p.name })));
  const courseOfferings = courses.flatMap((c) =>
    c.courseOfferings.map((co) => ({ ...co, courseTitle: c.title, programName: c.programName })),
  );

  return (
    <div className="stack">
      <h1>Institution Structure</h1>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Institutions</h2>
        {institutions.length === 0 ? (
          <p className="muted">No Institution has been created yet.</p>
        ) : (
          <ul>
            {institutions.map((i) => (
              <li key={i.id}>{i.name}</li>
            ))}
          </ul>
        )}
        <ActionForm action={createInstitutionAction} submitLabel="Create Institution">
          <div className="field">
            <label htmlFor="institution-name">Institution name</label>
            <input id="institution-name" name="name" required />
          </div>
        </ActionForm>
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Schools</h2>
        {schools.length === 0 ? (
          <p className="muted">No School has been created yet.</p>
        ) : (
          <ul>
            {schools.map((s) => (
              <li key={s.id}>
                {s.name} <span className="muted">— {s.institutionName}</span>
              </li>
            ))}
          </ul>
        )}
        <ActionForm action={createSchoolAction} submitLabel="Create School">
          <div className="field">
            <label htmlFor="school-institution">Institution</label>
            <select id="school-institution" name="institutionId" required disabled={institutions.length === 0}>
              <option value="">Select an Institution&hellip;</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="school-name">School name</label>
            <input id="school-name" name="name" required />
          </div>
        </ActionForm>
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Programs</h2>
        {programs.length === 0 ? (
          <p className="muted">No Program has been created yet.</p>
        ) : (
          <ul>
            {programs.map((p) => (
              <li key={p.id}>
                {p.name} <span className="muted">— {p.school.name}</span>{" "}
                {p.requiresExternship ? <span className="badge badge--submitted">Externship</span> : null}
              </li>
            ))}
          </ul>
        )}
        <ActionForm action={createProgramAction} submitLabel="Create Program">
          <div className="field">
            <label htmlFor="program-school">School</label>
            <select id="program-school" name="schoolId" required disabled={schools.length === 0}>
              <option value="">Select a School&hellip;</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="program-name">Program name</label>
            <input id="program-name" name="name" required />
          </div>
          <div className="field">
            <label htmlFor="program-slug">URL slug</label>
            <input id="program-slug" name="slug" placeholder="e.g. pharmacy-technology" required />
            <span className="hint">Lowercase letters, numbers, and hyphens only — used in /programs/[slug].</span>
          </div>
          <div className="field">
            <label htmlFor="program-description">Description</label>
            <textarea id="program-description" name="description" />
          </div>
          <div className="field">
            <label>
              <input type="checkbox" name="requiresExternship" /> Requires an externship
            </label>
          </div>
        </ActionForm>
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Cohorts</h2>
        {cohorts.length === 0 ? (
          <p className="muted">No Cohort has been created yet.</p>
        ) : (
          <ul>
            {cohorts.map((c) => (
              <li key={c.id}>
                {c.name} <span className="muted">— {c.programName}</span>
              </li>
            ))}
          </ul>
        )}
        <ActionForm action={createCohortAction} submitLabel="Create Cohort">
          <div className="field">
            <label htmlFor="cohort-program">Program</label>
            <select id="cohort-program" name="programId" required disabled={programs.length === 0}>
              <option value="">Select a Program&hellip;</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="cohort-name">Cohort name</label>
            <input id="cohort-name" name="name" placeholder="e.g. Fall 2026" required />
          </div>
        </ActionForm>
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Courses</h2>
        {courses.length === 0 ? (
          <p className="muted">No Course has been created yet.</p>
        ) : (
          <ul>
            {courses.map((c) => (
              <li key={c.id}>
                {c.title} <span className="muted">— {c.programName}</span>
              </li>
            ))}
          </ul>
        )}
        <ActionForm action={createCourseAction} submitLabel="Create Course">
          <div className="field">
            <label htmlFor="course-program">Program</label>
            <select id="course-program" name="programId" required disabled={programs.length === 0}>
              <option value="">Select a Program&hellip;</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="course-title">Course title</label>
            <input id="course-title" name="title" required />
          </div>
          <div className="field">
            <label htmlFor="course-description">Description</label>
            <textarea id="course-description" name="description" />
          </div>
        </ActionForm>
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Course Offerings (Sections)</h2>
        {courseOfferings.length === 0 ? (
          <p className="muted">No Course Offering has been created yet.</p>
        ) : (
          <ul>
            {courseOfferings.map((co) => (
              <li key={co.id}>
                {co.courseTitle} &middot; {co.cohort.name} &middot; {co.term}
              </li>
            ))}
          </ul>
        )}
        <ActionForm action={createCourseOfferingAction} submitLabel="Create Course Offering">
          <div className="field">
            <label htmlFor="offering-course">Course</label>
            <select id="offering-course" name="courseId" required disabled={courses.length === 0}>
              <option value="">Select a Course&hellip;</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.programName})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="offering-cohort">Cohort</label>
            <select id="offering-cohort" name="cohortId" required disabled={cohorts.length === 0}>
              <option value="">Select a Cohort&hellip;</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.programName})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="offering-term">Term</label>
            <input id="offering-term" name="term" placeholder="e.g. Fall 2026" required />
          </div>
        </ActionForm>
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Lessons</h2>
        <ActionForm action={createLessonAction} submitLabel="Create Lesson">
          <div className="field">
            <label htmlFor="lesson-course">Course</label>
            <select id="lesson-course" name="courseId" required disabled={courses.length === 0}>
              <option value="">Select a Course&hellip;</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.programName})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="lesson-title">Lesson title</label>
            <input id="lesson-title" name="title" required />
          </div>
          <div className="field">
            <label htmlFor="lesson-content">Content</label>
            <textarea id="lesson-content" name="content" required />
          </div>
        </ActionForm>
        {courses.map((c) =>
          c.lessons.length === 0 ? null : (
            <div key={c.id} className="card">
              <h3>{c.title}</h3>
              <ul>
                {c.lessons.map((l) => (
                  <li key={l.id}>{l.title}</li>
                ))}
              </ul>
            </div>
          ),
        )}
      </section>

      <section style={{ padding: 0, border: "none" }}>
        <h2>Assessments</h2>
        <ActionForm action={createAssessmentAction} submitLabel="Create Assessment">
          <div className="field">
            <label htmlFor="assessment-course">Course</label>
            <select id="assessment-course" name="courseId" required disabled={courses.length === 0}>
              <option value="">Select a Course&hellip;</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.programName})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="assessment-title">Assessment title</label>
            <input id="assessment-title" name="title" required />
          </div>
          <div className="field">
            <label htmlFor="assessment-instructions">Instructions</label>
            <textarea id="assessment-instructions" name="instructions" required />
          </div>
          <div className="field">
            <label htmlFor="assessment-maxScore">Max score</label>
            <input id="assessment-maxScore" name="maxScore" type="number" min={1} defaultValue={100} />
          </div>
        </ActionForm>
        {courses.map((c) =>
          c.assessments.length === 0 ? null : (
            <div key={c.id} className="card">
              <h3>{c.title}</h3>
              <ul>
                {c.assessments.map((a) => (
                  <li key={a.id}>
                    {a.title} <span className="muted">(/{a.maxScore})</span>
                  </li>
                ))}
              </ul>
            </div>
          ),
        )}
      </section>
    </div>
  );
}
