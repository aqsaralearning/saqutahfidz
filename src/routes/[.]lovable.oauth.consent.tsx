import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AuthorizationDetails = {
  client?: { name?: string; redirect_uri?: string } | null;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};

// Beta namespace not in the current @supabase/supabase-js types — narrow wrapper.
type OAuthResult<T> = { data: T | null; error: { message: string } | null };
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult<AuthorizationDetails>>;
  approveAuthorization: (id: string) => Promise<OAuthResult<AuthorizationDetails>>;
  denyAuthorization: (id: string) => Promise<OAuthResult<AuthorizationDetails>>;
};
const authOAuth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await authOAuth.getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data as AuthorizationDetails;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md p-8">
      <Card>
        <CardHeader><CardTitle>Tidak dapat memuat permintaan otorisasi</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">{String((error as Error)?.message ?? error)}</p></CardContent>
      </Card>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await authOAuth.approveAuthorization(authorization_id)
      : await authOAuth.denyAuthorization(authorization_id);
    if (error) { setBusy(false); setError(error.message); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setError("Server otorisasi tidak mengembalikan URL redirect."); return; }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "Aplikasi";
  return (
    <main className="mx-auto max-w-md p-6">
      <Card className="card-fun">
        <CardHeader>
          <CardTitle className="font-display text-xl">Hubungkan {clientName} ke SAQU Tahfidz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>{clientName} akan dapat memanggil alat MCP aplikasi ini <strong>sebagai Anda</strong>. Akses tetap dibatasi oleh peran (admin, musyrif, wali).</p>
          {details?.scope && (
            <p className="text-muted-foreground">Izin diminta: <code className="text-xs">{details.scope}</code></p>
          )}
          <p className="text-xs text-muted-foreground">Ini tidak melewati kebijakan keamanan basis data — RLS tetap berlaku.</p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button disabled={busy} className="flex-1 rounded-xl" onClick={() => decide(true)}>Setujui</Button>
            <Button disabled={busy} variant="outline" className="flex-1 rounded-xl" onClick={() => decide(false)}>Tolak</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
