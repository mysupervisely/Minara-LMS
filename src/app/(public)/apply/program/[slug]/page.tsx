import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getProgramBySlug } from "@/services/academic/institution";
import { getSessionUser } from "@/services/identity/session";
import { startOrResumeApplication } from "@/services/admissions/admissions";
import { RegisterForm } from "./register-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  return { title: program ? `Apply — ${program.name}` : "Apply" };
}

/**
 * The public "Apply" entry point — Phase 1's "View a Program page ->
 * Select Apply -> Create an account or sign in -> Begin an Application."
 * SSR-first, per ADR-002: the create-account form below posts to a
 * Server Action; nothing here depends on client JS to display correctly.
 *
 * Already-authenticated visitors (an Applicant returning mid-flow, or
 * any logged-in User exploring "Apply" again) skip straight to
 * starting/resuming their Application for this Program rather than
 * seeing a redundant account-creation form.
 */
export default async function PublicApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const user = await getSessionUser();
  if (user) {
    const application = await startOrResumeApplication(user.id, program.id, user);
    redirect(`/apply/${application.id}`);
  }

  return (
    <section>
      <div className="container">
        <p className="muted">
          <Link href={`/programs/${program.slug}`}>&larr; {program.name}</Link>
        </p>
        <h1>Apply to {program.name}</h1>
        <p className="muted">
          Courage to begin. Create an account below to start your Application, or{" "}
          <Link href="/login">log in</Link> if you already have one.
        </p>
        <RegisterForm slug={program.slug} />
      </div>
    </section>
  );
}
