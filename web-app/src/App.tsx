import { useState, useEffect, useCallback, useRef } from 'react';
import { ARQRTarget } from './types/arBook';
import { ARDatabase, getModelEntries, resolveAudioSource } from './services/db';
import { syncContentPack } from './services/contentPack';
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

// The model stays visible this long after the QR was last seen (scanner misses some frames)
const QR_LOST_TIMEOUT = 1200;

// Admin tools (create stickers, print QR, export content packs) are left out of the Play Store build.
// They are available in `npm run dev` and in `npm run build:admin` (VITE_ENABLE_ADMIN=true in .env.admin).
const ADMIN_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN === 'true';

function normalizeCode(code: string) {
  return (code || '').trim().toLowerCase();
}

export default function App() {
  const [isLoadingApp, setIsLoadingApp] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<'portal' | 'ar' | 'admin'>('portal');
  const [targets, setTargets] = useState<ARQRTarget[]>([]);
  const [activeTarget, setActiveTarget] = useState<ARQRTarget | null>(null);
  const [qrAnchor, setQrAnchor] = useState<QRAnchor | null>(null);
  const [activeAssetIndex, setActiveAssetIndex] = useState<number>(0);

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
    (async () => {
      await loadTargetsFromDB();
      // Install bundled content and, when online, mirror newer online content for offline use
      try {
        if (await syncContentPack()) await loadTargetsFromDB();
      } catch (e) {
        console.warn('Content sync notice:', e);
      }
    })();
  }, [loadTargetsFromDB]);

  const resetAR = useCallback(() => {
    if (qrLossTimerRef.current) window.clearTimeout(qrLossTimerRef.current);
    setActiveTarget(null);
    setQrAnchor(null);
    setActiveAssetIndex(0);
    soundService.stopAudio();
  }, []);

  const handleQRDetected = useCallback((code: string, anchor: QRAnchor) => {
    const clean = normalizeCode(code);
    const matched = targetsRef.current.find((t) => normalizeCode(t.qrCode) === clean);
    if (!matched) return;

    if (activeTargetRef.current?.id !== matched.id) {
      soundService.playScanBeep();
      setActiveAssetIndex(0);
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

  const handleCycleNextAsset = useCallback(() => {
    const t = activeTargetRef.current;
    if (!t) return;
    const count = getModelEntries(t).length;
    if (count > 1) setActiveAssetIndex((prev) => (prev + 1) % count);
  }, []);

  const openCamera = () => {
    resetAR();
    setCurrentView('ar');
  };

  const handleOpenAdmin = () => {
    if (sessionStorage.getItem('ar_admin_auth') === 'true') {
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
          onOpenAdmin={ADMIN_ENABLED ? handleOpenAdmin : undefined}
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
          hasContent={targets.length > 0}
        />
      )}

      {!isLoadingApp && currentView === 'ar' && (
        <>
          <CameraFeed onBarcodeDetected={handleQRDetected} videoRef={videoRef} />
          <ThreeCanvas
            target={activeTarget}
            qrAnchor={qrAnchor}
            onCycleNextAsset={handleCycleNextAsset}
            activeAssetIndex={activeAssetIndex}
          />
          <ARScannerOverlay
            activeTarget={qrAnchor ? activeTarget : null}
            onBackToHome={() => {
              resetAR();
              setCurrentView('portal');
            }}
          />
        </>
      )}

      {ADMIN_ENABLED && !isLoadingApp && currentView === 'admin' && (
        <AdminPanel
          targets={targets}
          onRefreshTargets={loadTargetsFromDB}
          onClose={() => setCurrentView('portal')}
          onTestCamera={openCamera}
          onOpenPrintModal={() => setIsPrintModalOpen(true)}
        />
      )}

      {ADMIN_ENABLED && isPrintModalOpen && <QRStickerPrintModal targets={targets} onClose={() => setIsPrintModalOpen(false)} />}

      {ADMIN_ENABLED && (
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onSuccess={() => {
            setIsAdminLoginOpen(false);
            setCurrentView('admin');
          }}
          onClose={() => setIsAdminLoginOpen(false)}
        />
      )}

      <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
    </div>
  );
}
