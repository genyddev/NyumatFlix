import "server-only";
import { redirect } from "next/navigation";
import { hasSupabaseEnvironment } from "./supabase/config";
import { createServerSupabaseClient } from "./supabase/server";
import { authClient } from "./supabase/auth";

export type AdminIdentity = Readonly<{ id: string; email: string | null }>;

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  if (!hasSupabaseEnvironment()) return null;
  const supabase = await createServerSupabaseClient();
  const { data: claimsData, error: claimsError } = await authClient(supabase).getClaims();
  const userId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : null;
  if (claimsError || !userId) return null;

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (adminError || !admin) return null;
  const email = typeof claimsData?.claims.email === "string" ? claimsData.claims.email : null;
  return { id: userId, email };
}

export async function requireAdmin(): Promise<AdminIdentity> {
  const admin = await getAdminIdentity();
  if (!admin) redirect("/admin");
  return admin;
}
