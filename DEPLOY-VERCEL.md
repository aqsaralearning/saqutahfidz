# Deploy SAQU Tahfidz ke Vercel

## Perbaikan yang sudah diterapkan

1. Build Nitro diarahkan ke preset `vercel`, bukan preset Cloudflare bawaan Lovable.
2. Logo dipindahkan menjadi aset lokal `public/logo-saqu.png`; URL internal Lovable `/__l5e/assets-v1/...` tidak tersedia di Vercel.
3. Ditambahkan konfigurasi `vercel.json` agar Vercel menjalankan `npm ci` dan `npm run build`.

## Environment Variables yang wajib ditambahkan di Vercel

Buka **Project → Settings → Environment Variables**, lalu tambahkan keenam variabel berikut dengan nilai yang sama seperti proyek Supabase/Lovable:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Tambahkan untuk **Production, Preview, dan Development**, kemudian lakukan **Redeploy**.

> Jangan menambahkan `SUPABASE_SERVICE_ROLE_KEY` kecuali fitur server-admin memang menggunakannya. Kunci service role tidak boleh memakai awalan `VITE_`.

## Pengaturan Vercel

- Framework Preset: **Other** atau biarkan mengikuti `vercel.json`
- Root Directory: folder yang berisi `package.json`
- Build Command: `npm run build`
- Install Command: `npm ci`
- Output Directory: kosongkan; Nitro membuat output Vercel secara otomatis.

## Setelah deploy

1. Buka halaman utama dan pastikan logo muncul.
2. Uji tombol **Masuk / Daftar**.
3. Login memakai akun yang sudah ada di Supabase.
4. Uji tambah santri, setoran, absensi, dan laporan.
5. Jika login gagal, cek Supabase **Authentication → URL Configuration** dan tambahkan domain Vercel pada **Redirect URLs**, misalnya `https://nama-proyek.vercel.app/**`.
