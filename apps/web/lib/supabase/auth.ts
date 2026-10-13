// supabase-js 2.117's bundled SupabaseAuthClient declaration omits inherited
// methods under TypeScript's bundler resolution. The runtime object is the
// official GoTrueClient; this helper describes only the official methods used here.
type AuthErrorLike = Readonly<{ message: string }>;
type ClaimsResult = Promise<Readonly<{
  data: Readonly<{ claims: Record<string, unknown> }> | null;
  error: AuthErrorLike | null;
}>>;
type PasswordResult = Promise<Readonly<{
  data: Readonly<{ user: Readonly<{ id: string }> | null }>;
  error: AuthErrorLike | null;
}>>;

export type ServerAuthClient = Readonly<{
  getClaims: () => ClaimsResult;
  signInWithPassword: (credentials: { email: string; password: string }) => PasswordResult;
  signOut: () => Promise<Readonly<{ error: AuthErrorLike | null }>>;
}>;

export function authClient(client: { auth: unknown }): ServerAuthClient {
  return client.auth as ServerAuthClient;
}
