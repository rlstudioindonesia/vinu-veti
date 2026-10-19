import React, { useEffect, useRef, useState, useCallback } from 'react';
import { barcodeScanner, QRAnchor } from '../../services/barcodeScanner';
import { qrTracker } from '../../services/qrTracker';
import { imageDetector, PICTURE_UNIT } from '../../services/imageDetector';
import { RefreshCw, VideoOff } from 'lucide-react';
import { useI18n } from '../../i18n';

interface CameraFeedProps {
  onBarcodeDetected: (barcode: string, anchor: QRAnchor) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

// Pause between scans (ms). A new scan only starts after the previous one finished.
const SCAN_INTERVAL = 30;
// While the tracker follows the QR every frame, decoding is only needed now and then (to confirm
// the QR and correct drift); fewer decodes leave the phone's CPU free for smooth tracking.
const SCAN_INTERVAL_TRACKING = 250;
// Sticker pictures: looked for this often (ms between searches) while nothing is tracked, and while
// a picture is tracked only now and then, to confirm it and correct drift
const PICTURE_INTERVAL = 120;
const PICTURE_INTERVAL_TRACKING = 900;

function sameCode(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onBarcodeDetected, videoRef }) => {
  const { t } = useI18n();
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
        name === 'NotAllowedError' ? 'denied' : 'failed'
      );
    }
  }, [videoRef]);

  useEffect(() => {
    initCamera();
    return () => barcodeScanner.stopCamera();
  }, [initCamera]);

  // Phone locked / app sent to the background: Android takes the camera away, and when the app comes
  // back the picture stays black or frozen. The camera is released while hidden (also saves battery
  // and turns the torch off) and opened again on return; same when the camera stops by itself
  // (another app took it).
  useEffect(() => {
    // The Android app also reports it directly (vv-app-pause / vv-app-resume), as not every WebView
    // marks the page hidden when the app goes to the background
    let hidden = document.visibilityState === 'hidden';
    const pause = () => {
      if (hidden) return;
      hidden = true;
      barcodeScanner.stopCamera();
    };
    const resume = () => {
      if (!hidden) return;
      hidden = false;
      initCamera();
    };
    const onVisibility = () => (document.visibilityState === 'hidden' ? pause() : resume());
    const video = videoRef.current;
    const watchTrack = () => {
      const stream = video?.srcObject as MediaStream | null;
      stream?.getVideoTracks().forEach((track) => {
        track.onended = () => {
          if (!hidden) initCamera();
        };
      });
    };
    video?.addEventListener('loadedmetadata', watchTrack);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('vv-app-pause', pause);
    window.addEventListener('vv-app-resume', resume);
    return () => {
      video?.removeEventListener('loadedmetadata', watchTrack);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('vv-app-pause', pause);
      window.removeEventListener('vv-app-resume', resume);
    };
  }, [initCamera, videoRef]);

  // Sequential scan loop (never overlaps, so slow phones don't pile up decode work)
  useEffect(() => {
    if (cameraError || isLoading) return;
    let stopped = false;
    let timer: number | undefined;

    const video = videoRef.current;
    if (video) qrTracker.start(video);
    // Code of the sticker whose picture (not its QR) the tracker follows. The QR and the picture of
    // the same sticker do not take turns: they give different squares, the model would jump.
    let pictureCode: string | null = null;

    const loop = async () => {
      if (stopped) return;
      const video = videoRef.current;
      if (video) {
        try {
          const tracked = qrTracker.isTracking() ? qrTracker.latest : null;
          if (tracked) barcodeScanner.hintRegion(tracked.anchor);
          const result = await barcodeScanner.scanOnce(video);
          const onPicture =
            !!pictureCode && !!result && sameCode(result.text, pictureCode) && qrTracker.isTracking(pictureCode);
          if (!stopped && result && result.text.trim() && onPicture) {
            onDetectedRef.current(result.text, qrTracker.latest!.anchor);
          } else if (!stopped && result && result.text.trim()) {
            pictureCode = null;
            qrTracker.seed(result.text, result.anchor);
            onDetectedRef.current(result.text, result.anchor);
          } else if (!stopped && tracked && qrTracker.isTracking(tracked.text)) {
            // Not decoded (e.g. motion blur) but still followed by the tracker: the QR is still there
            onDetectedRef.current(tracked.text, qrTracker.latest!.anchor);
          }
        } catch {
          // skip frame
        }
      }
      if (!stopped) timer = window.setTimeout(loop, qrTracker.isTracking() ? SCAN_INTERVAL_TRACKING : SCAN_INTERVAL);
    };
    loop();

    // Sticker pictures (book pages): runs next to the QR scan, in its own worker
    let pictureTimer: number | undefined;
    const pictureLoop = async () => {
      if (stopped) return;
      const video = videoRef.current;
      const tracked = qrTracker.isTracking() ? qrTracker.latest : null;
      const followingPicture = !!tracked && !!pictureCode && tracked.text === pictureCode;
      if (video && imageDetector.active) {
        try {
          const hit = await imageDetector.detect(video, followingPicture ? pictureCode! : undefined);
          // A QR sticker being tracked keeps priority over the picture of the same sticker
          const onQr = !!tracked && !followingPicture && !!hit && sameCode(tracked.text, hit.text);
          if (!stopped && hit && !onQr) {
            pictureCode = hit.text;
            qrTracker.seed(hit.text, hit.square, PICTURE_UNIT);
            onDetectedRef.current(hit.text, hit.anchor);
          }
        } catch {
          // skip frame
        }
      }
      if (!stopped) pictureTimer = window.setTimeout(pictureLoop, qrTracker.isTracking() ? PICTURE_INTERVAL_TRACKING : PICTURE_INTERVAL);
    };
    pictureLoop();

    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
      if (pictureTimer) window.clearTimeout(pictureTimer);
      qrTracker.stop();
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
          <h3 className="font-semibold text-base mb-1">{t('openingCamera')}</h3>
        </div>
      )}

      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-white z-40 p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
            <VideoOff className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-rose-300">{t('cameraNeeded')}</h3>
          <p className="text-xs text-slate-300 max-w-sm mb-5 leading-relaxed">{t(cameraError === 'denied' ? 'cameraDenied' : 'cameraFailed')}</p>
          <button
            onClick={() => initCamera()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            {t('tryAgain')}
          </button>
        </div>
      )}
    </div>
  );
};
