"use client";

import { useActionState } from "react";
import type { ReturnContentState } from "../actions";

const initialState: ReturnContentState = {};

/**
 * Shared by both the Lesson and Assessment review detail pages — the
 * "Return for revision" half of Program Director's review action,
 * requiring a reason (per
 * docs/milestones/milestone-11-curriculum-management-content-engine/05-publishing-workflow.md#rejection-reasons-are-required-not-optional,
 * carried into this slice's narrower workflow).
 */
export function ReturnContentForm({
  action,
}: {
  action: (state: ReturnContentState, formData: FormData) => Promise<ReturnContentState>;
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
        <label htmlFor="reason">Reason for returning to Draft</label>
        <textarea id="reason" name="reason" required />
      </div>
      <button className="button button--secondary" type="submit" disabled={pending}>
        {pending ? "Returning…" : "Return for Revision"}
      </button>
    </form>
  );
}
