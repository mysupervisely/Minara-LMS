import Link from "next/link";
import type { Metadata } from "next";
import { listPrograms } from "@/services/academic/institution";

export const metadata: Metadata = {
  title: "Programs",
  description: "Browse Minara Institute of Health Sciences' programs.",
};

export default async function ProgramsPage() {
  const programs = await listPrograms();

  return (
    <section>
      <div className="container">
        <h1>Programs</h1>
        <p className="muted">
          Every program offered across Minara&apos;s schools, powered by one
          platform.
        </p>

        {programs.length === 0 ? (
          <p>No programs are configured yet.</p>
        ) : (
          <div className="card-grid">
            {programs.map((program) => (
              <article className="card" key={program.id}>
                <h2>
                  <Link href={`/programs/${program.slug}`}>{program.name}</Link>
                </h2>
                <p className="muted">
                  {program.school.institution.name} &middot; {program.school.name}
                </p>
                {program.description ? <p>{program.description}</p> : null}
                {program.requiresExternship ? (
                  <p className="badge badge--submitted">Includes Externship</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
