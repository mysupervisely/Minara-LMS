import { redirect } from "next/navigation";
import { requireSessionUser, resolveHomeRoute } from "@/services/identity/authorization";

/** A generic landing route that sends every authenticated User to their role's home screen. */
export default async function DashboardRedirectPage() {
  const user = await requireSessionUser();
  redirect(resolveHomeRoute(user));
}
