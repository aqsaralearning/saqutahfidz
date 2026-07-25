import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shuffle, BookOpenText, Eye, EyeOff, Loader2 } from "lucide-react";
import { SURAHS } from "@/lib/quran";

type AyatKey = { surahNo: number; surahName: string; ayat: number };

/** Kumpulkan pool ayat yang sudah disetorkan (ziyadah + muroja'ah) per santri.
 *  Untuk melanjutkan ayat, kita butuh ayat X yang ayat X+1-nya juga masih dalam pool
 *  di surat yang sama. */
function buildPool(ziy: any[], mur: any[]): AyatKey[] {
  const covered = new Map<number, Set<number>>(); // surahNo -> set of ayat covered

  const addRange = (surahName: string, from: number, to: number) => {
    const s = SURAHS.find((x) => x.name === surahName);
    if (!s) return;
    const lo = Math.max(1, Math.min(from, to));
    const hi = Math.min(s.ayat, Math.max(from, to));
    if (!covered.has(s.no)) covered.set(s.no, new Set());
    const set = covered.get(s.no)!;
    for (let a = lo; a <= hi; a++) set.add(a);
  };

  for (const z of ziy) {
    if (!z.surah) continue;
    addRange(z.surah, Number(z.ayat_from) || 1, Number(z.ayat_to) || Number(z.ayat_from) || 1);
  }
  for (const m of mur) {
    // Muroja'ah biasanya per surah utuh (surah_from..surah_to)
    const from = SURAHS.find((x) => x.name === m.surah_from);
    if (!from) continue;
    const to = m.surah_to ? SURAHS.find((x) => x.name === m.surah_to) : from;
    if (!to) continue;
    const [lo, hi] = from.no <= to.no ? [from.no, to.no] : [to.no, from.no];
    for (let n = lo; n <= hi; n++) {
      const s = SURAHS.find((x) => x.no === n)!;
      addRange(s.name, 1, s.ayat);
    }
  }

  // Bangun list ayat prompt: harus ada ayat X+1 di surat yang sama, dan X+1 juga tercover.
  const pool: AyatKey[] = [];
  for (const [surahNo, set] of covered) {
    const s = SURAHS.find((x) => x.no === surahNo)!;
    for (const a of set) {
      if (a < s.ayat && set.has(a + 1)) pool.push({ surahNo, surahName: s.name, ayat: a });
    }
  }
  return pool;
}

async function fetchAyat(surahNo: number, ayat: number): Promise<string> {
  const r = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNo}:${ayat}/quran-uthmani`);
  if (!r.ok) throw new Error("Gagal memuat ayat");
  const j = await r.json();
  return j?.data?.text ?? "";
}

export function MelanjutkanAyat() {
  const [studentId, setStudentId] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [current, setCurrent] = useState<AyatKey | null>(null);

  const { data: santri } = useQuery({
    queryKey: ["students-list-min"],
    queryFn: async () => (await supabase.from("students").select("id, full_name").order("full_name")).data ?? [],
  });

  const { data: ziy } = useQuery({
    queryKey: ["ziy-of", studentId],
    enabled: !!studentId,
    queryFn: async () =>
      (await supabase.from("ziyadah_entries").select("surah, ayat_from, ayat_to").eq("student_id", studentId)).data ?? [],
  });
  const { data: mur } = useQuery({
    queryKey: ["mur-of", studentId],
    enabled: !!studentId,
    queryFn: async () =>
      (await supabase.from("murojaah_entries").select("surah_from, surah_to").eq("student_id", studentId)).data ?? [],
  });

  const pool = useMemo(() => (studentId ? buildPool(ziy ?? [], mur ?? []) : []), [studentId, ziy, mur]);

  const promptQ = useQuery({
    queryKey: ["ayat-prompt", current?.surahNo, current?.ayat],
    enabled: !!current,
    queryFn: () => fetchAyat(current!.surahNo, current!.ayat),
  });
  const answerQ = useQuery({
    queryKey: ["ayat-answer", current?.surahNo, current ? current.ayat + 1 : null],
    enabled: !!current,
    queryFn: () => fetchAyat(current!.surahNo, current!.ayat + 1),
  });

  const next = () => {
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setCurrent(pick);
    setShowAnswer(false);
  };

  return (
    <Card className="card-fun">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpenText className="h-5 w-5 text-leaf" />
          Melanjutkan Ayat (Pegangan Guru)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Santri:</span>
          <Select value={studentId} onValueChange={(v) => { setStudentId(v); setCurrent(null); }}>
            <SelectTrigger className="h-9 w-64"><SelectValue placeholder="Pilih santri" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {(santri ?? []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
            </SelectContent>
          </Select>
          {studentId && (
            <span className="ml-auto rounded-full bg-sky/20 text-sky-foreground px-2 py-0.5 text-xs font-semibold">
              {pool.length} ayat tersedia
            </span>
          )}
        </div>

        {!studentId ? (
          <p className="text-sm text-muted-foreground">Pilih santri untuk memulai. Ayat akan diambil hanya dari surat/juz yang sudah disetorkan (ziyadah & muroja'ah).</p>
        ) : pool.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada ayat yang memenuhi syarat. Pastikan santri sudah memiliki setoran ziyadah / muroja'ah.</p>
        ) : !current ? (
          <Button className="w-full rounded-xl" onClick={next}><Shuffle className="mr-2 h-4 w-4" />Ambil Ayat Acak</Button>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-dashed border-leaf/40 bg-leaf/5 p-6 text-center">
              <p className="text-xs uppercase text-muted-foreground mb-3">Bacakan penggalan ayat berikut kepada santri</p>
              {promptQ.isLoading ? (
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <p dir="rtl" lang="ar" className="font-arabic text-3xl leading-loose text-foreground">
                  {promptQ.data} <span className="text-leaf">﴿{toArabicNum(current.ayat)}﻾</span>
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                QS. {current.surahName} : {current.ayat}
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase text-muted-foreground">Jawaban (ayat berikutnya)</p>
                <Button size="sm" variant="ghost" className="rounded-lg" onClick={() => setShowAnswer((v) => !v)}>
                  {showAnswer ? <><EyeOff className="mr-1 h-3 w-3" />Sembunyikan</> : <><Eye className="mr-1 h-3 w-3" />Tampilkan</>}
                </Button>
              </div>
              {showAnswer ? (
                answerQ.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <p dir="rtl" lang="ar" className="font-arabic text-3xl leading-loose text-foreground text-center">
                      {answerQ.data} <span className="text-berry">﴿{toArabicNum(current.ayat + 1)}﻾</span>
                    </p>
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                      QS. {current.surahName} : {current.ayat + 1}
                    </p>
                  </>
                )
              ) : (
                <p className="text-center text-sm text-muted-foreground italic py-6">Tekan "Tampilkan" bila santri sudah menjawab.</p>
              )}
            </div>

            <Button className="w-full rounded-xl" onClick={next}><Shuffle className="mr-2 h-4 w-4" />Ayat Acak Berikutnya</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function toArabicNum(n: number): string {
  const d = "٠١٢٣٤٥٦٧٨٩";
  return String(n).split("").map((c) => d[+c] ?? c).join("");
}
