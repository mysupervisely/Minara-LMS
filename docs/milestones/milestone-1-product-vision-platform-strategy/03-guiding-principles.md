# Guiding Principles

**Status:** Draft
**Milestone:** 1 — Product Vision & Platform Strategy
**Date:** 2026-08-06

These principles are non-negotiable constraints on how Minara-LMS is
architected and built. They apply regardless of which specific
technologies are eventually selected, and every later architectural
decision (data model, service design, technology selection) should be
checked against them.

## 1. Scalability
The platform must accommodate growth in the number of schools, programs,
cohorts, and students without requiring architectural rework. Scale is
treated as a day-one design constraint, not a later optimization.

## 2. Security
Student, health-program, and institutional data require a security
posture appropriate to sensitive educational and (where clinical
placement is involved) potentially health-adjacent records. Security is
a foundational architectural concern, not a feature added later.

## 3. Accessibility
The platform must be usable by learners and staff with a range of
abilities. Accessibility is a design requirement for every portal and
every learner-facing surface, not an audit performed after launch.

## 4. Mobile-First Experience
Learners and staff will interact with the platform primarily on mobile
devices. Interfaces are designed mobile-first, with desktop as an
expanded experience rather than the primary target.

## 5. Server-Side Rendering (SSR) for Public-Facing Pages
Public-facing pages (e.g., marketing, admissions entry points, and other
content meant to be discoverable and fast-loading for prospective
students) are designed around server-side rendering principles to
support performance and discoverability.

## 6. Role-Based Access Control (RBAC)
Every user's access to data and functionality is governed by their role
(Student, Faculty, Program Director, Admissions, Clinical/Externship
Coordinator, Employer, Admin, and any future roles). Access control is a
first-class architectural concern, designed to support fine-grained,
auditable permissioning across multiple schools and programs.

## 7. Modular Architecture
The platform is composed of distinct, well-bounded capabilities
(admissions, curriculum delivery, gradebook, externship tracking,
payments, messaging, etc.) that can evolve independently. Modularity is
what allows new programs, schools, and Prepped products to be added
without destabilizing existing ones.

## 8. API-First Thinking
Capabilities are designed as services with clear contracts, not as
UI-embedded logic. This supports multiple portals consuming the same
underlying capabilities consistently, and supports future integrations
(e.g., with employer systems or external tools) without re-architecture.

## 9. Audit Logging
Actions that affect academic records, grades, enrollment, payments, or
access permissions must be traceable — who did what, when, and to what
record. This is treated as a compliance and trust requirement, relevant
to accreditation readiness.

## 10. Human-Reviewed AI Workflows
Wherever AI participates in the learning experience (e.g., the AI
learning assistant), its role is to assist and augment, not to make
unsupervised decisions with academic, disciplinary, or clinical
consequence. AI-influenced outcomes affecting a student's record are
subject to human review.

## 11. Future Accreditation Readiness
Health sciences programs operate under accreditation bodies with
specific evidentiary and process requirements. The platform is designed
so that, as accreditation requirements become concrete, the system can
produce the records, audit trails, and reporting those requirements
demand — without needing to be redesigned to do so.

## ⚠️ Needs Verification
- Specific accreditation bodies and their concrete evidentiary
  requirements are not yet identified in this repository; that detail is
  expected to originate from Minara-Master-Plan and inform later LMS
  architecture milestones.
