import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, LineChart, Users, ClipboardCheck, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SAQU Mutaba'ah Tahfidz — Aplikasi Pemantauan Hafalan Al-Qur'an SD" },
      { name: "description", content: "Kelola setoran ziyadah, muroja'ah, tasmi', ujian tahfidz dengan mushaf digital, absensi, target juz, dan rapor santri SD dalam satu aplikasi." },
      { property: "og:title", content: "SAQU Mutaba'ah Tahfidz" },
      { property: "og:description", content: "Semua kebutuhan mutaba'ah tahfidz sekolah dasar dalam satu aplikasi." },
    ],
  }),
  component: Landing,
});

function Feature({ icon: Icon, title, desc, color }: any) {
  return (
    <div className="card-fun p-6 transition hover:-translate-y-1">
      <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-display text-xl font-extrabold">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-leaf text-leaf-foreground">📖</div>
            SAQU Tahfidz
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost">Masuk</Button></Link>
            <Link to="/auth"><Button className="rounded-xl">Mulai</Button></Link>
          </nav>
        </div>
      </header>

      <section className="gradient-hero">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 text-center">
          <span className="inline-block rounded-full bg-sun/40 px-3 py-1 text-xs font-bold text-sun-foreground">Aplikasi Mutaba'ah Tahfidz Sekolah Dasar</span>
          <h1 className="mt-4 font-display text-4xl md:text-6xl font-extrabold leading-tight">
            Kelola hafalan Al-Qur'an santri <span className="text-primary">dengan mudah & menyenangkan</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-muted-foreground">
            Ziyadah, muroja'ah, tasmi', ujian tahfidz dengan <b>mushaf digital</b>, absensi, target juz, hingga rapor & sertifikat — semuanya dalam satu tempat.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/auth"><Button size="lg" className="rounded-xl">Masuk / Daftar</Button></Link>
            <a href="#fitur"><Button size="lg" variant="outline" className="rounded-xl">Lihat Fitur</Button></a>
          </div>
        </div>
      </section>

      <section id="fitur" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-display text-3xl md:text-4xl font-extrabold">Fitur Lengkap untuk Lembaga Tahfidz</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">Dirancang khusus untuk madrasah / SDIT / boarding school dengan kebutuhan pemantauan tahfidz harian.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Feature icon={Users} title="Data Santri" desc="Kelola data santri, kelompok halaqoh, wali, target hafalan per semester." color="bg-sky" />
          <Feature icon={BookOpen} title="Ziyadah / Muroja'ah / Tasmi'" desc="Input setoran harian dengan nilai, status, dan catatan musyrif." color="bg-leaf" />
          <Feature icon={GraduationCap} title="Ujian Tahfidz + Mushaf" desc="Uji santri sambil membuka mushaf digital & menandai kesalahan makhroj, mad, ghunnah, qolqolah." color="bg-berry" />
          <Feature icon={ClipboardCheck} title="Absensi Halaqoh" desc="Absensi harian per halaqoh dengan status hadir/izin/sakit/alpa." color="bg-sun" />
          <Feature icon={LineChart} title="Progres & Grafik" desc="Grafik pencapaian, persentase target juz, leaderboard santri." color="bg-primary" />
          <Feature icon={ShieldCheck} title="Rapor & Sertifikat PDF" desc="Cetak rapor tahfidz per semester & sertifikat kelulusan juz otomatis." color="bg-leaf" />
        </div>
      </section>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SAQU Tahfidz — Sekolah Alam Al-Qudsiyyah.
        </div>
      </footer>
    </div>
  );
}
