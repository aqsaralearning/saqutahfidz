import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { generateRaporPDF } from "@/lib/report-pdf";

export const Route = createFileRoute("/_authenticated/santri/$id")({
  head: () => ({ meta: [{ title: "Detail Santri — SAQU Tahfidz" }] }),
  component: SantriDetail,
});

function SantriDetail() {
  const { id } = Route.useParams();
  const { data: s } = useQuery({
    queryKey: ["student", id],
    queryFn: async () => (await supabase.from("students").select("*, halaqoh(name)").eq("id", id).maybeSingle()).data,
  });
  const { data: ziy } = useQuery({
    queryKey: ["ziy", id],
    queryFn: async () => (await supabase.from("ziyadah_entries").select("*").eq("student_id", id).order("date", { ascending: false })).data ?? [],
  });
  const { data: mur } = useQuery({
    queryKey: ["mur", id],
    queryFn: async () => (await supabase.from("murojaah_entries").select("*").eq("student_id", id).order("date", { ascending: false })).data ?? [],
  });
  const { data: tas } = useQuery({
    queryKey: ["tas", id],
    queryFn: async () => (await supabase.from("tasmi_entries").select("*").eq("student_id", id).order("date", { ascending: false })).data ?? [],
  });
  const { data: exams } = useQuery({
    queryKey: ["exams-s", id],
    queryFn: async () => (await supabase.from("exams").select("*").eq("student_id", id).order("date", { ascending: false })).data ?? [],
  });

  if (!s) return <p>Memuat...</p>;
  const juzLulus = new Set((exams ?? []).filter((e: any) => e.passed).map((e: any) => e.juz)).size;
  const progress = Math.min(100, (juzLulus / (s.target_juz || 1)) * 100);

  return (
    <div className="space-y-6">
      <Link to="/santri" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Kembali</Link>

      <Card className="card-fun">
        <CardContent className="p-6 flex flex-wrap items-center gap-6">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-sky to-leaf text-4xl">
            {s.gender === "L" ? "👦" : "👧"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-extrabold">{s.full_name}</h1>
            <p className="text-sm text-muted-foreground">NIS {s.nis} · Kelas {s.class_level} · {s.halaqoh?.name ?? "Belum ada halaqoh"}</p>
            <p className="text-xs text-muted-foreground">Wali: {s.parent_name ?? "-"} ({s.parent_phone ?? "-"})</p>
          </div>
          <Button className="rounded-xl" onClick={() => generateRaporPDF(s, ziy ?? [], mur ?? [], tas ?? [], exams ?? [])}>
            <Download className="mr-2 h-4 w-4" /> Cetak Rapor PDF
          </Button>
        </CardContent>
      </Card>

      <Card className="card-fun">
        <CardHeader><CardTitle>Progres Hafalan</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm"><span>Juz lulus: <b>{juzLulus}</b> dari target {s.target_juz}</span><span>{progress.toFixed(0)}%</span></div>
          <Progress value={progress} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <Stat label="Ziyadah" value={ziy?.length ?? 0} color="bg-leaf/20 text-leaf" />
            <Stat label="Muroja'ah" value={mur?.length ?? 0} color="bg-sun/30 text-sun-foreground" />
            <Stat label="Tasmi'" value={tas?.length ?? 0} color="bg-sky/20 text-sky" />
            <Stat label="Ujian" value={exams?.length ?? 0} color="bg-berry/20 text-berry" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <List title="Riwayat Ziyadah" rows={ziy ?? []} render={(r: any) => `${r.date} · ${r.surah} ${r.ayat_from}-${r.ayat_to} · nilai ${r.score ?? "-"}`} />
        <List title="Riwayat Muroja'ah" rows={mur ?? []} render={(r: any) => `${r.date} · ${r.surah_from}${r.surah_to ? " – "+r.surah_to : ""} · nilai ${r.score ?? "-"}`} />
        <List title="Riwayat Tasmi'" rows={tas ?? []} render={(r: any) => `${r.date} · Juz ${r.juz ?? "-"} · nilai ${r.score ?? "-"}`} />
        <List title="Riwayat Ujian" rows={exams ?? []} render={(r: any) => `${r.date} · Juz ${r.juz} · ${r.final_score ?? "-"} (${r.predicate ?? "-"})`} />
      </div>
    </div>
  );
}

function Stat({ label, value, color }: any) {
  return <div className={`rounded-xl p-3 ${color}`}><div className="text-2xl font-extrabold font-display">{value}</div><div className="text-xs">{label}</div></div>;
}
function List({ title, rows, render }: any) {
  return (
    <Card className="card-fun">
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        {rows.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada data.</p> : (
          <ul className="space-y-1 text-sm max-h-64 overflow-y-auto">{rows.map((r: any) => <li key={r.id} className="border-b py-1 last:border-0">{render(r)}</li>)}</ul>
        )}
      </CardContent>
    </Card>
  );
}
