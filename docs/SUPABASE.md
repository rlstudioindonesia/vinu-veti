# Publikasi Online dengan Supabase

Alur: admin mengunggah stiker & model dari aplikasi admin → tersimpan di Supabase Storage →
aplikasi Play Store mengunduh **hanya file yang berubah** saat online → disimpan di HP → bisa dipakai offline.

## 1. Buat project (sekali saja, gratis)

1. Daftar di <https://supabase.com> → **New project**.
2. **Project Settings → API**: catat **Project URL** dan **anon public key**.
   (anon key memang publik/aman ditaruh di aplikasi; yang menjaga keamanan adalah policy di langkah 3.)

## 2. Matikan pendaftaran umum & buat akun admin

1. **Authentication → Sign In / Providers → Email**: matikan **Allow new users to sign up**.
   *Wajib*, supaya orang lain tidak bisa membuat akun lalu mengunggah file.
2. **Authentication → Users → Add user**: buat akun admin (email + password), centang *Auto Confirm*.

## 3. Buat bucket & izin (SQL Editor → New query → Run)

```sql
-- Bucket publik: semua HP boleh membaca/mengunduh
insert into storage.buckets (id, name, public)
values ('vinu-veti', 'vinu-veti', true)
on conflict (id) do update set public = true;

-- Hanya akun admin yang login boleh mengunggah, mengganti dan menghapus
create policy "vv admin select" on storage.objects for select to authenticated using (bucket_id = 'vinu-veti');
create policy "vv admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'vinu-veti');
create policy "vv admin update" on storage.objects for update to authenticated using (bucket_id = 'vinu-veti');
create policy "vv admin delete" on storage.objects for delete to authenticated using (bucket_id = 'vinu-veti');
```

## 4. Isi konfigurasi lalu build

Sudah diisi untuk project `ctowesyemrjkrjaitfft` di `web-app/.env` (ikut di-commit karena isinya publik).
Untuk project lain, ganti isinya:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

- Versi Play Store: `npm run build` (membaca konten online; admin tersembunyi, ketuk badge 7×).
- Versi admin: `npm run build:admin` (atau `npm run dev` di laptop).

Konfigurasi ini cukup sekali. Setelah aplikasi ada di Play Store, update konten **tidak perlu rilis ulang**.

## 5. Update konten sehari-hari

1. Di aplikasi (versi Play Store pun bisa): ketuk badge **VINU & VETI** 7× → login akun admin → tambah/edit/hapus stiker, unggah `.glb`.
2. Di kartu **Publikasi Online** → **Publikasikan**.
3. HP anak mengambil perubahan saat aplikasi dibuka/kembali online.

## Cara kerja indexing (kenapa ringan)

- `manifest.json` = indeks kecil (beberapa KB) berisi semua stiker + sidik jari SHA-256 tiap file.
- File disimpan sebagai `files/<sha256>.glb`. File yang tidak berubah **tidak diunggah ulang** oleh admin
  dan **tidak diunduh ulang** oleh HP anak; yang diunduh hanya file baru/berubah, satu per satu.
- File lama yang tidak dipakai lagi otomatis dihapus dari server saat publikasi.
- HP yang offline tetap memakai salinan terakhir; tidak ada yang terhapus saat tidak ada sinyal.

## Model ringan & file di atas 50 MB

Batas upload Supabase gratis adalah 50 MB per file. Aplikasi menanganinya otomatis:

1. **Kompres otomatis saat upload** (form admin, aktif secara default untuk file > 5 MB), dengan
   kualitas sebagai prioritas:
   - Tekstur hanya diperkecil bila lebih besar dari 2048 px (layar HP tidak bisa menampilkan lebih, dan
     tekstur 4096 px sering membuat HP murah kehabisan memori GPU), lalu diubah ke WebP.
   - Setiap tekstur hasil kompres **dibandingkan piksel demi piksel** dengan aslinya (PSNR). Tekstur warna
     harus ≥ 40 dB, peta material ≥ 44 dB, peta normal (yang mengatur pantulan cahaya) ≥ 50 dB. Bila
     belum tercapai, dicoba kualitas lebih tinggi sampai WebP lossless; bila tetap tidak lebih kecil,
     **tekstur asli dipakai apa adanya**.
   - Tekstur transparan (rambut, daun, dll.) tidak pernah dikompres ulang agar tepinya tidak menghitam.
   - Geometri dikuantisasi dengan presisi tinggi (posisi 16 bit, normal & UV 14 bit) lalu Meshopt.
     Animasi hanya dibuang keyframe yang benar-benar berlebih (selisih < 0,0001).
   - Uji pada 11 model contoh Khronos: render sebelum vs sesudah SSIM ≥ 0,99 (umumnya 0,998), tidak
     terlihat bedanya oleh mata. Ukuran turun 1,1–4× (lebih besar lagi untuk tekstur 4096 px).
2. **File yang masih > 45 MB dipecah** menjadi beberapa bagian saat publikasi, lalu disatukan kembali
   di HP dan saat build APK. Memecah file **tidak mengubah satu bit pun**: setelah disatukan, isi file
   dicek dengan SHA-256 terhadap indeks (`manifest.json`); file yang rusak/terpotong di jalan ditolak
   dan diunduh ulang nanti.

Tetap usahakan model sekecil mungkin (idealnya < 15 MB): file besar lama diunduh anak, memperbesar APK,
dan memakan memori HP. Cara paling efektif tanpa turun kualitas: saat ekspor dari Blender, pakai tekstur
2048 px (bukan 4096/8192) dan hapus objek/animasi yang tidak dipakai. Kompres manual di laptop juga bisa:

```
npx @gltf-transform/cli optimize model.glb model-kecil.glb --compress meshopt --texture-compress webp --texture-size 2048
```

## Indeks & optimasi aplikasi

- **Indeks konten**: `manifest.json` berisi daftar stiker + SHA-256 setiap file. File disimpan dengan nama
  SHA-nya (`files/<sha>.glb`), jadi file yang tidak berubah tidak pernah diunggah/diunduh ulang.
- **Di HP**: kode QR dicari lewat indeks (satu kali lookup per bacaan kamera). Model yang sudah pernah
  dipindai disimpan sementara di memori (batas menyesuaikan RAM HP), jadi membuka halaman lagi langsung
  muncul tanpa membaca & mendekode ulang.
- Shader dan tekstur model disiapkan di GPU sebelum karakter muncul, agar animasi muncul tidak tersendat.
- Kode aplikasi dipecah: layar awal hanya memuat ±290 KB; kode AR dimuat di latar belakang setelah layar
  awal tampil, kode admin hanya saat admin dibuka.

## Kuota gratis Supabase (perkiraan)

1 GB penyimpanan, ±5 GB unduhan/bulan. Contoh: 20 model × 3 MB = 60 MB; tiap HP baru mengunduh 60 MB sekali,
jadi ±80 HP baru per bulan. Kompres model agar kuota cukup untuk lebih banyak pengguna.
