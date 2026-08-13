"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { configureTuition, BillingStateError, BillingAuthorizationError } from "@/services/billing/billing";

export interface ConfigureTuitionState {
  error?: string;
  success?: string;
}

const ConfigureTuitionSchema = z.object({
  cohortId: z.string().trim().min(1, "Cohort is required."),
  amountDollars: z.coerce.number().min(0, "Amount must be zero or more."),
  description: z.string().trim().max(200).optional(),
});

function messageForBillingError(error: unknown): string {
  if (error instanceof BillingStateError || error instanceof BillingAuthorizationError) {
    return error.message;
  }
  throw error;
}

export async function configureTuitionAction(
  _prevState: ConfigureTuitionState,
  formData: FormData,
): Promise<ConfigureTuitionState> {
  const user = await requireSessionUserWithRole("ADMINISTRATOR");

  const parsed = ConfigureTuitionSchema.safeParse({
    cohortId: formData.get("cohortId"),
    amountDollars: formData.get("amountDollars"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await configureTuition(
      {
        cohortId: parsed.data.cohortId,
        amountCents: Math.round(parsed.data.amountDollars * 100),
        description: parsed.data.description,
      },
      user,
    );
  } catch (error) {
    return { error: messageForBillingError(error) };
  }

  revalidatePath("/admin/billing");
  return { success: "Tuition configuration saved." };
}
