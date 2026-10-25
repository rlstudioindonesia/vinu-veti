import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';
import { ARQRTarget } from './types/arBook';
import { ARDatabase, ownerVoiceOf, secondVoiceOwner, voiceOwners } from './services/db';
import { resolveAudioForAR, resolvePictureForAR, syncContentPack } from './services/contentPack';
import { imageDetector } from './services/imageDetector';
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
import { currentRoute, leaveRoute, pushRoute, replaceRoute } from './utils/route';

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
// Checks for newly published content while the app stays open: at most this often when stickers are
// scanned, and on a timer
const SCAN_UPDATE_CHECK_MS = 10 * 1000;
const PERIODIC_UPDATE_CHECK_MS = 2 * 60 * 1000;
// Opening the developer menu is deliberate: check (almost) every time
const ADMIN_UPDATE_CHECK_MS = 2000;

// Admin tools are in every build. In the Play Store build the entry is hidden (tap the "VINU & VETI"
// badge 7 times) and protected by the admin account (worker/index.js). `npm run dev` and `npm run build:admin`
// also show a visible "Guru & Ortu" button.
const SHOW_ADMIN_BUTTON = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN === 'true';

/** Developer mode is open to this browser: admin account still logged in, or unlocked this session. */
function isAdminAuthorized(): boolean {
  try {
    return !!getCloudUser() || sessionStorage.getItem('ar_admin_auth') === 'true';
  } catch {
    return false;
  }
}

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
  // Opened screen from the address (#/admin…): a refresh in developer mode stays there while the
  // admin login is still valid. The camera is never reopened by a refresh (needs a tap + safety notice).
  const [currentView, setCurrentView] = useState<'portal' | 'ar' | 'admin'>(() =>
    currentRoute().startsWith('/admin') && isAdminAuthorized() ? 'admin' : 'portal'
  );
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
  // Set by the content sync below: checks the online list for updates (throttled)
  const checkUpdatesRef = useRef<((minGapMs?: number) => void) | null>(null);

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

  // Opening the developer menu: fetch what other devices published meanwhile right away
  useEffect(() => {
    if (currentView === 'admin') checkUpdatesRef.current?.(ADMIN_UPDATE_CHECK_MS);
  }, [currentView]);

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
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(
    () => currentRoute() === '/admin/print' && isAdminAuthorized()
  );
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
    const sync = async (force = false, minGapMs = 60000) => {
      if (running) {
        if (force) again = true;
        return;
      }
      if (!force && Date.now() - lastRun < minGapMs) return;
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
    // A model replaced and published while this app stays open must show up too: check when a sticker
    // is scanned (see handleQRDetected) and every few minutes (the online list is a small file)
    checkUpdatesRef.current = (minGapMs = SCAN_UPDATE_CHECK_MS) => sync(false, minGapMs);
    const periodic = window.setInterval(() => {
      if (document.visibilityState === 'visible') sync(false, PERIODIC_UPDATE_CHECK_MS - 5000);
    }, PERIODIC_UPDATE_CHECK_MS);
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      checkUpdatesRef.current = null;
      window.clearInterval(periodic);
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

  // Picture tracking: the stickers' pictures are prepared once the camera view was opened (not at
  // start-up: it takes a moment of CPU per picture), and again whenever a picture changes
  const picturesStartedRef = useRef(false);
  useEffect(() => {
    if (currentView === 'ar') picturesStartedRef.current = true;
    if (!picturesStartedRef.current) return;
    imageDetector.setPictures(
      targets
        .filter((t) => t.picture)
        .map((t) => ({
          code: t.qrCode,
          key: `${t.id}|${t.picture!.sha ?? ''}|${t.updatedAt}`,
          load: async () => {
            const src = await resolvePictureForAR(t);
            if (!src) return null;
            if (src instanceof Blob) return src;
            if (typeof src === 'string') return (await fetch(src)).blob();
            return new Blob([src]);
          },
        }))
    );
  }, [targets, currentView]);

  // How often the main animation was shown again by a touch (its voice 1 and voice 2 take turns)
  const mainTurnRef = useRef(0);

  const resetAR = useCallback(() => {
    if (qrLossTimerRef.current) window.clearTimeout(qrLossTimerRef.current);
    mainTurnRef.current = 0;
    setActiveTarget(null);
    setQrAnchor(null);
    soundService.stopAudio();
  }, []);

  const handleQRDetected = useCallback((code: string, anchor: QRAnchor) => {
    if (!safetyAcceptedRef.current) return; // the safety notice is still on screen
    const clean = normalizeCode(code);
    const matched = targetsByCodeRef.current.get(clean);
    if (!matched) return;
    // Is there a newer version of the content (e.g. its model was just replaced and published)?
    checkUpdatesRef.current?.();

    if (activeTargetRef.current?.id !== matched.id) {
      soundService.playScanBeep();
      // Fetch (and keep on the phone) the narration while the model loads, so it is ready when the
      // character appears and also plays offline next time
      resolveAudioForAR(matched, langRef.current).catch(() => undefined);
      // …and the other voices (2nd voice, extra animations), so a touch answers right away
      voiceOwners(matched)
        .slice(1)
        .forEach((owner) => ownerVoiceOf(matched, owner, langRef.current) && resolveAudioForAR(matched, langRef.current, owner).catch(() => undefined));
      mainTurnRef.current = 0;
        setActiveTarget(matched);
    }
    setQrAnchor(anchor);

    if (qrLossTimerRef.current) window.clearTimeout(qrLossTimerRef.current);
    qrLossTimerRef.current = window.setTimeout(() => setQrAnchor(null), QR_LOST_TIMEOUT);
  }, []);


  /** Plays one voice of the current sticker (main, 2nd voice or an extra animation's own voice). */
  const playVoice = useCallback((t: ARQRTarget, owner: string) => {
    resolveAudioForAR(t, langRef.current, owner).then((src) => {
      if (src && activeTargetRef.current?.id === t.id) soundService.playManualAudio(src);
    });
  }, []);

  /** The main animation's voice for its current turn: voice 2 every other time, when there is one. */
  const mainVoiceOwner = (t: ARQRTarget) => {
    const second = secondVoiceOwner(t.id);
    return mainTurnRef.current % 2 === 1 && ownerVoiceOf(t, second, langRef.current) ? second : t.id;
  };

  // Narration starts when the character actually appears on the AR screen, in the chosen language:
  // the voice of the animation shown (an extra animation without its own voice: the main voice)
  const handleModelShown = useCallback(
    (variant: number) => {
      const t = activeTargetRef.current;
      if (!t || t.autoPlayAudio === false) return;
      const asset = variant > 0 ? t.assets?.[variant - 1] : undefined;
      playVoice(t, asset && ownerVoiceOf(t, asset.id, langRef.current) ? asset.id : mainVoiceOwner(t));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playVoice]
  );

  // Touching the character: an extra animation with its own voice says it; back on the main
  // animation, voice 1 and voice 2 take turns. Without those voices nothing changes (as before).
  const handleCharacterTap = useCallback(
    (variant: number, changed: boolean): boolean => {
      const t = activeTargetRef.current;
      if (!t || t.autoPlayAudio === false) return false;
      if (variant === 0) {
        if (!ownerVoiceOf(t, secondVoiceOwner(t.id), langRef.current)) return false;
        mainTurnRef.current++;
        playVoice(t, mainVoiceOwner(t));
        return true;
      }
      const asset = t.assets?.[variant - 1];
      if (!changed || !asset || !ownerVoiceOf(t, asset.id, langRef.current)) return false;
      playVoice(t, asset.id);
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playVoice]
  );

  const showCamera = useCallback(() => {
    resetAR();
    // Every time AR starts: show the safety notice first (supervision, surroundings)
    setSafetyAccepted(false);
    setCurrentView('ar');
  }, [resetAR]);

  const openCamera = () => {
    // Called from a tap: iPhone/iPad need it to allow the motion sensor and later voice playback
    requestMotionPermission();
    soundService.unlock();
    pushRoute('/ar');
    showCamera();
  };

  const openAdmin = () => {
    pushRoute('/admin');
    setCurrentView('admin');
  };

  const handleOpenAdmin = () => {
    if (isAdminAuthorized()) openAdmin();
    else setIsAdminLoginOpen(true);
  };

  // Back from a screen (the app's own back buttons): to the screen it was opened from
  const backToPortal = () => {
    if (!leaveRoute('/')) {
      resetAR();
      setCurrentView('portal');
    }
  };

  // Browser / Android back and forward buttons: show the screen of the address
  useEffect(() => {
    const onPopState = () => {
      const route = currentRoute();
      setIsPrintModalOpen(route === '/admin/print');
      if (route.startsWith('/admin')) {
        if (isAdminAuthorized()) setCurrentView('admin');
        else {
          replaceRoute('/');
          setCurrentView('portal');
        }
      } else if (route === '/ar') {
        showCamera();
      } else {
        resetAR();
        setCurrentView('portal');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [resetAR, showCamera]);

  // An address that cannot be shown after a refresh (camera, admin without login): home screen
  useEffect(() => {
    const route = currentRoute();
    if (route === '/ar' || (route.startsWith('/admin') && !isAdminAuthorized())) replaceRoute('/');
  }, []);

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
            {safetyAccepted && <ThreeCanvas target={activeTarget} upcoming={upcoming} qrAnchor={qrAnchor} onModelShown={handleModelShown} onCharacterTap={handleCharacterTap} />}
          </Suspense>
          {!safetyAccepted && <ARSafetyNotice onAccept={() => setSafetyAccepted(true)} />}
          <ARScannerOverlay
            activeTarget={qrAnchor ? activeTarget : null}
            onBackToHome={backToPortal}
          />
        </>
      )}

      <Suspense fallback={null}>
        {!isLoadingApp && currentView === 'admin' && (
          <AdminPanel
            targets={targets}
            onRefreshTargets={loadTargetsFromDB}
            onClose={backToPortal}
            onTestCamera={openCamera}
            onOpenPrintModal={() => {
              pushRoute('/admin/print');
              setIsPrintModalOpen(true);
            }}
          />
        )}

        {isPrintModalOpen && (
          <QRStickerPrintModal
            targets={targets}
            onClose={() => {
              if (!leaveRoute('/admin')) setIsPrintModalOpen(false);
            }}
          />
        )}

        {isAdminLoginOpen && (
          <AdminLoginModal
            isOpen
            onSuccess={() => {
              setIsAdminLoginOpen(false);
              openAdmin();
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
