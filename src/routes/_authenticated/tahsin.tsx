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
import { SURAHS, predicateFromScore } from "@/lib/quran";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tahsin")({
  head: () => ({ meta: [{ title: "Tahsin — SAQU Tahfidz" }] }),
  component: TahsinPage,
});

const RUBRICS = [
  { key: "score_makhroj", label: "Makhorijul Huruf" },
  { key: "score_mad", label: "Mad" },
  { key: "score_gunnah", label: "Gunnah" },
  { key: "score_qolqolah", label: "Qolqolah" },
  { key: "score_kelancaran", label: "Kelancaran" },
  { key: "score_vokal", label: "Vokal / Irama" },
] as const;

function TahsinPage() {
  const qc = useQueryClient();
  const { user } = useSession();
  const [form, setForm] = useState<any>({
    student_id: "",
    date: new Date().toISOString().slice(0, 10),
    surah: "Al-Fatihah",
    ayat_from: 1,
    ayat_to: 7,
    juz: 1,
    score_makhroj: 80,
    score_mad: 80,
    score_gunnah: 80,
    score_qolqolah: 80,
    score_kelancaran: 80,
    score_vokal: 80,
    notes: "",
  });

  const final = useMemo(() => {
    const vals = RUBRICS.map((r) => Number(form[r.key]) || 0);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [form]);
  const pred = predicateFromScore(final);

  const { data: santri } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => (await supabase.from("students").select("id, full_name, nis").order("full_name")).data ?? [],
  });

  const { data: rows } = useQuery({
    queryKey: ["tahsin-history"],
    queryFn: async () => (await supabase.from("tahsin_entries").select("*, students(full_name)").order("date", { ascending: false }).limit(50)).data ?? [],
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!form.student_id) throw new Error("Pilih santri");
      const { error } = await supabase.from("tahsin_entries").insert({
        ...form,
        teacher_id: user!.id,
        final_score: final,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Tahsin disimpan"); qc.invalidateQueries({ queryKey: ["tahsin-history"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Tahsin</h1>
        <p className="text-muted-foreground">Nilai bacaan santri per komponen tajwid, kelancaran, dan irama.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-fun">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-berry" />Tambah Penilaian Tahsin</CardTitle>
            <p className="text-xs text-muted-foreground">Penerima setoran: <span className="font-semibold text-foreground">{user?.email}</span></p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Santri</Label>
              <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih santri" /></SelectTrigger>
                <SelectContent>{(santri ?? []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Tanggal</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Juz</Label><Input type="number" min={1} max={30} value={form.juz} onChange={(e) => setForm({ ...form, juz: +e.target.value })} /></div>
            </div>
            <div>
              <Label>Surah</Label>
              <Select value={form.surah} onValueChange={(v) => setForm({ ...form, surah: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">{SURAHS.map((s) => <SelectItem key={s.no} value={s.name}>{s.no}. {s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Ayat dari</Label><Input type="number" min={1} value={form.ayat_from} onChange={(e) => setForm({ ...form, ayat_from: +e.target.value })} /></div>
              <div><Label>Ayat sampai</Label><Input type="number" min={1} value={form.ayat_to} onChange={(e) => setForm({ ...form, ayat_to: +e.target.value })} /></div>
            </div>

            <div className="rounded-xl border p-3 space-y-2">
              <div className="text-xs font-semibold uppercase text-muted-foreground">Rubrik Penilaian (0-100)</div>
              {RUBRICS.map((r) => (
                <div key={r.key} className="grid grid-cols-3 items-center gap-2">
                  <Label className="col-span-2 text-sm">{r.label}</Label>
                  <Input type="number" min={0} max={100} value={form[r.key]}
                    onChange={(e) => setForm({ ...form, [r.key]: +e.target.value })} />
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between rounded-lg bg-muted/50 p-2">
                <span className="text-sm font-semibold">Nilai Akhir</span>
                <span className="font-display text-2xl font-extrabold text-primary">{final}</span>
              </div>
              <div className="text-center text-xs font-semibold text-muted-foreground">Predikat: {pred.label}</div>
            </div>

            <div><Label>Catatan</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button className="w-full rounded-xl" onClick={() => add.mutate()} disabled={add.isPending}>Simpan Tahsin</Button>
          </CardContent>
        </Card>

        <Card className="card-fun">
          <CardHeader><CardTitle>Riwayat Tahsin</CardTitle></CardHeader>
          <CardContent>
            {(rows ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Belum ada penilaian.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                    <tr><th className="py-2 pr-2">Tgl</th><th>Santri</th><th>Materi</th><th>Nilai</th></tr>
                  </thead>
                  <tbody>
                    {(rows ?? []).map((r: any) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="py-2 pr-2 whitespace-nowrap">{r.date}</td>
                        <td className="font-semibold">{r.students?.full_name}</td>
                        <td className="text-xs">{r.surah} {r.ayat_from}-{r.ayat_to}</td>
                        <td><span className="rounded-full bg-leaf/20 px-2 py-0.5 text-xs font-bold text-leaf">{r.final_score ?? "-"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
