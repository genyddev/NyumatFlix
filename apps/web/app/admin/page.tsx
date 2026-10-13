import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminIdentity } from "@/lib/admin-auth";
import { hasSupabaseEnvironment } from "@/lib/supabase/config";
import { loginAction } from "./actions";

export const metadata: Metadata = { title: "Administrimi" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminIdentity()) redirect("/admin/movies");
  const { error } = await searchParams;
  const configured = hasSupabaseEnvironment();
  return (
    <div className="admin-login-shell">
      <section className="admin-login-card">
        <p className="eyebrow">KokoMax Admin</p>
        <h1>Hyr në administrim</h1>
        <p>Vetëm llogaritë e krijuara në Supabase Auth dhe të regjistruara në <code>admin_users</code> lejohen.</p>
        {error ? <div className="admin-alert admin-alert-error" role="alert">{error}</div> : null}
        {!configured ? <div className="admin-alert">Supabase nuk është konfiguruar në këtë mjedis. Ndiq dokumentin e konfigurimit para hyrjes.</div> : null}
        <form action={loginAction} className="admin-login-form">
          <label><span>Emaili</span><input name="email" type="email" autoComplete="username" required disabled={!configured} /></label>
          <label><span>Fjalëkalimi</span><input name="password" type="password" autoComplete="current-password" required disabled={!configured} /></label>
          <button className="primary-button" type="submit" disabled={!configured}>Hyr</button>
        </form>
        <small>Nuk ka regjistrim publik. Fjalëkalimet administrohen vetëm nga Supabase Auth.</small>
      </section>
    </div>
  );
}
