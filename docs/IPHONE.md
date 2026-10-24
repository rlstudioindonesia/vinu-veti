# Versi iPhone / iPad / Android web (gratis, tanpa App Store)

iPhone tidak bisa memasang file aplikasi secara manual seperti APK. Karena itu versi iPhone dibuat
sebagai **Web App (PWA)**: dibuka dari link di Safari lalu "Tambahkan ke Layar Utama". Hasilnya ikon di
layar utama, layar penuh, bisa dipakai **offline**, dan otomatis ter-update. Tanpa akun Apple, tanpa
Mac, tanpa biaya. Link yang sama juga bisa dibuka di HP Android.

## Sekali saja: hosting gratis di Cloudflare

1. Daftar gratis di <https://dash.cloudflare.com/sign-up>.
2. Menu **Workers & Pages** → **Create** → **Import a repository** → hubungkan GitHub dan pilih repo
   `rlstudioindonesia/vinu-veti`.
3. Pengaturan build (repo sudah berisi `package.json` dan `wrangler.jsonc` di folder utama, jadi cukup
   nilai bawaan ini):
   - Project name: `vinu-veti`
   - Build command: `npm run build:web`
   - Deploy command: `npx wrangler deploy`
   - Root directory: `/`
4. **Deploy**. Setelah ±2 menit muncul alamat seperti `https://vinu-veti.<akun>.workers.dev`
   (bisa dilihat di tab **Domains**).

Setiap ada merge ke `main`, Cloudflare otomatis membangun dan meng-update situs. Konten QR/model 3D
diambil dari Cloudflare R2 (alamat `/cdn/` di situs yang sama) seperti di Android (tidak perlu upload ulang).

(Netlify juga bisa: base directory `web-app`, build `npm run build:web`, publish `web-app/dist`.)

## Cara pakai untuk orang tua (iPhone/iPad)

1. Buka link di **Safari** (bukan Chrome / browser di dalam WhatsApp).
2. Ketuk tombol **Bagikan** (kotak dengan panah ke atas) → **Tambahkan ke Layar Utama**.
3. Buka **Vinu & Veti** dari ikon di layar utama. Saat pertama dibuka perlu internet agar konten
   terunduh; setelah itu bisa offline.
4. Saat membuka kamera pertama kali, izinkan **Kamera** dan **Gerakan & Orientasi** (agar karakter stabil).

Di iPhone, aplikasi menampilkan petunjuk ini otomatis saat dibuka dari Safari.

## Cara pakai di HP Android (tanpa Play Store)

1. Buka link di **Chrome** (bukan browser di dalam Facebook/Instagram; dari WhatsApp boleh).
2. Di layar Pilih Bahasa ketuk **Pasang di HP Android** → **Pasang sekarang** (dialog pemasangan Chrome),
   atau menu **⋮ → Instal aplikasi / Tambahkan ke layar utama**.
3. Aplikasi dipasang oleh Chrome sendiri (WebAPK yang dibuat dan ditandatangani Google): tanpa "sumber
   tidak dikenal", tanpa peringatan Play Protect, ikon di layar utama, layar penuh, bisa offline.

Yang membuat situs ini dinilai aman oleh Chrome/Google: HTTPS, manifest lengkap (ikon biasa + maskable,
tangkapan layar, `id`), service worker, header keamanan (`web-app/public/_headers`: hanya kamera yang
diizinkan, tidak bisa disematkan di situs lain), kebijakan privasi, tanpa iklan, tanpa izin lain, kamera
baru diminta saat anak mengetuk Buka Kamera. Manifest menyebut aplikasi Play Store (`related_applications`)
tanpa memaksanya, jadi pengguna bebas memilih.

## Catatan

- Butuh iOS/iPadOS 15 atau lebih baru.
- Menu admin tetap tersembunyi (ketuk logo 7×); upload konten tetap dari aplikasi admin seperti biasa.
- Data (model & suara) tersimpan di iPhone. Bila aplikasi dihapus dari layar utama, datanya ikut terhapus
  dan akan diunduh lagi saat dipasang ulang.
