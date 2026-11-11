# Portal KiTA

Landing page + PWA statis untuk komunitas: bento layout, aurora, panel pengelola tersembunyi, dan mode offline.
Tanpa build step — cukup HTML, CSS, dan JavaScript.

## Menjalankan lokal

Service worker butuh HTTP, bukan `file://`:

```bash
python -m http.server 4173 --bind 127.0.0.1
```

Buka `http://127.0.0.1:4173/`. Panel pengelola: `http://127.0.0.1:4173/admin.html`
(atau 5 ketukan pada titik kecil di footer).

## Struktur

| Path | Isi |
| --- | --- |
| `index.html` | Landing page |
| `admin.html` | Panel pengelola (CRUD) |
| `assets/css/` | `base.css` (token & komponen), `landing.css`, `admin.css` |
| `assets/js/` | `store.js` (data), `ui.js` (dialog/ikon), `landing.js`, `admin.js` |
| `assets/icons/` | Favicon, ikon PWA, `og-image.png` |
| `manifest.webmanifest` | Metadata PWA |
| `sw.js` | Service worker (precache, offline) |
| `vercel.json` | Header keamanan & cache untuk Vercel |
| `404.html`, `robots.txt`, `sitemap.xml` | Berkas publikasi |
| `tools/` | Generator ikon & sumber kartu OG (tidak di-deploy) |

## Sebelum publish

1. Ganti `https://portalkita.id` bila domainnya berbeda. Kemunculan ada di
   `index.html` (canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD),
   `robots.txt`, dan `sitemap.xml`.
2. Ganti email `halo@portalkita.id` di `assets/js/store.js` (nilai default `contactUrl`)
   atau lewat panel admin → Tampilan.
3. Isi tautan portal yang sebenarnya di panel admin, lalu ekspor datanya
   (lihat catatan di bawah) — tautan contoh memakai `portalkita.id/...`.
4. Bump `VERSION` di `sw.js` setiap kali CSS/JS berubah, supaya cache lama dibuang.
5. Regenerasi ikon: `node tools/make-icons.js`; kartu OG: buka `tools/og-card.html`
   dan tangkap 1200×630 (contoh perintah ada di komentar file itu).

## Deploy ke Vercel

1. Push repo ini ke GitHub (repo belum diinisialisasi saat README ditulis).
2. Di Vercel: **Add New → Project → Import** repo tersebut.
3. Framework Preset: **Other**, Build Command: kosong, Output Directory: kosong/root.
4. Deploy, lalu tambahkan domain di **Settings → Domains**.
5. Setelah mengubah domain, perbarui URL absolut seperti pada langkah 1.

Header di `vercel.json` sudah mengatur: `sw.js` selalu revalidasi, HTML tidak
di-cache lama, aset di-cache 1 jam, plus CSP, `nosniff`, dan `X-Frame-Options`.
Kalau CSP diubah, uji ulang karena font memakai `fonts.googleapis.com` /
`fonts.gstatic.com`.

Catatan paket gratis Vercel: Hobby hanya untuk proyek pribadi/non-komersial.
Kalau portal ini dipakai untuk kegiatan berbayar atau sponsor, pilih Cloudflare
Pages atau naik ke Pro.

### Alternatif gratis

- **Cloudflare Pages** — static request dan bandwidth tak dibatasi, 500 build/bulan,
  cocok kalau trafiknya ramai atau situsnya komersial. Build command kosong,
  output directory `/`. `.vercelignore` tidak dipakai di sini, jadi pastikan `tools/`
  tidak ikut bila tidak ingin terekspos.
- **Netlify** — kuota transfer bulanan terbatas, tapi sangat mudah.
- **GitHub Pages** — gratis untuk repo publik, tanpa header kustom seperti CSP.

## Penting: data panel admin bersifat lokal

`admin.html` menyimpan data di `localStorage` **per perangkat/per browser**.
Artinya:

- Perubahan yang kamu buat di admin hanya terlihat di perangkat itu; pengunjung
  lain tetap melihat data default dari `assets/js/store.js`.
- Panel kini punya gerbang kata sandi lokal (SHA-256 + sessionStorage, kedaluwarsa 1 jam).
  Ini hanya pengamanan di sisi klien: siapa pun yang bisa membuka DevTools atau
  menghapus `localStorage` tetap bisa melewati/mengatur ulang. Untuk keamanan nyata,
  gunakan mode Supabase (email + password + RLS) atau backend lain.
- Menyembunyikan tautan (`admin.html` / 5 ketukan) bukan pengamanan; jangan andalkan itu.
- Untuk menyebarkan konten ke semua pengunjung, pilih salah satu:
  1. **Ekspor/impor manual (sekarang):** admin → Data → Ekspor JSON, lalu jadikan
     isi JSON itu nilai default di `store.js` dan deploy ulang.
  2. **Backend bersama:** Supabase (Postgres + Auth + RLS) atau sejenisnya, dengan
     halaman publik membaca data dan admin menulis setelah login. Ini yang perlu
     ditambahkan bila panel harus dipakai banyak pengelola.

## Setup Supabase (konten bersama)

1. Buat proyek di Supabase.
2. Buka **SQL Editor**, jalankan seluruh isi `supabase/schema.sql`.
3. **Authentication → Providers → Email**: matikan *Confirm email* (atau buat user
   dengan *Auto Confirm* di **Authentication → Users**) agar login langsung jalan.
4. Buat user admin di **Authentication → Users** (email + password).
5. Isi `assets/js/config.js`:
   ```js
   window.PORTAL_SUPABASE = {
     url: "https://PROJECT.supabase.co", // boleh tanpa https://
     anonKey: "eyJ..." // anon public key
   };
   ```
6. Deploy. Saat admin pertama kali login, data lokal akan otomatis disalin ke
   cloud (seed). Setelah itu semua pengunjung membaca dari cloud.

## Keamanan dasar

- Selalu akses lewat HTTPS (Vercel menyediakannya otomatis).
- Header di `vercel.json` mengaktifkan CSP, `nosniff`, `X-Frame-Options`, dan
  `Permissions-Policy`.
- Kata sandi admin lokal hanya UX; untuk keamanan nyata gunakan Supabase Auth + RLS.
- Jangan pernah menaruh service role key di `assets/js/config.js` — hanya anon key.
- Reset kata sandi lokal (jika lupa): hapus key `portal-kita:admin:v1` dari
  `localStorage` browser, lalu buat ulang.

## Pemeliharaan

- Perbarui `lastmod` di `sitemap.xml` saat konten utama berubah.
- Uji offline: buka situs sekali, matikan jaringan, muat ulang — landing dan admin
  seharusnya tetap terbuka.
- `BASH.bat` / `BASH.lnk` hanya pembantu lingkungan lokal dan tidak di-deploy.
