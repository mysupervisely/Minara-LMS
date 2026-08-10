"use client";

import { useActionState } from "react";
import type { ActionState } from "../../actions";

const initialState: ActionState = {};

/**
 * Records a Midpoint or Final Evaluation — deliberately minimal, per the
 * Externship Deep Dive's #13/#14: free-text content plus a single
 * overall outcome, not a structured rubric. Recorded by the Coordinator
 * on the Employer/Preceptor's behalf (see the Evaluation model's schema
 * comment) — there is no Employer-facing submission path in this slice.
 */
export function EvaluationForm({
  action,
  label,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      {state.error ? (
        <p className="alert alert--error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="alert alert--success" role="status">
          {state.success}
        </p>
      ) : null}
      <div className="field">
        <label htmlFor={`${label}-content`}>{label} content</label>
        <textarea id={`${label}-content`} name="content" required />
      </div>
      <div className="field">
        <label htmlFor={`${label}-outcome`}>Overall outcome</label>
        <select id={`${label}-outcome`} name="outcome" required defaultValue="SATISFACTORY">
          <option value="SATISFACTORY">Satisfactory</option>
          <option value="CONCERNS_IDENTIFIED">Concerns Identified</option>
        </select>
      </div>
      <button className="button button--primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : `Record ${label}`}
      </button>
    </form>
  );
}
