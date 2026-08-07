# Course-Level Versioning Evaluation

**Status:** Draft
**Milestone:** 15 — Planning (Architecture Checkpoint, Question 2)
**Date:** 2026-08-07

Milestone 14's final report recommended: *"Extend versioning upward to
Course-level composition... only if a real product need for that
emerges."* This document performs that evaluation honestly, rather than
building it by default.

## What Milestone 14 Already Solved

`LessonVersion`/`AssessmentVersion` give exact, immutable, per-item
historical accuracy: a Student's `LessonCompletion`/`Submission` is
foreign-keyed to the specific version they engaged with, and publishing
a new version never rewrites that row. This is tested end to end
(`tests/content-versioning.test.ts`, 18/18 assertions) and is exactly
what M14 set out to prove.

## What Course-Level Versioning Would Add — and What It Would Not

**It would not** improve the accuracy of any individual Lesson or
Assessment a Student already completed — that is already solved.

**It would** address a narrower, different question: *if a Faculty
member or Administrator adds, removes, or reorders which Lessons and
Assessments belong to a Course after a Cohort has already begun*, should
Students who started under the old composition keep seeing the old set,
the way they already keep seeing the old *content* of an unchanged
Lesson? Today, `Course.lessons`/`Course.assessments` are live,
unversioned relations — `CourseOffering` has no persisted "manifest" of
which Lessons/Assessments it presents; it always reflects whatever the
parent `Course` currently contains, each resolved to its own live
`publishedVersionId` at render time.

## Analysis Against the Six Questions Posed

**Is Course-level versioning required to preserve historical student
learning experiences?** No, not for the case M14 was built to solve
(content accuracy). It would only matter for Course *composition* drift,
a materially narrower and currently unobserved scenario.

**Are LessonVersion + AssessmentVersion sufficient?** Yes, for
content-level historical accuracy — proven by the M14 test suite. They
are not sufficient for composition-level historical accuracy, but
nothing in this repository's actual usage (seed data, tests, or any
documented workflow) has ever exercised composition drift: Courses are
authored once, then delivered; no screen or service function in this
codebase lets someone remove a Lesson from a Course that already has an
active Course Offering.

**How should a Course Offering know which published versions it
presents?** Currently, implicitly and dynamically: it always resolves
whatever the live `Course.lessons`/`Course.assessments` set is, each to
its own `publishedVersionId`, at request time. This is adequate as long
as composition itself doesn't change after a Cohort begins — which is
the actual, current operating assumption, not an aspiration.

**Could changing Course composition break historical grades/
completions?** No — data integrity is safe regardless. `LessonCompletion`
and `Submission` key off `lessonVersionId`/`assessmentVersionId`
directly, never off Course composition. Removing a Lesson from a Course
would not corrupt or lose any historical row; it would only make the
*Course's current outline* not match what an earlier Cohort's Student
actually saw — a presentation/reporting question, not a data-loss risk.

**Should Program/Course versioning happen now or later?** Later. No
concrete trigger exists in this codebase's actual usage today —
building it now would be exactly the "abstraction for a hypothetical
second use case that doesn't exist yet" that
[ADR-012 Principle 3](../../architecture/adr/ADR-012-development-philosophy.md#3-documentation-before-complexity)
warns against.

**Does it add meaningful value before launch?** Marginal. The concrete,
observable gaps standing between this platform and a real operating
Pharmacy Technology school are Certificates, Externship tracking, and
Payments (see [Candidate Ranking](./03-vertical-slice-candidate-ranking.md))
— none of which depend on Course-level versioning. The single launch
cohort's Course list is being authored once, pre-launch, not iteratively
restructured mid-term.

## Recommendation: **DEFER**

Not "do not build" — the entity/version-split pattern M14 proved
(`Lesson`/`LessonVersion`) generalizes directly to a future
`Course`/`CourseVersion` holding an ordered manifest of Lesson/Assessment
references, if and when a real scenario demands it (e.g., a Program
Director needs to add a required Lesson to a live Course mid-Cohort
without affecting students who already progressed). This is a low-regret
deferral: the pattern to reuse already exists and is proven, so waiting
for a real trigger costs nothing architecturally.

**Do not build now.** No real product need has emerged; building it
would be speculative complexity ahead of demonstrated need, contrary to
[ADR-012](../../architecture/adr/ADR-012-development-philosophy.md) and
[ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md)'s
shared discipline.

## Current / Planned / Future

| Element | Status |
|---|---|
| Lesson/Assessment versioning (M14) | **Current** — implemented |
| Course/Program/Module-level versioning | **Future** — revisit only if a concrete composition-drift scenario is reported |

## ⚠️ Needs Verification

- Whether any institutional policy already anticipates mid-Cohort Course
  restructuring (this document assumes not, based on absence of any such
  workflow anywhere in Milestones 1–14's documentation or code) —
  ⚠️ Needs Verification against Minara-Master-Plan / institutional
  academic policy if that assumption is ever challenged.
