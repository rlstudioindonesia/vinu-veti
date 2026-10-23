Konten bawaan APK (hybrid): halaman-halaman awal, maksimal 30 MB, bisa dipakai offline sejak instal.
Sisanya diunduh aplikasi di latar belakang saat online, dan konten yang diperbarui lewat Publikasikan
otomatis mengganti salinan di APK (dibandingkan per file dengan SHA-256).

Biasanya folder ini kosong: build release Android (Gradle, tugas bundleContent) mengunduh konten itu
sendiri. Bila `npm run build` dijalankan lebih dulu, konten diambil ke sini dan itu yang dipakai.
Isinya TIDAK di-commit ke GitHub. Batas ukuran: web-app/.env.local, misalnya CONTENT_BUNDLE_MB=100
