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
  modelMissing: { id: 'Model 3D belum diunggah untuk stiker ini', en: 'No 3D model uploaded for this sticker yet', tl: 'Wala pang 3D model para sa sticker na ito' },
  modelFailed: { id: 'Model 3D gagal dimuat', en: 'The 3D model could not be loaded', tl: 'Hindi ma-load ang 3D model' },
  tapToChange: { id: 'Sentuh karakternya untuk ganti gerakan!', en: 'Touch the character to change its move!', tl: 'Pindutin ang karakter para magpalit ng galaw!' },
  // Privacy
  privacyTitle: { id: 'Kebijakan Privasi', en: 'Privacy Policy', tl: 'Patakaran sa Privacy' },
  privacyBody: {
    id: 'Vinu & Veti tidak mengumpulkan data pribadi. Kamera hanya dipakai di perangkat untuk membaca stiker QR dan tidak ada gambar yang disimpan atau dikirim. Konten 3D dan suara diunduh dari server kami lalu disimpan di perangkat agar bisa dipakai tanpa internet. Aplikasi tidak memuat iklan dan tidak meminta login untuk anak.',
    en: 'Vinu & Veti does not collect personal data. The camera is only used on the device to read QR stickers; no images are stored or sent. 3D content and voices are downloaded from our server and kept on the device so they work offline. The app has no ads and does not ask children to log in.',
    tl: 'Hindi nangongolekta ang Vinu & Veti ng personal na datos. Ginagamit lamang ang kamera sa device para basahin ang QR sticker; walang larawang iniimbak o ipinapadala. Ang 3D na nilalaman at mga boses ay dina-download mula sa aming server at iniimbak sa device para gumana kahit offline. Walang ads ang app at hindi nito pinapa-login ang mga bata.',
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
