# Perbaikan Login Google di Vercel

Masalah 404 terjadi karena tombol Google sebelumnya memakai endpoint internal Lovable (`/~oauth/initiate`) yang hanya berjalan di preview Lovable. Kode telah diganti memakai Supabase Auth langsung.

## Pengaturan Supabase

1. Supabase Dashboard → Authentication → Providers → Google → Enable.
2. Isi Google Client ID dan Client Secret.
3. Authentication → URL Configuration:
   - Site URL: `https://saqutahfidz.vercel.app`
   - Redirect URLs: tambahkan:
     - `https://saqutahfidz.vercel.app/auth`
     - `https://saqutahfidz.vercel.app/**`
4. Google Cloud Console → OAuth Client → Authorized redirect URI, masukkan callback Supabase yang ditampilkan pada halaman provider Google, biasanya:
   `https://<PROJECT_REF>.supabase.co/auth/v1/callback`

## Deploy

Upload seluruh isi folder ini ke branch `main` GitHub, lalu Vercel akan deploy ulang.
