import {
  BarcodeFormat,
  BinaryBitmap,
  DecodeHintType,
  HTMLCanvasElementLuminanceSource,
  HybridBinarizer,
  QRCodeReader,
} from '@zxing/library';
import { applyHomography, homography, Point2 } from '../utils/qrPose';

export interface QRAnchor {
  x: number; // Video pixel X (top-left of QR bounding box)
  y: number; // Video pixel Y
  width: number; // Video pixel width
  height: number; // Video pixel height
  videoWidth: number;
  videoHeight: number;
  // QR corners in video pixels, in the QR's own orientation: top-left, top-right, bottom-right, bottom-left
  cornerPoints?: Array<{ x: number; y: number }>;
  timestamp?: number; // when the frame was captured (ms)
}

export interface ScanResult {
  text: string;
  timestamp: number;
  anchor: QRAnchor;
}

type NativeBarcode = {
  rawValue: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  cornerPoints?: Array<{ x: number; y: number }>;
};
type NativeDetector = { detect: (src: ImageBitmapSource) => Promise<NativeBarcode[]> };
type NativeDetectorCtor = {
  new (opts?: { formats: string[] }): NativeDetector;
  getSupportedFormats?: () => Promise<string[]>;
};

// Max width of the frame we analyse. Smaller = faster scanning on low-end phones.
const SCAN_WIDTH = 960;
// Max width of the cropped area around the QR while tracking
const ROI_SCAN_WIDTH = 560;

/**
 * Camera + QR scanner.
 *
 * Frames are copied to an offscreen canvas and decoded there, so the <video> element that shows the
 * live camera is never touched by the decoder. (ZXing's decodeFromVideoElement() calls reset(), which
 * sets video.srcObject = null and leaves only the grey WebView video poster on screen.)
 */
/**
 * The 4 outer corners of a QR (TL, TR, BR, BL) from ZXing's result points:
 * [bottomLeft, topLeft, topRight] finder centres and, for version 2+, the alignment pattern centre.
 * With the alignment pattern the corners follow the real perspective (needed to stand the model
 * upright on a tilted book); without it the QR is assumed to be a parallelogram.
 */
function qrCornersFromZxing(pts: Array<{ x: number; y: number; moduleSize: number }>): Point2[] | null {
  if (pts.length < 3) return null;
  const [bl, tl, tr] = pts;
  const dist = (a: Point2, b: Point2) => Math.hypot(a.x - b.x, a.y - b.y);
  const moduleSize = (bl.moduleSize + tl.moduleSize + tr.moduleSize) / 3;

  // QR size in modules, computed like ZXing does (always 4·version + 17)
  let dim = 0;
  if (moduleSize > 0) {
    dim = Math.round((dist(tl, tr) + dist(tl, bl)) / 2 / moduleSize) + 7;
    if ((dim & 3) === 0) dim += 1;
    else if ((dim & 3) === 2) dim -= 1;
    else if ((dim & 3) === 3) dim += 2;
  }

  if (pts.length >= 4 && dim >= 25) {
    const h = homography(
      [
        { x: 3.5, y: 3.5 },
        { x: dim - 3.5, y: 3.5 },
        { x: 3.5, y: dim - 3.5 },
        { x: dim - 6.5, y: dim - 6.5 },
      ],
      [tl, tr, bl, pts[3]]
    );
    if (h) {
      return [
        { x: 0, y: 0 },
        { x: dim, y: 0 },
        { x: dim, y: dim },
        { x: 0, y: dim },
      ].map((p) => applyHomography(h, p));
    }
  }

  // Parallelogram fallback: finder centres sit 3.5 modules inside the edge
  const br = { x: tr.x + bl.x - tl.x, y: tr.y + bl.y - tl.y };
  const cx = (tl.x + br.x) / 2;
  const cy = (tl.y + br.y) / 2;
  const grow = dim > 7 ? dim / (dim - 7) : 1.4;
  return [tl, tr, br, bl].map((p) => ({ x: cx + (p.x - cx) * grow, y: cy + (p.y - cy) * grow }));
}

