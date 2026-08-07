import Link from "next/link";

/**
 * Public Website layout — SSR-first, per ADR-002 and
 * docs/milestones/milestone-8-technology-stack-development-architecture/02-frontend-architecture.md.
 * Every page nested under this layout renders its primary content on
 * the server; nothing here depends on client-side JavaScript to display
 * correctly (verifiable by loading any page in this group with
 * JavaScript disabled, per ADR-002's enforcement rule).
 *
 * Configuration-driven, not Pharmacy-Technology-hard-coded: this layout
 * and its nav contain no program-specific copy — Program names and
 * descriptions are read from the database (see
 * src/services/academic/institution.ts), never hard-coded here.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="stack" style={{ minHeight: "100%" }}>
      <header className="site-header">
        <div className="container site-header__bar">
          <Link href="/" className="brand">
            <span className="brand__eyebrow">Minara Institute of</span>
            Health Sciences
          </Link>
          <nav className="main-nav" aria-label="Primary">
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/programs">Programs</Link>
              </li>
              <li>
                <Link href="/login">Log In</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="main-content">{children}</main>

      <footer className="site-footer">
        <div className="container">
          <p>
            &copy; {new Date().getFullYear()} Minara Institute of Health
            Sciences. Minara-LMS is the platform that delivers and manages
            the educational experience across Minara&apos;s schools and
            programs.
          </p>
        </div>
      </footer>
    </div>
  );
}
