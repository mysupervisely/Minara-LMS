import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log In",
};

/**
 * Per Milestone 10, Phase 3 and
 * docs/milestones/milestone-9-engineering-foundation-development-setup/10-first-implementation-roadmap.md:
 * direct email + password login only — no advanced identity/SSO
 * integration yet, and no public self-service account creation (see
 * src/services/identity/users.ts's module comment for why).
 */
export default function LoginPage() {
  return (
    <section>
      <div className="container">
        <h1>Log In</h1>
        <p className="muted">
          Accounts are created by your institution&apos;s Administrator. If
          you don&apos;t yet have login details, contact your program.
        </p>
        <LoginForm />
      </div>
    </section>
  );
}
