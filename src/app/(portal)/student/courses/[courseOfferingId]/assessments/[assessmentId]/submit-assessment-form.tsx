"use client";

import { useActionState } from "react";
import type { SubmitAssessmentState } from "@/app/(portal)/student/actions";

const initialState: SubmitAssessmentState = {};

export function SubmitAssessmentForm({
  action,
  defaultValue,
}: {
  action: (state: SubmitAssessmentState, formData: FormData) => Promise<SubmitAssessmentState>;
  defaultValue?: string;
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
          Your submission was recorded.
        </p>
      ) : null}

      <div className="field">
        <label htmlFor="content">Your response</label>
        <textarea id="content" name="content" required defaultValue={defaultValue} />
      </div>

      <button className="button button--primary" type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
