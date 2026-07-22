import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Save, Download } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { juzPageRange, mushafPageUrl, predicateFromScore } from "@/lib/quran";
import { generateSertifikatPDF } from "@/lib/report-pdf";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/ujian/$id")({
  head: () => ({ meta: [{ title: "Penilaian Ujian — SAQU" }] }),
  component: UjianDetail,
});

const RUBRIK = [
  { key: "score_makhroj", label: "Makhroj Huruf" },
  { key: "score_mad", label: "Tajwid — Mad" },
  { key: "score_ghunnah", label: "Tajwid — Ghunnah" },
  { key: "score_qolqolah", label: "Tajwid — Qolqolah" },
  { key: "score_kelancaran", label: "Kelancaran" },
  { key: "score_adab", label: "Adab & Tartil" },
] as const;

const KATEGORI_ERR = ["makhroj", "mad", "ghunnah", "qolqolah", "kelancaran", "lainnya"];

function UjianDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data: exam } = useQuery({
    queryKey: ["exam", id],
    queryFn: async () => (await supabase.from("exams").select("*, students(*)").eq("id", id).maybeSingle()).data,
  });
  const { data: mistakes } = useQuery({
    queryKey: ["mistakes", id],
    queryFn: async () => (await supabase.from("exam_mistakes").select("*").eq("exam_id", id).order("created_at")).data ?? [],
  });

  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [page, setPage] = useState<number>(1);
  const [newMistake, setNewMistake] = useState({ surah: "", ayat: 1, category: "makhroj", note: "" });

  useEffect(() => {
    if (exam) {
      const s: any = {};
      RUBRIK.forEach((r) => { s[r.key] = (exam as any)[r.key] ?? 85; });
      setScores(s);
      setNotes(exam.notes ?? "");
      const [start] = juzPageRange(exam.juz);
      setPage(start);
    }
  }, [exam?.id]);

  const pageRange = useMemo(() => exam ? juzPageRange(exam.juz) : [1, 604] as [number, number], [exam]);

  const finalScore = useMemo(() => {
    const nums = Object.values(scores).filter((n) => typeof n === "number");
    if (!nums.length) return 0;
    return +(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
  }, [scores]);
  const pred = predicateFromScore(finalScore);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("exams").update({
        ...scores, notes, final_score: finalScore, predicate: pred.key as any, passed: finalScore >= 70,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Penilaian tersimpan"); qc.invalidateQueries({ queryKey: ["exam", id] }); qc.invalidateQueries({ queryKey: ["exams"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const addMistake = useMutation({
    mutationFn: async () => {
      if (!newMistake.surah) throw new Error("Isi surah");
      const { error } = await supabase.from("exam_mistakes").insert({ exam_id: id, ...newMistake, page });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Kesalahan dicatat"); setNewMistake({ ...newMistake, note: "" }); qc.invalidateQueries({ queryKey: ["mistakes", id] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const delMistake = useMutation({
    mutationFn: async (mid: string) => { const { error } = await supabase.from("exam_mistakes").delete().eq("id", mid); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mistakes", id] }),
  });

  if (!exam) return <p>Memuat...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/ujian" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
        <div className="flex gap-2">
          <Button onClick={() => save.mutate()} disabled={save.isPending} className="rounded-xl"><Save className="mr-2 h-4 w-4" />Simpan Penilaian</Button>
          {finalScore >= 70 && (
            <Button variant="outline" className="rounded-xl" onClick={() => generateSertifikatPDF(exam.students, exam.juz, finalScore)}>
              <Download className="mr-2 h-4 w-4" />Sertifikat
            </Button>
          )}
        </div>
      </div>

      <Card className="card-fun">
        <CardContent className="p-5 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold">{exam.students.full_name}</h1>
            <p className="text-sm text-muted-foreground">Ujian Juz {exam.juz} · {exam.date}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-extrabold font-display text-primary">{finalScore.toFixed(1)}</div>
            <div className="text-xs font-bold uppercase text-muted-foreground">{pred.label}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Mushaf */}
        <Card className="card-fun lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>Mushaf Digital — Halaman {page}</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setPage(Math.max(pageRange[0], page - 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <Input type="number" className="w-20" min={pageRange[0]} max={pageRange[1]} value={page} onChange={(e) => setPage(+e.target.value)} />
              <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setPage(Math.min(pageRange[1], page + 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-[oklch(0.97_0.02_90)] p-3 rounded-xl border overflow-hidden">
              <img src={mushafPageUrl(page)} alt={`Mushaf halaman ${page}`} className="w-full h-auto max-h-[70vh] object-contain mx-auto" loading="lazy" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Rentang Juz {exam.juz}: halaman {pageRange[0]}–{pageRange[1]}</p>
          </CardContent>
        </Card>

        {/* Rubrik + kesalahan */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="card-fun">
            <CardHeader><CardTitle>Rubrik Penilaian</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {RUBRIK.map((r) => (
                <div key={r.key}>
                  <div className="flex justify-between text-sm"><Label>{r.label}</Label><span className="font-bold">{scores[r.key] ?? 0}</span></div>
                  <Slider value={[scores[r.key] ?? 0]} min={0} max={100} step={1} onValueChange={(v) => setScores({ ...scores, [r.key]: v[0] })} />
                </div>
              ))}
              <div><Label>Catatan Musyrif</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card className="card-fun">
            <CardHeader><CardTitle>Catatan Kesalahan</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Surah</Label><Input value={newMistake.surah} onChange={(e) => setNewMistake({ ...newMistake, surah: e.target.value })} placeholder="Al-Baqarah" /></div>
                <div><Label>Ayat</Label><Input type="number" min={1} value={newMistake.ayat} onChange={(e) => setNewMistake({ ...newMistake, ayat: +e.target.value })} /></div>
              </div>
              <div>
                <Label>Kategori</Label>
                <Select value={newMistake.category} onValueChange={(v) => setNewMistake({ ...newMistake, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{KATEGORI_ERR.map((k) => <SelectItem key={k} value={k} className="capitalize">{k}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Catatan</Label><Input value={newMistake.note} onChange={(e) => setNewMistake({ ...newMistake, note: e.target.value })} /></div>
              <Button size="sm" className="w-full rounded-xl" onClick={() => addMistake.mutate()}><Plus className="mr-2 h-4 w-4" />Tandai Kesalahan (hal. {page})</Button>

              <div className="max-h-56 overflow-y-auto space-y-1 pt-2">
                {(mistakes ?? []).map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border bg-muted/30 px-2 py-1 text-xs">
                    <div>
                      <span className="font-semibold">{m.surah}:{m.ayat}</span>{" "}
                      <span className="rounded-full bg-berry/20 px-2 py-0.5 text-berry font-bold uppercase text-[10px]">{m.category}</span>
                      {m.note && <span className="text-muted-foreground"> — {m.note}</span>}
                      {m.page && <span className="text-muted-foreground"> · hal {m.page}</span>}
                    </div>
                    <button className="text-berry hover:underline" onClick={() => delMistake.mutate(m.id)}>Hapus</button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
