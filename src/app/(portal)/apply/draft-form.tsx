"use client";

import { useActionState } from "react";
import { saveApplicationDraftAction, type SaveDraftState } from "./actions";

const initialState: SaveDraftState = {};

export function DraftForm({ applicationId, initialNotes }: { applicationId: string; initialNotes: string }) {
  const [state, formAction, pending] = useActionState(
    saveApplicationDraftAction.bind(null, applicationId),
    initialState,
  );

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
        <label htmlFor="notes">Anything you&rsquo;d like the Admissions team to know (optional)</label>
        <textarea id="notes" name="notes" defaultValue={initialNotes} rows={4} />
      </div>
      <button className="button button--secondary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Draft"}
      </button>
    </form>
  );
}
