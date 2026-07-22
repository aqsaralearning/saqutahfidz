import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SURAHS } from "@/lib/quran";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/setoran")({
  head: () => ({ meta: [{ title: "Setoran Hafalan — SAQU Tahfidz" }] }),
  component: SetoranPage,
});

type Jenis = "ziyadah" | "murojaah" | "tasmi";
const TABLE: Record<Jenis, string> = { ziyadah: "ziyadah_entries", murojaah: "murojaah_entries", tasmi: "tasmi_entries" };

function SetoranPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Setoran Hafalan</h1>
        <p className="text-muted-foreground">Input dan lihat riwayat ziyadah, muroja'ah, dan tasmi' santri.</p>
      </div>
      <Tabs defaultValue="ziyadah">
        <TabsList className="rounded-xl">
          <TabsTrigger value="ziyadah">Ziyadah</TabsTrigger>
          <TabsTrigger value="murojaah">Muroja'ah</TabsTrigger>
          <TabsTrigger value="tasmi">Tasmi'</TabsTrigger>
        </TabsList>
        <TabsContent value="ziyadah"><SetoranForm jenis="ziyadah" /></TabsContent>
        <TabsContent value="murojaah"><SetoranForm jenis="murojaah" /></TabsContent>
        <TabsContent value="tasmi"><SetoranForm jenis="tasmi" /></TabsContent>
      </Tabs>
    </div>
  );
}

function SetoranForm({ jenis }: { jenis: Jenis }) {
  const qc = useQueryClient();
  const { user } = useSession();
  const [form, setForm] = useState<any>({ student_id: "", date: new Date().toISOString().slice(0, 10), surah: "Al-Fatihah", surah_from: "Al-Fatihah", surah_to: "", ayat_from: 1, ayat_to: 7, juz: 1, score: 85, status: "lancar", notes: "" });

  const { data: santri } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => (await supabase.from("students").select("id, full_name, nis").order("full_name")).data ?? [],
  });
  const { data: rows } = useQuery({
    queryKey: ["setoran", jenis],
    queryFn: async () => (await supabase.from(TABLE[jenis] as any).select("*, students(full_name)").order("date", { ascending: false }).limit(50)).data ?? [],
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!form.student_id) throw new Error("Pilih santri dulu");
      const payload: any = { ...form, teacher_id: user!.id };
      if (jenis === "ziyadah") {
        delete payload.surah_from; delete payload.surah_to;
      } else {
        delete payload.surah; delete payload.ayat_from; delete payload.ayat_to;
      }
      const { error } = await supabase.from(TABLE[jenis] as any).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Setoran disimpan"); qc.invalidateQueries({ queryKey: ["setoran", jenis] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="card-fun lg:col-span-2">
        <CardHeader><CardTitle className="capitalize">Tambah {jenis === "tasmi" ? "Tasmi'" : jenis === "murojaah" ? "Muroja'ah" : "Ziyadah"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Santri</Label>
            <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih santri" /></SelectTrigger>
              <SelectContent>{(santri ?? []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.nis})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Tanggal</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>

          {jenis === "ziyadah" ? (
            <>
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
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Surah dari</Label>
                  <Select value={form.surah_from} onValueChange={(v) => setForm({ ...form, surah_from: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-64">{SURAHS.map((s) => <SelectItem key={s.no} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Surah sampai (opsional)</Label>
                  <Select value={form.surah_to || "-"} onValueChange={(v) => setForm({ ...form, surah_to: v === "-" ? "" : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-64"><SelectItem value="-">—</SelectItem>{SURAHS.map((s) => <SelectItem key={s.no} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div><Label>Juz</Label><Input type="number" min={1} max={30} value={form.juz} onChange={(e) => setForm({ ...form, juz: +e.target.value })} /></div>
            <div><Label>Nilai (0-100)</Label><Input type="number" min={0} max={100} value={form.score} onChange={(e) => setForm({ ...form, score: +e.target.value })} /></div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lancar">Lancar</SelectItem>
                <SelectItem value="kurang_lancar">Kurang Lancar</SelectItem>
                <SelectItem value="mengulang">Mengulang</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Catatan</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
          <Button className="w-full rounded-xl" onClick={() => add.mutate()} disabled={add.isPending}>Simpan Setoran</Button>
        </CardContent>
      </Card>

      <Card className="card-fun lg:col-span-3">
        <CardHeader><CardTitle>Riwayat Setoran</CardTitle></CardHeader>
        <CardContent>
          {(rows ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Belum ada data.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                  <tr><th className="py-2 pr-2">Tgl</th><th>Santri</th><th>Materi</th><th>Nilai</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {(rows ?? []).map((r: any) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-2 whitespace-nowrap">{r.date}</td>
                      <td className="font-semibold">{r.students?.full_name}</td>
                      <td className="text-xs">
                        {jenis === "ziyadah" ? `${r.surah} ${r.ayat_from}-${r.ayat_to}` : `${r.surah_from}${r.surah_to ? " – " + r.surah_to : ""}`}
                        {r.juz ? ` · Juz ${r.juz}` : ""}
                      </td>
                      <td><span className="rounded-full bg-leaf/20 px-2 py-0.5 text-xs font-bold text-leaf">{r.score ?? "-"}</span></td>
                      <td className="text-xs capitalize">{r.status.replace("_", " ")}</td>
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
