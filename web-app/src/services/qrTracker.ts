/**
 * Follows the QR sticker in EVERY camera frame (optical flow), between the slower QR decodes.
 *
 * The decoder (ZXing / BarcodeDetector) only reads the QR a few times per second, fails on motion
 * blur and its 4 corners are noisy. Once a QR has been decoded, this tracker follows a grid of points
 * on the QR pattern from frame to frame (pyramidal Lucas-Kanade) and fits a homography through them:
 * - the model follows the sticker at camera frame rate, also when the phone slides sideways
 *   (the gyroscope only measures rotation),
 * - dozens of points average out the noise: no more trembling,
 * - decodes only confirm the identity of the QR and correct drift.
 */
import * as THREE from 'three';
import { TrackCore } from '../utils/qrTrackCore';
import { focalFromVideo } from '../utils/qrPose';
import { project } from '../utils/lkTracker';
import type { QRAnchor } from './barcodeScanner';

const TRACK_W = 400; // width of the analysed frame (px); height follows the video
// QR unit square (y up), corners in the order TL, TR, BR, BL like the decoder's cornerPoints
const UNIT = [
  [-0.5, 0.5],
  [0.5, 0.5],
  [0.5, -0.5],
  [-0.5, -0.5],
];

export interface TrackedQR {
  seq: number;
  text: string;
  anchor: QRAnchor; // corners in video pixels, timestamp = capture time (Date.now clock)
  perfTime: number; // capture time (performance.now clock)
}

type VideoWithRVFC = HTMLVideoElement & {
  requestVideoFrameCallback?: (
    cb: (now: number, meta: { captureTime?: number; expectedDisplayTime?: number; mediaTime?: number }) => void
  ) => number;
  cancelVideoFrameCallback?: (id: number) => void;
};

interface Pending {
  captureTime: number; // performance.now clock
  grabbed: number; // performance.now when the frame was copied
  now: number; // Date.now when the frame was copied
  scale: number;
  videoWidth: number;
  videoHeight: number;
}

class QrTracker {
  latest: TrackedQR | null = null;
  /** Frames tracked per second and processing time, for the diagnostics overlay. */
  fps = 0;
  ms = 0;
  /** 'worker' when tracking runs on its own thread. */
  mode = '';
  /**
   * Camera rotation from a past time (performance.now clock) until now, from the gyroscope (set by
   * the AR view). Used to predict where the QR moves between frames when the phone is shaken.
   */
  rotationSince: ((t: number) => THREE.Quaternion | null) | null = null;
  private lastCapture = 0;

  private video: VideoWithRVFC | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private w = 0;
  private h = 0;
  private scale = 1; // tracking px per video px
  private worker: Worker | null = null;
  private local: TrackCore | null = null; // fallback without Web Workers
  private pending = new Map<number, Pending>();
  private nextId = 1;
  private ok = false;
  private seq = 0;
  private handle = 0;
  private running = false;
  private stamps: number[] = [];

