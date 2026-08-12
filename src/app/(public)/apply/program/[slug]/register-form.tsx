"use client";

import { useActionState } from "react";
import { registerAndApplyAction, type RegisterAndApplyState } from "./actions";

const initialState: RegisterAndApplyState = {};

export function RegisterForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState(registerAndApplyAction.bind(null, slug), initialState);

  return (
    <form action={formAction} noValidate>
      {state.error ? (
        <p className="alert alert--error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="field">
        <label htmlFor="name">Full Name</label>
        <input id="name" name="name" type="text" autoComplete="name" required aria-required="true" />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required aria-required="true" />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          aria-required="true"
          minLength={8}
        />
      </div>

      <button className="button button--primary" type="submit" disabled={pending}>
        {pending ? "Creating Account…" : "Create Account & Start Application"}
      </button>
    </form>
  );
}
