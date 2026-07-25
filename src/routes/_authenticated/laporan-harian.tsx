import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Send, FileText } from "lucide-react";
import logoSaqu from "@/assets/logo-saqu.png.asset.json";

export const Route = createFileRoute("/_authenticated/laporan-harian")({
  head: () => ({ meta: [{ title: "Laporan Harian — SAQU Tahfidz" }] }),
  component: LaporanHarianPage,
});

function LaporanHarianPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [studentId, setStudentId] = useState<string>("");

  const { data: santri } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => (await supabase.from("students").select("id, full_name, nis, class_level, parent_name, parent_phone").order("full_name")).data ?? [],
  });

  const s = (santri ?? []).find((x: any) => x.id === studentId);

  const { data: ziy } = useQuery({
    queryKey: ["lh-ziy", studentId, date],
    enabled: !!studentId,
    queryFn: async () => (await supabase.from("ziyadah_entries").select("*").eq("student_id", studentId).eq("date", date)).data ?? [],
  });
  const { data: mur } = useQuery({
    queryKey: ["lh-mur", studentId, date],
    enabled: !!studentId,
    queryFn: async () => (await supabase.from("murojaah_entries").select("*").eq("student_id", studentId).eq("date", date)).data ?? [],
  });
  const { data: tas } = useQuery({
    queryKey: ["lh-tas", studentId, date],
    enabled: !!studentId,
    queryFn: async () => (await supabase.from("tasmi_entries").select("*").eq("student_id", studentId).eq("date", date)).data ?? [],
  });
  const { data: att } = useQuery({
    queryKey: ["lh-att", studentId, date],
    enabled: !!studentId,
    queryFn: async () => (await supabase.from("attendance").select("*").eq("student_id", studentId).eq("date", date)).data ?? [],
  });

  const tanggalID = new Date(date + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  const shareWA = () => {
    if (!s) return;
    const lines = [
      `*Laporan Harian Tahfidz — SAQU*`,
      `Tanggal: ${tanggalID}`,
      `Santri: ${s.full_name} (${s.nis}) — Kelas ${s.class_level}`,
      ``,
      `Kehadiran: ${(att?.[0] as any)?.status ?? "belum tercatat"}`,
      ``,
      `Ziyadah:`,
      ...((ziy ?? []).length ? ziy!.map((z: any) => `• ${z.surah} ${z.ayat_from}-${z.ayat_to} — nilai ${z.score ?? "-"} (${z.status})`) : ["• Tidak ada"]),
      ``,
      `Muroja'ah:`,
      ...((mur ?? []).length ? mur!.map((m: any) => `• ${m.surah_from}${m.surah_to ? " – " + m.surah_to : ""} — nilai ${m.score ?? "-"} (${m.status})`) : ["• Tidak ada"]),
      ``,
      `Tasmi':`,
      ...((tas ?? []).length ? tas!.map((t: any) => `• ${t.surah_from}${t.surah_to ? " – " + t.surah_to : ""} — nilai ${t.score ?? "-"}`) : ["• Tidak ada"]),
      ``,
      `Barakallahu fiik 🌱`,
    ].join("\n");
    const phone = (s.parent_phone || "").replace(/[^\d]/g, "").replace(/^0/, "62");
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(lines)}` : `https://wa.me/?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="font-display text-3xl font-extrabold">Laporan Harian</h1>
        <p className="text-muted-foreground">Rangkuman aktivitas tahfidz harian untuk dicetak atau dikirim ke wali santri.</p>
      </div>

      <Card className="card-fun print:hidden">
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-sky" />Pilih Santri & Tanggal</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div>
            <Label>Santri</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger><SelectValue placeholder="Pilih santri" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {(santri ?? []).map((x: any) => <SelectItem key={x.id} value={x.id}>{x.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tanggal</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button className="rounded-xl flex-1" disabled={!s} onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />Cetak
            </Button>
            <Button variant="outline" className="rounded-xl flex-1" disabled={!s} onClick={shareWA}>
              <Send className="mr-2 h-4 w-4" />Kirim WA
            </Button>
          </div>
        </CardContent>
      </Card>

      {s && (
        <div id="print-area" className="bg-white text-black rounded-2xl border p-8 print:border-0 print:shadow-none print:rounded-none print:p-6">
          <div className="flex items-start justify-between border-b-2 border-primary pb-4 mb-5">
            <div className="flex items-center gap-3">
              <img src={logoSaqu.url} alt="SAQU" className="h-14 w-14 object-contain" />
              <div>
                <h2 className="font-display text-xl font-extrabold text-primary">LAPORAN HARIAN TAHFIDZ</h2>
                <p className="text-xs">Sekolah Alam Al-Qudsiyyah (SAQU)</p>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-semibold">{tanggalID}</div>
            </div>
          </div>

          <table className="w-full text-sm mb-5">
            <tbody>
              <tr><td className="py-1 w-40 font-semibold">Nama Santri</td><td>: {s.full_name}</td></tr>
              <tr><td className="py-1 font-semibold">NIS</td><td>: {s.nis}</td></tr>
              <tr><td className="py-1 font-semibold">Kelas</td><td>: {s.class_level}</td></tr>
              <tr><td className="py-1 font-semibold">Wali Santri</td><td>: {s.parent_name || "-"}</td></tr>
              <tr><td className="py-1 font-semibold">Kehadiran</td><td>: <b className="uppercase">{(att?.[0] as any)?.status ?? "belum tercatat"}</b></td></tr>
            </tbody>
          </table>

          <Section title="Ziyadah (Hafalan Baru)">
            {(ziy ?? []).length === 0 ? <Empty /> : (
              <SimpleTable
                head={["Materi", "Juz", "Nilai", "Status", "Catatan"]}
                rows={ziy!.map((z: any) => [`${z.surah} ${z.ayat_from}-${z.ayat_to}`, z.juz ?? "-", z.score ?? "-", z.status, z.notes || "-"])}
              />
            )}
          </Section>

          <Section title="Muroja'ah">
            {(mur ?? []).length === 0 ? <Empty /> : (
              <SimpleTable
                head={["Materi", "Jenis", "Juz", "Nilai", "Status"]}
                rows={mur!.map((m: any) => [`${m.surah_from}${m.surah_to ? " – " + m.surah_to : ""}`, m.murojaah_type ?? "-", m.juz ?? "-", m.score ?? "-", m.status])}
              />
            )}
          </Section>

          <Section title="Tasmi'">
            {(tas ?? []).length === 0 ? <Empty /> : (
              <SimpleTable
                head={["Materi", "Jenis", "Durasi", "Nilai", "Status"]}
                rows={tas!.map((t: any) => [`${t.surah_from}${t.surah_to ? " – " + t.surah_to : ""}`, t.tasmi_type, `${t.duration_min ?? "-"} mnt`, t.score ?? "-", t.status])}
              />
            )}
          </Section>

          <div className="grid grid-cols-2 gap-4 mt-10 text-sm">
            <div className="text-center">
              <p>Musyrif Tahfidz,</p>
              <div className="h-16" />
              <p className="border-t border-black pt-1 mx-6">(_______________)</p>
            </div>
            <div className="text-center">
              <p>Wali Santri,</p>
              <div className="h-16" />
              <p className="border-t border-black pt-1 mx-6">(_______________)</p>
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] italic text-gray-600">Barakallahu fiikum — semoga Allah memberkahi hafalan ananda.</p>
        </div>
      )}

      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          aside, header { display: none !important; }
          main { padding: 0 !important; }
          #print-area { box-shadow: none; }
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="font-bold text-sm bg-primary/10 px-3 py-1 rounded-md mb-2">{title}</h3>
      {children}
    </div>
  );
}
function Empty() { return <p className="text-xs italic text-gray-500 px-2">Tidak ada aktivitas.</p>; }
function SimpleTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <table className="w-full text-xs border">
      <thead className="bg-gray-100">
        <tr>{head.map((h) => <th key={h} className="border px-2 py-1 text-left">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{r.map((c, j) => <td key={j} className="border px-2 py-1">{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}
