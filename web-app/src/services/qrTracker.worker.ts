/// <reference lib="webworker" />
/**
 * Runs the frame-by-frame QR tracker off the main thread, so tracking never slows down the 3D
 * rendering or the QR decoder. Messages: see qrTracker.ts.
 */
import { TrackCore } from '../utils/qrTrackCore';

const core = new TrackCore();
// Frames arriving as ImageBitmaps are drawn and read here (the main thread does not read pixels)
let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

function track(m: { id: number; w: number; h: number; now: number; mediaTime: number; prior: number[] | null }, rgba: Uint8ClampedArray, t0: number) {
  const gray = new Uint8Array(m.w * m.h);
  for (let i = 0, j = 0; i < gray.length; i++, j += 4) gray[i] = (rgba[j] * 77 + rgba[j + 1] * 150 + rgba[j + 2] * 29) >> 8;
  const r = core.process(gray, m.w, m.h, m.now, m.mediaTime, m.prior);
  (self as unknown as Worker).postMessage({
    type: 'result',
    id: m.id,
    H: r?.H ?? null,
    text: r?.text ?? '',
    ms: performance.now() - t0,
  });
}

self.onmessage = (e: MessageEvent) => {
  const m = e.data;
  if (m.type === 'seed') {
    core.seed(m.text, m.corners, m.t, m.mediaTime);
  } else if (m.type === 'reset') {
    core.reset();
  } else if (m.type === 'frame') {
    const t0 = performance.now();
    track(m, new Uint8ClampedArray(m.rgba), t0);
  } else if (m.type === 'bitmap') {
    const t0 = performance.now();
    const bitmap = m.bitmap as ImageBitmap;
    let rgba: Uint8ClampedArray;
    try {
      if (!canvas || canvas.width !== m.w || canvas.height !== m.h) {
        canvas = new OffscreenCanvas(m.w, m.h);
        ctx = canvas.getContext('2d', { willReadFrequently: true });
      }
      if (!ctx) throw new Error('no 2d context');
      ctx.drawImage(bitmap, 0, 0, m.w, m.h);
      rgba = ctx.getImageData(0, 0, m.w, m.h).data;
    } catch {
      (self as unknown as Worker).postMessage({ type: 'result', id: m.id, H: null, text: '', ms: 0, noBitmap: true });
      return;
    } finally {
      bitmap.close();
    }
    track(m, rgba, t0);
  }
};
