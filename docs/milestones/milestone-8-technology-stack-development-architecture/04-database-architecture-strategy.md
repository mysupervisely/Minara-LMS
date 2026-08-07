# Database Architecture Strategy

**Status:** Draft
**Milestone:** 8 — Technology Stack & Development Architecture
**Date:** 2026-08-07

This document defines the **conceptual** database strategy for
Minara-LMS — the category of data store, and the principles governing
how data is organized within it. It contains no schemas, no SQL, and no
table designs; that work belongs to actual implementation.

## Relational vs. Non-Relational Considerations

**Recommendation: a relational database as the primary data store
(e.g., PostgreSQL as the leading example of the category), with
narrowly-scoped use of non-relational patterns only where a specific
access pattern demands it.**

| Consideration | Assessment |
|---|---|
| Milestone 5's domain model is deeply relational | The [Domain Relationship Catalog](../milestone-5-domain-model-data-architecture/07-domain-relationship-catalog.md) is built almost entirely on structured, cardinality-defined relationships (Enrollment belongs to Program and Cohort; Grades belong to Academic Record; Approval references a Role Assignment and the entity approved) — exactly what relational databases are built to enforce correctly. |
| Milestone 5's Business Rules Catalog demands data integrity | Rules like "A Course belongs to exactly one Program" and "An Invoice belongs to exactly one Enrollment" ([Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md)) are naturally enforced by relational constraints; a document/NoSQL store would require re-implementing that integrity in application code, a real risk for records with academic and financial consequence. |
| Milestone 2's Audit and Accountability requirements | Immutable, precisely attributed, queryable-across-relationships audit trails ([Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md)) are well-served by relational storage's strong consistency guarantees. |
| A few entities are naturally document-shaped | AI Conversation transcripts and generated Reports (per the [Platform Services Domain Model](../milestone-5-domain-model-data-architecture/06-platform-services-domain-model.md)) are less relationally structured — but PostgreSQL's native support for semi-structured (JSON) columns handles this without introducing a second database technology, avoiding the "unnecessary complexity" this milestone's principles warn against. |

**Rationale:** nothing in Milestones 1–7 calls for the specific
strengths of a non-relational primary store (extreme write throughput
on loosely-structured data, for example), while nearly everything in
the domain model calls for relational integrity. Introducing a second
database technology for a handful of document-shaped entities would
violate [Technology Selection Principles](./01-technology-selection-principles.md)'s
"one well-chosen tool" rule when the leading relational option already
handles semi-structured data adequately.

## Complementary Data Technologies (Not Primary Stores)

| Purpose | Category | Notes |
|---|---|---|
| Caching (per [Scalability & Reliability Framework §Caching Philosophy](../milestone-6-technical-architecture/09-scalability-reliability-framework.md)) | In-memory key-value store (e.g., Redis as the category's leading example) | Reversible, low-lock-in choice — caching layers are swappable without touching the domain model |
| Content & File Storage (per [File Storage & Content Architecture](../milestone-6-technical-architecture/05-file-storage-content-architecture.md)) | Object storage (S3-compatible API as a portable standard) | The File entity's metadata stays in the relational store; only the bytes live in object storage — keeping File records queryable and consistent with everything else |
| Full-text/content search (Future, per [Milestone 6](../milestone-6-technical-architecture/09-scalability-reliability-framework.md)) | Relational full-text search first; a dedicated search engine only if that proves insufficient | Avoids adding a search-specific database before there's evidence Postgres's built-in search can't handle the load |

## Data Modeling Philosophy

- **The database schema mirrors the domain model, not the screens.**
  [Milestone 5](../milestone-5-domain-model-data-architecture/README.md)'s
  entities and relationships are the source of truth for what tables and
  associations eventually get built — the schema is not derived from
  Milestone 4's screens, which are a presentation-layer concern that
  can change without touching the data model underneath.
- **Bounded contexts inform schema organization, not schema
  separation.** The five bounded contexts from
  [Milestone 5, Doc 1](../milestone-5-domain-model-data-architecture/01-domain-driven-design-principles.md)
  guide how tables are grouped and named, consistent with the modular
  monolith's module boundaries (see
  [Backend Architecture](./03-backend-architecture.md)) — but within one
  physical database, not five separate ones, consistent with the
  "one deployable unit" recommendation there.

## Multi-School Support

The relational schema is designed around the Institution → School →
Program → Cohort hierarchy from the
[Academic Domain Model](../milestone-5-domain-model-data-architecture/02-academic-domain-model.md)
as a **data relationship**, not as separate databases per school. One
School gets a new row in the Schools table, not a new database — this
is what makes
[Platform Philosophy](../milestone-1-product-vision-platform-strategy/04-platform-philosophy.md)'s
"programs are configuration, not forks" true at the data layer, and it
is the same reasoning
[Prepped Ecosystem Architecture](./10-prepped-ecosystem-architecture.md)
applies to Prepped products.

## Historical Records & Versioning

Per the
[Future Data Architecture Considerations](../milestone-5-domain-model-data-architecture/09-future-data-architecture-considerations.md),
curriculum content versioning and historical-accuracy-of-requirements
are explicitly **Future** concerns. This document's position: the
relational schema should record **when** a fact was true (e.g., which
version of a Course a Student was actually enrolled against), not just
its current state — a principle to design toward now, even though the
full versioning mechanism itself remains Future work.

## Auditability

The relational store is also where the Audit Log (per the
[Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md))
lives — append-only, and, per that framework, never edited or deleted
by any role. This document's recommendation: enforce that immutability
at the database level (e.g., through access controls that permit
inserts but not updates/deletes on audit records), not solely through
application-layer discipline — a defense-in-depth approach consistent
with [Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md).

## Data Migrations

- Schema changes are managed through a versioned, incremental migration
  process — a standard practice for relational databases, named here as
  a principle rather than a specific migration tool.
- Migrations are treated as part of the codebase (reviewed, tested, and
  deployed alongside application changes), never applied ad hoc against
  a live database.

## Current / Planned / Future

| Element | Status |
|---|---|
| Relational database as primary store (PostgreSQL as the leading example) | **Current** — this milestone's recommendation |
| JSON columns for the handful of document-shaped entities | **Current** |
| Redis-category caching layer | **Planned** |
| S3-compatible object storage for File content | **Planned** |
| Dedicated search engine | **Future**, only if relational full-text search proves insufficient |
| Full curriculum-content versioning mechanism | **Future**, per [Milestone 5](../milestone-5-domain-model-data-architecture/09-future-data-architecture-considerations.md) |
| Database-level enforcement of Audit Log immutability | **Planned** |

## ⚠️ Needs Verification

- Concrete data retention durations, still unresolved from
  [Milestone 2](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md)
  and [Milestone 6](../milestone-6-technical-architecture/05-file-storage-content-architecture.md),
  directly affect how aggressively historical data needs to be archived
  vs. retained live — this document assumes retention decisions come
  first and archival strategy follows, not the reverse.
- The specific database product (this document names PostgreSQL only as
  the category's leading, most defensible example) should be confirmed,
  not assumed, once real implementation planning begins.
