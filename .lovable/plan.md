## Diagnosis

Error `new row violates row-level security policy for table students` muncul karena RLS pada tabel `public.students` **sudah benar** — hanya user dengan role `admin` yang boleh insert/update/delete:

```
students_admin_all      → is_admin(auth.uid())     (ALL, authenticated)
students_musyrif_read   → SELECT untuk musyrif
students_musyrif_update → UPDATE untuk musyrif halaqohnya sendiri
students_wali_read_own  → SELECT untuk wali santrinya
```

Tidak ada policy untuk `anon` (aman, sesuai permintaan).

**Akar masalahnya:** kedua akun yang sudah terdaftar (`saku cianjur`, `Aqsara Learning`) **belum punya role apa pun** di tabel `user_roles`, sehingga `is_admin(auth.uid())` = false → insert ditolak.

Form Tambah Santri di `src/routes/_authenticated/santri.tsx` sudah memakai session pengguna login (`supabase.from("students").insert(form)` lewat client yang membawa bearer token user), jadi kode form tidak perlu diubah.

## Rencana Perbaikan

1. **Berikan role `admin` ke akun `saku cianjur`** (akun utama lembaga) lewat insert data ke `public.user_roles`. Setelah ini, akun tersebut bisa menambah/mengubah/menghapus santri dari halaman **Data Santri**.
2. Tidak mengubah RLS — sudah sesuai spesifikasi (admin-only untuk tulis, anon tidak punya akses apa pun).
3. Tidak mengubah kode form — sudah memakai session user login.

## Cara Mengisi Data Santri (setelah role admin aktif)

1. Login sebagai akun admin di `/auth`.
2. Buka menu **Data Santri** di sidebar.
3. Klik tombol **Tambah Santri** di kanan atas.
4. Isi NIS, Nama Lengkap, Jenis Kelamin, Kelas, Halaqoh (opsional), Target Juz, Nama & No. HP Wali → **Simpan**.
5. Untuk menetapkan halaqoh, buat dulu halaqoh di menu **Halaqoh** lalu pilih di form santri.

## Lokasi Database

Semua data tahfidz (santri, ziyadah, muroja'ah, tasmi', ujian, absensi, halaqoh, dsb.) disimpan di **Lovable Cloud** (backend terkelola) pada 12 tabel: `students`, `ziyadah_entries`, `murojaah_entries`, `tasmi_entries`, `exams`, `exam_mistakes`, `attendance`, `halaqoh`, `halaqoh_schedule`, `profiles`, `user_roles`, `parent_students`. Bisa dilihat lewat tombol **View Backend** di editor Lovable.

## Untuk Menambah Admin Lain di Masa Depan

Setelah jadi admin, buka menu **Pengaturan** → bagian **Pengguna & Peran** → klik `+ admin` di baris user yang diinginkan.
