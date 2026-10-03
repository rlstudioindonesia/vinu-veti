# Vinu Veti — Buku AR

Aplikasi Android (WebView + React) yang menampilkan model 3D di atas stiker QR pada buku. Bekerja offline.

## Dua jenis build

| Perintah (di folder `web-app`) | Isi | Untuk |
|---|---|---|
| `npm run build` | Tanpa menu Admin | **Play Store** |
| `npm run build:admin` | Dengan menu Guru & Ortu (Admin) | HP tim pembuat konten |
| `npm run dev` | Dengan Admin, di browser laptop | Membuat konten paling nyaman |

Hasil build masuk ke `app/src/main/assets/www`, lalu build APK/AAB di Android Studio.
Pastikan build terakhir sebelum membuat AAB untuk Play Store adalah `npm run build`.

## Konten online (disarankan)

Admin mempublikasikan stiker & model ke Supabase; aplikasi Play Store mengunduh hanya file yang berubah
dan menyimpannya untuk offline. Update konten **tanpa rilis ulang** Play Store.
Setup sekali: lihat [`docs/SUPABASE.md`](docs/SUPABASE.md).

## Update aplikasi

- **Konten** (stiker, model .glb, audio): cukup **Publikasikan** dari menu admin.
- **Kode / tampilan**: build ulang, naikkan `versionCode` & `versionName` di `app/build.gradle.kts`,
  unggah AAB baru ke Play Store.

Opsional: konten bawaan APK (sudah ada sejak instal, tanpa internet sama sekali): ekspor ZIP dari admin,
ekstrak ke `web-app/public/content/`, lalu `npm run build`.

## Ikon & maskot

Lihat `branding/README.md`.
