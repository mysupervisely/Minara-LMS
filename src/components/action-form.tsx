"use client";

import { useActionState } from "react";

export interface SimpleActionState {
  error?: string;
  success?: string;
}

const initialState: SimpleActionState = {};

/**
 * A small shared form primitive used across the Administrator
 * foundation screens (src/app/(portal)/admin) — wires a "use server"
 * action up to `useActionState` and renders a consistent error/success
 * alert, so each individual create-entity form doesn't re-implement the
 * same boilerplate. This is the seed of the shared UI component library
 * described in
 * docs/milestones/milestone-8-technology-stack-development-architecture/02-frontend-architecture.md
 * (§Component Architecture Philosophy) — that library remains Planned;
 * this is a first, minimal instance built as this vertical slice
 * actually needed it, not built ahead of need.
 */
export function ActionForm({
  action,
  children,
  submitLabel = "Save",
}: {
  action: (state: SimpleActionState, formData: FormData) => Promise<SimpleActionState>;
  children: React.ReactNode;
  submitLabel?: string;
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
      {children}
      <button className="button button--primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
