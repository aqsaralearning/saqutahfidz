import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Trophy, Star } from "lucide-react";
import { generateRaporPDF } from "@/lib/report-pdf";

export const Route = createFileRoute("/_authenticated/rapot")({
  head: () => ({ meta: [{ title: "Rapot & Rekap Tahfidz — SAQU" }] }),
  component: RapotPage,
});

function avg(arr: any[], key = "score") {
  const nums = arr.map((r) => r[key]).filter((n) => typeof n === "number");
  return nums.length ? +(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : 0;
}

function RapotPage() {
  const [studentId, setStudentId] = useState("");
  const { data: santri } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => (await supabase.from("students").select("*").order("full_name")).data ?? [],
  });
  const s = (santri ?? []).find((x: any) => x.id === studentId);

  const { data: ziy } = useQuery({
    queryKey: ["rapot-ziy", studentId], enabled: !!studentId,
    queryFn: async () => (await supabase.from("ziyadah_entries").select("*").eq("student_id", studentId)).data ?? [],
  });
  const { data: mur } = useQuery({
    queryKey: ["rapot-mur", studentId], enabled: !!studentId,
    queryFn: async () => (await supabase.from("murojaah_entries").select("*").eq("student_id", studentId)).data ?? [],
  });
  const { data: tas } = useQuery({
    queryKey: ["rapot-tas", studentId], enabled: !!studentId,
    queryFn: async () => (await supabase.from("tasmi_entries").select("*").eq("student_id", studentId)).data ?? [],
  });
  const { data: exams } = useQuery({
    queryKey: ["rapot-exams", studentId], enabled: !!studentId,
    queryFn: async () => (await supabase.from("exams").select("*").eq("student_id", studentId).order("date")).data ?? [],
  });
  const { data: att } = useQuery({
    queryKey: ["rapot-att", studentId], enabled: !!studentId,
    queryFn: async () => (await supabase.from("attendance").select("status").eq("student_id", studentId)).data ?? [],
  });
  const { data: pel } = useQuery({
    queryKey: ["rapot-pel", studentId], enabled: !!studentId,
    queryFn: async () => (await (supabase as any).from("pelanggaran").select("points").eq("student_id", studentId)).data ?? [],
  });

  // Ranking global — juz lulus
  const { data: ranking } = useQuery({
    queryKey: ["ranking-global"],
    queryFn: async () => {
      const { data } = await supabase.from("exams").select("student_id, juz, final_score, passed, students(full_name)").eq("passed", true);
      const map = new Map<string, { name: string; juz: Set<number>; scores: number[] }>();
      (data ?? []).forEach((e: any) => {
        const cur = map.get(e.student_id) ?? { name: e.students?.full_name ?? "-", juz: new Set<number>(), scores: [] };
        cur.juz.add(e.juz); if (typeof e.final_score === "number") cur.scores.push(e.final_score);
        map.set(e.student_id, cur);
      });
      return Array.from(map.entries()).map(([id, x]) => ({
        id, name: x.name, juz: x.juz.size,
        avg: x.scores.length ? +(x.scores.reduce((a,b)=>a+b,0)/x.scores.length).toFixed(1) : 0,
      })).sort((a, b) => b.juz - a.juz || b.avg - a.avg);
    },
  });

  const attStats = (() => {
    const c = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
    (att ?? []).forEach((a: any) => { if (a.status in c) (c as any)[a.status]++; });
    return c;
  })();
  const totalPel = (pel ?? []).reduce((sum: number, p: any) => sum + (p.points || 0), 0);
  const juzLulus = new Set((exams ?? []).filter((e: any) => e.passed).map((e: any) => e.juz)).size;
  const rewardStars = Math.min(5, Math.floor(juzLulus / 2) + (attStats.hadir >= 20 ? 1 : 0));
  const myRank = studentId && ranking ? ranking.findIndex((r) => r.id === studentId) + 1 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Rapot & Rekap Tahfidz</h1>
        <p className="text-muted-foreground">Rangkuman capaian, ranking, dan reward santri.</p>
      </div>

      <Card className="card-fun">
        <CardContent className="pt-6 flex flex-wrap items-end gap-3">
          <div className="min-w-64">
            <Label>Santri</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger><SelectValue placeholder="Pilih santri" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {(santri ?? []).map((x: any) => <SelectItem key={x.id} value={x.id}>{x.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button className="rounded-xl" disabled={!s} onClick={() => s && generateRaporPDF(s, ziy ?? [], mur ?? [], tas ?? [], exams ?? [])}>
            <Download className="mr-2 h-4 w-4" />Unduh Rapot PDF
          </Button>
        </CardContent>
      </Card>

      {s && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={FileText} label="Total Ziyadah" value={(ziy ?? []).length} color="bg-sky" sub={`Rata² ${avg(ziy ?? [])}`} />
            <Stat icon={FileText} label="Total Muroja'ah" value={(mur ?? []).length} color="bg-leaf" sub={`Rata² ${avg(mur ?? [])}`} />
            <Stat icon={FileText} label="Total Tasmi'" value={(tas ?? []).length} color="bg-sun" sub={`Rata² ${avg(tas ?? [])}`} />
            <Stat icon={Trophy} label="Juz Lulus" value={juzLulus} color="bg-berry" sub={`Ranking #${myRank || "-"}`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="card-fun">
              <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-sun" />Reward & Kedisiplinan</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Bintang Reward</div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-8 w-8 ${i < rewardStars ? "fill-sun text-sun" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {(["hadir","izin","sakit","alpa"] as const).map((k) => (
                    <div key={k} className="rounded-lg bg-muted/40 py-2">
                      <div className="font-extrabold text-lg">{attStats[k]}</div>
                      <div className="uppercase text-muted-foreground">{k}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-berry/10 p-3 text-sm">
                  <span className="font-semibold">Total Poin Pelanggaran:</span> <b className="text-berry">{totalPel}</b>
                </div>
              </CardContent>
            </Card>

            <Card className="card-fun">
              <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-sun" />Ranking Global (Juz Lulus)</CardTitle></CardHeader>
              <CardContent>
                <ol className="space-y-1 text-sm">
                  {(ranking ?? []).slice(0, 10).map((r, i) => (
                    <li key={r.id} className={`flex items-center justify-between rounded-lg px-3 py-2 ${r.id === studentId ? "bg-primary/10 font-bold" : "bg-muted/20"}`}>
                      <span>#{i + 1} · {r.name}</span>
                      <span className="text-xs">{r.juz} juz · nilai {r.avg}</span>
                    </li>
                  ))}
                  {(ranking ?? []).length === 0 && <p className="text-muted-foreground">Belum ada ranking.</p>}
                </ol>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, color }: any) {
  return (
    <Card className="card-fun">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`grid h-12 w-12 place-items-center rounded-xl ${color}`}><Icon className="h-6 w-6 text-white" /></div>
        <div>
          <div className="text-2xl font-extrabold font-display">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
          {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
