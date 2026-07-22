# Aplikasi Mutaba'ah Tahfidz SAQU

Aplikasi web pemantauan hafalan Al-Qur'an untuk sekolah dasar dengan multi-user (admin, guru/musyrif, wali santri), database cloud, dan tema warna-warni ramah anak.

## Ruang Lingkup Fitur

### 1. Manajemen Data Master
- **Santri**: nama, NIS, kelas, jenis kelamin, tanggal lahir, nama wali, foto, kelompok halaqoh
- **Guru/Musyrif**: nama, NIP, kelompok halaqoh yang diampu
- **Kelas & Halaqoh**: tingkat kelas SD (1-6), pengelompokan halaqoh
- **Target Hafalan**: target juz/surah per santri per semester

### 2. Setoran Hafalan (3 modul inti)
- **Ziyadah** (setoran hafalan baru): surah, ayat mulai-selesai, juz, halaman, nilai, catatan
- **Muroja'ah** (mengulang hafalan): rentang hafalan yang diulang, kualitas, catatan
- **Tasmi'** (menyimak / setor panjang): rentang, durasi, penilaian keseluruhan

Setiap entri: tanggal, santri, guru penilai, nilai (A-D), status (lancar / kurang lancar / mengulang).

### 3. Ujian Tahfidz dengan Mushaf Digital
- Pilih santri + rentang hafalan yang diuji
- Tampilan **mushaf digital** per halaman (gambar mushaf standar Madinah / Kemenag) agar penguji bisa memeriksa langsung sambil menandai kesalahan
- Rubrik penilaian:
  - **Makhroj Huruf** (skor 1-100)
  - **Tajwid**: Mad, Ghunnah, Qolqolah (masing-masing 1-100)
  - **Kelancaran** (skor 1-100)
  - **Adab & Tartil** (skor 1-100)
- Tombol tandai kesalahan per ayat (klik ayat → catat jenis kesalahan)
- Nilai akhir otomatis + predikat (Mumtaz / Jayyid Jiddan / Jayyid / Maqbul)
- Sertifikat kelulusan juz otomatis (PDF)

### 4. Absensi & Jadwal Halaqoh
- Jadwal harian halaqoh (hari, jam, ruang, musyrif)
- Absensi harian santri (hadir / izin / sakit / alpa)

### 5. Progres & Target
- Dashboard per santri: total hafalan (juz + halaman), grafik pencapaian mingguan/bulanan, persentase pencapaian target
- Leaderboard kelas / halaqoh

### 6. Laporan & Rapor
- Rekap setoran per santri / kelas / periode
- **Rapor tahfidz PDF** per semester (data santri, ringkasan ziyadah/muroja'ah/tasmi', hasil ujian, komentar musyrif, tanda tangan)
- **Sertifikat juz** PDF
- Ekspor CSV

### 7. Autentikasi & Peran
- Login email/password + Google
- Peran (disimpan di tabel `user_roles` terpisah): `admin`, `musyrif`, `wali`
  - **Admin**: kelola semua data, user, laporan
  - **Musyrif**: input setoran, ujian, absensi untuk santri di halaqohnya
  - **Wali**: hanya melihat progres anaknya, rapor, sertifikat

## Desain Visual (Ceria Anak SD)
- Palet: biru `#2563EB`, kuning `#F59E0B`, hijau `#10B981`, merah `#EF4444` + latar putih hangat
- Font: Baloo 2 / Fredoka (headline ramah anak) + Inter (body)
- Sudut membulat besar (`rounded-2xl`), ilustrasi/emoji, kartu berwarna
- Ikon lucide dengan warna aksen bergantian
- Motion halus (hover scale, fade), animasi konfeti saat santri selesai 1 juz

## Rencana Teknis

### Backend (Lovable Cloud)
Tabel utama (public schema, dengan GRANT + RLS):
- `profiles` (user profile: nama, foto, kelas, dsb.)
- `user_roles` + enum `app_role` + fungsi `has_role()` (security definer)
- `students` (santri)
- `teachers` (musyrif) — atau via role
- `halaqoh` (kelompok halaqoh)
- `student_halaqoh` (relasi santri-halaqoh)
- `parent_students` (relasi wali-santri)
- `ziyadah_entries`, `murojaah_entries`, `tasmi_entries`
- `exams` (ujian tahfidz: header) + `exam_scores` (rubrik) + `exam_mistakes` (catatan per ayat)
- `attendance` (absensi harian)
- `schedule` (jadwal halaqoh)
- `targets` (target semester)

RLS:
- Admin: full access
- Musyrif: CRUD data santri di halaqoh yang diampunya
- Wali: SELECT data anak-anaknya saja

### Frontend (TanStack Start)
Rute:
- `/` — landing publik (info sekolah + tombol Login)
- `/auth` — login/register
- `/_authenticated/dashboard` — dashboard peran
- `/_authenticated/santri` (list) + `/_authenticated/santri/$id` (detail + progres)
- `/_authenticated/ziyadah`, `/muroja'ah`, `/tasmi` — form + list setoran
- `/_authenticated/ujian` (list) + `/_authenticated/ujian/$id` — halaman ujian dengan mushaf
- `/_authenticated/halaqoh` — jadwal & absensi
- `/_authenticated/laporan` — rekap + generate PDF (rapor & sertifikat)
- `/_authenticated/admin/users` — manajemen user (admin only)

Library:
- `@tanstack/react-query` (sudah ada)
- `jspdf` + `jspdf-autotable` untuk rapor & sertifikat PDF
- `recharts` untuk grafik progres
- Mushaf: menggunakan gambar halaman mushaf dari sumber publik (mis. `everyayah.com` per-page images atau `qul.tarteel.ai`); tampilkan per halaman berdasarkan nomor halaman input

### Server functions
Semua tulis data via `createServerFn` + `requireSupabaseAuth`, akses cek role dgn `has_role()`.

## Tahap Implementasi
1. Aktifkan Lovable Cloud + auth (email + Google) + tabel & RLS
2. Design system (warna ceria, font, komponen kartu)
3. Landing page + auth
4. Layout dashboard + navigasi peran
5. CRUD santri, halaqoh, jadwal
6. Modul setoran (Ziyadah / Muroja'ah / Tasmi')
7. Modul ujian tahfidz + mushaf digital + rubrik
8. Absensi & target
9. Dashboard progres + grafik
10. Laporan + generate PDF rapor & sertifikat
11. Halaman wali (read-only progres anak)
12. SEO, sitemap, polish

Aplikasi cukup besar — implementasi akan berlangsung bertahap; versi pertama akan mencakup fondasi (auth, data santri, ziyadah/muroja'ah/tasmi', ujian dengan mushaf & rubrik, dashboard, laporan dasar & rapor PDF), lalu fitur pendukung disempurnakan berikutnya.
