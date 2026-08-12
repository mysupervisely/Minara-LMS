"use client";

import { useActionState } from "react";
import {
  addRequirementAction,
  type AddRequirementState,
  updateRequirementStatusAction,
  type UpdateRequirementState,
  recordDecisionAction,
  type DecisionState,
  assignCohortAction,
  type CohortState,
} from "../../actions";
import type { Decision } from "@/services/admissions/admissions";

const emptyAdd: AddRequirementState = {};
const emptyUpdate: UpdateRequirementState = {};
const emptyDecision: DecisionState = {};
const emptyCohort: CohortState = {};

/** Fail-closed by construction (see admissions.ts): the select only ever offers the four real statuses — never a freeform value that could bypass the service's own validation. */
export function RequirementStatusForm({
  requirementId,
  applicationId,
  currentStatus,
  currentNote,
}: {
  requirementId: string;
  applicationId: string;
  currentStatus: string;
  currentNote: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateRequirementStatusAction.bind(null, requirementId, applicationId),
    emptyUpdate,
  );

  return (
    <form action={formAction} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
      {state.error ? (
        <p className="alert alert--error" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="field">
        <label htmlFor={`status-${requirementId}`}>Status</label>
        <select id={`status-${requirementId}`} name="status" defaultValue={currentStatus}>
          <option value="RECEIVED">Received</option>
          <option value="MISSING">Missing</option>
          <option value="NEEDS_VERIFICATION">⚠️ Needs Verification</option>
          <option value="NOT_APPLICABLE">Not Applicable</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor={`note-${requirementId}`}>Note</label>
        <input id={`note-${requirementId}`} name="note" type="text" defaultValue={currentNote} />
      </div>
      <button className="button button--secondary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Update"}
      </button>
    </form>
  );
}

export function AddRequirementForm({ applicationId }: { applicationId: string }) {
  const [state, formAction, pending] = useActionState(addRequirementAction.bind(null, applicationId), emptyAdd);

  return (
    <form action={formAction} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
      {state.error ? (
        <p className="alert alert--error" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="field">
        <label htmlFor="label">Add Checklist Item</label>
        <input id="label" name="label" type="text" required />
      </div>
      <button className="button button--secondary" type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add"}
      </button>
    </form>
  );
}

export function DecisionForm({
  applicationId,
  decision,
  label,
  buttonClass = "button--primary",
}: {
  applicationId: string;
  decision: Decision;
  label: string;
  buttonClass?: string;
}) {
  const [state, formAction, pending] = useActionState(
    recordDecisionAction.bind(null, applicationId, decision),
    emptyDecision,
  );

  return (
    <form action={formAction} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
      {state.error ? (
        <p className="alert alert--error" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="field">
        <label htmlFor={`reason-${decision}`}>Reason / Notes (optional)</label>
        <input id={`reason-${decision}`} name="reason" type="text" />
      </div>
      <button className={`button ${buttonClass}`} type="submit" disabled={pending}>
        {pending ? "Saving…" : label}
      </button>
    </form>
  );
}

export function CohortForm({
  applicationId,
  cohorts,
  currentCohortId,
}: {
  applicationId: string;
  cohorts: { id: string; name: string }[];
  currentCohortId: string | null;
}) {
  const [state, formAction, pending] = useActionState(assignCohortAction.bind(null, applicationId), emptyCohort);

  return (
    <form action={formAction} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
      {state.error ? (
        <p className="alert alert--error" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="field">
        <label htmlFor="cohortId">Cohort</label>
        <select id="cohortId" name="cohortId" defaultValue={currentCohortId ?? ""}>
          <option value="" disabled>
            Select a Cohort…
          </option>
          {cohorts.map((cohort) => (
            <option key={cohort.id} value={cohort.id}>
              {cohort.name}
            </option>
          ))}
        </select>
      </div>
      <button className="button button--secondary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Assign Cohort"}
      </button>
    </form>
  );
}
