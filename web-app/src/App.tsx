import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';
import { ARQRTarget } from './types/arBook';
import { ARDatabase } from './services/db';
import { resolveAudioForAR, syncContentPack } from './services/contentPack';
import { getCloudUser } from './services/cloudPublish';
import { QRAnchor } from './services/barcodeScanner';
import { soundService } from './services/soundService';
import { SplashScreen } from './components/Splash/SplashScreen';
import { WelcomeScreen } from './components/Portal/WelcomeScreen';
import { ARScannerOverlay } from './components/ARView/ARScannerOverlay';
import { PrivacyPolicyModal } from './components/Privacy/PrivacyPolicyModal';
import { LanguagePicker } from './components/Portal/LanguagePicker';
import { ARSafetyNotice } from './components/ARView/ARSafetyNotice';
import type { ContentStatus } from './components/Portal/WelcomeScreen';
import { loadSavedLang, useI18n } from './i18n';
import { requestMotionPermission } from './utils/platform';

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
// Content files that failed to download are tried again after this long while the app stays open
const SYNC_RETRY_MS = 2 * 60 * 1000;

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
  const [safetyAccepted, setSafetyAccepted] = useState<boolean>(false);
  const safetyAcceptedRef = useRef(false);
  safetyAcceptedRef.current = safetyAccepted;
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

  // Stickers to prepare while one is shown: the next two in book order and the previous one
  // (children turn pages forward, sometimes back)
  const upcoming = useMemo(() => {
    const i = activeTarget ? targets.findIndex((t) => t.id === activeTarget.id) : -1;
    if (i < 0) return [];
    return [targets[i + 1], targets[i + 2], targets[i - 1]].filter((t): t is ARQRTarget => !!t);
  }, [activeTarget, targets]);

  // App sent to the background (phone locked, other app): the narration stops instead of playing on
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') soundService.stopAudio();
    };
    const onPause = () => soundService.stopAudio();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('vv-app-pause', onPause);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('vv-app-pause', onPause);
    };
  }, []);

  // Content updated while a sticker is shown (sync finished): switch to its new version, so the
  // updated model is loaded; a sticker that was unpublished is closed
  useEffect(() => {
    const active = activeTargetRef.current;
    if (!active) return;
    const fresh = targets.find((t) => t.id === active.id);
    if (!fresh) {
      setActiveTarget(null);
      setQrAnchor(null);
    } else if (fresh.updatedAt !== active.updatedAt) {
      setActiveTarget(fresh);
    }
  }, [targets]);
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
    // A request while a sync runs (e.g. the connection came back) is not lost: it runs right after
    let again = false;
    let retryTimer: number | undefined;
    const sync = async (force = false) => {
      if (running) {
        if (force) again = true;
        return;
      }
      if (!force && Date.now() - lastRun < 60000) return;
      window.clearTimeout(retryTimer);
      running = true;
      lastRun = Date.now();
      let failed = 0;
      try {
        const result = await syncContentPack(
          () => loadTargetsFromDB(),
          (p) => setContentStatus({ phase: 'downloading', ...p })
        );
        await loadTargetsFromDB();
        failed = result.failed;
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
      if (again) {
        again = false;
        sync(true);
      } else if (failed > 0) {
        // Some files could not be downloaded: try again in a while, also while the app stays open
        retryTimer = window.setTimeout(() => sync(true), SYNC_RETRY_MS);
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') sync();
    };
    // Back online: always sync now (the connection was missing, so the last attempt did nothing)
    const onOnline = () => sync(true);

    loadTargetsFromDB().then(() => sync(true));
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(retryTimer);
      window.removeEventListener('online', onOnline);
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
    if (!safetyAcceptedRef.current) return; // the safety notice is still on screen
    const clean = normalizeCode(code);
    const matched = targetsByCodeRef.current.get(clean);
    if (!matched) return;

    if (activeTargetRef.current?.id !== matched.id) {
      soundService.playScanBeep();
      // Fetch (and keep on the phone) the narration while the model loads, so it is ready when the
      // character appears and also plays offline next time
      resolveAudioForAR(matched, langRef.current).catch(() => undefined);
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
    resolveAudioForAR(t, langRef.current).then((src) => {
      if (src && activeTargetRef.current?.id === t.id) soundService.playManualAudio(src);
    });
  }, []);

  const openCamera = () => {
    // Called from a tap: iPhone/iPad need it to allow the motion sensor and later voice playback
    requestMotionPermission();
    soundService.unlock();
    resetAR();
    // Every time AR starts: show the safety notice first (supervision, surroundings)
    setSafetyAccepted(false);
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
            {/* Characters (and their voices) only appear after the safety notice is accepted */}
            {safetyAccepted && <ThreeCanvas target={activeTarget} upcoming={upcoming} qrAnchor={qrAnchor} onModelShown={handleModelShown} />}
          </Suspense>
          {!safetyAccepted && <ARSafetyNotice onAccept={() => setSafetyAccepted(true)} />}
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
