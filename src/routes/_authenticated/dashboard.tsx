import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, Users, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SAQU Tahfidz" }] }),
  component: Dashboard,
});

function Stat({ icon: Icon, label, value, color }: any) {
  return (
    <Card className="card-fun">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`grid h-12 w-12 place-items-center rounded-xl ${color}`}><Icon className="h-6 w-6 text-white" /></div>
        <div>
          <div className="text-2xl font-extrabold font-display">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [{ count: santri }, { count: ziy }, { count: mur }, { count: tas }, { count: ujian }] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("ziyadah_entries").select("*", { count: "exact", head: true }),
        supabase.from("murojaah_entries").select("*", { count: "exact", head: true }),
        supabase.from("tasmi_entries").select("*", { count: "exact", head: true }),
        supabase.from("exams").select("*", { count: "exact", head: true }),
      ]);
      return { santri: santri ?? 0, ziy: ziy ?? 0, mur: mur ?? 0, tas: tas ?? 0, ujian: ujian ?? 0 };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["recent-ziyadah"],
    queryFn: async () => {
      const { data } = await supabase.from("ziyadah_entries")
        .select("id, date, surah, ayat_from, ayat_to, score, students(full_name)")
        .order("date", { ascending: false }).limit(7);
      return data ?? [];
    },
  });

  const chartData = (() => {
    const map = new Map<string, number>();
    (recent ?? []).forEach((r: any) => { map.set(r.date, (map.get(r.date) ?? 0) + 1); });
    return Array.from(map.entries()).map(([date, setoran]) => ({ date: date.slice(5), setoran })).reverse();
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Assalamu'alaikum 👋</h1>
        <p className="text-muted-foreground">Ringkasan aktivitas mutaba'ah tahfidz hari ini.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Total Santri" value={stats?.santri ?? 0} color="bg-sky" />
        <Stat icon={BookOpen} label="Ziyadah" value={stats?.ziy ?? 0} color="bg-leaf" />
        <Stat icon={TrendingUp} label="Muroja'ah" value={stats?.mur ?? 0} color="bg-sun" />
        <Stat icon={GraduationCap} label="Ujian Tahfidz" value={stats?.ujian ?? 0} color="bg-berry" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="card-fun lg:col-span-2">
          <CardHeader><CardTitle>Aktivitas Setoran (7 hari terakhir)</CardTitle></CardHeader>
          <CardContent className="h-64">
            {chartData.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">Belum ada data setoran</div>
            ) : (
              <ResponsiveContainer><BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" /><YAxis allowDecimals={false} /><Tooltip />
                <Bar dataKey="setoran" fill="oklch(0.58 0.19 250)" radius={[8, 8, 0, 0]} />
              </BarChart></ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="card-fun">
          <CardHeader><CardTitle>Setoran Terbaru</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(recent ?? []).length === 0 && <p className="text-sm text-muted-foreground">Belum ada setoran.</p>}
            {(recent ?? []).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <div>
                  <div className="font-semibold">{r.students?.full_name}</div>
                  <div className="text-xs text-muted-foreground">{r.surah} : {r.ayat_from}-{r.ayat_to}</div>
                </div>
                <div className="rounded-full bg-leaf/20 px-2 py-0.5 text-xs font-bold text-leaf">{r.score ?? "-"}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