  start(video: HTMLVideoElement) {
    this.stop();
    this.video = video as VideoWithRVFC;
    this.running = true;
    try {
      this.worker = new Worker(new URL('./qrTracker.worker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = (e) => this.onResult(e.data);
      this.worker.onerror = () => {
        // Workers unavailable: track on the main thread instead
        this.worker?.terminate();
        this.worker = null;
        this.pending.clear();
        this.local = new TrackCore();
        this.mode = 'main';
      };
      this.mode = 'worker';
    } catch {
      this.local = new TrackCore();
      this.mode = 'main';
    }
    this.schedule();
  }

  stop() {
    this.running = false;
    const v = this.video;
    if (v && this.handle) {
      if (v.cancelVideoFrameCallback) v.cancelVideoFrameCallback(this.handle);
      else cancelAnimationFrame(this.handle);
    }
    this.handle = 0;
    this.video = null;
    this.worker?.terminate();
    this.worker = null;
    this.local = null;
    this.pending.clear();
    this.latest = null;
    this.ok = false;
    this.lastCapture = 0;
  }

  /** True while the given QR (or any QR) was tracked in the last few frames. */
  isTracking(text?: string): boolean {
    const l = this.latest;
    return this.ok && !!l && Date.now() - l.anchor.timestamp! < 250 && (text === undefined || l.text === text);
  }

  /** A decode result: starts tracking, or corrects drift of the running track. */
  seed(text: string, anchor: QRAnchor) {
    if (!anchor.cornerPoints || anchor.cornerPoints.length !== 4) return;
    const scale = TRACK_W / anchor.videoWidth;
    const msg = {
      type: 'seed',
      text,
      corners: anchor.cornerPoints.map((p) => ({ x: p.x * scale, y: p.y * scale })),
      t: anchor.timestamp ?? Date.now(),
      mediaTime: anchor.mediaTime,
    };
    if (this.worker) this.worker.postMessage(msg);
    else this.local?.seed(msg.text, msg.corners, msg.t, msg.mediaTime);
  }

  private schedule() {
    const v = this.video;
    if (!this.running || !v) return;
    if (v.requestVideoFrameCallback) {
      this.handle = v.requestVideoFrameCallback((_now, meta) => {
        this.frame(meta.captureTime ?? performance.now(), meta.mediaTime ?? v.currentTime);
        this.schedule();
      });
    } else {
      let lastTime = -1;
      const tick = () => {
        if (!this.running) return;
        if (v.currentTime !== lastTime) {
          lastTime = v.currentTime;
          this.frame(performance.now(), v.currentTime);
        }
        this.handle = requestAnimationFrame(tick);
      };
      this.handle = requestAnimationFrame(tick);
    }
  }

  private frame(captureTime: number, mediaTime: number) {
    const v = this.video;
    // One frame at a time: when the phone is busy, frames are skipped instead of piling up
    if (!v || this.pending.size > 0 || v.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !v.videoWidth) return;
    const w = TRACK_W;
    const h = Math.round((v.videoHeight / v.videoWidth) * TRACK_W);
    if (w !== this.w || h !== this.h || !this.ctx) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = w;
      this.canvas.height = h;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
      this.w = w;
      this.h = h;
    }
    if (!this.ctx) return;
    this.scale = w / v.videoWidth;
    this.ctx.drawImage(v, 0, 0, w, h);
    const rgba = this.ctx.getImageData(0, 0, w, h).data;
    const prior = this.gyroPrior(captureTime, w, h, v.videoWidth, v.videoHeight);
    this.lastCapture = captureTime;
    const id = this.nextId++;
    const now = Date.now();
    this.pending.set(id, { captureTime, grabbed: performance.now(), now, scale: this.scale, videoWidth: v.videoWidth, videoHeight: v.videoHeight });
    if (this.worker) {
      this.worker.postMessage({ type: 'frame', id, rgba: rgba.buffer, w, h, now, mediaTime, prior }, [rgba.buffer]);
    } else if (this.local) {
      const t0 = performance.now();
      const gray = new Uint8Array(w * h);
      for (let i = 0, j = 0; i < gray.length; i++, j += 4) gray[i] = (rgba[j] * 77 + rgba[j + 1] * 150 + rgba[j + 2] * 29) >> 8;
      const r = this.local.process(gray, w, h, now, mediaTime, prior);
      this.onResult({ id, H: r?.H ?? null, text: r?.text ?? '', ms: performance.now() - t0 });
    }
  }

  /** Image motion caused by the phone's rotation since the previous tracked frame (3×3, row-major). */
  private gyroPrior(captureTime: number, w: number, h: number, vw: number, vh: number): number[] | null {
    if (!this.rotationSince || !this.lastCapture) return null;
    const a = this.rotationSince(this.lastCapture);
    const b = this.rotationSince(captureTime);
    if (!a || !b) return null;
    // Camera rotation between the two frames; points move by its inverse
    const dq = a.multiply(b.invert());
    const R = new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(dq.invert()));
    // three.js camera axes (y up, looking along -z) → image axes (y down, looking along +z)
    const D = new THREE.Matrix3().set(1, 0, 0, 0, -1, 0, 0, 0, -1);
    const f = focalFromVideo(vw, vh) * (w / vw);
    const K = new THREE.Matrix3().set(f, 0, w / 2, 0, f, h / 2, 0, 0, 1);
    const Kinv = K.clone().invert();
    const Hm = K.multiply(D).multiply(R).multiply(D).multiply(Kinv);
    const e = Hm.elements; // column-major
    return [e[0], e[3], e[6], e[1], e[4], e[7], e[2], e[5], e[8]].map((x) => x / e[8]);
  }

  private onResult(m: { id: number; H: number[] | null; text: string; ms: number }) {
    const p = this.pending.get(m.id);
    this.pending.delete(m.id);
    if (!p || !this.running) return;
    this.ok = !!m.H;
    if (m.H) {
      const corners = UNIT.map(([ux, uy]) => {
        const [x, y] = project(m.H!, ux, uy);
        return { x: x / p.scale, y: y / p.scale };
      });
      const xs = corners.map((c) => c.x);
      const ys = corners.map((c) => c.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      this.latest = {
        seq: ++this.seq,
        text: m.text,
        perfTime: p.captureTime,
        anchor: {
          x: minX,
          y: minY,
          width: Math.max(...xs) - minX,
          height: Math.max(...ys) - minY,
          videoWidth: p.videoWidth,
          videoHeight: p.videoHeight,
          cornerPoints: corners,
          timestamp: p.now - (p.grabbed - p.captureTime),
        },
      };
    }
    const end = performance.now();
    this.ms = this.ms * 0.9 + m.ms * 0.1;
    this.stamps.push(end);
    while (this.stamps.length > 0 && end - this.stamps[0] > 1000) this.stamps.shift();
    this.fps = this.stamps.length;
  }
}

export const qrTracker = new QrTracker();
