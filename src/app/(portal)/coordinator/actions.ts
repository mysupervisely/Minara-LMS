"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import {
  createClinicalSite,
  updateClinicalSiteStatus,
  determineEligibility,
  requestPlacement,
  approvePlacement,
  activatePlacement,
  attestHoursComplete,
  recordEvaluation,
  submitCompletionForVerification,
  ExternshipStateError,
  ExternshipAuthorizationError,
  type ClinicalSiteStatus,
  type DeterminedEligibilityStatus,
  type EvaluationType,
  type EvaluationOutcome,
} from "@/services/externship/externship";

/**
 * Clinical/Externship Coordinator Portal — Milestone 15. Follows the
 * exact same `useActionState`/plain-bound-form conventions as
 * src/app/(portal)/program-director/actions.ts and
 * src/app/(portal)/admin/actions.ts; nothing new introduced here.
 *
 * Every action below calls `requireSessionUserWithRole("CLINICAL_COORDINATOR")`
 * first (page-level defense in depth), then passes the resulting
 * SessionUser straight into the externship.ts service function, which
 * re-checks Program scope itself — see that module's header comment for
 * why authorization is deliberately enforced twice here, not once.
 */

export interface ActionState {
  error?: string;
  success?: string;
}

function messageFor(error: unknown): string {
  if (error instanceof ExternshipStateError || error instanceof ExternshipAuthorizationError) {
    return error.message;
  }
  throw error;
}

// ── Sites ────────────────────────────────────────────────────────────────

const CreateSiteSchema = z.object({
  programId: z.string().min(1, "Select a Program."),
  name: z.string().trim().min(1, "Site name is required."),
  employerName: z.string().trim().min(1, "Employer name is required."),
  contactName: z.string().trim().optional(),
  contactInfo: z.string().trim().optional(),
  capacity: z.coerce.number().int().min(1).max(1000).optional(),
});

export async function createClinicalSiteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireSessionUserWithRole("CLINICAL_COORDINATOR");
  const parsed = CreateSiteSchema.safeParse({
    programId: formData.get("programId"),
    name: formData.get("name"),
    employerName: formData.get("employerName"),
    contactName: formData.get("contactName") || undefined,
    contactInfo: formData.get("contactInfo") || undefined,
    capacity: formData.get("capacity") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    await createClinicalSite(parsed.data, user);
  } catch (error) {
    return { error: messageFor(error) };
  }

  revalidatePath("/coordinator/sites");
  return { success: "Clinical Site added." };
}

/** Bound to a plain `<form action={...}>` — see approveGradeAction's comment in program-director/actions.ts for why this throws rather than returning a state. */
export async function updateClinicalSiteStatusAction(
  siteId: string,
  status: ClinicalSiteStatus,
  _formData: FormData,
): Promise<void> {
  const user = await requireSessionUserWithRole("CLINICAL_COORDINATOR");
  try {
    await updateClinicalSiteStatus(siteId, status, user);
  } catch (error) {
    throw new Error(messageFor(error));
  }
  revalidatePath("/coordinator/sites");
}

// ── Eligibility ──────────────────────────────────────────────────────────

const DetermineEligibilitySchema = z.object({
  studentId: z.string().min(1, "Select a Student."),
  programId: z.string().min(1, "Program is required."),
  status: z.enum(["ELIGIBLE", "NOT_YET_ELIGIBLE", "BLOCKED"]),
  notes: z.string().trim().optional(),
});

export async function determineEligibilityAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireSessionUserWithRole("CLINICAL_COORDINATOR");
  const parsed = DetermineEligibilitySchema.safeParse({
    studentId: formData.get("studentId"),
    programId: formData.get("programId"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    await determineEligibility(
      {
        studentId: parsed.data.studentId,
        programId: parsed.data.programId,
        status: parsed.data.status as DeterminedEligibilityStatus,
        notes: parsed.data.notes,
      },
      user,
    );
  } catch (error) {
    return { error: messageFor(error) };
  }

  revalidatePath("/coordinator/eligibility");
  return { success: "Eligibility determination recorded." };
}

// ── Placements ───────────────────────────────────────────────────────────

const RequestPlacementSchema = z.object({
  studentId: z.string().min(1, "Select a Student."),
  programId: z.string().min(1, "Program is required."),
  clinicalSiteId: z.string().min(1, "Select a Clinical Site."),
  preceptorName: z.string().trim().optional(),
  preceptorContact: z.string().trim().optional(),
});

export async function requestPlacementAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireSessionUserWithRole("CLINICAL_COORDINATOR");
  const parsed = RequestPlacementSchema.safeParse({
    studentId: formData.get("studentId"),
    programId: formData.get("programId"),
    clinicalSiteId: formData.get("clinicalSiteId"),
    preceptorName: formData.get("preceptorName") || undefined,
    preceptorContact: formData.get("preceptorContact") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    await requestPlacement(parsed.data, user);
  } catch (error) {
    return { error: messageFor(error) };
  }

  revalidatePath("/coordinator/placements");
  revalidatePath("/coordinator/eligibility");
  return { success: "Placement requested." };
}

async function runPlacementTransition(
  placementId: string,
  fn: (placementId: string, user: Awaited<ReturnType<typeof requireSessionUserWithRole>>) => Promise<unknown>,
) {
  const user = await requireSessionUserWithRole("CLINICAL_COORDINATOR");
  try {
    await fn(placementId, user);
  } catch (error) {
    throw new Error(messageFor(error));
  }
  revalidatePath("/coordinator/placements");
  revalidatePath(`/coordinator/placements/${placementId}`);
}

export async function approvePlacementAction(placementId: string, _formData: FormData): Promise<void> {
  await runPlacementTransition(placementId, approvePlacement);
}

export async function activatePlacementAction(placementId: string, _formData: FormData): Promise<void> {
  await runPlacementTransition(placementId, activatePlacement);
}

export async function attestHoursCompleteAction(placementId: string, _formData: FormData): Promise<void> {
  await runPlacementTransition(placementId, attestHoursComplete);
}

export async function submitCompletionForVerificationAction(
  placementId: string,
  _formData: FormData,
): Promise<void> {
  await runPlacementTransition(placementId, submitCompletionForVerification);
  revalidatePath("/coordinator/completion");
  revalidatePath("/program-director/externship");
}

// ── Evaluations ──────────────────────────────────────────────────────────

const RecordEvaluationSchema = z.object({
  content: z.string().trim().min(1, "Evaluation content is required."),
  outcome: z.enum(["SATISFACTORY", "CONCERNS_IDENTIFIED"]),
});

export async function recordEvaluationAction(
  placementId: string,
  type: EvaluationType,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireSessionUserWithRole("CLINICAL_COORDINATOR");
  const parsed = RecordEvaluationSchema.safeParse({
    content: formData.get("content"),
    outcome: formData.get("outcome"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    await recordEvaluation(
      {
        placementId,
        type,
        content: parsed.data.content,
        outcome: parsed.data.outcome as EvaluationOutcome,
      },
      user,
    );
  } catch (error) {
    return { error: messageFor(error) };
  }

  revalidatePath(`/coordinator/placements/${placementId}`);
  revalidatePath("/coordinator/evaluations");
  return { success: `${type === "MIDPOINT" ? "Midpoint" : "Final"} Evaluation recorded.` };
}
