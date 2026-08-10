"use client";

import { useActionState } from "react";
import type { ReturnCompletionState } from "../actions";

const initialState: ReturnCompletionState = {};

/**
 * The remediation loop's required-reason form — identical shape to
 * program-director/content/return-content-form.tsx, reused for a fourth
 * approval gate rather than reinvented.
 */
export function ReturnCompletionForm({
  action,
}: {
  action: (state: ReturnCompletionState, formData: FormData) => Promise<ReturnCompletionState>;
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
        <label htmlFor="reason">Reason for returning for further work</label>
        <textarea id="reason" name="reason" required />
      </div>
      <button className="button button--secondary" type="submit" disabled={pending}>
        {pending ? "Returning…" : "Return for Further Work"}
      </button>
    </form>
  );
}
