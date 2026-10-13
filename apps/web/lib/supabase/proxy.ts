import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "../database.types";
import { AUTH_COOKIE_OPTIONS, hasSupabaseEnvironment, getSupabaseEnvironment } from "./config";
import { authClient } from "./auth";

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnvironment()) return NextResponse.next({ request });
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseEnvironment();
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookieOptions: AUTH_COOKIE_OPTIONS,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, { ...options, ...AUTH_COOKIE_OPTIONS }),
        );
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });
  await authClient(supabase).getClaims();
  return response;
}
