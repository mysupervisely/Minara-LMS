import type { Metadata } from "next";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { listClinicalSitesForProgram } from "@/services/externship/externship";
import { listPrograms } from "@/services/academic/institution";
import { db } from "@/lib/db";
import { ActionForm } from "@/components/action-form";
import { createClinicalSiteAction, updateClinicalSiteStatusAction } from "../actions";

export const metadata: Metadata = { title: "Clinical Coordinator — Sites" };

const SITE_BADGE: Record<string, string> = { PENDING: "draft", ACTIVE: "active", INACTIVE: "draft" };

/**
 * Sites — implements the Coordinator Portal's Sites screen
 * (docs/milestones/milestone-4-information-architecture/06-clinical-coordinator-portal.md),
 * narrowed per this milestone's Externship Deep Dive: no Site Agreement,
 * no Employer self-service — Employer is a plain text field an authorized
 * Coordinator enters directly. Lifecycle: PENDING → ACTIVE → INACTIVE, no
 * invented site-accreditation requirement.
 */
export default async function CoordinatorSitesPage() {
  const user = await requireSessionUserWithRole("CLINICAL_COORDINATOR");

  const isAdministrator = user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
  const programIds = isAdministrator
    ? (await db.program.findMany({ select: { id: true } })).map((p) => p.id)
    : Array.from(
        new Set(
          user.roleAssignments
            .filter((ra) => ra.role === "CLINICAL_COORDINATOR" && ra.programId)
            .map((ra) => ra.programId as string),
        ),
      );

  const [sitesByProgram, programs] = await Promise.all([
    Promise.all(
      programIds.map(async (programId) => ({
        programId,
        sites: await listClinicalSitesForProgram(programId, user),
      })),
    ),
    listPrograms(),
  ]);
  const scopedPrograms = programs.filter((p) => programIds.includes(p.id));

  return (
    <div className="stack">
      <h1>Clinical Sites</h1>

      {sitesByProgram.map(({ programId, sites }) => {
        const program = scopedPrograms.find((p) => p.id === programId);
        if (!program) return null;
        return (
          <section key={programId} style={{ padding: 0, border: "none" }}>
            <h2>{program.name}</h2>
            {sites.length === 0 ? (
              <p className="muted">No Clinical Sites recorded for this Program yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Site</th>
                      <th scope="col">Employer</th>
                      <th scope="col">Contact</th>
                      <th scope="col">Capacity</th>
                      <th scope="col">Status</th>
                      <th scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sites.map((site) => (
                      <tr key={site.id}>
                        <td>{site.name}</td>
                        <td>{site.employerName}</td>
                        <td>{site.contactName ?? "—"}</td>
                        <td>{site.capacity}</td>
                        <td>
                          <span className={`badge badge--${SITE_BADGE[site.status] ?? "draft"}`}>
                            {site.status}
                          </span>
                        </td>
                        <td style={{ display: "flex", gap: "0.5rem" }}>
                          {site.status === "PENDING" ? (
                            <form action={updateClinicalSiteStatusAction.bind(null, site.id, "ACTIVE")}>
                              <button className="button button--secondary" type="submit">
                                Approve
                              </button>
                            </form>
                          ) : null}
                          {site.status === "ACTIVE" ? (
                            <form action={updateClinicalSiteStatusAction.bind(null, site.id, "INACTIVE")}>
                              <button className="button button--secondary" type="submit">
                                Deactivate
                              </button>
                            </form>
                          ) : null}
                          {site.status === "INACTIVE" ? (
                            <form action={updateClinicalSiteStatusAction.bind(null, site.id, "ACTIVE")}>
                              <button className="button button--secondary" type="submit">
                                Reactivate
                              </button>
                            </form>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}

      <section style={{ padding: 0, border: "none" }}>
        <h2>Add a Clinical Site</h2>
        <ActionForm action={createClinicalSiteAction} submitLabel="Add Site">
          <div className="field">
            <label htmlFor="site-program">Program</label>
            <select id="site-program" name="programId" required defaultValue="">
              <option value="" disabled>
                Select a Program&hellip;
              </option>
              {scopedPrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="site-name">Site name</label>
            <input id="site-name" name="name" required />
          </div>
          <div className="field">
            <label htmlFor="site-employer">Employer name</label>
            <input id="site-employer" name="employerName" required />
            <span className="hint">
              Employer is recorded here as plain contact information for this vertical slice — Employer
              self-service login is deliberately out of scope (see this milestone&rsquo;s Externship Deep Dive).
            </span>
          </div>
          <div className="field">
            <label htmlFor="site-contact-name">Site contact name</label>
            <input id="site-contact-name" name="contactName" />
          </div>
          <div className="field">
            <label htmlFor="site-contact-info">Site contact info</label>
            <input id="site-contact-info" name="contactInfo" />
          </div>
          <div className="field">
            <label htmlFor="site-capacity">Capacity</label>
            <input id="site-capacity" name="capacity" type="number" min={1} defaultValue={1} />
          </div>
        </ActionForm>
      </section>
    </div>
  );
}
