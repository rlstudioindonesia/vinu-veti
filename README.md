# Vinu Veti — Buku AR

Aplikasi Android (WebView + React) yang menampilkan model 3D di atas stiker QR pada buku. Bekerja offline.

## Mode pengembang (admin) di versi Play Store

Menu admin ada di semua versi, tetapi tersembunyi:

1. Di homepage, **ketuk badge "VINU & VETI" (kiri atas) 7 kali dengan cepat**.
2. Login dengan akun admin Supabase (email + password). Pendaftaran umum dimatikan, jadi hanya akun
   yang dibuat di dashboard Supabase yang bisa masuk.
3. Tambah/ubah stiker, unggah `.glb`, lalu **Publikasikan**. Login tersimpan di HP itu; keluar lewat
   tombol **Keluar** di kartu Publikasi Online.

## Build

| Perintah (di folder `web-app`) | Isi | Untuk |
|---|---|---|
| `npm run build` | Admin tersembunyi (ketuk 7×) | **Play Store** |
| `npm run build:admin` | Ditambah tombol "Guru & Ortu" yang terlihat | HP tim (opsional) |
| `npm run dev` | Dengan tombol admin, di browser laptop | Membuat konten di laptop |

Hasil build masuk ke `app/src/main/assets/www`, lalu build APK/AAB di Android Studio.

`npm run build` juga **mengambil semua konten yang sudah dipublikasikan** (model, gerakan, suara 3 bahasa)
dari Supabase ke `web-app/public/content`, sehingga ikut di dalam APK: begitu anak instal/update dari
Play Store, semua QR langsung bisa dipakai **tanpa internet**. Konten yang dipublikasikan setelah rilis
tetap diunduh otomatis saat online (hanya file yang berubah) dan tersimpan di HP.
Jalankan build di komputer yang terhubung internet; jika server tidak terjangkau, build tetap jalan
dengan konten yang sudah ada.

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
