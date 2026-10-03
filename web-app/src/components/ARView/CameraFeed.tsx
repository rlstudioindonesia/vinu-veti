import React, { useEffect, useRef, useState, useCallback } from 'react';
import { barcodeScanner, QRAnchor } from '../../services/barcodeScanner';
import { RefreshCw, VideoOff } from 'lucide-react';

interface CameraFeedProps {
  onBarcodeDetected: (barcode: string, anchor?: QRAnchor) => void;
  facingMode: 'environment' | 'user';
  isScanningActive: boolean;
  onCameraReady?: () => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  onBarcodeDetected,
  facingMode,
  isScanningActive,
  onCameraReady,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const scanIntervalRef = useRef<number | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const lastScannedCodeRef = useRef<string>('');

  const initCamera = useCallback(async () => {
    if (!videoRef.current) return;
    setIsLoading(true);
    setCameraError(null);
    try {
      await barcodeScanner.startCamera(videoRef.current, facingMode);
      setIsLoading(false);
      if (onCameraReady) onCameraReady();
    } catch (err: unknown) {
      console.warn('Camera access failed:', err);
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Kamera tidak dapat diakses';
      setCameraError(
        errorMsg.includes('Permission denied') || errorMsg.includes('NotAllowedError')
          ? 'Izin kamera belum diizinkan. Silakan beri izin akses kamera di perangkat Anda.'
          : 'Gagal mengaktifkan kamera perangkat. Pastikan izin kamera aktif.'
      );
    }
  }, [facingMode, onCameraReady]);

  // Start / re-initialize camera when facingMode changes
  useEffect(() => {
    initCamera();
    return () => {
      barcodeScanner.stopCamera();
    };
  }, [initCamera]);

  // Frame scanner loop
  useEffect(() => {
    if (!isScanningActive || cameraError || isLoading) {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      return;
    }

    const runScan = async () => {
      if (!videoRef.current) return;
      try {
        const result = await barcodeScanner.scanOnce(videoRef.current);
        if (result && result.text) {
          lastScannedTimeRef.current = Date.now();
          lastScannedCodeRef.current = result.text;
          onBarcodeDetected(result.text, result.anchor);
        }
      } catch {
        // Frame decoding skipped
      }
    };

    // Scan every 120ms (approx 8-10 scans/sec) for smooth battery-friendly scanning on mobile
    scanIntervalRef.current = window.setInterval(runScan, 120);
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [isScanningActive, cameraError, isLoading, onBarcodeDetected]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black z-0">
      {/* Real-life camera feed video */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="w-full h-full object-cover"
        style={{
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
        }}
      />

      {/* Loading state indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm text-white z-10 p-6 text-center">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="font-semibold text-base mb-1">Menghubungkan Kamera Dunia Nyata...</h3>
          <p className="text-xs text-slate-400 max-w-xs">
            Mengaktifkan streaming video langsung untuk pengalaman Augmented Reality.
          </p>
        </div>
      )}

      {/* Camera permission / hardware error fallback */}
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md text-white z-10 p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
            <VideoOff className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-rose-300">Akses Kamera Diperlukan</h3>
          <p className="text-xs text-slate-300 max-w-sm mb-5 leading-relaxed">
            {cameraError}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => initCamera()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Hubungkan Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
