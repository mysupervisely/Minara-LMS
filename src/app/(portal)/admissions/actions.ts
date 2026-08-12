"use server";

import { revalidatePath } from "next/cache";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import {
  startReview,
  reopenForReview,
  addRequirement,
  updateRequirementStatus,
  recordDecision,
  assignCohort,
  createEnrollmentFromApplication,
  ApplicationStateError,
  ApplicationAuthorizationError,
  type Decision,
  type RequirementStatus,
} from "@/services/admissions/admissions";

function messageForAdmissionsError(error: unknown): string {
  if (error instanceof ApplicationStateError || error instanceof ApplicationAuthorizationError) {
    return error.message;
  }
  throw error;
}

// Bound to plain `<form action={...}>` buttons — one-click, no fields —
// same convention as approvePlacementAction/approveGradeAction: throws
// rather than returning a state, since there is no per-field error to
// surface inline.
export async function startReviewAction(applicationId: string, _formData: FormData): Promise<void> {
  const user = await requireSessionUserWithRole("ADMISSIONS_STAFF");
  try {
    await startReview(applicationId, user);
  } catch (error) {
    throw new Error(messageForAdmissionsError(error));
  }
  revalidatePath("/admissions/applications");
  revalidatePath(`/admissions/applications/${applicationId}`);
}

export async function reopenForReviewAction(applicationId: string, _formData: FormData): Promise<void> {
  const user = await requireSessionUserWithRole("ADMISSIONS_STAFF");
  try {
    await reopenForReview(applicationId, user);
  } catch (error) {
    throw new Error(messageForAdmissionsError(error));
  }
  revalidatePath("/admissions/applications");
  revalidatePath(`/admissions/applications/${applicationId}`);
}

export interface AddRequirementState {
  error?: string;
}

export async function addRequirementAction(
  applicationId: string,
  _prevState: AddRequirementState,
  formData: FormData,
): Promise<AddRequirementState> {
  const user = await requireSessionUserWithRole("ADMISSIONS_STAFF");
  const label = String(formData.get("label") ?? "");
  try {
    await addRequirement(applicationId, label, user);
  } catch (error) {
    return { error: messageForAdmissionsError(error) };
  }
  revalidatePath(`/admissions/applications/${applicationId}`);
  return {};
}

export interface UpdateRequirementState {
  error?: string;
}

export async function updateRequirementStatusAction(
  requirementId: string,
  applicationId: string,
  _prevState: UpdateRequirementState,
  formData: FormData,
): Promise<UpdateRequirementState> {
  const user = await requireSessionUserWithRole("ADMISSIONS_STAFF");
  const status = String(formData.get("status") ?? "") as RequirementStatus;
  const note = formData.get("note") ? String(formData.get("note")) : null;
  try {
    await updateRequirementStatus(requirementId, status, note, user);
  } catch (error) {
    return { error: messageForAdmissionsError(error) };
  }
  revalidatePath(`/admissions/applications/${applicationId}`);
  revalidatePath("/admissions/requirements");
  return {};
}

export interface DecisionState {
  error?: string;
}

export async function recordDecisionAction(
  applicationId: string,
  decision: Decision,
  _prevState: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  const user = await requireSessionUserWithRole("ADMISSIONS_STAFF");
  const reason = formData.get("reason") ? String(formData.get("reason")) : null;
  try {
    await recordDecision(applicationId, decision, reason, user);
  } catch (error) {
    return { error: messageForAdmissionsError(error) };
  }
  revalidatePath("/admissions/applications");
  revalidatePath(`/admissions/applications/${applicationId}`);
  return {};
}

export interface CohortState {
  error?: string;
}

export async function assignCohortAction(
  applicationId: string,
  _prevState: CohortState,
  formData: FormData,
): Promise<CohortState> {
  const user = await requireSessionUserWithRole("ADMISSIONS_STAFF");
  const cohortId = String(formData.get("cohortId") ?? "");
  try {
    await assignCohort(applicationId, cohortId, user);
  } catch (error) {
    return { error: messageForAdmissionsError(error) };
  }
  revalidatePath(`/admissions/applications/${applicationId}`);
  return {};
}

export async function createEnrollmentFromApplicationAction(applicationId: string, _formData: FormData): Promise<void> {
  const user = await requireSessionUserWithRole("ADMISSIONS_STAFF");
  try {
    await createEnrollmentFromApplication(applicationId, user);
  } catch (error) {
    throw new Error(messageForAdmissionsError(error));
  }
  revalidatePath("/admissions/applications");
  revalidatePath(`/admissions/applications/${applicationId}`);
}
