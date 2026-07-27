import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, BookOpen, Loader2, ImageOff } from "lucide-react";
import { JUZ_START_PAGE, mushafPageUrl, mushafPageTextApi, SURAHS } from "@/lib/quran";

type AyahT = { number: number; text: string; numberInSurah: number; surah: { number: number; englishName: string; name: string } };

export function MushafViewer({ initialPage = 1, height = "70vh" }: { initialPage?: number; height?: string }) {
  const [page, setPage] = useState(initialPage);
  const [juz, setJuz] = useState<number>(1);
  const [imgStatus, setImgStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [ayat, setAyat] = useState<AyahT[] | null>(null);
  const [textLoading, setTextLoading] = useState(false);

  const go = (n: number) => setPage(Math.max(1, Math.min(604, Number.isFinite(n) ? n : 1)));
  const jumpJuz = (j: number) => { setJuz(j); go(JUZ_START_PAGE[j]); };

  useEffect(() => { setImgStatus("loading"); }, [page]);

  // Fetch teks Uthmani sebagai fallback saat gambar gagal (dan sekaligus disediakan)
  useEffect(() => {
    if (imgStatus !== "error") return;
    let alive = true;
    setTextLoading(true);
    fetch(mushafPageTextApi(page))
      .then((r) => r.json())
      .then((j) => { if (alive) setAyat(j?.data?.ayahs ?? []); })
      .catch(() => { if (alive) setAyat([]); })
      .finally(() => alive && setTextLoading(false));
    return () => { alive = false; };
  }, [imgStatus, page]);

  const src = mushafPageUrl(page);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <BookOpen className="h-4 w-4 text-leaf" /> Mushaf Al-Qur'an — Halaman {page}
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(juz)} onValueChange={(v) => jumpJuz(+v)}>
            <SelectTrigger className="w-28 h-9"><SelectValue placeholder="Juz" /></SelectTrigger>
            <SelectContent className="max-h-64">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                <SelectItem key={j} value={String(j)}>Juz {j}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => go(page - 1)} disabled={page <= 1}><ChevronLeft className="h-4 w-4" /></Button>
          <Input type="number" className="w-20 h-9" min={1} max={604} value={page} onChange={(e) => go(+e.target.value)} />
          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => go(page + 1)} disabled={page >= 604}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="relative bg-[oklch(0.97_0.02_90)] p-3 rounded-xl border overflow-hidden flex items-center justify-center" style={{ minHeight: 240 }}>
        {imgStatus === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-6 w-6 animate-spin" /> Memuat halaman {page}…
          </div>
        )}
        {imgStatus !== "error" && (
          <img
            key={src}
            src={src}
            alt={`Mushaf halaman ${page}`}
            referrerPolicy="no-referrer"
            className={`w-full h-auto object-contain mx-auto ${imgStatus === "loaded" ? "" : "invisible absolute"}`}
            style={{ maxHeight: height }}
            loading="lazy"
            onLoad={() => setImgStatus("loaded")}
            onError={() => setImgStatus("error")}
          />
        )}
        {imgStatus === "error" && (
          <div className="w-full max-h-[70vh] overflow-y-auto p-4 bg-[oklch(0.98_0.01_90)] rounded-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <ImageOff className="h-4 w-4" /> Gambar mushaf offline — menampilkan teks Uthmani (alquran.cloud).
            </div>
            {textLoading && <div className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Memuat teks…</div>}
            {ayat && ayat.length === 0 && !textLoading && <p className="text-sm text-muted-foreground">Tidak dapat memuat halaman ini.</p>}
            {ayat && ayat.length > 0 && (
              <UthmaniPage ayat={ayat} />
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground text-center">Mushaf Madinah 15 baris · Halaman 1–604 · Sumber online</p>
    </div>
  );
}

function UthmaniPage({ ayat }: { ayat: AyahT[] }) {
  // Kelompokkan per surah, tampilkan judul surah saat berganti
  const blocks: { surahNo: number; surahName: string; items: AyahT[] }[] = [];
  ayat.forEach((a) => {
    const last = blocks[blocks.length - 1];
    if (!last || last.surahNo !== a.surah.number) {
      const meta = SURAHS.find((s) => s.no === a.surah.number);
      blocks.push({ surahNo: a.surah.number, surahName: meta?.name ?? a.surah.englishName, items: [a] });
    } else last.items.push(a);
  });

  return (
    <div className="space-y-4">
      {blocks.map((b) => (
        <div key={b.surahNo + "-" + b.items[0].number}>
          <div className="text-center mb-2">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1 text-xs font-bold text-primary">
              Surah {b.surahNo}. {b.surahName}
            </div>
          </div>
          <p dir="rtl" lang="ar" style={{ fontFamily: "'Amiri Quran','Amiri','Scheherazade New',serif", fontSize: "1.6rem", lineHeight: "2.8rem" }}
             className="text-right text-black">
            {b.items.map((a) => (
              <span key={a.number}>
                {a.text}{" "}
                <span className="inline-block align-middle mx-1 text-primary text-base font-bold border border-primary rounded-full px-2">
                  {a.numberInSurah}
                </span>{" "}
              </span>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
}
