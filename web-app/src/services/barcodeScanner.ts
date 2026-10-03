import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';

export interface QRAnchor {
  x: number; // Video pixel X
  y: number; // Video pixel Y
  width: number; // Video pixel width
  height: number; // Video pixel height
  videoWidth: number;
  videoHeight: number;
  cornerPoints?: Array<{ x: number; y: number }>;
}

export interface ScanResult {
  text: string;
  format: string;
  timestamp: number;
  anchor?: QRAnchor;
}

export class BarcodeScannerService {
  private codeReader: BrowserMultiFormatReader | null = null;
  private currentStream: MediaStream | null = null;
  private activeFacingMode: 'environment' | 'user' = 'environment';
  private torchEnabled: boolean = false;

  constructor() {
    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_39,
      BarcodeFormat.DATA_MATRIX,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    try {
      this.codeReader = new BrowserMultiFormatReader(hints, 250);
    } catch (e) {
      console.warn('ZXing init error:', e);
    }
  }

  public async startCamera(
    videoElement: HTMLVideoElement,
    facingMode: 'environment' | 'user' = 'environment'
  ): Promise<MediaStream> {
    this.stopCamera();
    this.activeFacingMode = facingMode;

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.currentStream = stream;
      videoElement.srcObject = stream;
      videoElement.setAttribute('playsinline', 'true');
      videoElement.muted = true;
      await videoElement.play();
      return stream;
    } catch (err) {
      console.error('Failed to start camera:', err);
      throw err;
    }
  }

  public stopCamera() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track) => track.stop());
      this.currentStream = null;
    }
    this.torchEnabled = false;
  }

  public async toggleTorch(): Promise<boolean> {
    if (!this.currentStream) return false;
    const track = this.currentStream.getVideoTracks()[0];
    if (!track) return false;

    try {
      const capabilities = track.getCapabilities ? (track.getCapabilities() as { torch?: boolean }) : null;
      if (capabilities && capabilities.torch) {
        this.torchEnabled = !this.torchEnabled;
        await track.applyConstraints({
          advanced: [{ torch: this.torchEnabled } as MediaTrackConstraintSet],
        });
        return this.torchEnabled;
      }
    } catch (e) {
      console.warn('Torch constraint not supported on this device/browser:', e);
    }
    return false;
  }

  public getTorchState(): boolean {
    return this.torchEnabled;
  }

  public async scanOnce(videoElement: HTMLVideoElement): Promise<ScanResult | null> {
    if (!videoElement || videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return null;
    }

    const vWidth = videoElement.videoWidth || 1280;
    const vHeight = videoElement.videoHeight || 720;

    // 1. Try Native BarcodeDetector if available (instant on Android WebView & Chromium)
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        const BarcodeDetectorClass = (
          window as unknown as {
            BarcodeDetector: new (opts?: { formats: string[] }) => {
              detect: (src: ImageBitmapSource) => Promise<
                Array<{
                  rawValue: string;
                  format: string;
                  boundingBox: { x: number; y: number; width: number; height: number };
                  cornerPoints?: Array<{ x: number; y: number }>;
                }>
              >;
            };
          }
        ).BarcodeDetector;

        const detector = new BarcodeDetectorClass();
        const barcodes = await detector.detect(videoElement);
        if (barcodes && barcodes.length > 0) {
          const b = barcodes[0];
          const anchor: QRAnchor = {
            x: b.boundingBox.x,
            y: b.boundingBox.y,
            width: b.boundingBox.width,
            height: b.boundingBox.height,
            videoWidth: vWidth,
            videoHeight: vHeight,
            cornerPoints: b.cornerPoints || [],
          };
          return {
            text: b.rawValue,
            format: b.format,
            timestamp: Date.now(),
            anchor,
          };
        }
      } catch {
        // Fall back to ZXing
      }
    }

    // 2. Fall back to ZXing MultiFormatReader
    if (this.codeReader) {
      try {
        const result = await this.codeReader.decodeFromVideoElement(videoElement);
        if (result) {
          let anchor: QRAnchor | undefined = undefined;
          const pts = result.getResultPoints ? result.getResultPoints() : null;
          if (pts && pts.length > 0) {
            let minX = Infinity,
              minY = Infinity,
              maxX = -Infinity,
              maxY = -Infinity;

            const cornerPoints = pts.map((p) => {
              const px = p.getX();
              const py = p.getY();
              if (px < minX) minX = px;
              if (py < minY) minY = py;
              if (px > maxX) maxX = px;
              if (py > maxY) maxY = py;
              return { x: px, y: py };
            });

            anchor = {
              x: minX,
              y: minY,
              width: Math.max(40, maxX - minX),
              height: Math.max(40, maxY - minY),
              videoWidth: vWidth,
              videoHeight: vHeight,
              cornerPoints,
            };
          } else {
            // Default center fallback
            anchor = {
              x: vWidth * 0.35,
              y: vHeight * 0.35,
              width: vWidth * 0.3,
              height: vHeight * 0.3,
              videoWidth: vWidth,
              videoHeight: vHeight,
            };
          }

          return {
            text: result.getText(),
            format: result.getBarcodeFormat().toString(),
            timestamp: Date.now(),
            anchor,
          };
        }
      } catch {
        // No barcode in this frame
      }
    }

    return null;
  }

  public getActiveFacingMode(): 'environment' | 'user' {
    return this.activeFacingMode;
  }
}

export const barcodeScanner = new BarcodeScannerService();
