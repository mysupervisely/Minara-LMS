"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/services/identity/session";
import { logout } from "@/services/identity/auth";

export async function logoutAction() {
  const user = await getSessionUser();
  await logout(user?.id ?? null);
  redirect("/login");
}
