import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';
import { ARQRTarget } from './types/arBook';
import { ARDatabase, resolveAudioSource } from './services/db';
import { syncContentPack } from './services/contentPack';
import { getCloudUser } from './services/cloudPublish';
import { QRAnchor } from './services/barcodeScanner';
import { soundService } from './services/soundService';
import { SplashScreen } from './components/Splash/SplashScreen';
import { WelcomeScreen } from './components/Portal/WelcomeScreen';
import { ARScannerOverlay } from './components/ARView/ARScannerOverlay';
import { PrivacyPolicyModal } from './components/Privacy/PrivacyPolicyModal';
import { LanguagePicker } from './components/Portal/LanguagePicker';
import type { ContentStatus } from './components/Portal/WelcomeScreen';
import { loadSavedLang, useI18n } from './i18n';

// Loaded on demand so the app starts fast: AR (three.js + QR scanner) is fetched in the background
// right after the splash screen, the admin tools only when they are opened.
const loadCameraFeed = () => import('./components/ARView/CameraFeed');
const loadThreeCanvas = () => import('./components/ARView/ThreeCanvas');
const CameraFeed = lazy(() => loadCameraFeed().then((m) => ({ default: m.CameraFeed })));
const ThreeCanvas = lazy(() => loadThreeCanvas().then((m) => ({ default: m.ThreeCanvas })));
const AdminPanel = lazy(() => import('./components/Admin/AdminPanel').then((m) => ({ default: m.AdminPanel })));
const AdminLoginModal = lazy(() => import('./components/Auth/AdminLoginModal').then((m) => ({ default: m.AdminLoginModal })));
const QRStickerPrintModal = lazy(() =>
  import('./components/QRPrint/QRStickerPrintModal').then((m) => ({ default: m.QRStickerPrintModal }))
);

// The AR session for a sticker ends this long after the QR was last seen. While the camera moves the
// scanner often misses the QR (motion blur); ThreeCanvas keeps the model on the sticker using the
// gyroscope in the meantime.
const QR_LOST_TIMEOUT = 2500;

// Admin tools are in every build. In the Play Store build the entry is hidden (tap the "VINU & VETI"
// badge 7 times) and protected by the Supabase admin account. `npm run dev` and `npm run build:admin`
// also show a visible "Guru & Ortu" button.
const SHOW_ADMIN_BUTTON = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN === 'true';

function normalizeCode(code: string) {
  return (code || '').trim().toLowerCase();
}

