import Link from "next/link";
import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listCourseOfferingsForFaculty } from "@/services/academic/institution";
import { listSubmissionsForCourseOffering } from "@/services/assessments/assessments";

export const metadata: Metadata = { title: "Faculty Dashboard" };

/**
 * Faculty Dashboard — implements
 * docs/milestones/milestone-4-information-architecture/03-faculty-portal.md's
 * Dashboard screen, narrowed to this vertical slice's scope: assigned
 * sections and a pending-review count per section.
 */
export default async function FacultyDashboardPage() {
  const user = await requireSessionUserWithRole("FACULTY");
  const offerings = await listCourseOfferingsForFaculty(user.id);

  const withCounts = await Promise.all(
    offerings.map(async (offering) => {
      const submissions = await listSubmissionsForCourseOffering(offering.id);
      const pendingReview = submissions.filter((s) => !s.grade).length;
      return { offering, pendingReview, totalSubmissions: submissions.length };
    }),
  );

  return (
    <div className="stack">
      <h1>Welcome, {user.name.split(" ")[0]}</h1>
      <h2>My Sections</h2>
      {withCounts.length === 0 ? (
        <p className="muted">You have no Teaching Assignments yet.</p>
      ) : (
        <div className="card-grid">
          {withCounts.map(({ offering, pendingReview, totalSubmissions }) => (
            <article className="card" key={offering.id}>
              <h3>
                <Link href={`/faculty/courses/${offering.id}`}>{offering.course.title}</Link>
              </h3>
              <p className="muted">
                {offering.cohort.name} &middot; {offering.term}
              </p>
              <p>
                {totalSubmissions} submission{totalSubmissions === 1 ? "" : "s"}
                {pendingReview > 0 ? (
                  <>
                    {" "}
                    — <span className="badge badge--draft">{pendingReview} pending review</span>
                  </>
                ) : null}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
