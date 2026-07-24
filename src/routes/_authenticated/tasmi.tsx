import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SURAHS } from "@/lib/quran";
import { useState } from "react";
import { toast } from "sonner";
import { Mic } from "lucide-react";
import { MushafViewer } from "@/components/MushafViewer";

export const Route = createFileRoute("/_authenticated/tasmi")({
  head: () => ({ meta: [{ title: "Tasmi' — SAQU Tahfidz" }] }),
  component: TasmiPage,
});

const TASMI_TYPES = [
  { key: "q1", label: "Tasmi' 1/4 Juz Pertama", short: "1/4 Juz" },
  { key: "q2", label: "Tasmi' 1/4 Juz Ke-2 (1/2 Juz)", short: "1/2 Juz" },
  { key: "q3", label: "Tasmi' 1/4 Juz Ke-3 (3/4 Juz)", short: "3/4 Juz" },
  { key: "q4", label: "Tasmi' 1/4 Juz Ke-4 (1 Juz Penuh)", short: "1 Juz" },
] as const;

function TasmiPage() {
  const qc = useQueryClient();
  const { user } = useSession();
  const [form, setForm] = useState<any>({
    student_id: "",
    date: new Date().toISOString().slice(0, 10),
    surah_from: "Al-Fatihah",
    surah_to: "",
    juz: 1,
    tasmi_type: "q1",
    duration_min: 15,
    score: 85,
    status: "lancar",
    notes: "",
  });

  const { data: santri } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => (await supabase.from("students").select("id, full_name, nis").order("full_name")).data ?? [],
  });

  const { data: rows } = useQuery({
    queryKey: ["tasmi-history"],
    queryFn: async () => (await supabase.from("tasmi_entries").select("*, students(full_name)").order("date", { ascending: false }).limit(50)).data ?? [],
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!form.student_id) throw new Error("Pilih santri");
      const { error } = await supabase.from("tasmi_entries").insert({
        student_id: form.student_id,
        teacher_id: user!.id,
        date: form.date,
        surah_from: form.surah_from,
        surah_to: form.surah_to || null,
        juz: form.juz,
        tasmi_type: form.tasmi_type,
        duration_min: form.duration_min,
        score: form.score,
        status: form.status,
        notes: form.notes,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Tasmi' disimpan"); qc.invalidateQueries({ queryKey: ["tasmi-history"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Tasmi'</h1>
        <p className="text-muted-foreground">Setoran tasmi' bertahap: 1/4, 1/2, 3/4, hingga 1 juz penuh.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="card-fun lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5 text-berry" />Tambah Tasmi'</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Santri</Label>
              <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih santri" /></SelectTrigger>
                <SelectContent>{(santri ?? []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Jenis Tasmi'</Label>
              <Select value={form.tasmi_type} onValueChange={(v) => setForm({ ...form, tasmi_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASMI_TYPES.map((t) => <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Tanggal</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Juz</Label><Input type="number" min={1} max={30} value={form.juz} onChange={(e) => setForm({ ...form, juz: +e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Surah dari</Label>
                <Select value={form.surah_from} onValueChange={(v) => setForm({ ...form, surah_from: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-64">{SURAHS.map((s) => <SelectItem key={s.no} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Surah sampai</Label>
                <Select value={form.surah_to || "-"} onValueChange={(v) => setForm({ ...form, surah_to: v === "-" ? "" : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-64"><SelectItem value="-">—</SelectItem>{SURAHS.map((s) => <SelectItem key={s.no} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Durasi (mnt)</Label><Input type="number" min={0} value={form.duration_min} onChange={(e) => setForm({ ...form, duration_min: +e.target.value })} /></div>
              <div><Label>Nilai</Label><Input type="number" min={0} max={100} value={form.score} onChange={(e) => setForm({ ...form, score: +e.target.value })} /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lancar">Lancar</SelectItem>
                    <SelectItem value="kurang_lancar">Kurang</SelectItem>
                    <SelectItem value="mengulang">Ulang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Catatan</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button className="w-full rounded-xl" onClick={() => add.mutate()} disabled={add.isPending}>Simpan Tasmi'</Button>
          </CardContent>
        </Card>

        <Card className="card-fun lg:col-span-3">
          <CardHeader><CardTitle>Riwayat Tasmi'</CardTitle></CardHeader>
          <CardContent>
            {(rows ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Belum ada tasmi'.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                    <tr><th className="py-2 pr-2">Tgl</th><th>Santri</th><th>Jenis</th><th>Materi</th><th>Nilai</th></tr>
                  </thead>
                  <tbody>
                    {(rows ?? []).map((r: any) => {
                      const t = TASMI_TYPES.find((x) => x.key === r.tasmi_type);
                      return (
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="py-2 pr-2 whitespace-nowrap">{r.date}</td>
                          <td className="font-semibold">{r.students?.full_name}</td>
                          <td><span className="rounded-full bg-sun/30 px-2 py-0.5 text-[10px] font-bold uppercase">{t?.short ?? r.tasmi_type}</span></td>
                          <td className="text-xs">{r.surah_from}{r.surah_to ? ` – ${r.surah_to}` : ""}{r.juz ? ` · Juz ${r.juz}` : ""}</td>
                          <td><span className="rounded-full bg-leaf/20 px-2 py-0.5 text-xs font-bold text-leaf">{r.score ?? "-"}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="card-fun">
        <CardHeader><CardTitle>Mushaf Al-Qur'an Digital</CardTitle></CardHeader>
        <CardContent><MushafViewer /></CardContent>
      </Card>
    </div>
  );
}

