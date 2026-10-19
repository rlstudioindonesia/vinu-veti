/**
 * Picture tracking: a sticker can also have a picture (e.g. the book page itself). When the camera
 * sees that picture the model appears on it, like on the QR sticker; the QR keeps working too.
 *
 * Recognition runs in a Web Worker a few times per second (imageFeatures.ts). A recognised picture
 * starts the same frame-by-frame tracker as a QR sticker (qrTracker), which then follows the centred
 * square of the picture.
 */
import type { QRAnchor } from './barcodeScanner';

// Width of the analysed camera frame (long side, px)
const DETECT_SIZE = 640;
/**
 * The model is sized and lifted in "sticker widths" (modelScale, elevationOffset). On a picture one
 * sticker width is this fraction of the picture's shorter side, so a model keeps a similar size on a
 * page as on a QR sticker.
 */
export const PICTURE_UNIT = 0.25;

export interface PictureSource {
  code: string; // the sticker's QR code text: a recognised picture acts as that QR
  key: string; // changes when the picture changes (e.g. its SHA-256)
  load: () => Promise<Blob | null>;
}

export interface PictureHit {
  text: string;
  // Centred square of the picture (its side = the picture's shorter side), video pixels: what the
  // tracker follows
  square: QRAnchor;
  // The "sticker" inside it (PICTURE_UNIT of the side): where and how big the model is placed
  anchor: QRAnchor;
}

type Corners = Array<{ x: number; y: number }>;

function toAnchor(corners: Corners, videoWidth: number, videoHeight: number, timestamp: number, mediaTime: number): QRAnchor {
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y, videoWidth, videoHeight, cornerPoints: corners, timestamp, mediaTime };
}

/** The centred part (fraction `f` of the side) of a square given by its corners (perspective-correct). */
export function innerSquare(c: Corners, f: number): Corners {
  // Bilinear on a projective quad is not exact; use the homography of the unit square instead
  const H = squareHomography(c);
  const a = (1 - f) / 2;
  const b = (1 + f) / 2;
  return [
    [a, a],
    [b, a],
    [b, b],
    [a, b],
  ].map(([u, v]) => {
    const w = H[6] * u + H[7] * v + H[8];
    return { x: (H[0] * u + H[1] * v + H[2]) / w, y: (H[3] * u + H[4] * v + H[5]) / w };
  });
}

/** Homography from the unit square (0,0)-(1,1) to the quad TL, TR, BR, BL (closed form). */
function squareHomography(q: Corners): number[] {
  const [p0, p1, p2, p3] = q;
  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const sx = p0.x - p1.x + p2.x - p3.x;
  const sy = p0.y - p1.y + p2.y - p3.y;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = den ? (sx * dy2 - dx2 * sy) / den : 0;
  const h = den ? (dx1 * sy - sx * dy1) / den : 0;
  return [p1.x - p0.x + g * p1.x, p3.x - p0.x + h * p3.x, p0.x, p1.y - p0.y + g * p1.y, p3.y - p0.y + h * p3.y, p0.y, g, h, 1];
}

class ImageDetector {
  private worker: Worker | null = null;
  private failed = false;
  private codes = new Map<string, string>(); // picture key → sticker code
  private sent = new Set<string>();
  private loading = new Set<string>();
  private nextId = 1;
  private waiting = new Map<number, (r: { found: { key: string; corners: Corners } | null; noBitmap?: boolean }) => void>();
  private bitmaps: boolean | null = null; // null = not tried yet
  private canvas: HTMLCanvasElement | null = null;
  /** Detection time in the worker (ms, averaged; diagnostics). */
  ms = 0;

  /** True when at least one sticker has a picture. */
  get active(): boolean {
    return this.codes.size > 0 && !this.failed;
  }