export default function App() {
  const { lang } = useI18n();
  const langRef = useRef(lang);
  langRef.current = lang;
  // First launch: ask for the language once (can be changed later from the home screen)
  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = useState<boolean>(() => loadSavedLang() === null);
  const [isLoadingApp, setIsLoadingApp] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<'portal' | 'ar' | 'admin'>('portal');
  const [targets, setTargets] = useState<ARQRTarget[]>([]);
  const [activeTarget, setActiveTarget] = useState<ARQRTarget | null>(null);
  const [qrAnchor, setQrAnchor] = useState<QRAnchor | null>(null);

  // Index: normalised QR code → sticker, so each camera read is a single lookup
  const targetsByCode = useMemo(() => new Map(targets.map((t) => [normalizeCode(t.qrCode), t])), [targets]);
  const targetsByCodeRef = useRef(targetsByCode);
  targetsByCodeRef.current = targetsByCode;
  const activeTargetRef = useRef<ARQRTarget | null>(null);
  activeTargetRef.current = activeTarget;
  const qrLossTimerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Mirroring of online content to the phone (shown on the home screen)
  const [contentStatus, setContentStatus] = useState<ContentStatus>({ phase: 'idle', done: 0, total: 0 });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  const loadTargetsFromDB = useCallback(async () => {
    try {
      await ARDatabase.init();
      setTargets(await ARDatabase.getAllTargets());
    } catch (e) {
      console.warn('DB load notice:', e);
    }
  }, []);

  useEffect(() => {
    // Install bundled content and mirror newer online content (only changed files) for offline use.
    // Runs at start, when the connection comes back and when the app returns to the foreground.
    let running = false;
    let lastRun = 0;
    const sync = async () => {
      if (running || Date.now() - lastRun < 60000) return;
      running = true;
      lastRun = Date.now();
      try {
        const result = await syncContentPack(
          () => loadTargetsFromDB(),
          (p) => setContentStatus({ phase: 'downloading', ...p })
        );
        await loadTargetsFromDB();
        if (result.failed > 0) setContentStatus({ phase: 'partial', done: 0, total: 0 });
        else if (result.downloaded > 0) {
          setContentStatus({ phase: 'ready', done: 0, total: 0 });
          window.setTimeout(() => setContentStatus((c) => (c.phase === 'ready' ? { phase: 'idle', done: 0, total: 0 } : c)), 5000);
        } else setContentStatus((c) => (c.phase === 'downloading' ? { phase: 'idle', done: 0, total: 0 } : c));
      } catch (e) {
        console.warn('Content sync notice:', e);
      } finally {
        running = false;
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') sync();
    };

    loadTargetsFromDB().then(sync);
    window.addEventListener('online', sync);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('online', sync);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [loadTargetsFromDB]);

  // Fetch the AR code in the background once the home screen is up, so "Open camera" is instant
  useEffect(() => {
    if (isLoadingApp) return;
    const id = window.setTimeout(() => {
      loadCameraFeed().catch(() => undefined);
      loadThreeCanvas().catch(() => undefined);
    }, 300);
    return () => window.clearTimeout(id);
  }, [isLoadingApp]);

  const resetAR = useCallback(() => {
    if (qrLossTimerRef.current) window.clearTimeout(qrLossTimerRef.current);
    setActiveTarget(null);
    setQrAnchor(null);
    soundService.stopAudio();
  }, []);

  const handleQRDetected = useCallback((code: string, anchor: QRAnchor) => {
    const clean = normalizeCode(code);
    const matched = targetsByCodeRef.current.get(clean);
    if (!matched) return;

    if (activeTargetRef.current?.id !== matched.id) {
      soundService.playScanBeep();
        setActiveTarget(matched);
    }
    setQrAnchor(anchor);

    if (qrLossTimerRef.current) window.clearTimeout(qrLossTimerRef.current);
    qrLossTimerRef.current = window.setTimeout(() => setQrAnchor(null), QR_LOST_TIMEOUT);
  }, []);


  // Narration starts when the character actually appears on the AR screen, in the chosen language
  const handleModelShown = useCallback(() => {
    const t = activeTargetRef.current;
    if (!t || t.autoPlayAudio === false) return;
    resolveAudioSource(t, langRef.current).then((src) => {
      if (src && activeTargetRef.current?.id === t.id) soundService.playManualAudio(src);
    });
  }, []);

  const openCamera = () => {
    resetAR();
    setCurrentView('ar');
  };

  const handleOpenAdmin = () => {
    if (getCloudUser() || sessionStorage.getItem('ar_admin_auth') === 'true') {
      setCurrentView('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {isLoadingApp && <SplashScreen onLoaded={() => setIsLoadingApp(false)} />}

      {!isLoadingApp && currentView === 'portal' && (
        <WelcomeScreen
          onStartCamera={openCamera}
          onOpenAdmin={handleOpenAdmin}
          showAdminButton={SHOW_ADMIN_BUTTON}
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
          onOpenLanguage={() => setIsLanguagePickerOpen(true)}
          hasContent={targets.length > 0}
          contentStatus={contentStatus}
        />
      )}

      {!isLoadingApp && currentView === 'ar' && (
        <>
          <Suspense fallback={null}>
            <CameraFeed onBarcodeDetected={handleQRDetected} videoRef={videoRef} />
            <ThreeCanvas target={activeTarget} qrAnchor={qrAnchor} onModelShown={handleModelShown} />
          </Suspense>
          <ARScannerOverlay
            activeTarget={qrAnchor ? activeTarget : null}
            onBackToHome={() => {
              resetAR();
              setCurrentView('portal');
            }}
          />
        </>
      )}

      <Suspense fallback={null}>
        {!isLoadingApp && currentView === 'admin' && (
          <AdminPanel
            targets={targets}
            onRefreshTargets={loadTargetsFromDB}
            onClose={() => setCurrentView('portal')}
            onTestCamera={openCamera}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        )}

        {isPrintModalOpen && <QRStickerPrintModal targets={targets} onClose={() => setIsPrintModalOpen(false)} />}

        {isAdminLoginOpen && (
          <AdminLoginModal
            isOpen
            onSuccess={() => {
              setIsAdminLoginOpen(false);
              setCurrentView('admin');
            }}
            onClose={() => setIsAdminLoginOpen(false)}
          />
        )}
      </Suspense>

      <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />

      {!isLoadingApp && isLanguagePickerOpen && <LanguagePicker onDone={() => setIsLanguagePickerOpen(false)} />}
    </div>
  );
}
