import Link from "next/link";
import { requireSessionUser } from "@/services/identity/authorization";
import { ROLE_LABELS, type Role } from "@/domain/roles";
import { logoutAction } from "./actions";

/**
 * The authenticated shell — one layout serving every role, per
 * docs/milestones/milestone-4-information-architecture/01-global-navigation-framework.md's
 * Primary Navigation pattern and ADR-001's "one deployable unit" scope
 * for this vertical slice's Application Foundation.
 *
 * `requireSessionUser()` is the authoritative authorization check for
 * everything nested under this layout (see src/middleware.ts's comment
 * for why the real check lives here, not in Edge middleware) — every
 * page under (portal) inherits this gate for free.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSessionUser();
  const roles = Array.from(new Set(user.roleAssignments.map((ra) => ra.role))) as Role[];

  return (
    <div className="portal-shell">
      <nav className="portal-nav" aria-label="Portal navigation">
        <p className="brand" style={{ marginBottom: "1.5rem" }}>
          Minara-LMS
        </p>
        {roles.includes("STUDENT") && (
          <PortalNavSection
            heading="Student"
            links={[
              { href: "/student", label: "Dashboard" },
              { href: "/student/grades", label: "My Grades" },
            ]}
          />
        )}
        {roles.includes("FACULTY") && (
          <PortalNavSection
            heading="Faculty"
            links={[{ href: "/faculty", label: "Dashboard" }]}
          />
        )}
        {roles.includes("PROGRAM_DIRECTOR") && (
          <PortalNavSection
            heading="Program Director"
            links={[{ href: "/program-director", label: "Approvals" }]}
          />
        )}
        {roles.includes("ADMINISTRATOR") && (
          <PortalNavSection
            heading="Administration"
            links={[
              { href: "/admin", label: "Overview" },
              { href: "/admin/institution", label: "Institution Structure" },
              { href: "/admin/users", label: "Users & Roles" },
              { href: "/admin/enrollments", label: "Enrollments" },
              { href: "/admin/audit", label: "Audit Log" },
            ]}
          />
        )}
      </nav>

      <div className="portal-main">
        <header className="portal-topbar">
          <div>
            <strong>{user.name}</strong>
            <p className="muted" style={{ margin: 0 }}>
              {roles.map((r) => ROLE_LABELS[r]).join(", ") || "No role assigned"}
            </p>
          </div>
          <form action={logoutAction}>
            <button className="button button--secondary" type="submit">
              Log Out
            </button>
          </form>
        </header>
        <main id="main-content">{children}</main>
      </div>
    </div>
  );
}

function PortalNavSection({
  heading,
  links,
}: {
  heading: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <p
        className="muted"
        style={{ textTransform: "uppercase", fontSize: "0.75rem", fontWeight: 700, margin: "0 0 0.5rem 0" }}
      >
        {heading}
      </p>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
