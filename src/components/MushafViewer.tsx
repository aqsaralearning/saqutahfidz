import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { JUZ_START_PAGE, mushafPageUrl } from "@/lib/quran";

export function MushafViewer({ initialPage = 1, height = "70vh" }: { initialPage?: number; height?: string }) {
  const [page, setPage] = useState(initialPage);
  const [juz, setJuz] = useState<number>(1);

  const go = (n: number) => setPage(Math.max(1, Math.min(604, n)));
  const jumpJuz = (j: number) => { setJuz(j); go(JUZ_START_PAGE[j]); };

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
          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => go(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Input type="number" className="w-20 h-9" min={1} max={604} value={page} onChange={(e) => go(+e.target.value)} />
          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => go(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="bg-[oklch(0.97_0.02_90)] p-3 rounded-xl border overflow-hidden">
        <img
          src={mushafPageUrl(page)}
          alt={`Mushaf halaman ${page}`}
          className="w-full h-auto object-contain mx-auto"
          style={{ maxHeight: height }}
          loading="lazy"
        />
      </div>
      <p className="text-xs text-muted-foreground text-center">Mushaf Madinah 15 baris · Halaman 1–604</p>
    </div>
  );
}
