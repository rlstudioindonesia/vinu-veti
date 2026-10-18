import {
  BarcodeFormat,
  BinaryBitmap,
  DecodeHintType,
  HTMLCanvasElementLuminanceSource,
  HybridBinarizer,
  QRCodeReader,
} from '@zxing/library';
import { applyHomography, homography, Point2 } from '../utils/qrPose';
import { cameraLight } from './cameraLight';

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
  mediaTime?: number; // video.currentTime of that frame: identifies the exact camera frame
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
// Average brightness (0-255) below which the picture counts as dark: the torch button is offered and
// frames are contrast-stretched before decoding
const DARK_LEVEL = 70;
const BRIGHTNESS_EVERY_MS = 400;

/**
 * Stretches the brightness range of a dark / low-contrast frame to the full 0-255 (ignoring the
 * darkest and brightest 1 %), with a gamma lift for shadows: the QR's black and white modules
 * become clearly separable again for the binarizer.
 */
function enhanceContrast(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const hist = new Uint32Array(256);
  for (let i = 0; i < d.length; i += 16) hist[(d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8]++;
  const total = d.length / 16;
  let lo = 0;
  let hi = 255;
  for (let acc = 0; lo < 255 && (acc += hist[lo]) < total * 0.01; lo++);
  for (let acc = 0; hi > 0 && (acc += hist[hi]) < total * 0.01; hi--);
  if (hi - lo < 8) return;
  const lut = new Uint8ClampedArray(256);
  for (let v = 0; v < 256; v++) lut[v] = 255 * Math.pow(Math.min(1, Math.max(0, (v - lo) / (hi - lo))), 0.7);
  for (let i = 0; i < d.length; i += 4) {
    d[i] = lut[d[i]];
    d[i + 1] = lut[d[i + 1]];
    d[i + 2] = lut[d[i + 2]];
  }
  ctx.putImageData(img, 0, 0);
}

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
  // Low light: measured on a tiny copy of the frame now and then
  private probe: HTMLCanvasElement | null = null;
  private brightnessAt = 0;
  private nativeMisses = 0;
  /** Average brightness of the camera picture (0-255). */
  public brightness = 255;

  constructor() {
    cameraLight.setter = (on) => this.setTorch(on);
  }

  public get isDark(): boolean {
    return this.brightness < DARK_LEVEL;
  }

  /** Turns the phone's flashlight on/off (only while the camera runs, where supported). */
  public async setTorch(on: boolean): Promise<boolean> {
    const track = this.currentStream?.getVideoTracks()[0];
    if (!track || !cameraLight.torchSupported) return false;
    try {
      await track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] });
      cameraLight.torchOn = on;
    } catch {
      cameraLight.torchOn = false;
    }
    cameraLight.notify();
    return cameraLight.torchOn;
  }

  private measureBrightness(video: HTMLVideoElement) {
    const now = Date.now();
    if (now - this.brightnessAt < BRIGHTNESS_EVERY_MS) return;
    this.brightnessAt = now;
    if (!this.probe) {
      this.probe = document.createElement('canvas');
      this.probe.width = 32;
      this.probe.height = 32;
    }
    const ctx = this.probe.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    // Centre of the picture, where the child points the QR
    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const side = Math.min(vW, vH) * 0.6;
    ctx.drawImage(video, (vW - side) / 2, (vH - side) / 2, side, side, 0, 0, 32, 32);
    const d = ctx.getImageData(0, 0, 32, 32).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
    this.brightness = sum / (d.length / 4);
    if (cameraLight.dark !== this.isDark) {
      cameraLight.dark = this.isDark;
      cameraLight.notify();
    }
  }

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
    cameraLight.torchOn = false;
    cameraLight.torchSupported = false;
    const track = stream.getVideoTracks()[0];
    try {
      const caps = (track?.getCapabilities?.() ?? {}) as MediaTrackCapabilities & {
        torch?: boolean;
        focusMode?: string[];
        exposureMode?: string[];
      };
      cameraLight.torchSupported = !!caps.torch;
      // Keep focus and exposure adapting to the page (sharp, readable QR in dim rooms)
      const advanced: Record<string, string>[] = [];
      if (caps.focusMode?.includes('continuous')) advanced.push({ focusMode: 'continuous' });
      if (caps.exposureMode?.includes('continuous')) advanced.push({ exposureMode: 'continuous' });
      if (advanced.length > 0) await track.applyConstraints({ advanced: advanced as MediaTrackConstraintSet[] }).catch(() => undefined);
    } catch {
      // capabilities not available in this WebView
    }
    cameraLight.notify();
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
    cameraLight.torchOn = false;
    cameraLight.torchSupported = false;
    cameraLight.dark = false;
    cameraLight.notify();
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

  /** Where the QR is now (from the frame-by-frame tracker): the next decode only looks there. */
  public hintRegion(anchor: QRAnchor) {
    const side = Math.max(anchor.width, anchor.height);
    this.lastRegion = { x: anchor.x, y: anchor.y, w: side, h: side, t: Date.now() };
  }

  public async scanOnce(videoElement: HTMLVideoElement): Promise<ScanResult | null> {
    if (!videoElement || videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;
    const vW = videoElement.videoWidth;
    const vH = videoElement.videoHeight;
    if (!vW || !vH) return null;
    const capturedAt = Date.now(); // frame time, used to predict motion between scans
    const mediaTime = videoElement.currentTime;
    this.measureBrightness(videoElement);
    const dark = this.isDark;

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
              mediaTime,
            },
          };
        }
        // In a dark room the native detector often sees nothing: every other miss, ZXing gets a
        // contrast-enhanced copy of the frame below
        this.nativeMisses++;
        if (!dark || this.nativeMisses % 2 === 1) return null;
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
    if (dark) enhanceContrast(ctx, cW, cH);

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
      this.nativeMisses = 0;
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
          mediaTime,
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