export class BarcodeScannerService {
  private currentStream: MediaStream | null = null;
  private zxingReader = new QRCodeReader();
  private zxingHints = new Map<DecodeHintType, unknown>([
    [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]],
    [DecodeHintType.TRY_HARDER, true],
  ]);
  private canvas: HTMLCanvasElement | null = null;
  private nativeDetector: NativeDetector | null | undefined = undefined;
  private lastRegion: { x: number; y: number; w: number; h: number; t: number } | null = null;
  private fullResNext = false;
  /** Which decoder found the last QR (shown in the diagnostics overlay). */
  public lastMethod: 'Android' | 'ZXing' | '' = '';

  public async startCamera(videoElement: HTMLVideoElement): Promise<MediaStream> {
    this.stopCamera();

    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error('Kamera tidak didukung pada perangkat ini');
    }

    const tryConstraints: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: { facingMode: 'environment' }, audio: false },
      { video: true, audio: false },
    ];

    let stream: MediaStream | null = null;
    let lastErr: unknown = null;
    for (const c of tryConstraints) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(c);
        if (stream) break;
      } catch (e) {
        lastErr = e;
        // Permission denied will fail for every constraint, no need to keep trying
        if (e instanceof DOMException && e.name === 'NotAllowedError') break;
      }
    }

    if (!stream) {
      throw lastErr || new Error('Gagal mengaktifkan kamera perangkat');
    }

    this.currentStream = stream;
    videoElement.muted = true;
    videoElement.setAttribute('playsinline', 'true');
    videoElement.srcObject = stream;
    try {
      await videoElement.play();
    } catch (e) {
      console.warn('Video play deferred:', e);
    }
    return stream;
  }

  public stopCamera() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track) => track.stop());
      this.currentStream = null;
    }
  }

  private async getNativeDetector(): Promise<NativeDetector | null> {
    if (this.nativeDetector !== undefined) return this.nativeDetector;
    this.nativeDetector = null;
    const Ctor = (window as unknown as { BarcodeDetector?: NativeDetectorCtor }).BarcodeDetector;
    if (Ctor) {
      try {
        const formats = Ctor.getSupportedFormats ? await Ctor.getSupportedFormats() : ['qr_code'];
        if (formats.includes('qr_code')) {
          this.nativeDetector = new Ctor({ formats: ['qr_code'] });
        }
      } catch {
        this.nativeDetector = null;
      }
    }
    return this.nativeDetector;
  }

  public async scanOnce(videoElement: HTMLVideoElement): Promise<ScanResult | null> {
    if (!videoElement || videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;
    const vW = videoElement.videoWidth;
    const vH = videoElement.videoHeight;
    if (!vW || !vH) return null;
    const capturedAt = Date.now(); // frame time, used to predict motion between scans

    // 1. Native BarcodeDetector (fast, available in most Android WebViews)
    const detector = await this.getNativeDetector();
    if (detector) {
      try {
        const codes = await detector.detect(videoElement);
        if (codes.length > 0) {
          const b = codes[0];
          this.lastMethod = 'Android';
          return {
            text: b.rawValue,
            timestamp: capturedAt,
            anchor: {
              x: b.boundingBox.x,
              y: b.boundingBox.y,
              width: b.boundingBox.width,
              height: b.boundingBox.height,
              videoWidth: vW,
              videoHeight: vH,
              cornerPoints: b.cornerPoints,
              timestamp: capturedAt,
            },
          };
        }
        return null;
      } catch {
        // Detector failed on this device, permanently fall back to ZXing
        this.nativeDetector = null;
      }
    }

    // 2. ZXing on a canvas copy of the frame. While tracking, only the area around the last known QR
    //    position is decoded: a much smaller image, so scans are faster and the model follows closely.
    const roi = this.lastRegion && capturedAt - this.lastRegion.t < 600 ? this.lastRegion : null;
    const src = roi
      ? (() => {
          const pad = Math.max(roi.w, roi.h) * 0.8;
          const x = Math.max(0, roi.x - pad);
          const y = Math.max(0, roi.y - pad);
          return { x, y, w: Math.min(vW, roi.x + roi.w + pad) - x, h: Math.min(vH, roi.y + roi.h + pad) - y };
        })()
      : { x: 0, y: 0, w: vW, h: vH };
    // After a miss, try the next frame at full resolution (small or tilted QRs need the detail)
    const scale = this.fullResNext ? 1 : Math.min(1, (roi ? ROI_SCAN_WIDTH : SCAN_WIDTH) / src.w);
    const cW = Math.max(1, Math.round(src.w * scale));
    const cH = Math.max(1, Math.round(src.h * scale));
    if (!this.canvas) this.canvas = document.createElement('canvas');
    const canvas = this.canvas;
    if (canvas.width !== cW || canvas.height !== cH) {
      canvas.width = cW;
      canvas.height = cH;
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(videoElement, src.x, src.y, src.w, src.h, 0, 0, cW, cH);

    try {
      const bitmap = new BinaryBitmap(new HybridBinarizer(new HTMLCanvasElementLuminanceSource(canvas)));
      const result = this.zxingReader.decode(bitmap, this.zxingHints);
      const corners = qrCornersFromZxing(
        result.getResultPoints().map((p) => ({
          x: src.x + p.getX() / scale,
          y: src.y + p.getY() / scale,
          moduleSize: ((p as unknown as { getEstimatedModuleSize?: () => number }).getEstimatedModuleSize?.() ?? 0) / scale,
        }))
      );
      if (!corners) return null;
      const xs = corners.map((p) => p.x);
      const ys = corners.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const side = Math.max(Math.max(...xs) - minX, Math.max(...ys) - minY);

      this.lastRegion = { x: minX, y: minY, w: side, h: side, t: capturedAt };
      this.lastMethod = 'ZXing';
      this.fullResNext = false;
      return {
        text: result.getText(),
        timestamp: capturedAt,
        anchor: {
          x: minX,
          y: minY,
          width: side,
          height: side,
          videoWidth: vW,
          videoHeight: vH,
          cornerPoints: corners,
          timestamp: capturedAt,
        },
      };
    } catch {
      this.lastRegion = null; // lost it: scan the whole frame next time
      this.fullResNext = !this.fullResNext && scale < 1;
      return null; // No QR in this frame
    } finally {
      this.zxingReader.reset();
    }
  }
}

export const barcodeScanner = new BarcodeScannerService();
