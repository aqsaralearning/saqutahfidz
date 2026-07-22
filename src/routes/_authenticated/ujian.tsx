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
import { Plus, GraduationCap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { predicateFromScore } from "@/lib/quran";

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
    </div>
  );
}
