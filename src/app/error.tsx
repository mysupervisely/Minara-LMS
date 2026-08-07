"use client";

/**
 * Root error boundary. Several Server Actions in this vertical slice
 * (e.g. markLessonCompleteAction, approveGradeAction) throw a plain
 * Error on failure rather than returning a `{ error }` state, since
 * they're bound directly to simple one-click forms rather than wired
 * through `useActionState` — this boundary is what a user sees if one
 * of those throws (e.g. an authorization failure re-checked at the
 * Server Action layer). Error messages here are deliberately generic;
 * the specific reason is Audit Logged, not exposed to the browser, per
 * Security Development Practices' least-privilege-information handling.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container" style={{ paddingTop: "3rem" }}>
      <h1>Something went wrong</h1>
      <p className="alert alert--error" role="alert">
        We couldn&apos;t complete that action. If this keeps happening, contact your Administrator.
      </p>
      <button className="button button--primary" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
