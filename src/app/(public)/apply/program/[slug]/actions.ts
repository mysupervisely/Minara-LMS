"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getProgramBySlug } from "@/services/academic/institution";
import { registerApplicant, EmailAlreadyRegisteredError } from "@/services/identity/users";
import { createSession } from "@/services/identity/session";
import { recordAuditEvent } from "@/services/audit/audit";
import { startOrResumeApplication } from "@/services/admissions/admissions";
import type { SessionUser } from "@/services/identity/session";

const RegisterSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export interface RegisterAndApplyState {
  error?: string;
}

/**
 * Phase 1's "Create an account or sign in" — the account-creation half.
 * Creates the User (src/services/identity/users.ts's registerApplicant,
 * the one self-service exception to Administrator-provisioned accounts),
 * signs them in immediately (the same createSession every login uses),
 * then starts (or resumes) their Application for this Program and hands
 * off into the authenticated (portal)/apply flow. The "sign in instead"
 * path is just the existing /login page — a returning Applicant who
 * already has an account lands at /apply after logging in, per
 * resolveHomeRoute's Milestone 17 fallback.
 */
export async function registerAndApplyAction(
  slug: string,
  _prevState: RegisterAndApplyState,
  formData: FormData,
): Promise<RegisterAndApplyState> {
  const program = await getProgramBySlug(slug);
  if (!program) return { error: "Program not found." };

  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let user;
  try {
    user = await registerApplicant(parsed.data);
  } catch (error) {
    if (error instanceof EmailAlreadyRegisteredError) {
      return { error: error.message };
    }
    throw error;
  }

  await createSession(user.id);
  await recordAuditEvent({
    actorId: user.id,
    action: "USER_LOGIN",
    entityType: "User",
    entityId: user.id,
    metadata: { via: "applicant-self-registration" },
  });

  const actor: SessionUser = { id: user.id, email: user.email, name: user.name, roleAssignments: [] };
  const application = await startOrResumeApplication(user.id, program.id, actor);

  redirect(`/apply/${application.id}`);
}
