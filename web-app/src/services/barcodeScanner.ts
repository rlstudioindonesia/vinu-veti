import {
  BarcodeFormat,
  BinaryBitmap,
  DecodeHintType,
  HTMLCanvasElementLuminanceSource,
  HybridBinarizer,
  QRCodeReader,
} from '@zxing/library';

export interface QRAnchor {
  x: number; // Video pixel X (top-left of QR bounding box)
  y: number; // Video pixel Y
  width: number; // Video pixel width
  height: number; // Video pixel height
  videoWidth: number;
  videoHeight: number;
  cornerPoints?: Array<{ x: number; y: number }>;
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
const SCAN_WIDTH = 720;

/**
 * Camera + QR scanner.
 *
 * Frames are copied to an offscreen canvas and decoded there, so the <video> element that shows the
 * live camera is never touched by the decoder. (ZXing's decodeFromVideoElement() calls reset(), which
 * sets video.srcObject = null and leaves only the grey WebView video poster on screen.)
 */
export class BarcodeScannerService {
  private currentStream: MediaStream | null = null;
  private zxingReader = new QRCodeReader();
  private zxingHints = new Map<DecodeHintType, unknown>([
    [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]],
    [DecodeHintType.TRY_HARDER, true],
  ]);
  private canvas: HTMLCanvasElement | null = null;
  private nativeDetector: NativeDetector | null | undefined = undefined;

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

    // 1. Native BarcodeDetector (fast, available in most Android WebViews)
    const detector = await this.getNativeDetector();
    if (detector) {
      try {
        const codes = await detector.detect(videoElement);
        if (codes.length > 0) {
          const b = codes[0];
          return {
            text: b.rawValue,
            timestamp: Date.now(),
            anchor: {
              x: b.boundingBox.x,
              y: b.boundingBox.y,
              width: b.boundingBox.width,
              height: b.boundingBox.height,
              videoWidth: vW,
              videoHeight: vH,
              cornerPoints: b.cornerPoints,
            },
          };
        }
        return null;
      } catch {
        // Detector failed on this device, permanently fall back to ZXing
        this.nativeDetector = null;
      }
    }

    // 2. ZXing on a downscaled canvas copy of the frame
    const scale = Math.min(1, SCAN_WIDTH / vW);
    const cW = Math.round(vW * scale);
    const cH = Math.round(vH * scale);
    if (!this.canvas) this.canvas = document.createElement('canvas');
    const canvas = this.canvas;
    if (canvas.width !== cW || canvas.height !== cH) {
      canvas.width = cW;
      canvas.height = cH;
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(videoElement, 0, 0, cW, cH);

    try {
      const bitmap = new BinaryBitmap(new HybridBinarizer(new HTMLCanvasElementLuminanceSource(canvas)));
      const result = this.zxingReader.decode(bitmap, this.zxingHints);
      const pts = result.getResultPoints().slice(0, 3); // 3 finder pattern centers
      if (pts.length < 3) return null;

      const xs = pts.map((p) => p.getX() / scale);
      const ys = pts.map((p) => p.getY() / scale);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      // Finder centers sit ~3.5 modules inside the QR edge, so grow the box to approximate full size
      const side = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * 1.4;

      return {
        text: result.getText(),
        timestamp: Date.now(),
        anchor: {
          x: cx - side / 2,
          y: cy - side / 2,
          width: side,
          height: side,
          videoWidth: vW,
          videoHeight: vH,
          cornerPoints: xs.map((x, i) => ({ x, y: ys[i] })),
        },
      };
    } catch {
      return null; // No QR in this frame
    } finally {
      this.zxingReader.reset();
    }
  }
}

export const barcodeScanner = new BarcodeScannerService();
