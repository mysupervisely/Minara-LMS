import Link from "next/link";
import type { Metadata } from "next";
import { listPrograms } from "@/services/academic/institution";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Minara Institute of Health Sciences prepares students for health sciences careers through Minara-LMS, the platform that delivers and manages the educational experience.",
};

export default async function HomePage() {
  const programs = await listPrograms();

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Health sciences education, delivered on one platform.</h1>
          <p>
            Minara Institute of Health Sciences prepares students for real
            careers in health sciences — courses, assessments, grading, and
            certification, all on Minara-LMS.
          </p>
          <div className="button-row">
            <Link className="button button--primary" href="/programs">
              Explore Programs
            </Link>
            <Link className="button button--secondary" href="/login">
              Student &amp; Faculty Log In
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <h2>Programs</h2>
          {programs.length === 0 ? (
            <p className="muted">
              Program listings will appear here once the institution&apos;s
              first program is configured.
            </p>
          ) : (
            <div className="card-grid">
              {programs.map((program) => (
                <article className="card" key={program.id}>
                  <h3>
                    <Link href={`/programs/${program.slug}`}>{program.name}</Link>
                  </h3>
                  <p className="muted">{program.school.name}</p>
                  {program.description ? <p>{program.description}</p> : null}
                  <Link href={`/programs/${program.slug}`} className="button button--secondary">
                    Learn more
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
