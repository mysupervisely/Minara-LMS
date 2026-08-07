import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProgramBySlug } from "@/services/academic/institution";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return { title: "Program Not Found" };
  return {
    title: program.name,
    description: program.description ?? `${program.name} at ${program.school.institution.name}.`,
  };
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  return (
    <section>
      <div className="container">
        <p className="muted">
          <Link href="/programs">&larr; All Programs</Link>
        </p>
        <h1>{program.name}</h1>
        <p className="muted">
          {program.school.institution.name} &middot; {program.school.name}
        </p>
        {program.description ? <p>{program.description}</p> : null}
        {program.requiresExternship ? (
          <p className="badge badge--submitted">Includes a supervised externship</p>
        ) : null}

        <h2>Courses</h2>
        {program.courses.length === 0 ? (
          <p className="muted">Course details will be published here.</p>
        ) : (
          <ul>
            {program.courses.map((course) => (
              <li key={course.id}>{course.title}</li>
            ))}
          </ul>
        )}

        <div className="button-row">
          <Link className="button button--primary" href="/login">
            Apply / Log In
          </Link>
        </div>
      </div>
    </section>
  );
}
