"use server";

import { redirect } from "next/navigation";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { startPayment, BillingStateError, BillingAuthorizationError } from "@/services/billing/billing";
import { db } from "@/lib/db";

/**
 * Bound to a plain `<form action={...}>` "Pay Now" button — throws
 * rather than returning a state, matching every other one-click action
 * in this codebase (see approveGradeAction's comment for why). Redirects
 * the Student's browser to the (simulated) hosted-checkout page —
 * exactly the "external-hosted checkout" flow this milestone's brief
 * asks for; Minara never collects card data on this form.
 */
export async function startPaymentAction(chargeId: string, _formData: FormData): Promise<void> {
  const user = await requireSessionUserWithRole("STUDENT");

  let payment;
  try {
    payment = await startPayment(chargeId, user);
  } catch (error) {
    if (error instanceof BillingStateError || error instanceof BillingAuthorizationError) {
      throw new Error(error.message);
    }
    throw error;
  }

  const record = await db.payment.findUniqueOrThrow({ where: { id: payment.id } });
  redirect(`/pay/${record.providerSessionId}`);
}
