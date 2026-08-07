"use client";

import { useActionState } from "react";
import type { GradeFormState } from "../../actions";

const initialState: GradeFormState = {};

export function GradeForm({
  action,
  maxScore,
  defaultScore,
  defaultFeedback,
}: {
  action: (state: GradeFormState, formData: FormData) => Promise<GradeFormState>;
  maxScore: number;
  defaultScore?: number;
  defaultFeedback?: string | null;
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
          Grade saved as Draft.
        </p>
      ) : null}

      <div className="field">
        <label htmlFor="score">Score (out of {maxScore})</label>
        <input
          id="score"
          name="score"
          type="number"
          min={0}
          max={maxScore}
          required
          defaultValue={defaultScore}
        />
      </div>

      <div className="field">
        <label htmlFor="feedback">Feedback</label>
        <textarea id="feedback" name="feedback" defaultValue={defaultFeedback ?? ""} />
        <span className="hint">Shared with the Student once the grade is approved.</span>
      </div>

      <button className="button button--primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Draft Grade"}
      </button>
    </form>
  );
}
