import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, GraduationCap, BookOpen, Sparkles, Puzzle, Shuffle, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { predicateFromScore, SURAHS } from "@/lib/quran";
import { MelanjutkanAyat } from "@/components/MelanjutkanAyat";

export const Route = createFileRoute("/_authenticated/ujian")({
  head: () => ({ meta: [{ title: "Ujian Tahfidz — SAQU" }] }),
  component: UjianList,
});

function UjianList() {
  const qc = useQueryClient();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ student_id: "", juz: 1, date: new Date().toISOString().slice(0, 10) });

  const { data: santri } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => (await supabase.from("students").select("id, full_name, nis").order("full_name")).data ?? [],
  });
  const { data: exams } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => (await supabase.from("exams").select("*, students(full_name, nis)").order("date", { ascending: false })).data ?? [],
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!form.student_id) throw new Error("Pilih santri");
      const { data, error } = await supabase.from("exams").insert({ ...form, examiner_id: user!.id }).select().single();
      if (error) throw error; return data;
    },
    onSuccess: () => { toast.success("Ujian dibuat, silakan mulai penilaian"); setOpen(false); qc.invalidateQueries({ queryKey: ["exams"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Ujian Tahfidz</h1>
          <p className="text-muted-foreground">Ujian per juz dengan mushaf digital & rubrik penilaian tajwid.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="rounded-xl"><Plus className="mr-2 h-4 w-4" />Ujian Baru</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Mulai Ujian Tahfidz</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Santri</Label>
                <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih santri" /></SelectTrigger>
                  <SelectContent>{(santri ?? []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Juz</Label><Input type="number" min={1} max={30} value={form.juz} onChange={(e) => setForm({ ...form, juz: +e.target.value })} /></div>
                <div><Label>Tanggal</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter><Button onClick={() => create.mutate()} disabled={create.isPending} className="rounded-xl">Buat</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="ujian">
        <TabsList className="rounded-xl">
          <TabsTrigger value="ujian">Riwayat Ujian</TabsTrigger>
          <TabsTrigger value="setoran">Riwayat Setoran</TabsTrigger>
          <TabsTrigger value="games"><Sparkles className="mr-1 h-3 w-3" />Program Seru</TabsTrigger>
        </TabsList>

        <TabsContent value="ujian">
          <Card className="card-fun">
            <CardHeader><CardTitle>Riwayat Ujian</CardTitle></CardHeader>
            <CardContent>
              {(exams ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Belum ada ujian.</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                      <tr><th className="py-2 pr-2">Tgl</th><th>Santri</th><th>Juz</th><th>Nilai</th><th>Predikat</th><th></th></tr>
                    </thead>
                    <tbody>
                      {(exams ?? []).map((e: any) => (
                        <tr key={e.id} className="border-b last:border-0">
                          <td className="py-2 pr-2 whitespace-nowrap">{e.date}</td>
                          <td className="font-semibold flex items-center gap-2"><GraduationCap className="h-4 w-4 text-berry" />{e.students?.full_name}</td>
                          <td>Juz {e.juz}</td>
                          <td>{e.final_score ?? <span className="text-muted-foreground">—</span>}</td>
                          <td className="text-xs">{e.final_score ? predicateFromScore(Number(e.final_score)).label : "-"}</td>
                          <td><Link to="/ujian/$id" params={{ id: e.id }}><Button size="sm" className="rounded-lg">Nilai / Mushaf</Button></Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setoran">
          <RiwayatSetoran />
        </TabsContent>

        <TabsContent value="games">
          <GamesTahfidz />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GamesTahfidz() {
  return (
    <div className="space-y-4">
      <MelanjutkanAyat />
      <div className="grid gap-4 lg:grid-cols-2">
        <SambungAyatGame />
        <TebakSuratGame />
      </div>
    </div>
  );
}

function pickRandom<T>(arr: T[], n: number, exclude?: T): T[] {
  const pool = arr.filter((x) => x !== exclude);
  const out: T[] = [];
  while (out.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

function SambungAyatGame() {
  const [juz, setJuz] = useState<number>(30);
  const [q, setQ] = useState(() => makeSambung(SURAHS.filter((s) => s.juzStart === 30)));
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ benar: 0, salah: 0 });

  function next(newJuz = juz) {
    const p = SURAHS.filter((s) => s.juzStart >= newJuz - 1 && s.juzStart <= newJuz + 1);
    setQ(makeSambung(p.length >= 4 ? p : SURAHS));
    setPicked(null);
  }

  function choose(name: string) {
    if (picked) return;
    setPicked(name);
    if (name === q.answer) setScore((s) => ({ ...s, benar: s.benar + 1 }));
    else setScore((s) => ({ ...s, salah: s.salah + 1 }));
  }

  return (
    <Card className="card-fun">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Puzzle className="h-5 w-5 text-sky" />Menyambung Ayat (Urutan Surat)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Juz fokus:</span>
            <Select value={String(juz)} onValueChange={(v) => { setJuz(+v); next(+v); }}>
              <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-64">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => <SelectItem key={j} value={String(j)}>Juz {j}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="rounded-full bg-leaf/20 text-leaf px-2 py-0.5">Benar {score.benar}</span>
            <span className="rounded-full bg-berry/20 text-berry px-2 py-0.5">Salah {score.salah}</span>
          </div>
        </div>
        <div className="rounded-xl bg-sky/10 p-4 text-center">
          <p className="text-xs uppercase text-muted-foreground">Surat berikut ini adalah</p>
          <p className="font-display text-2xl font-extrabold">{q.prompt.name}</p>
          <p className="text-xs text-muted-foreground">Apa surat setelahnya?</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {q.options.map((o) => {
            const correct = picked && o === q.answer;
            const wrong = picked === o && o !== q.answer;
            return (
              <Button key={o} variant="outline" className={`rounded-xl h-auto py-3 justify-center ${correct ? "bg-leaf/20 border-leaf" : ""} ${wrong ? "bg-berry/20 border-berry" : ""}`} onClick={() => choose(o)}>
                {o}
              </Button>
            );
          })}
        </div>
        <Button className="w-full rounded-xl" onClick={() => next()}><Shuffle className="mr-2 h-4 w-4" />Soal Berikutnya</Button>
      </CardContent>
    </Card>
  );
}

function makeSambung(pool: typeof SURAHS) {
  const usable = pool.filter((s) => s.no < 114);
  const prompt = usable[Math.floor(Math.random() * usable.length)];
  const answer = SURAHS[prompt.no].name;
  const distractors = pickRandom(SURAHS.map((s) => s.name).filter((n) => n !== answer && n !== prompt.name), 3);
  const options = [...distractors, answer].sort(() => Math.random() - 0.5);
  return { prompt, answer, options };
}

function TebakSuratGame() {
  const [q, setQ] = useState(() => makeTebak());
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ benar: 0, salah: 0 });

  function next() { setQ(makeTebak()); setPicked(null); }
  function choose(name: string) {
    if (picked) return;
    setPicked(name);
    if (name === q.answer.name) setScore((s) => ({ ...s, benar: s.benar + 1 }));
    else setScore((s) => ({ ...s, salah: s.salah + 1 }));
  }

  return (
    <Card className="card-fun">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-sun" />Tebak Surat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-end gap-3 text-xs font-semibold">
          <span className="rounded-full bg-leaf/20 text-leaf px-2 py-0.5">Benar {score.benar}</span>
          <span className="rounded-full bg-berry/20 text-berry px-2 py-0.5">Salah {score.salah}</span>
        </div>
        <div className="rounded-xl bg-sun/15 p-4 space-y-1 text-center">
          <p className="text-xs uppercase text-muted-foreground">Petunjuk</p>
          <p className="text-sm">Surat urutan ke-<b>{q.answer.no}</b> dalam mushaf</p>
          <p className="text-sm">Jumlah ayat: <b>{q.answer.ayat}</b> · Mulai dari <b>Juz {q.answer.juzStart}</b></p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {q.options.map((o) => {
            const correct = picked && o === q.answer.name;
            const wrong = picked === o && o !== q.answer.name;
            return (
              <Button key={o} variant="outline" className={`rounded-xl h-auto py-3 ${correct ? "bg-leaf/20 border-leaf" : ""} ${wrong ? "bg-berry/20 border-berry" : ""}`} onClick={() => choose(o)}>
                {o}
              </Button>
            );
          })}
        </div>
        <Button className="w-full rounded-xl" onClick={next}><Shuffle className="mr-2 h-4 w-4" />Soal Berikutnya</Button>
      </CardContent>
    </Card>
  );
}

function makeTebak() {
  const answer = SURAHS[Math.floor(Math.random() * SURAHS.length)];
  const distractors = pickRandom(SURAHS.filter((s) => s.name !== answer.name), 3).map((s) => s.name);
  const options = [...distractors, answer.name].sort(() => Math.random() - 0.5);
  return { answer, options };
}


function RiwayatSetoran() {
  const { data: ziyadah } = useQuery({
    queryKey: ["riwayat-ziyadah"],
    queryFn: async () => (await supabase.from("ziyadah_entries").select("*, students(full_name)").order("date", { ascending: false }).limit(100)).data ?? [],
  });
  const { data: murojaah } = useQuery({
    queryKey: ["riwayat-murojaah"],
    queryFn: async () => (await supabase.from("murojaah_entries").select("*, students(full_name)").order("date", { ascending: false }).limit(100)).data ?? [],
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="card-fun">
        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-leaf" />Ziyadah</CardTitle></CardHeader>
        <CardContent>
          {(ziyadah ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Belum ada.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                  <tr><th className="py-2 pr-2">Tgl</th><th>Santri</th><th>Materi</th><th>Nilai</th></tr>
                </thead>
                <tbody>
                  {(ziyadah ?? []).map((r: any) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-2 whitespace-nowrap">{r.date}</td>
                      <td className="font-semibold">{r.students?.full_name}</td>
                      <td className="text-xs">{r.surah} {r.ayat_from}-{r.ayat_to}{r.juz ? ` · J${r.juz}` : ""}</td>
                      <td><span className="rounded-full bg-leaf/20 px-2 py-0.5 text-xs font-bold text-leaf">{r.score ?? "-"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-fun">
        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-berry" />Muroja'ah</CardTitle></CardHeader>
        <CardContent>
          {(murojaah ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Belum ada.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                  <tr><th className="py-2 pr-2">Tgl</th><th>Santri</th><th>Jenis</th><th>Materi</th><th>Nilai</th></tr>
                </thead>
                <tbody>
                  {(murojaah ?? []).map((r: any) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-2 whitespace-nowrap">{r.date}</td>
                      <td className="font-semibold">{r.students?.full_name}</td>
                      <td><span className="rounded-full bg-sky/30 px-2 py-0.5 text-[10px] font-bold uppercase">{r.murojaah_type ?? "-"}</span></td>
                      <td className="text-xs">{r.surah_from}{r.surah_to ? ` – ${r.surah_to}` : ""}{r.juz ? ` · J${r.juz}` : ""}</td>
                      <td><span className="rounded-full bg-leaf/20 px-2 py-0.5 text-xs font-bold text-leaf">{r.score ?? "-"}</span></td>
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
