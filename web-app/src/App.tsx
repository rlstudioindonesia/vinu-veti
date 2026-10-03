import { useState, useEffect, useCallback, useRef } from 'react';
import { ARQRTarget } from './types/arBook';
import { ARDatabase, resolveAudioSource } from './services/db';
import { syncContentPack } from './services/contentPack';
import { getCloudUser } from './services/cloudPublish';
import { QRAnchor } from './services/barcodeScanner';
import { soundService } from './services/soundService';
import { SplashScreen } from './components/Splash/SplashScreen';
import { WelcomeScreen } from './components/Portal/WelcomeScreen';
import { AdminLoginModal } from './components/Auth/AdminLoginModal';
import { CameraFeed } from './components/ARView/CameraFeed';
import { ThreeCanvas } from './components/ARView/ThreeCanvas';
import { ARScannerOverlay } from './components/ARView/ARScannerOverlay';
import { QRStickerPrintModal } from './components/QRPrint/QRStickerPrintModal';
import { AdminPanel } from './components/Admin/AdminPanel';
import { PrivacyPolicyModal } from './components/Privacy/PrivacyPolicyModal';

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
  const [isLoadingApp, setIsLoadingApp] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<'portal' | 'ar' | 'admin'>('portal');
  const [targets, setTargets] = useState<ARQRTarget[]>([]);
  const [activeTarget, setActiveTarget] = useState<ARQRTarget | null>(null);
  const [qrAnchor, setQrAnchor] = useState<QRAnchor | null>(null);

  const targetsRef = useRef<ARQRTarget[]>([]);
  targetsRef.current = targets;
  const activeTargetRef = useRef<ARQRTarget | null>(null);
  activeTargetRef.current = activeTarget;
  const qrLossTimerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
        await syncContentPack(() => loadTargetsFromDB());
        await loadTargetsFromDB();
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

  const resetAR = useCallback(() => {
    if (qrLossTimerRef.current) window.clearTimeout(qrLossTimerRef.current);
    setActiveTarget(null);
    setQrAnchor(null);
    soundService.stopAudio();
  }, []);

  const handleQRDetected = useCallback((code: string, anchor: QRAnchor) => {
    const clean = normalizeCode(code);
    const matched = targetsRef.current.find((t) => normalizeCode(t.qrCode) === clean);
    if (!matched) return;

    if (activeTargetRef.current?.id !== matched.id) {
      soundService.playScanBeep();
        setActiveTarget(matched);
      if (matched.autoPlayAudio !== false) {
        resolveAudioSource(matched).then((src) => {
          if (src && activeTargetRef.current?.id === matched.id) soundService.playManualAudio(src);
        });
      }
    }
    setQrAnchor(anchor);

    if (qrLossTimerRef.current) window.clearTimeout(qrLossTimerRef.current);
    qrLossTimerRef.current = window.setTimeout(() => setQrAnchor(null), QR_LOST_TIMEOUT);
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
          hasContent={targets.length > 0}
        />
      )}

      {!isLoadingApp && currentView === 'ar' && (
        <>
          <CameraFeed onBarcodeDetected={handleQRDetected} videoRef={videoRef} />
          <ThreeCanvas target={activeTarget} qrAnchor={qrAnchor} />
          <ARScannerOverlay
            activeTarget={qrAnchor ? activeTarget : null}
            onBackToHome={() => {
              resetAR();
              setCurrentView('portal');
            }}
          />
        </>
      )}

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

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setCurrentView('admin');
        }}
        onClose={() => setIsAdminLoginOpen(false)}
      />

      <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
    </div>
  );
}
