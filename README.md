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

## Membuat & merilis konten

1. Jalankan `npm run dev` (atau pasang APK `build:admin`), buka menu Guru & Ortu (admin / admin).
2. Tambah stiker, unggah model `.glb` (dan audio), cetak QR-nya.
3. **Ekspor Paket Konten** → ZIP. Ekstrak isinya ke `web-app/public/content/`.
4. `npm run build` → naikkan `versionCode` & `versionName` di `app/build.gradle.kts` → build AAB → unggah ke Play Store.

## Update aplikasi

Perubahan di komputer lokal **tidak** otomatis sampai ke pengguna. Setiap update (kode maupun konten bawaan)
harus dirilis ulang ke Play Store dengan `versionCode` yang lebih besar; HP pengguna lalu memperbarui lewat Play Store.

Opsional: dengan `VITE_CONTENT_URL` (lihat `.env.example`), konten baru (stiker/model/audio) bisa diunggah ke hosting
statis dan diunduh aplikasi tanpa rilis ulang. Perubahan kode/tampilan tetap harus lewat Play Store.

## Ikon & maskot

Lihat `branding/README.md`.
