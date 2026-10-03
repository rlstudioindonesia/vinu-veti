import React, { useState, useEffect, useCallback } from 'react';
import { ARQRTarget } from './types/arBook';
import { ARDatabase } from './services/db';
import { realtimeSync } from './services/realtimeSync';
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

export default function App() {
  const [isLoadingApp, setIsLoadingApp] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<'portal' | 'ar' | 'admin'>('portal');
  const [targets, setTargets] = useState<ARQRTarget[]>([]);
  const [activeTarget, setActiveTarget] = useState<ARQRTarget | null>(null);
  const [qrAnchor, setQrAnchor] = useState<QRAnchor | null>(null);
  const [activeAssetIndex, setActiveAssetIndex] = useState<number>(0);

  // Modals
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  // Load targets from IndexedDB / LocalStorage
  const loadTargetsFromDB = useCallback(async () => {
    try {
      await ARDatabase.init();
      const all = await ARDatabase.getAllTargets();
      setTargets(all);
    } catch (e) {
      console.warn('DB load notice:', e);
    }
  }, []);

  useEffect(() => {
    loadTargetsFromDB();

    // Real-time synchronization listener across tabs
    const unsubscribeSync = realtimeSync.subscribe(async () => {
      const fresh = await ARDatabase.getAllTargets();
      setTargets(fresh);
      setActiveTarget((prev) => {
        if (!prev) return null;
        return fresh.find((t) => t.id === prev.id) || prev;
      });
    });

    return () => {
      unsubscribeSync();
    };
  }, [loadTargetsFromDB]);

  // Handle QR Scan from Real Camera Feed
  const handleQRDetected = useCallback(
    async (code: string, anchor?: QRAnchor) => {
      if (anchor) {
        setQrAnchor(anchor);
      }
      const matched = await ARDatabase.findTargetByBarcode(code);
      if (matched) {
        if (!activeTarget || activeTarget.id !== matched.id) {
          soundService.playScanBeep();
          setActiveAssetIndex(0);
          // Auto-play manual audio if uploaded
          if (matched.hasCustomAudio && matched.autoPlayAudio !== false) {
            ARDatabase.getAudioBlob(matched.id).then((blob) => {
              if (blob) {
                soundService.playManualAudio(blob);
              }
            });
          }
        }
        setActiveTarget(matched);
      }
    },
    [activeTarget]
  );

  // Cycle to next asset when touching 3D model
  const handleCycleNextAsset = () => {
    if (!activeTarget?.assets || activeTarget.assets.length <= 1) return;
    setActiveAssetIndex((prev) => (prev + 1) % activeTarget.assets!.length);
  };

  // Preview AR from admin / print sheet
  const handleProjectTargetDirectly = (target: ARQRTarget) => {
    setQrAnchor({
      x: 440,
      y: 260,
      width: 400,
      height: 400,
      videoWidth: 1280,
      videoHeight: 720,
    });
    setActiveTarget(target);
    setActiveAssetIndex(0);
    soundService.playScanBeep();
    if (target.hasCustomAudio && target.autoPlayAudio !== false) {
      ARDatabase.getAudioBlob(target.id).then((blob) => {
        if (blob) {
          soundService.playManualAudio(blob);
        }
      });
    }
  };

  const handleOpenAdmin = () => {
    const isAuth = sessionStorage.getItem('ar_admin_auth') === 'true';
    if (isAuth) {
      setCurrentView('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* 1. Initial Loading Screen */}
      {isLoadingApp && (
        <SplashScreen onLoaded={() => setIsLoadingApp(false)} />
      )}

      {/* 2. Simple Home Screen (Mulai Kamera, Admin & Privasi) */}
      {!isLoadingApp && currentView === 'portal' && (
        <WelcomeScreen
          onStartCamera={() => setCurrentView('ar')}
          onOpenAdmin={handleOpenAdmin}
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
          targets={targets}
          onPreviewTarget={(t) => {
            handleProjectTargetDirectly(t);
            setCurrentView('ar');
          }}
        />
      )}

      {/* 3. Real-World Camera Stream (Active in AR mode) */}
      {!isLoadingApp && currentView === 'ar' && (
        <>
          <CameraFeed
            onBarcodeDetected={handleQRDetected}
            facingMode="environment"
            isScanningActive={true}
          />
          <ThreeCanvas
            target={activeTarget}
            qrAnchor={qrAnchor}
            onCycleNextAsset={handleCycleNextAsset}
            activeAssetIndex={activeAssetIndex}
          />
          <ARScannerOverlay
            activeTarget={activeTarget}
            onBackToHome={() => {
              setActiveTarget(null);
              setQrAnchor(null);
              soundService.stopAudio();
              setCurrentView('portal');
            }}
          />
        </>
      )}

      {/* 4. Admin Panel */}
      {!isLoadingApp && currentView === 'admin' && (
        <AdminPanel
          targets={targets}
          onRefreshTargets={loadTargetsFromDB}
          onClose={() => setCurrentView('portal')}
          onPreviewAR={(t) => {
            handleProjectTargetDirectly(t);
            setCurrentView('ar');
          }}
          onOpenPrintModal={() => setIsPrintModalOpen(true)}
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        />
      )}

      {/* 5. Print QR Stickers Modal */}
      {isPrintModalOpen && (
        <QRStickerPrintModal
          targets={targets}
          onSelectTargetForAR={(t) => {
            setIsPrintModalOpen(false);
            handleProjectTargetDirectly(t);
            setCurrentView('ar');
          }}
          onOpenCreate={() => {
            setIsPrintModalOpen(false);
          }}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* 6. Admin Authentication Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setCurrentView('admin');
        }}
        onClose={() => setIsAdminLoginOpen(false)}
      />

      {/* 7. Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}
