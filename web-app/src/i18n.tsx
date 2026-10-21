import React, { createContext, useCallback, useContext, useState } from 'react';

export type Lang = 'id' | 'en' | 'tl';

export const LANGS: Array<{ code: Lang; label: string; flag: string }> = [
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tl', label: 'Tagalog (Filipino)', flag: '🇵🇭' },
];

const STRINGS = {
  // Language picker
  chooseLanguage: { id: 'Pilih Bahasa', en: 'Choose Language', tl: 'Pumili ng Wika' },
  // Splash
  storybook3d: { id: 'BUKU CERITA AJAIB 3D', en: 'MAGIC 3D STORYBOOK', tl: 'MAHIWAGANG 3D NA KUWENTO' },
  preparing: { id: 'Menyiapkan dunia ajaib...', en: 'Preparing the magic world...', tl: 'Inihahanda ang mahiwagang mundo...' },
  // Home
  teacherParent: { id: 'Guru & Ortu', en: 'Teachers & Parents', tl: 'Guro at Magulang' },
  tagline: { id: 'Buku Bergambar Menjadi Nyata!', en: 'Picture Books Come to Life!', tl: 'Nabubuhay ang mga Larawang Aklat!' },
  openCamera: { id: 'BUKA KAMERA AJAIB!', en: 'OPEN MAGIC CAMERA!', tl: 'BUKSAN ANG MAHIWAGANG KAMERA!' },
  tapToScan: { id: 'Sentuh untuk memindai stiker', en: 'Tap to scan a sticker', tl: 'Pindutin para i-scan ang sticker' },
  howToPlay: { id: 'Cara Bermain Sangat Mudah:', en: 'How to Play — So Easy:', tl: 'Paano Maglaro — Napakadali:' },
  step1: { id: '1. Buka Buku', en: '1. Open the Book', tl: '1. Buksan ang Aklat' },
  step2: { id: '2. Arahkan Kamera', en: '2. Point the Camera', tl: '2. Itutok ang Kamera' },
  step3: { id: '3. Muncul 3D!', en: '3. 3D Appears!', tl: '3. Lilitaw ang 3D!' },
  safeToPlay: { id: 'Aman untuk Belajar & Bermain', en: 'Safe for Learning & Play', tl: 'Ligtas sa Pag-aaral at Paglalaro' },
  installTitle: { id: 'Pasang di iPhone / iPad', en: 'Install on iPhone / iPad', tl: 'I-install sa iPhone / iPad' },
  installStep1: {
    id: 'Ketuk tombol Bagikan di bawah layar Safari',
    en: 'Tap the Share button at the bottom of Safari',
    tl: 'I-tap ang Share button sa ibaba ng Safari',
  },
  installStep2: {
    id: 'Pilih "Tambahkan ke Layar Utama"',
    en: 'Choose "Add to Home Screen"',
    tl: 'Piliin ang "Add to Home Screen"',
  },
  installStep3: {
    id: 'Buka Vinu & Veti dari ikon di layar utama. Bisa dipakai offline!',
    en: 'Open Vinu & Veti from the home screen icon. Works offline!',
    tl: 'Buksan ang Vinu & Veti mula sa icon sa home screen. Gumagana offline!',
  },
  installSafari: {
    id: 'Buka link ini di Safari untuk memasangnya.',
    en: 'Open this link in Safari to install it.',
    tl: 'Buksan ang link na ito sa Safari para i-install.',
  },
  installLater: { id: 'Nanti saja', en: 'Later', tl: 'Mamaya na' },
  noContentAdmin: {
    id: 'Belum ada konten AR. Tambahkan stiker & model 3D di menu Guru & Ortu.',
    en: 'No AR content yet. Add stickers & 3D models in the Teachers & Parents menu.',
    tl: 'Wala pang AR na nilalaman. Magdagdag ng sticker at 3D model sa menu ng Guro at Magulang.',
  },
  noContent: {
    id: 'Konten AR belum tersedia. Sambungkan internet sekali agar konten terunduh.',
    en: 'AR content is not available yet. Connect to the internet once to download it.',
    tl: 'Wala pang AR na nilalaman. Kumonekta sa internet nang isang beses para ma-download ito.',
  },
  downloadingContent: {
    id: 'Mengunduh konten AR {done}/{total}… biarkan aplikasi terbuka',
    en: 'Downloading AR content {done}/{total}… keep the app open',
    tl: 'Dina-download ang AR na nilalaman {done}/{total}… huwag isara ang app',
  },
  contentReady: { id: 'Semua konten siap dipakai offline ✓', en: 'All content is ready to use offline ✓', tl: 'Handa nang gamitin offline ang lahat ✓' },
  contentPartial: {
    id: 'Sebagian konten belum terunduh. Akan dicoba lagi saat online.',
    en: 'Some content is not downloaded yet. It will retry when online.',
    tl: 'May nilalamang hindi pa na-download. Susubukan muli kapag online.',
  },
  soundOn: { id: 'Nyalakan suara', en: 'Turn sound on', tl: 'Buksan ang tunog' },
  soundOff: { id: 'Matikan suara', en: 'Turn sound off', tl: 'Patayin ang tunog' },
  language: { id: 'Bahasa', en: 'Language', tl: 'Wika' },
  // AR view
  pointAtQr: { id: 'Arahkan kamera ke stiker QR di buku', en: 'Point the camera at the QR sticker in the book', tl: 'Itutok ang kamera sa QR sticker sa aklat' },
  backToMenu: { id: 'Kembali ke Menu Utama', en: 'Back to Main Menu', tl: 'Bumalik sa Pangunahing Menu' },
  openingCamera: { id: 'Membuka Kamera...', en: 'Opening Camera...', tl: 'Binubuksan ang Kamera...' },
  cameraNeeded: { id: 'Akses Kamera Diperlukan', en: 'Camera Access Needed', tl: 'Kailangan ang Access sa Kamera' },
  cameraDenied: {
    id: 'Izin kamera belum diberikan. Izinkan akses kamera untuk aplikasi ini di Pengaturan, lalu coba lagi.',
    en: 'Camera permission was not given. Allow camera access for this app in Settings, then try again.',
    tl: 'Hindi pa naibibigay ang pahintulot sa kamera. Payagan ito sa Settings, pagkatapos subukan muli.',
  },
  cameraFailed: {
    id: 'Gagal mengaktifkan kamera perangkat. Tutup aplikasi lain yang memakai kamera, lalu coba lagi.',
    en: 'Could not start the camera. Close other apps that use the camera, then try again.',
    tl: 'Hindi mabuksan ang kamera. Isara ang ibang app na gumagamit ng kamera, pagkatapos subukan muli.',
  },
  tryAgain: { id: 'Coba Lagi', en: 'Try Again', tl: 'Subukan Muli' },
  loadingModel: { id: 'Memuat objek 3D...', en: 'Loading 3D object...', tl: 'Nilo-load ang 3D na bagay...' },
  // Also shown for QR slots printed in advance whose model is not uploaded yet
  modelMissing: {
    id: 'Objek 3D untuk stiker ini segera hadir',
    en: 'The 3D object for this sticker is coming soon',
    tl: 'Malapit nang dumating ang 3D na bagay para sa sticker na ito',
  },
  openingModel: { id: 'Membuka objek 3D...', en: 'Opening 3D object...', tl: 'Binubuksan ang 3D na bagay...' },
  preparingModel: { id: 'Menyiapkan tampilan 3D...', en: 'Preparing the 3D view...', tl: 'Inihahanda ang 3D na tanawin...' },
  modelTooHeavy: {
    id: 'Objek 3D terlalu berat untuk HP ini. Ketuk untuk coba lagi',
    en: 'This 3D object is too heavy for this phone. Tap to try again',
    tl: 'Masyadong mabigat ang 3D na bagay para sa teleponong ito. Pindutin para subukan muli',
  },
  modelOffline: {
    id: 'Model 3D belum terunduh. Sambungkan internet sekali',
    en: 'The 3D model is not downloaded yet. Connect to the internet once',
    tl: 'Hindi pa na-download ang 3D model. Kumonekta sa internet nang isang beses',
  },
  modelFailed: { id: 'Model 3D gagal dimuat', en: 'The 3D model could not be loaded', tl: 'Hindi ma-load ang 3D model' },
  tooDark: { id: 'Terlalu gelap? Nyalakan lampu', en: 'Too dark? Turn on the light', tl: 'Masyadong madilim? Buksan ang ilaw' },
  torchOn: { id: 'Nyalakan lampu', en: 'Turn on light', tl: 'Buksan ang ilaw' },
  torchOff: { id: 'Matikan lampu', en: 'Turn off light', tl: 'Patayin ang ilaw' },
  gestureHint: {
    id: 'Geser untuk memutar · cubit dua jari untuk zoom',
    en: 'Swipe to turn · pinch with two fingers to zoom',
    tl: 'I-swipe para paikutin · i-pinch para mag-zoom',
  },
  resetView: { id: 'Atur ulang', en: 'Reset', tl: 'I-reset' },
  tapToChange: { id: 'Sentuh karakternya untuk ganti gerakan!', en: 'Touch the character to change its move!', tl: 'Pindutin ang karakter para magpalit ng galaw!' },
  // AR safety notice (shown every time the AR camera starts; Google Play Families policy)
  safetyTitle: { id: 'Sebelum Bermain AR', en: 'Before You Play AR', tl: 'Bago Maglaro ng AR' },
  safetyAdult: {
    id: 'Mainkan bersama orang tua atau guru. Orang dewasa sebaiknya selalu mendampingi anak saat memakai AR.',
    en: 'Play together with a parent or teacher. An adult should always supervise children while they use AR.',
    tl: 'Maglaro kasama ang magulang o guro. Dapat laging may nakatatandang nagbabantay sa bata habang gumagamit ng AR.',
  },
  safetySurroundings: {
    id: 'Perhatikan sekitarmu. Duduk di tempat yang aman, jangan berjalan sambil melihat layar, dan jauhi tangga, jalan, serta benda berbahaya.',
    en: 'Watch your surroundings. Sit somewhere safe, do not walk while looking at the screen, and stay away from stairs, roads and dangerous objects.',
    tl: 'Bantayan ang paligid. Umupo sa ligtas na lugar, huwag maglakad habang nakatingin sa screen, at lumayo sa hagdan, kalsada at mapanganib na bagay.',
  },
  safetyBreak: {
    id: 'Istirahatkan mata secara berkala.',
    en: 'Take regular breaks to rest your eyes.',
    tl: 'Magpahinga paminsan-minsan para sa iyong mga mata.',
  },
  safetyOk: { id: 'Saya Mengerti', en: 'I Understand', tl: 'Naiintindihan Ko' },
  // Privacy
  privacyTitle: { id: 'Kebijakan Privasi', en: 'Privacy Policy', tl: 'Patakaran sa Privacy' },
  privacyBody: {
    id: 'Vinu & Veti tidak mengumpulkan data pribadi. Kamera dan sensor gerak hanya dipakai di perangkat untuk membaca stiker QR dan menempatkan karakter 3D; tidak ada gambar yang disimpan atau dikirim. Konten 3D dan suara diunduh dari server kami lalu disimpan di perangkat agar bisa dipakai tanpa internet. Tidak ada iklan, analitik, maupun login untuk anak. Gunakan AR dengan pendampingan orang tua dan perhatikan lingkungan sekitar.',
    en: 'Vinu & Veti does not collect personal data. The camera and motion sensors are only used on the device to read QR stickers and place the 3D characters; no images are stored or sent. 3D content and voices are downloaded from our server and kept on the device so they work offline. There are no ads, no analytics and no login for children. Use AR with parental supervision and stay aware of your surroundings.',
    tl: 'Hindi nangongolekta ang Vinu & Veti ng personal na datos. Ginagamit lamang ang kamera at motion sensor sa device para basahin ang QR sticker at ilagay ang 3D na karakter; walang larawang iniimbak o ipinapadala. Ang 3D na nilalaman at mga boses ay dina-download mula sa aming server at iniimbak sa device para gumana kahit offline. Walang ads, analytics, o login para sa mga bata. Gamitin ang AR na may gabay ng magulang at bantayan ang paligid.',
  },
  close: { id: 'Tutup', en: 'Close', tl: 'Isara' },
} satisfies Record<string, Record<Lang, string>>;

export type StringKey = keyof typeof STRINGS;

const LANG_KEY = 'vv_lang';

export function loadSavedLang(): Lang | null {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === 'id' || v === 'en' || v === 'tl' ? v : null;
  } catch {
    return null;
  }
}

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey) => string;
}

const I18nContext = createContext<I18nValue>({ lang: 'id', setLang: () => {}, t: (k) => STRINGS[k].id });

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => loadSavedLang() ?? 'id');
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      // ignore
    }
    document.documentElement.lang = l === 'tl' ? 'fil' : l;
  }, []);
  const t = useCallback((key: StringKey) => STRINGS[key][lang], [lang]);
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  return useContext(I18nContext);
}
