import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession, useIsAdmin } from "@/lib/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/halaqoh")({
  head: () => ({ meta: [{ title: "Halaqoh & Absensi — SAQU" }] }),
  component: HalaqohPage,
});

const HARI = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];

function HalaqohPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Halaqoh & Absensi</h1>
        <p className="text-muted-foreground">Kelompok halaqoh, jadwal, dan absensi harian santri.</p>
      </div>
      <Tabs defaultValue="halaqoh">
        <TabsList className="rounded-xl">
          <TabsTrigger value="halaqoh">Halaqoh</TabsTrigger>
          <TabsTrigger value="absensi">Absensi Harian</TabsTrigger>
        </TabsList>
        <TabsContent value="halaqoh"><HalaqohTab /></TabsContent>
        <TabsContent value="absensi"><AbsensiTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function HalaqohTab() {
  const qc = useQueryClient();
  const isAdmin = useIsAdmin();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", level: "1", description: "" });
  const { data: rows } = useQuery({
    queryKey: ["halaqoh-full"],
    queryFn: async () => (await supabase.from("halaqoh").select("*").order("name")).data ?? [],
  });
  const add = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("halaqoh").insert(form); if (error) throw error; },
    onSuccess: () => { toast.success("Halaqoh dibuat"); setOpen(false); qc.invalidateQueries({ queryKey: ["halaqoh-full"] }); qc.invalidateQueries({ queryKey: ["halaqoh"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      {isAdmin && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="rounded-xl"><Plus className="mr-2 h-4 w-4" />Tambah Halaqoh</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Halaqoh Baru</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nama</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Halaqoh Al-Fatih" /></div>
              <div>
                <Label>Tingkat / Kelas</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["1","2","3","4","5","6"].map(k => <SelectItem key={k} value={k}>Kelas {k}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Keterangan</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={() => add.mutate()} disabled={add.isPending}>Simpan</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(rows ?? []).map((h: any) => (
          <Card key={h.id} className="card-fun">
            <CardContent className="p-5">
              <div className="font-display font-extrabold text-lg">{h.name}</div>
              <div className="text-xs text-muted-foreground">Kelas {h.level ?? "-"}</div>
              {h.description && <p className="mt-2 text-sm">{h.description}</p>}
            </CardContent>
          </Card>
        ))}
        {(rows ?? []).length === 0 && <p className="text-sm text-muted-foreground">Belum ada halaqoh.</p>}
      </div>
    </div>
  );
}

function AbsensiTab() {
  const qc = useQueryClient();
  const { user } = useSession();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [halaqohId, setHalaqohId] = useState<string>("");

  const { data: halaqoh } = useQuery({
    queryKey: ["halaqoh"],
    queryFn: async () => (await supabase.from("halaqoh").select("id, name").order("name")).data ?? [],
  });
  const { data: santri } = useQuery({
    queryKey: ["santri-hal", halaqohId],
    enabled: !!halaqohId,
    queryFn: async () => (await supabase.from("students").select("id, full_name").eq("halaqoh_id", halaqohId).order("full_name")).data ?? [],
  });
  const { data: abs } = useQuery({
    queryKey: ["absensi", date, halaqohId],
    enabled: !!halaqohId,
    queryFn: async () => {
      const ids = (santri ?? []).map((s: any) => s.id);
      if (ids.length === 0) return [];
      return (await supabase.from("attendance").select("*").eq("date", date).in("student_id", ids)).data ?? [];
    },
  });

  const mark = useMutation({
    mutationFn: async ({ student_id, status }: { student_id: string; status: string }) => {
      const { error } = await supabase.from("attendance").upsert(
        { student_id, date, status: status as any, recorded_by: user!.id },
        { onConflict: "student_id,date" }
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["absensi", date, halaqohId] }),
    onError: (e: any) => toast.error(e.message),
  });

  const getStatus = (sid: string) => (abs ?? []).find((a: any) => a.student_id === sid)?.status;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label>Tanggal</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="min-w-56">
          <Label>Halaqoh</Label>
          <Select value={halaqohId} onValueChange={setHalaqohId}>
            <SelectTrigger><SelectValue placeholder="Pilih halaqoh" /></SelectTrigger>
            <SelectContent>{(halaqoh ?? []).map((h: any) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {halaqohId ? (
        <Card className="card-fun">
          <CardHeader><CardTitle>Daftar Santri — {date}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(santri ?? []).map((s: any) => {
                const st = getStatus(s.id);
                return (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-muted/20 px-3 py-2">
                    <div className="font-semibold">{s.full_name}</div>
                    <div className="flex gap-1">
                      {[["hadir","H","bg-leaf"],["izin","I","bg-sun"],["sakit","S","bg-sky"],["alpa","A","bg-berry"]].map(([v, l, c]) => (
                        <Button key={v} size="sm" variant={st === v ? "default" : "outline"}
                          onClick={() => mark.mutate({ student_id: s.id, status: v })}
                          className={`rounded-lg w-10 ${st === v ? c + " text-white" : ""}`}>{l}</Button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {(santri ?? []).length === 0 && <p className="text-sm text-muted-foreground">Belum ada santri di halaqoh ini.</p>}
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Pilih halaqoh untuk mulai absensi.</p>
      )}
    </div>
  );
}
