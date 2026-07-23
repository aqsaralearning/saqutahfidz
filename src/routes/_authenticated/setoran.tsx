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
import { MushafViewer } from "@/components/MushafViewer";

export const Route = createFileRoute("/_authenticated/setoran")({
  head: () => ({ meta: [{ title: "Setoran Hafalan — SAQU Tahfidz" }] }),
  component: SetoranPage,
});

type Jenis = "ziyadah" | "murojaah";

function SetoranPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Setoran Hafalan</h1>
        <p className="text-muted-foreground">Catat ziyadah dan muroja'ah santri sambil membuka mushaf digital.</p>
      </div>
      <Tabs defaultValue="ziyadah">
        <TabsList className="rounded-xl">
          <TabsTrigger value="ziyadah">Ziyadah</TabsTrigger>
          <TabsTrigger value="murojaah">Muroja'ah</TabsTrigger>
        </TabsList>
        <TabsContent value="ziyadah"><SetoranForm jenis="ziyadah" /></TabsContent>
        <TabsContent value="murojaah"><SetoranForm jenis="murojaah" /></TabsContent>
      </Tabs>
    </div>
  );
}

function SetoranForm({ jenis }: { jenis: Jenis }) {
  const qc = useQueryClient();
  const { user } = useSession();
  const [form, setForm] = useState<any>({
    student_id: "",
    date: new Date().toISOString().slice(0, 10),
    surah: "Al-Fatihah",
    surah_from: "Al-Fatihah",
    surah_to: "",
    ayat_from: 1,
    ayat_to: 7,
    juz: 1,
    score: 85,
    status: "lancar",
    murojaah_type: "lama",
    notes: "",
  });

  const { data: santri } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => (await supabase.from("students").select("id, full_name, nis").order("full_name")).data ?? [],
  });

  const table = jenis === "ziyadah" ? "ziyadah_entries" : "murojaah_entries";

  const add = useMutation({
    mutationFn: async () => {
      if (!form.student_id) throw new Error("Pilih santri dulu");
      const base: any = {
        student_id: form.student_id,
        teacher_id: user!.id,
        date: form.date,
        juz: form.juz,
        score: form.score,
        status: form.status,
        notes: form.notes,
      };
      if (jenis === "ziyadah") {
        Object.assign(base, { surah: form.surah, ayat_from: form.ayat_from, ayat_to: form.ayat_to });
      } else {
        Object.assign(base, {
          surah_from: form.surah_from,
          surah_to: form.surah_to || null,
          murojaah_type: form.murojaah_type,
        });
      }
      const { error } = await supabase.from(table as any).insert(base);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Setoran disimpan");
      qc.invalidateQueries({ queryKey: ["setoran-history"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="card-fun lg:col-span-2">
        <CardHeader>
          <CardTitle className="capitalize">
            Tambah {jenis === "murojaah" ? "Muroja'ah" : "Ziyadah"}
          </CardTitle>
        </CardHeader>
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
              <div>
                <Label>Jenis Muroja'ah</Label>
                <Select value={form.murojaah_type} onValueChange={(v) => setForm({ ...form, murojaah_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lama">Muroja'ah Lama</SelectItem>
                    <SelectItem value="baru">Muroja'ah Baru</SelectItem>
                  </SelectContent>
                </Select>
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
        <CardHeader><CardTitle>Mushaf Al-Qur'an Digital</CardTitle></CardHeader>
        <CardContent>
          <MushafViewer />
        </CardContent>
      </Card>
    </div>
  );
}
