"use server";

import { revalidatePath } from "next/cache";
import { requireSessionUser } from "@/services/identity/authorization";
import {
  saveApplicationDraft,
  submitApplication,
  confirmOffer,
  declineOffer,
  ApplicationStateError,
  ApplicationAuthorizationError,
} from "@/services/admissions/admissions";

function messageForAdmissionsError(error: unknown): string {
  if (error instanceof ApplicationStateError || error instanceof ApplicationAuthorizationError) {
    return error.message;
  }
  throw error;
}

export interface SaveDraftState {
  error?: string;
  success?: string;
}

export async function saveApplicationDraftAction(
  applicationId: string,
  _prevState: SaveDraftState,
  formData: FormData,
): Promise<SaveDraftState> {
  // requireSessionUser (not requireSessionUserWithRole) — an Applicant
  // holds no Role yet; this is the one authenticated area of the portal
  // that only requires a session, per this milestone's "Applicant is not
  // a Role" design (see src/services/admissions/admissions.ts).
  const user = await requireSessionUser();
  const notes = String(formData.get("notes") ?? "");
  try {
    await saveApplicationDraft(applicationId, notes, user);
  } catch (error) {
    return { error: messageForAdmissionsError(error) };
  }
  revalidatePath(`/apply/${applicationId}`);
  return { success: "Draft saved." };
}

export async function submitApplicationAction(applicationId: string, _formData: FormData): Promise<void> {
  const user = await requireSessionUser();
  try {
    await submitApplication(applicationId, user);
  } catch (error) {
    throw new Error(messageForAdmissionsError(error));
  }
  revalidatePath(`/apply/${applicationId}`);
  revalidatePath("/apply");
}

export async function confirmOfferAction(applicationId: string, _formData: FormData): Promise<void> {
  const user = await requireSessionUser();
  try {
    await confirmOffer(applicationId, user);
  } catch (error) {
    throw new Error(messageForAdmissionsError(error));
  }
  revalidatePath(`/apply/${applicationId}`);
}

export async function declineOfferAction(applicationId: string, _formData: FormData): Promise<void> {
  const user = await requireSessionUser();
  try {
    await declineOffer(applicationId, user);
  } catch (error) {
    throw new Error(messageForAdmissionsError(error));
  }
  revalidatePath(`/apply/${applicationId}`);
  revalidatePath("/apply");
}
