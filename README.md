# Vinu Veti — Buku AR

Aplikasi Android (WebView + React) yang menampilkan model 3D di atas stiker QR pada buku. Bekerja offline.

## Mode pengembang (admin) di versi Play Store

Menu admin ada di semua versi, tetapi tersembunyi:

1. Di homepage, **ketuk badge "VINU & VETI" (kiri atas) 7 kali dengan cepat**.
2. Login dengan akun admin (email + password) dari secret `ADMIN_USERS` di Cloudflare
   (lihat [`docs/R2.md`](docs/R2.md)). Hanya akun di situ yang bisa masuk.
3. Tambah/ubah stiker, unggah `.glb`, lalu **Publikasikan**. Login tersimpan di HP itu; keluar lewat
   tombol **Keluar** di kartu Publikasi Online.

## Build

| Perintah (di folder `web-app`) | Isi | Untuk |
|---|---|---|
| `npm run build` | Admin tersembunyi (ketuk 7×) | **Play Store** |
| `npm run build:admin` | Ditambah tombol "Guru & Ortu" yang terlihat | HP tim (opsional) |
| `npm run dev` | Dengan tombol admin, di browser laptop | Membuat konten di laptop |

Hasil build masuk ke `app/src/main/assets/www`, lalu build APK/AAB di Android Studio.

**Konten bawaan APK (hybrid):** build **release** Android (AAB untuk Play Store, juga dari AI Studio)
otomatis mengunduh halaman-halaman awal konten yang sudah dipublikasikan (model, gerakan, suara 3 bahasa)
dari server konten (Cloudflare R2), **maksimal 30 MB** (ringan untuk diinstal; batas Play Store ±200 MB), mulai halaman 1; stiker yang tidak muat
dilewati. Halaman itu langsung bisa dipakai **tanpa internet** sejak instal. Sisanya diunduh aplikasi di
latar belakang saat online, dan konten yang diperbarui lewat **Publikasikan** otomatis mengganti salinan di
APK (hanya file yang berubah). Log build menampilkan baris `[konten] …` berisi halaman yang ikut.
Tugas Gradle `bundleContent` di `app/build.gradle.kts`; batas bisa diubah di `web-app/.env.local`
(`CONTENT_BUNDLE_MB=100`). Konten ini tidak di-commit ke GitHub. Bila `npm run build` dijalankan lebih
dulu, konten hasil script itu (`app/src/main/assets/www/content`) yang dipakai.

## Versi iPhone / iPad

Gratis sebagai Web App (PWA), tanpa App Store: lihat [docs/IPHONE.md](docs/IPHONE.md). Build: `npm run build:web` (hasil di `web-app/dist`).

## Diagnosa pelacakan AR

Cara kerja pelacakan: QR dibaca (ZXing / BarcodeDetector) untuk mengenali stiker, lalu **pelacak optik**
mengikuti pola QR di setiap frame kamera (optical flow Lucas-Kanade pada 49 titik, di Web Worker terpisah),
dibantu sensor rotasi Android untuk menebak gerakan saat HP digoyang. Karena itu karakter tetap menempel
saat HP digeser maupun diputar, dan tidak bergetar.

Di layar kamera AR, ketuk nama stiker (kanan atas) **5×** untuk menampilkan info: pembaca QR yang dipakai,
jumlah baca per detik, status pelacak optik (fps & ms per frame), dan sumber sensor gerak. Kirim
screenshot-nya bila ada masalah.

## Konten online (disarankan)

Admin mempublikasikan stiker & model ke Cloudflare R2 (lewat Worker `worker/index.js`, unduhan tanpa
biaya); aplikasi Play Store mengunduh hanya file yang berubah
dan menyimpannya untuk offline. Update konten **tanpa rilis ulang** Play Store.
Setup sekali: lihat [`docs/R2.md`](docs/R2.md) (sebelumnya Supabase: `docs/SUPABASE.md`).

## Update aplikasi

- **Konten** (stiker, model .glb, audio): cukup **Publikasikan** dari menu admin.
- **Kode / tampilan**: build ulang, naikkan `versionCode` & `versionName` di `app/build.gradle.kts`,
  unggah AAB baru ke Play Store.

Konten bawaan APK ikut diperbarui otomatis setiap `npm run build` (lihat bagian Build); ZIP dari
"Ekspor Paket Konten" cukup sebagai cadangan.

## Ikon & maskot

Lihat `branding/README.md`.
