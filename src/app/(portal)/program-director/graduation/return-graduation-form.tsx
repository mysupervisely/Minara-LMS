"use client";

import { useActionState } from "react";
import type { ReturnGraduationState } from "../actions";

const initialState: ReturnGraduationState = {};

/**
 * The remediation loop's required-reason form — identical shape to
 * program-director/content/return-content-form.tsx and
 * program-director/externship/return-completion-form.tsx, reused for a
 * fifth approval gate rather than reinvented.
 */
export function ReturnGraduationForm({
  action,
}: {
  action: (state: ReturnGraduationState, formData: FormData) => Promise<ReturnGraduationState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      {state.error ? (
        <p className="alert alert--error" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="field">
        <label htmlFor="reason">Reason for returning to the Student&rsquo;s record</label>
        <textarea id="reason" name="reason" required />
      </div>
      <button className="button button--secondary" type="submit" disabled={pending}>
        {pending ? "Returning…" : "Return for Further Work"}
      </button>
    </form>
  );
}
