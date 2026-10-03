import React, { useEffect, useRef, useState, useCallback } from 'react';
import { barcodeScanner, QRAnchor } from '../../services/barcodeScanner';
import { RefreshCw, VideoOff } from 'lucide-react';

interface CameraFeedProps {
  onBarcodeDetected: (barcode: string, anchor: QRAnchor) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

// Pause between scans (ms). A new scan only starts after the previous one finished.
const SCAN_INTERVAL = 90;

export const CameraFeed: React.FC<CameraFeedProps> = ({ onBarcodeDetected, videoRef }) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const onDetectedRef = useRef(onBarcodeDetected);
  onDetectedRef.current = onBarcodeDetected;

  const initCamera = useCallback(async () => {
    if (!videoRef.current) return;
    setIsLoading(true);
    setCameraError(null);
    try {
      await barcodeScanner.startCamera(videoRef.current);
      setIsLoading(false);
    } catch (err: unknown) {
      console.warn('Camera access failed:', err);
      setIsLoading(false);
      const name = err instanceof DOMException ? err.name : '';
      setCameraError(
        name === 'NotAllowedError'
          ? 'Izin kamera belum diberikan. Izinkan akses kamera untuk aplikasi ini di Pengaturan, lalu coba lagi.'
          : 'Gagal mengaktifkan kamera perangkat. Tutup aplikasi lain yang memakai kamera, lalu coba lagi.'
      );
    }
  }, [videoRef]);

  useEffect(() => {
    initCamera();
    return () => barcodeScanner.stopCamera();
  }, [initCamera]);

  // Sequential scan loop (never overlaps, so slow phones don't pile up decode work)
  useEffect(() => {
    if (cameraError || isLoading) return;
    let stopped = false;
    let timer: number | undefined;

    const loop = async () => {
      if (stopped) return;
      const video = videoRef.current;
      if (video) {
        try {
          const result = await barcodeScanner.scanOnce(video);
          if (!stopped && result && result.text.trim()) {
            onDetectedRef.current(result.text, result.anchor);
          }
        } catch {
          // skip frame
        }
      }
      if (!stopped) timer = window.setTimeout(loop, SCAN_INTERVAL);
    };
    loop();

    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [cameraError, isLoading, videoRef]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black z-0">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        disablePictureInPicture
        className="w-full h-full object-cover bg-black"
      />

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-white z-10 p-6 text-center">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="font-semibold text-base mb-1">Membuka Kamera...</h3>
        </div>
      )}

      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-white z-40 p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
            <VideoOff className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-rose-300">Akses Kamera Diperlukan</h3>
          <p className="text-xs text-slate-300 max-w-sm mb-5 leading-relaxed">{cameraError}</p>
          <button
            onClick={() => initCamera()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
};
