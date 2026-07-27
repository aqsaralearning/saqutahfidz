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
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/pelanggaran")({
  head: () => ({ meta: [{ title: "Poin Pelanggaran — SAQU" }] }),
  component: PelanggaranPage,
});

const KATEGORI = [
  { key: "terlambat", label: "Terlambat", pts: 1 },
  { key: "tidak_setor", label: "Tidak Setor Tanpa Alasan", pts: 2 },
  { key: "adab", label: "Pelanggaran Adab", pts: 3 },
  { key: "seragam", label: "Seragam Tidak Rapi", pts: 1 },
  { key: "berkelahi", label: "Berkelahi", pts: 5 },
  { key: "lain", label: "Lainnya", pts: 1 },
];

function PelanggaranPage() {
  const qc = useQueryClient();
  const { user } = useSession();
  const [form, setForm] = useState<any>({
    student_id: "", date: new Date().toISOString().slice(0, 10),
    kategori: "terlambat", points: 1, deskripsi: "", tindak_lanjut: "",
  });

  const { data: santri } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => (await supabase.from("students").select("id, full_name, class_level").order("full_name")).data ?? [],
  });
  const { data: rows } = useQuery({
    queryKey: ["pelanggaran-list"],
    queryFn: async () => (await supabase.from("pelanggaran" as any).select("*, students(full_name, class_level)").order("date", { ascending: false }).limit(100)).data ?? [],
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!form.student_id) throw new Error("Pilih santri");
      const { error } = await supabase.from("pelanggaran" as any).insert({
        student_id: form.student_id, recorded_by: user!.id, date: form.date,
        kategori: form.kategori, points: form.points, deskripsi: form.deskripsi, tindak_lanjut: form.tindak_lanjut,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Poin pelanggaran dicatat"); qc.invalidateQueries({ queryKey: ["pelanggaran-list"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  // Rekap poin per santri
  const rekap = (() => {
    const map = new Map<string, { name: string; total: number; count: number }>();
    (rows ?? []).forEach((r: any) => {
      const cur = map.get(r.student_id) ?? { name: r.students?.full_name ?? "-", total: 0, count: 0 };
      cur.total += r.points || 0; cur.count += 1;
      map.set(r.student_id, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold flex items-center gap-2"><AlertTriangle className="text-berry" />Poin Pelanggaran</h1>
        <p className="text-muted-foreground">Catat pelanggaran santri agar mudah dievaluasi dalam rapot.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="card-fun">
          <CardHeader><CardTitle>Catat Pelanggaran</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Santri</Label>
              <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih santri" /></SelectTrigger>
                <SelectContent className="max-h-64">{(santri ?? []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Tanggal</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Poin</Label><Input type="number" min={1} value={form.points} onChange={(e) => setForm({ ...form, points: +e.target.value })} /></div>
            </div>
            <div>
              <Label>Kategori</Label>
              <Select value={form.kategori} onValueChange={(v) => { const k = KATEGORI.find(x=>x.key===v); setForm({ ...form, kategori: v, points: k?.pts ?? form.points }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{KATEGORI.map(k => <SelectItem key={k.key} value={k.key}>{k.label} ({k.pts} poin)</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Deskripsi</Label><Textarea rows={2} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} /></div>
            <div><Label>Tindak Lanjut</Label><Textarea rows={2} value={form.tindak_lanjut} onChange={(e) => setForm({ ...form, tindak_lanjut: e.target.value })} /></div>
            <Button className="w-full rounded-xl" onClick={() => add.mutate()} disabled={add.isPending}>Simpan</Button>
          </CardContent>
        </Card>

        <Card className="card-fun">
          <CardHeader><CardTitle>Rekap Poin per Santri</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm max-h-96 overflow-y-auto">
              {rekap.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2">
                  <span className="font-semibold">{r.name}</span>
                  <span className="rounded-full bg-berry/20 px-2 py-0.5 text-xs font-bold text-berry">{r.total} poin · {r.count}x</span>
                </div>
              ))}
              {rekap.length === 0 && <p className="text-muted-foreground">Belum ada pelanggaran tercatat.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-fun">
        <CardHeader><CardTitle>Riwayat Pelanggaran</CardTitle></CardHeader>
        <CardContent>
          {(rows ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Belum ada data.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                  <tr><th className="py-2 pr-2">Tgl</th><th>Santri</th><th>Kategori</th><th>Poin</th><th>Deskripsi</th></tr>
                </thead>
                <tbody>
                  {(rows ?? []).map((r: any) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-2 whitespace-nowrap">{r.date}</td>
                      <td className="font-semibold">{r.students?.full_name}</td>
                      <td><span className="rounded-full bg-sun/20 px-2 py-0.5 text-[10px] font-bold uppercase">{r.kategori}</span></td>
                      <td><span className="rounded-full bg-berry/20 px-2 py-0.5 text-xs font-bold text-berry">{r.points}</span></td>
                      <td className="text-xs">{r.deskripsi || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
