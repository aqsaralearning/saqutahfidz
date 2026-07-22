import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { useIsAdmin } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/pengaturan")({
  head: () => ({ meta: [{ title: "Pengaturan — SAQU" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin");
    if (!roles || roles.length === 0) throw redirect({ to: "/dashboard" });
  },
  component: Pengaturan,
});

function Pengaturan() {
  const qc = useQueryClient();
  const isAdmin = useIsAdmin();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "musyrif" | "wali">("musyrif");

  const { data: users } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id, full_name"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      return (profiles ?? []).map((p: any) => ({
        ...p, roles: (roles ?? []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role),
      }));
    },
  });

  const { data: halaqoh } = useQuery({
    queryKey: ["halaqoh-full"],
    queryFn: async () => (await supabase.from("halaqoh").select("*, profiles:musyrif_id(full_name)")).data ?? [],
  });

  const assignByProfileId = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: string }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id, role: role as any });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Peran ditambahkan"); qc.invalidateQueries({ queryKey: ["all-users"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const revoke = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: string }) => {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", user_id).eq("role", role as any);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Peran dicabut"); qc.invalidateQueries({ queryKey: ["all-users"] }); },
  });

  const setMusyrif = useMutation({
    mutationFn: async ({ halaqoh_id, musyrif_id }: { halaqoh_id: string; musyrif_id: string | null }) => {
      const { error } = await supabase.from("halaqoh").update({ musyrif_id }).eq("id", halaqoh_id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Musyrif diperbarui"); qc.invalidateQueries({ queryKey: ["halaqoh-full"] }); },
  });

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola peran pengguna & musyrif halaqoh.</p>
      </div>

      <Card className="card-fun">
        <CardHeader><CardTitle>Pengguna & Peran</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                <tr><th className="py-2 pr-2">Nama</th><th>Peran</th><th>Tambah Peran</th></tr>
              </thead>
              <tbody>
                {(users ?? []).map((u: any) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-2 pr-2 font-semibold">{u.full_name || <span className="text-muted-foreground">tanpa nama</span>}</td>
                    <td className="space-x-1">
                      {u.roles.map((r: string) => (
                        <span key={r} className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase">
                          {r}<button onClick={() => revoke.mutate({ user_id: u.id, role: r })} className="text-berry">×</button>
                        </span>
                      ))}
                      {u.roles.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {(["admin", "musyrif", "wali"] as const).filter(r => !u.roles.includes(r)).map(r => (
                          <Button key={r} size="sm" variant="outline" className="rounded-lg text-xs" onClick={() => assignByProfileId.mutate({ user_id: u.id, role: r })}>+ {r}</Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="card-fun">
        <CardHeader><CardTitle>Musyrif Halaqoh</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(halaqoh ?? []).map((h: any) => (
              <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-muted/20 px-3 py-2">
                <div>
                  <div className="font-semibold">{h.name}</div>
                  <div className="text-xs text-muted-foreground">Musyrif: {h.profiles?.full_name ?? "Belum ada"}</div>
                </div>
                <Select value={h.musyrif_id ?? ""} onValueChange={(v) => setMusyrif.mutate({ halaqoh_id: h.id, musyrif_id: v || null })}>
                  <SelectTrigger className="w-56"><SelectValue placeholder="Pilih musyrif" /></SelectTrigger>
                  <SelectContent>
                    {(users ?? []).filter((u: any) => u.roles.includes("musyrif") || u.roles.includes("admin")).map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
