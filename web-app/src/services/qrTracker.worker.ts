/// <reference lib="webworker" />
/**
 * Runs the frame-by-frame QR tracker off the main thread, so tracking never slows down the 3D
 * rendering or the QR decoder. Messages: see qrTracker.ts.
 */
import { TrackCore } from '../utils/qrTrackCore';

const core = new TrackCore();

self.onmessage = (e: MessageEvent) => {
  const m = e.data;
  if (m.type === 'seed') {
    core.seed(m.text, m.corners, m.t, m.mediaTime);
  } else if (m.type === 'reset') {
    core.reset();
  } else if (m.type === 'frame') {
    const t0 = performance.now();
    const rgba = new Uint8ClampedArray(m.rgba);
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
};
