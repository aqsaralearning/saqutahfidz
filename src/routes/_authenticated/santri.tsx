import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, UserCircle, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { uploadStudentPhoto, useSignedPhotos } from "@/lib/photo";

export const Route = createFileRoute("/_authenticated/santri")({
  head: () => ({ meta: [{ title: "Data Santri — SAQU Tahfidz" }] }),
  component: SantriPage,
});

function SantriPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ nis: "", full_name: "", gender: "L", class_level: "1", parent_name: "", parent_phone: "", target_juz: 1 });

  const { data: halaqoh } = useQuery({
    queryKey: ["halaqoh"],
    queryFn: async () => (await supabase.from("halaqoh").select("*").order("name")).data ?? [],
  });

  const { data: santri, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => (await supabase.from("students").select("*, halaqoh(name)").order("full_name")).data ?? [],
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("students").insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Santri ditambahkan"); setOpen(false);
      setForm({ nis: "", full_name: "", gender: "L", class_level: "1", parent_name: "", parent_phone: "", target_juz: 1 });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (santri ?? []).filter((s: any) =>
    !q || s.full_name.toLowerCase().includes(q.toLowerCase()) || s.nis.includes(q));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Data Santri</h1>
          <p className="text-muted-foreground">Kelola data santri dan halaqohnya.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="rounded-xl"><Plus className="mr-2 h-4 w-4" />Tambah Santri</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Tambah Santri Baru</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>NIS</Label><Input value={form.nis} onChange={(e) => setForm({ ...form, nis: e.target.value })} /></div>
              <div><Label>Nama Lengkap</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div>
                <Label>Jenis Kelamin</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="L">Laki-laki</SelectItem><SelectItem value="P">Perempuan</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kelas</Label>
                <Select value={form.class_level} onValueChange={(v) => setForm({ ...form, class_level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["1","2","3","4","5","6"].map(k => <SelectItem key={k} value={k}>Kelas {k}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Halaqoh</Label>
                <Select value={form.halaqoh_id ?? ""} onValueChange={(v) => setForm({ ...form, halaqoh_id: v || null })}>
                  <SelectTrigger><SelectValue placeholder="Pilih halaqoh" /></SelectTrigger>
                  <SelectContent>
                    {(halaqoh ?? []).map((h: any) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Target Juz</Label><Input type="number" min={1} max={30} value={form.target_juz} onChange={(e) => setForm({ ...form, target_juz: +e.target.value })} /></div>
              <div><Label>Nama Wali</Label><Input value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} /></div>
              <div><Label>No. HP Wali</Label><Input value={form.parent_phone} onChange={(e) => setForm({ ...form, parent_phone: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={() => add.mutate()} disabled={add.isPending} className="rounded-xl">Simpan</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-fun">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari nama atau NIS..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Memuat...</p> :
           filtered.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada data santri.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                  <tr><th className="py-2 pr-3">NIS</th><th>Nama</th><th>Kelas</th><th>Halaqoh</th><th>Target</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.map((s: any) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-3 pr-3 font-mono text-xs">{s.nis}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2 font-semibold"><UserCircle className="h-5 w-5 text-primary" />{s.full_name}</div>
                        <div className="text-xs text-muted-foreground">{s.gender === "L" ? "Laki-laki" : "Perempuan"}</div>
                      </td>
                      <td>Kelas {s.class_level}</td>
                      <td>{s.halaqoh?.name ?? <span className="text-muted-foreground">-</span>}</td>
                      <td>Juz {s.target_juz}</td>
                      <td><Link to="/santri/$id" params={{ id: s.id }}><Button size="sm" variant="ghost" className="rounded-lg">Detail</Button></Link></td>
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
