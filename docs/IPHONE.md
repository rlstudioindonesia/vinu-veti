# Versi iPhone / iPad (gratis, tanpa App Store)

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
tetap diambil dari Supabase seperti di Android (tidak perlu upload ulang).

(Netlify juga bisa: base directory `web-app`, build `npm run build:web`, publish `web-app/dist`.)

## Cara pakai untuk orang tua (iPhone/iPad)

1. Buka link di **Safari** (bukan Chrome / browser di dalam WhatsApp).
2. Ketuk tombol **Bagikan** (kotak dengan panah ke atas) → **Tambahkan ke Layar Utama**.
3. Buka **Vinu & Veti** dari ikon di layar utama. Saat pertama dibuka perlu internet agar konten
   terunduh; setelah itu bisa offline.
4. Saat membuka kamera pertama kali, izinkan **Kamera** dan **Gerakan & Orientasi** (agar karakter stabil).

Di iPhone, aplikasi menampilkan petunjuk ini otomatis saat dibuka dari Safari.

## Catatan

- Butuh iOS/iPadOS 15 atau lebih baru.
- Menu admin tetap tersembunyi (ketuk logo 7×); upload konten tetap dari aplikasi admin seperti biasa.
- Data (model & suara) tersimpan di iPhone. Bila aplikasi dihapus dari layar utama, datanya ikut terhapus
  dan akan diunduh lagi saat dipasang ulang.
