/// <reference lib="webworker" />
/**
 * Recognises the stickers' pictures in camera frames off the main thread (see imageDetector.ts).
 */
import { buildReference, centreSquare, describeFrame, Gray, ReferenceIndex, toGray } from '../utils/imageFeatures';

const index = new ReferenceIndex();
let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

function pixels(bitmap: ImageBitmap, w: number, h: number): Gray {
  if (!canvas || canvas.width !== w || canvas.height !== h) {
    canvas = new OffscreenCanvas(w, h);
    ctx = canvas.getContext('2d', { willReadFrequently: true });
  }
  if (!ctx) throw new Error('no 2d context');
  ctx.drawImage(bitmap, 0, 0, w, h);
  return toGray(ctx.getImageData(0, 0, w, h).data, w, h);
}

const post = (m: unknown) => (self as unknown as Worker).postMessage(m);

self.onmessage = (e: MessageEvent) => {
  const m = e.data;
  if (m.type === 'keep') {
    // Pictures no longer used (sticker deleted or picture replaced)
    const keep = new Set<string>(m.keys);
    for (const k of index.keys()) if (!keep.has(k)) index.delete(k);
  } else if (m.type === 'reference') {
    try {
      const g: Gray = m.bitmap ? pixels(m.bitmap, m.w, m.h) : toGray(new Uint8ClampedArray(m.rgba), m.w, m.h);
      index.set(m.key, buildReference(g));
      post({ type: 'reference', key: m.key, ok: true });
    } catch {
      post({ type: 'reference', key: m.key, ok: false, noBitmap: !!m.bitmap });
    } finally {
      m.bitmap?.close();
    }
  } else if (m.type === 'detect') {
    const t0 = performance.now();
    let found: { key: string; corners: Array<{ x: number; y: number }>; inliers: number } | null = null;
    let noBitmap = false;
    try {
      const g: Gray = m.bitmap ? pixels(m.bitmap, m.w, m.h) : toGray(new Uint8ClampedArray(m.rgba), m.w, m.h);
      const r = index.find(describeFrame(g), m.w, m.h, m.only);
      if (r) found = { key: r.key, corners: centreSquare(r.det, index.get(r.key)!), inliers: r.det.inliers };
    } catch {
      noBitmap = !!m.bitmap;
    } finally {
      m.bitmap?.close();
    }
    post({ type: 'detect', id: m.id, found, noBitmap, ms: performance.now() - t0 });
  }
};