  private ensureWorker(): Worker | null {
    if (this.worker || this.failed) return this.worker;
    try {
      this.worker = new Worker(new URL('./imageDetector.worker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = (e) => {
        const m = e.data;
        if (m.type === 'detect') {
          this.ms = this.ms ? this.ms * 0.8 + m.ms * 0.2 : m.ms;
          this.waiting.get(m.id)?.(m);
          this.waiting.delete(m.id);
        } else if (m.type === 'reference' && !m.ok) {
          this.sent.delete(m.key);
          if (m.noBitmap) this.bitmaps = false;
        }
      };
      this.worker.onerror = () => {
        this.failed = true;
        this.worker?.terminate();
        this.worker = null;
        this.waiting.forEach((done) => done({ found: null }));
        this.waiting.clear();
      };
    } catch {
      this.failed = true;
    }
    return this.worker;
  }

  /** The stickers' pictures (call whenever the sticker list changes). */
  setPictures(list: PictureSource[]) {
    this.codes = new Map(list.map((p) => [p.key, p.code]));
    if (list.length === 0) {
      this.worker?.terminate();
      this.worker = null;
      this.sent.clear();
      return;
    }
    const worker = this.ensureWorker();
    if (!worker) return;
    worker.postMessage({ type: 'keep', keys: list.map((p) => p.key) });
    for (const k of [...this.sent]) if (!this.codes.has(k)) this.sent.delete(k);
    for (const p of list) {
      if (this.sent.has(p.key) || this.loading.has(p.key)) continue;
      this.loading.add(p.key);
      p.load()
        .then((blob) => (blob ? this.sendReference(p.key, blob) : undefined))
        .catch((err) => console.warn('Picture for tracking not available:', p.code, err))
        .finally(() => this.loading.delete(p.key));
    }
  }

  private async sendReference(key: string, blob: Blob) {
    const bitmap = await createImageBitmap(blob);
    // Reference pictures are analysed at 640 px; a smaller copy is plenty
    const s = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * s));
    const h = Math.max(1, Math.round(bitmap.height * s));
    const worker = this.ensureWorker();
    if (!worker || !this.codes.has(key)) {
      bitmap.close();
      return;
    }
    this.sent.add(key);
    if (this.bitmaps !== false && typeof OffscreenCanvas !== 'undefined') {
      worker.postMessage({ type: 'reference', key, bitmap, w, h }, [bitmap]);
      return;
    }
    const rgba = this.readPixels(bitmap, w, h);
    bitmap.close();
    if (rgba) worker.postMessage({ type: 'reference', key, rgba: rgba.buffer, w, h }, [rgba.buffer]);
  }

  private readPixels(src: CanvasImageSource, w: number, h: number): Uint8ClampedArray | null {
    if (!this.canvas) this.canvas = document.createElement('canvas');
    const c = this.canvas;
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(src, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h).data;
  }

  /**
   * Looks for a sticker picture in the current camera frame. `only`: the code of the picture being
   * tracked (just confirm it and correct drift: cheaper).
   */
  async detect(video: HTMLVideoElement, only?: string): Promise<PictureHit | null> {
    const worker = this.active ? this.ensureWorker() : null;
    if (!worker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) return null;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const s = DETECT_SIZE / Math.max(vw, vh);
    const w = Math.round(vw * s);
    const h = Math.round(vh * s);
    const timestamp = Date.now();
    const mediaTime = video.currentTime;
    const onlyKey = only ? [...this.codes].find(([, c]) => c === only)?.[0] : undefined;
    const id = this.nextId++;
    const reply = new Promise<{ found: { key: string; corners: Corners } | null; noBitmap?: boolean }>((resolve) => {
      this.waiting.set(id, resolve);
      // A worker that never answers must not stop scanning for good
      window.setTimeout(() => {
        if (this.waiting.delete(id)) resolve({ found: null });
      }, 3000);
    });
    if (this.bitmaps !== false && typeof createImageBitmap === 'function' && typeof OffscreenCanvas !== 'undefined') {
      try {
        const bitmap = await createImageBitmap(video, { resizeWidth: w, resizeHeight: h });
        worker.postMessage({ type: 'detect', id, bitmap, w, h, only: onlyKey }, [bitmap]);
      } catch {
        this.bitmaps = false;
        this.waiting.delete(id);
        return null;
      }
    } else {
      const rgba = this.readPixels(video, w, h);
      if (!rgba) {
        this.waiting.delete(id);
        return null;
      }
      worker.postMessage({ type: 'detect', id, rgba: rgba.buffer, w, h, only: onlyKey }, [rgba.buffer]);
    }
    const r = await reply;
    if (r.noBitmap) this.bitmaps = false;
    if (!r.found) return null;
    const text = this.codes.get(r.found.key);
    if (!text) return null;
    const corners = r.found.corners.map((c) => ({ x: c.x / s, y: c.y / s }));
    return {
      text,
      square: toAnchor(corners, vw, vh, timestamp, mediaTime),
      anchor: toAnchor(innerSquare(corners, PICTURE_UNIT), vw, vh, timestamp, mediaTime),
    };
  }
}

export const imageDetector = new ImageDetector();
