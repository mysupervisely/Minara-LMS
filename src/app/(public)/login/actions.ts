"use server";

import { z } from "zod";
import { login, AuthenticationError } from "@/services/identity/auth";
import { getSessionUser } from "@/services/identity/session";
import { resolveHomeRoute } from "@/services/identity/authorization";
import { redirect } from "next/navigation";

const LoginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export interface LoginFormState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await login(parsed.data.email, parsed.data.password);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { error: error.message };
    }
    throw error;
  }

  const user = await getSessionUser();
  const destination = user ? resolveHomeRoute(user) : "/login";
  redirect(destination);
}
