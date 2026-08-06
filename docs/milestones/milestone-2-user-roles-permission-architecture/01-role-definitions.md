# Role Definitions

**Status:** Draft
**Milestone:** 2 — User Roles & Permission Architecture
**Date:** 2026-08-06

This document defines the seven primary platform roles first introduced
in [Primary User Groups](../milestone-1-product-vision-platform-strategy/05-primary-user-groups.md).
For each role it describes: purpose, core responsibilities, primary
platform interactions, and relationship to other roles. Concrete
permissions are detailed in the [Permission Framework](./02-permission-framework.md);
reporting/approval relationships are detailed in [Role Hierarchy](./03-role-hierarchy.md).

A person may hold more than one role, and may hold the same role scoped
to more than one school, program, or cohort (see
[Multi-School and Multi-Program Access Model](./04-multi-school-multi-program-access-model.md)).
Roles describe *capacity*, not a fixed, exclusive account type.

---

## 1. Student

**Purpose:** The learner. The role the entire platform ultimately serves.

**Core Responsibilities:**
- Progress through enrolled courses and complete required learning
  activities
- Complete assignments and assessments honestly and on schedule
- Maintain accurate profile and payment information
- Communicate with faculty and staff as needed
- Fulfill externship/clinical requirements where applicable

**Platform Interactions:**
- Student Portal: dashboard, course access, lesson completion,
  assessments, grades, progress tracking, certificates, payments,
  messaging, AI learning assistant

**Relationship to Other Roles:** Receives instruction from Faculty,
is subject to program oversight by Program Directors, is placed and
evaluated by Externship/Clinical Coordinators (where applicable), is
evaluated by Employer Partners (where applicable), and is administered
by Admissions Staff and Administrators.

---

## 2. Faculty Instructor

**Purpose:** Delivers instruction and evaluates student learning within
assigned courses/sections.

**Core Responsibilities:**
- Manage the content and structure of assigned course sections (within
  curriculum delivered from Minara-Curriculum)
- Monitor enrolled students' progress
- Grade assignments and assessments
- Provide feedback to students
- Communicate with students in their sections
- Report course-level concerns to the Program Director

**Platform Interactions:**
- Faculty Portal: course management, student progress views, grading,
  feedback, communication, section-level analytics

**Relationship to Other Roles:** Reports to the Program Director for the
program(s) they teach in. Interacts directly with Students in their
sections. Does not typically have authority over students outside their
own sections/cohorts.

---

## 3. Program Director

**Purpose:** Owns the academic and operational integrity of a program.

**Core Responsibilities:**
- Oversee curriculum delivery within the program (in coordination with
  Minara-Curriculum content and Faculty delivery of it)
- Manage cohort-level structure and health for the program
- Coordinate and support Faculty teaching within the program
- Produce and review program-level reporting (e.g., for accreditation
  or institutional review)
- Serve as an escalation point above individual Faculty Instructors

**Platform Interactions:**
- Program Director Portal: curriculum oversight, cohort management,
  faculty coordination, program reporting

**Relationship to Other Roles:** Sits above Faculty Instructors within a
given program. Coordinates with Admissions Staff on program capacity and
enrollment, and with Externship/Clinical Coordinators on program
placement requirements. Reports into institutional Administrators.

---

## 4. Admissions Staff

**Purpose:** Manages the prospective-to-enrolled student pipeline.

**Core Responsibilities:**
- Process and review applications
- Guide prospective students through onboarding
- Manage enrollment workflow and status
- Track application/enrollment status and communicate updates
- Coordinate with Program Directors on program capacity/eligibility
  requirements

**Platform Interactions:**
- Admissions Portal: applications, student onboarding, enrollment
  workflow, status tracking

**Relationship to Other Roles:** Operates upstream of a student becoming
an active learner. Hands off enrolled students to Program Directors and
Faculty once enrollment is confirmed. Reports into institutional
Administrators.

---

## 5. Externship/Clinical Coordinator

**Purpose:** Manages the off-campus, real-world training component of
health sciences programs.

**Core Responsibilities:**
- Manage relationships with externship/clinical sites
- Place students at sites appropriate to their program and stage
- Track clinical/externship hours
- Record and manage evaluations of student performance at placement
  sites
- Ensure placement activity meets program and (eventually)
  accreditation/licensure requirements

**Platform Interactions:**
- Clinical/Externship Coordinator Portal: externship sites, student
  placement, hours tracking, evaluations

**Relationship to Other Roles:** Coordinates closely with Program
Directors on program placement requirements, and is the primary internal
point of contact for Employer Partners hosting placements. Interacts
with Students regarding placement logistics and requirements.

---

## 6. Employer Partner

**Purpose:** An external organization engaged in the institution's
talent pipeline — as a placement host, evaluator, and/or hiring
participant.

**Core Responsibilities:**
- Maintain the partnership relationship with the institution
- Evaluate students placed with them (externship or otherwise)
- Participate in hiring pipeline activity for graduating/eligible
  students

**Platform Interactions:**
- Employer Portal: partnership management, student evaluation, hiring
  pipeline

**Relationship to Other Roles:** External to the institution's staff
hierarchy. Primary internal liaison is the Externship/Clinical
Coordinator. Interacts with Students only in the bounded context of
placement/evaluation/hiring, not general academic administration.

---

## 7. Administrator

**Purpose:** Owns institution-wide operational oversight across schools
and programs.

**Core Responsibilities:**
- Institution-wide management and cross-program reporting
- Manage permissions and role assignments
- Finance oversight
- Serve as the top of the internal role hierarchy for escalation and
  governance enforcement

**Platform Interactions:**
- Admin Portal: institution-wide management, reporting, permissions,
  finance oversight

**Relationship to Other Roles:** Sits above Program Directors, Admissions
Staff, and Externship/Clinical Coordinators in the institutional
hierarchy (see [Role Hierarchy](./03-role-hierarchy.md)). Administrator
authority is expected to reflect Minara-Master-Plan's institutional
governance structure.

---

## ⚠️ Needs Verification

- Whether "Administrator" is a single flat role or should be decomposed
  into sub-roles (e.g., Institutional Administrator vs. School-Level
  Administrator vs. Finance Administrator) is not yet confirmed. This
  document treats Administrator as one role for Phase 1, with
  decomposition flagged as a **Planned** consideration in the
  [Permission Framework](./02-permission-framework.md).
- Whether a distinct "Compliance / Accreditation Liaison" role is needed
  (called out as an open question in Milestone 1) remains unresolved and
  is treated as **Future** here.
- The precise authority Program Directors hold relative to institutional
  Administrators (e.g., whether Program Directors can independently
  approve program-level policy exceptions) should be confirmed against
  Minara-Master-Plan governance documents.
