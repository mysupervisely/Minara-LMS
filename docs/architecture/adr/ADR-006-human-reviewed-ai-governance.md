# ADR-006: Human-Reviewed AI Governance

**Status:** Draft (Proposed)
**Date:** 2026-08-07
**Source:** [Guiding Principles §10](../../milestones/milestone-1-product-vision-platform-strategy/03-guiding-principles.md),
[AI Learning Assistant Workflow](../../milestones/milestone-3-student-journey-core-workflows/06-ai-learning-assistant-workflow.md),
[AI Platform Architecture](../../milestones/milestone-6-technical-architecture/06-ai-platform-architecture.md),
[AI Technology Architecture](../../milestones/milestone-8-technology-stack-development-architecture/09-ai-technology-architecture.md)

## Context / Problem

AI-assisted learning is part of Minara-LMS's stated vision (per
[Long-Term Platform Vision](../../milestones/milestone-1-product-vision-platform-strategy/07-long-term-platform-vision.md)),
but the platform operates in a health sciences education context where
an AI system making or influencing the wrong decision — a grade, an
admissions outcome, a graduation determination — carries real academic
and, in places, safety consequence. This decision fixes, permanently,
where AI's role stops and human institutional judgment begins.

## Decision

**AI assists education but does not replace institutional judgment.**
This is treated as an absolute boundary, not a preference balanced
against other considerations.

## AI Use Cases (Permitted, Bounded)

| Use Case | Description | Status |
|---|---|---|
| **Tutoring** | Student-facing Learning Support — answering questions, explaining concepts, guiding study | Planned, per [AI Platform Architecture](../../milestones/milestone-6-technical-architecture/06-ai-platform-architecture.md) |
| **Content Assistance** | Helping Faculty with delivery-side supplementary material — never authoring Minara-Curriculum's core content | Future |
| **Recommendations** | Surfacing insight (e.g., early-warning signals) derived from Learning Analytics | Future |
| **Faculty Support** | Assisting Faculty with routine, non-decisional tasks | Future |

## AI Restrictions (Absolute, Non-Negotiable)

The AI module **may never**:

- Approve or assign final grades.
- Make or influence admissions decisions.
- Approve graduation.
- Approve certificate issuance.

These four restrictions are enforced as an explicit output-validation
boundary (per
[AI Technology Architecture](../../milestones/milestone-8-technology-stack-development-architecture/09-ai-technology-architecture.md)),
not merely a policy statement — even a request that passes the Safety &
Scope Gate and produces a well-grounded response is checked against this
boundary before being acted upon.

## Human Review Requirements

- **The Safety & Scope Gate** classifies every request before any
  response is generated, per
  [AI Platform Architecture](../../milestones/milestone-6-technical-architecture/06-ai-platform-architecture.md) —
  crisis/safety signals and academic-integrity concerns are routed away
  from ordinary AI response generation entirely.
- **Escalation** routes any request the AI cannot adequately handle, or
  that a Student explicitly asks a human to handle, to a Faculty
  Instructor, actionable through Notifications.
- **The Human Review Queue** subjects a policy-driven subset of
  Conversation History to after-the-fact human review.
- **Every AI-influenced outcome affecting a Student's academic record
  requires the reviewing human — Faculty Instructor or Program Director
  — to be the accountable party of record.** The AI is never the
  accountable actor, per the
  [Business Rules Catalog](../../milestones/milestone-5-domain-model-data-architecture/08-business-rules-catalog.md)'s
  AI & Human Oversight Rules.

## Options Considered

| Option | Description | Why Not Chosen |
|---|---|---|
| **Unrestricted AI assistance** | AI permitted to act across any capability, including decisional ones, if it demonstrates sufficient accuracy. | Unacceptable given the academic and health-sciences-adjacent stakes; no accuracy threshold makes an unsupervised grading or admissions decision appropriate for this platform. |
| **No AI at all** | Avoid the risk entirely by excluding AI-assisted features. | Forfeits real, stated value (per [Long-Term Platform Vision](../../milestones/milestone-1-product-vision-platform-strategy/07-long-term-platform-vision.md)) without needing to, given that a bounded, human-reviewed model can capture the benefit safely. |
| **Human-reviewed, boundary-restricted AI** *(chosen)* | AI assists within a defined scope; humans retain all decisional authority. | Captures AI's real value (tutoring, support) while keeping every consequential decision with an accountable human — the only option consistent with [Guiding Principles §10](../../milestones/milestone-1-product-vision-platform-strategy/03-guiding-principles.md). |

## Consequences

**Benefits:**
- Trust: Students, Faculty, and institutional stakeholders can rely on
  AI assistance without it introducing unaccountable decision-making.
- Safety: crisis/safety signals are routed to humans immediately, not
  handled by a general-purpose response engine.
- Regulatory defensibility: no AI-made decision can ever become a
  liability point in an accreditation or legal review, because no AI
  ever makes a decision of consequence.

**Tradeoffs:**
- AI capability is intentionally narrower than what's technically
  possible — a more "autonomous" AI experience is deliberately not
  pursued.
- Requires ongoing human staffing for escalation and review, an
  operational cost that scales with AI Tutor usage, per
  [AI Technology Architecture §Cost Management](../../milestones/milestone-8-technology-stack-development-architecture/09-ai-technology-architecture.md).

## Future Review Considerations

This decision's **restrictions** (the four "may never" items) are not
expected to be revisited — they are treated as permanent, per
[AI Platform Architecture §Future AI Agents](../../milestones/milestone-6-technical-architecture/06-ai-platform-architecture.md).
The **use cases** (what AI is permitted to assist with) may expand over
time as Learning Analytics and other supporting capabilities mature —
any such expansion should be recorded as a new ADR, not a silent change
to this one.

## Current / Planned / Future

| Element | Status |
|---|---|
| The four absolute restrictions | **Current** — permanent |
| Tutoring use case | **Planned** |
| Content Assistance, Recommendations, Faculty Support use cases | **Future** |
| Human review mechanisms (Gate, Escalation, Review Queue) | **Planned** |

## ⚠️ Needs Verification

- Exact crisis/safety escalation staffing and Human Review flagging
  criteria remain unresolved, carried forward from
  [AI Learning Assistant Workflow](../../milestones/milestone-3-student-journey-core-workflows/06-ai-learning-assistant-workflow.md).
