# Multi-School and Multi-Program Access Model

**Status:** Draft
**Milestone:** 2 — User Roles & Permission Architecture
**Date:** 2026-08-06

This document defines, conceptually, how access works when a single
platform serves multiple schools, each with multiple programs, each with
multiple cohorts — and when a single person (staff or student) may relate
to more than one of these at once. It builds directly on
[Platform Philosophy](../milestone-1-product-vision-platform-strategy/04-platform-philosophy.md)'s
"one account, one profile, multiple programs" model.

## The Core Idea: Role Assignment, Not Global Role

A role (Student, Faculty Instructor, Program Director, Admissions Staff,
Externship/Clinical Coordinator, Employer Partner, Administrator) is not,
by itself, enough to describe someone's access. Access is described by a
**role assignment**:

> **Role Assignment = (Person) + (Role) + (Scope)**

Where **Scope** is a node in the structural hierarchy from
[Role Hierarchy](./03-role-hierarchy.md): Institution, School, Program,
Cohort, or Section/Course — or, for a Student, the special scope
**Self**.

A single person can hold **multiple role assignments simultaneously**,
each with its own role and its own scope. This is what allows, for
example:

- A Faculty Instructor teaching a section in **Program A** at **School
  X**, and a separate section in **Program B** at **School Y**, holding
  two Faculty Instructor role assignments, each scoped to its own
  section.
- A person who is a Program Director for **Program A** and also teaches
  a course as Faculty Instructor in **Program B** — two different role
  assignments, different roles, different scopes, same person.
- A Student enrolled in a Minara school program **and** participating in
  a Prepped product (e.g., PharmTechPrepped) — one Student identity, two
  enrollment-scoped relationships.

## Scope Levels

| Scope Level | Applies Naturally To | Example |
|---|---|---|
| **Institution-wide** | Administrator (default); potentially Admissions Staff | Sees/manages across all schools and programs |
| **School** | A role assignment limited to one school but spanning its programs | **⚠️ Needs Verification** — whether school-scoped roles exist distinctly from institution-wide or program-scoped ones |
| **Program** | Program Director, Externship/Clinical Coordinator (typical) | Sees/manages within one program's cohorts, sections, and students |
| **Cohort** | Rarely a standalone scope; usually inherited from Program | A Program Director may filter by cohort, but authority is program-level |
| **Section/Course** | Faculty Instructor | Sees/manages the students enrolled in that specific section |
| **Self** | Student | Sees own profile, enrollments, grades, progress, payments |

Scope is **hierarchical and inclusive downward**: a role assignment
scoped to a Program includes everything beneath it (its Cohorts and
Sections) unless explicitly narrowed. A role assignment scoped to a
Section does not include anything above it.

## Students Across Multiple Programs and Schools

A Student's platform identity (their account and profile) is singular and
persists across every program and school they touch, per
[Platform Philosophy](../milestone-1-product-vision-platform-strategy/04-platform-philosophy.md).
What varies **per enrollment** is:

- Which courses, assignments, and assessments they see
- Which grades and progress records apply
- Which cohort and section they belong to
- Which Faculty Instructor(s), Program Director, and (if applicable)
  Externship/Clinical Coordinator have a role-based relationship to them

Practically: a Student's own-record access (Scope = Self) always shows
*all* of their own data across every program, but a Faculty Instructor's
Section-scoped access to that same student is limited to the section(s)
that Faculty Instructor actually teaches them in. The student is not
"invisible" to one Faculty member because they're also enrolled
elsewhere — but that unrelated Faculty member has no access to the
unrelated enrollment.

## Employer Partners

Employer Partner access is inherently scoped to **their own
organization's placement and hiring relationships**, and is not
institution-, school-, or program-scoped in the same sense as internal
staff roles. An Employer Partner engaging with students across more than
one program only sees the students actually placed or engaged with them.

## Cross-School / Cross-Program Reporting

Institution-wide reporting (owned by Administrators, per the
[Permission Framework](./02-permission-framework.md)) is the one place
scope is intentionally aggregated *across* schools and programs. This is
treated as a distinct capability — aggregation for reporting purposes —
rather than as a role assignment scope in its own right, since it does
not grant operational (create/edit/approve) authority over the
underlying records.

## Current / Planned / Future

| Element | Status |
|---|---|
| Role Assignment = (Person, Role, Scope) model | **Current** |
| Hierarchical, downward-inclusive scope resolution | **Current** |
| Multiple simultaneous role assignments per person | **Current** |
| Explicit School-level scope (distinct from Institution and Program) | **Planned**, pending confirmation of whether Minara schools require independent administrative layers |
| Cohort-level scope as a standalone (not just Program-inherited) access boundary | **Future** |
| Cross-program student transfer workflows (moving a student's active enrollment between programs while preserving history) | **Future** |
| Institution-wide reporting aggregation as a distinct read-only capability, separate from operational role scope | **Planned** |

## ⚠️ Needs Verification

- Whether "School" needs to be a first-class scope level with its own
  administrative role(s), or whether "School" is primarily an
  organizational grouping of Programs with Administrator oversight
  applying uniformly, is not yet confirmed.
- Whether a Program Director can hold authority spanning multiple
  Programs (e.g., a director overseeing a cluster of related programs)
  is not yet confirmed; this document assumes one Program Director role
  assignment per Program, with a person able to hold more than one such
  assignment.
- The mechanics of a student changing programs or schools mid-enrollment
  (e.g., transferring) are not yet defined and are marked **Future**
  above pending institutional policy from Minara-Master-Plan.
