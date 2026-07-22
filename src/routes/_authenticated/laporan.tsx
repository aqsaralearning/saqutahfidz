import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, LineChart, Line } from "recharts";
import { Trophy, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/laporan")({
  head: () => ({ meta: [{ title: "Laporan — SAQU Tahfidz" }] }),
  component: Laporan,
});

function Laporan() {
  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await supabase.from("exams").select("student_id, juz, passed, students(full_name)").eq("passed", true);
      const map = new Map<string, { name: string; juz: Set<number> }>();
      (data ?? []).forEach((e: any) => {
        const cur = map.get(e.student_id) ?? { name: e.students?.full_name ?? "-", juz: new Set() };
        cur.juz.add(e.juz);
        map.set(e.student_id, cur);
      });
      return Array.from(map.values()).map((x) => ({ name: x.name, juz: x.juz.size })).sort((a, b) => b.juz - a.juz).slice(0, 10);
    },
  });

  const { data: monthly } = useQuery({
    queryKey: ["monthly-setoran"],
    queryFn: async () => {
      const { data } = await supabase.from("ziyadah_entries").select("date");
      const map = new Map<string, number>();
      (data ?? []).forEach((r: any) => {
        const m = r.date.slice(0, 7);
        map.set(m, (map.get(m) ?? 0) + 1);
      });
      return Array.from(map.entries()).sort().slice(-6).map(([bulan, ziyadah]) => ({ bulan, ziyadah }));
    },
  });

  const exportCSV = async () => {
    const { data } = await supabase.from("ziyadah_entries").select("date, students(full_name, nis), surah, ayat_from, ayat_to, juz, score, status");
    const rows = (data ?? []).map((r: any) => [r.date, r.students?.nis, r.students?.full_name, r.surah, r.ayat_from, r.ayat_to, r.juz, r.score, r.status]);
    const csv = ["tanggal,nis,nama,surah,ayat_dari,ayat_sampai,juz,nilai,status", ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `ziyadah-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Laporan & Rekap</h1>
          <p className="text-muted-foreground">Rekap pencapaian dan ekspor data.</p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={exportCSV}><Download className="mr-2 h-4 w-4" />Ekspor Ziyadah CSV</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="card-fun">
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="text-sun" /> Leaderboard Juz Lulus</CardTitle></CardHeader>
          <CardContent className="h-72">
            {(leaderboard ?? []).length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">Belum ada ujian yang lulus.</div>
            ) : (
              <ResponsiveContainer><BarChart data={leaderboard} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" allowDecimals={false} /><YAxis dataKey="name" type="category" width={130} />
                <Tooltip /><Bar dataKey="juz" fill="oklch(0.68 0.16 155)" radius={[0, 8, 8, 0]} />
              </BarChart></ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="card-fun">
          <CardHeader><CardTitle>Tren Setoran Ziyadah (6 bulan)</CardTitle></CardHeader>
          <CardContent className="h-72">
            {(monthly ?? []).length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">Belum ada data.</div>
            ) : (
              <ResponsiveContainer><LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="bulan" /><YAxis allowDecimals={false} /><Tooltip />
                <Line type="monotone" dataKey="ziyadah" stroke="oklch(0.58 0.19 250)" strokeWidth={3} />
              </LineChart></ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
