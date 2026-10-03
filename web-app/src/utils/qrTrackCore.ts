/**
 * Core of the frame-by-frame QR tracker (no DOM: runs in a Web Worker, and in tests).
 *
 * Follows a grid of points on the QR pattern from frame to frame (pyramidal Lucas-Kanade) and fits a
 * homography through them. Decodes (see qrTracker.ts) start the track and correct drift; they are
 * matched to the exact frame they were read from, because decoding takes a few frames.
 */
import { buildPyramid, fitHomography, project, Pyramid, trackPoints } from './lkTracker';
import { homography, Point2 } from './qrPose';

export const LEVELS = 5; // pyramid levels: follows fast motion (up to ~50 px per frame at this width)
const GRID = 7; // GRID × GRID points on the QR
const HISTORY = 10; // past frames kept (gray only) to apply a late decode to the right frame
const MIN_INLIERS = 10;
// Frames a lost track keeps trying from the last good frame (one blurred frame should not lose it)
const MAX_COAST = 3;
// QR unit square (y up), corners in the order TL, TR, BR, BL like the decoder's cornerPoints
const UNIT: Point2[] = [
  { x: -0.5, y: 0.5 },
  { x: 0.5, y: 0.5 },
  { x: 0.5, y: -0.5 },
  { x: -0.5, y: -0.5 },
];

const GX = new Float32Array(GRID * GRID);
const GY = new Float32Array(GRID * GRID);
for (let i = 0; i < GRID; i++) {
  for (let j = 0; j < GRID; j++) {
    GX[i * GRID + j] = -0.46 + (0.92 * j) / (GRID - 1);
    GY[i * GRID + j] = 0.46 - (0.92 * i) / (GRID - 1);
  }
}

interface Frame {
  t: number; // Date.now() when grabbed
  mediaTime: number; // video.currentTime of the frame (matches QRAnchor.mediaTime of a decode)
  gray: Uint8Array;
  H: number[] | null; // unit square → tracking pixels in this frame
}

function quadArea(c: Point2[]): number {
  let a = 0;
  for (let i = 0; i < 4; i++) {
    const p = c[i];
    const q = c[(i + 1) % 4];
    a += p.x * q.y - q.x * p.y;
  }
  return a / 2;
}

function isConvex(c: Point2[]): boolean {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = c[i];
    const b = c[(i + 1) % 4];
    const d = c[(i + 2) % 4];
    const cross = (b.x - a.x) * (d.y - b.y) - (b.y - a.y) * (d.x - b.x);
    if (Math.abs(cross) < 1e-6) return false;
    if (sign === 0) sign = Math.sign(cross);
    else if (Math.sign(cross) !== sign) return false;
  }
  return true;
}

function mul3(a: number[], b: number[]): number[] {
  const o = new Array(9);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
  return o;
}

export class TrackCore {
  private w = 0;
  private h = 0;
  private frames: Frame[] = [];
  private prevPyr: Pyramid | null = null;
  private H: number[] | null = null;
  private prevPts: { x: Float32Array; y: Float32Array } | null = null;
  private text = '';
  private lostFrames = 0;
  private coastPrior: number[] | null = null;
  private pendingSeed: { text: string; corners: Point2[]; t: number; mediaTime?: number } | null = null;

  reset() {
    this.frames = [];
    this.prevPyr = null;
    this.H = null;
    this.prevPts = null;
    this.pendingSeed = null;
    this.lostFrames = 0;
    this.coastPrior = null;
  }

  /** A decode result, corners (TL, TR, BR, BL) in tracking pixels: applied with the next frame. */
  seed(text: string, corners: Point2[], t: number, mediaTime?: number) {
    this.pendingSeed = { text, corners, t, mediaTime };
  }

  /** Tracks the grid from one frame to another; returns the fitted homography or null. */
  private track(
    from: Pyramid,
    to: Pyramid,
    Hfrom: number[],
    guess: { x: Float32Array; y: Float32Array } | null,
    previousArea: number
  ): { H: number[]; pts: { x: Float32Array; y: Float32Array } } | null {
    const n = GX.length;
    const px = new Float32Array(n);
    const py = new Float32Array(n);
    for (let i = 0; i < n; i++) [px[i], py[i]] = project(Hfrom, GX[i], GY[i]);
    // First the whole QR at once (a large window sees the white square, not the repeating modules,
    // so it cannot lock onto the wrong module), then every point refines from there
    const [cx, cy] = project(Hfrom, 0, 0);
    let gcx = cx;
    let gcy = cy;
    if (guess) {
      gcx = 0;
      gcy = 0;
      for (let i = 0; i < n; i++) {
        gcx += guess.x[i] - px[i];
        gcy += guess.y[i] - py[i];
      }
      gcx = cx + gcx / n;
      gcy = cy + gcy / n;
    }
    const g = trackPoints(from, to, Float32Array.of(cx), Float32Array.of(cy), Float32Array.of(gcx), Float32Array.of(gcy), 20);
    const shiftX = g.ok[0] ? g.x[0] - gcx : 0;
    const shiftY = g.ok[0] ? g.y[0] - gcy : 0;
    const gx = new Float32Array(n);
    const gy = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      gx[i] = (guess ? guess.x[i] : px[i]) + shiftX;
      gy[i] = (guess ? guess.y[i] : py[i]) + shiftY;
    }
    const r = trackPoints(from, to, px, py, gx, gy);

    // Robust fit: drop points that disagree with the others (occlusion, reflections), refit
    let use = Uint8Array.from(r.ok, (ok, i) => (ok && r.err[i] < 90 ? 1 : 0));
    let H: number[] | null = null;
    for (let pass = 0; pass < 3; pass++) {
      if (use.reduce((a, b) => a + b, 0) < MIN_INLIERS) return null;
      H = fitHomography(GX, GY, r.x, r.y, use);
      if (!H) return null;
      const res: number[] = [];
      for (let i = 0; i < n; i++) {
        if (!r.ok[i]) continue;
        const [x, y] = project(H, GX[i], GY[i]);
        res.push(Math.hypot(x - r.x[i], y - r.y[i]));
      }
      const sorted = [...res].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      // Points disagree: the track is lost or wrong (motion blur makes points less exact, so the
      // limit grows with the size of the QR on screen)
      if (median > Math.max(1.5, 0.025 * Math.sqrt(Math.max(previousArea, this.areaOf(Hfrom))))) return null;
      const limit = Math.max(1, 2.5 * median);
      const next = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        if (!r.ok[i]) continue;
        const [x, y] = project(H, GX[i], GY[i]);
        next[i] = Math.hypot(x - r.x[i], y - r.y[i]) <= limit ? 1 : 0;
      }
      use = next;
    }
    if (!H || use.reduce((a, b) => a + b, 0) < MIN_INLIERS) return null;

    const corners = UNIT.map((u) => {
      const [x, y] = project(H!, u.x, u.y);
      return { x, y };
    });
    const area = Math.abs(quadArea(corners));
    if (!isConvex(corners) || area < 200) return null;
    if (previousArea > 0 && (area > previousArea * 1.6 || area < previousArea / 1.6)) return null;
    const pts = { x: new Float32Array(n), y: new Float32Array(n) };
    for (let i = 0; i < n; i++) [pts.x[i], pts.y[i]] = project(H, GX[i], GY[i]);
    return { H, pts };
  }

  private areaOf(H: number[] | null): number {
    if (!H) return 0;
    return Math.abs(
      quadArea(
        UNIT.map((u) => {
          const [x, y] = project(H, u.x, u.y);
          return { x, y };
        })
      )
    );
  }

  /** Processes one camera frame (grayscale, w×h). Returns the QR homography (unit square → pixels). */
  /**
   * `prior` (optional): 3×3 image homography of the camera rotation since the previous call (from
   * the gyroscope), mapping previous pixel positions to the current ones.
   */
  process(gray: Uint8Array, w: number, h: number, now: number, mediaTime: number, prior?: number[] | null): { H: number[]; text: string } | null {
    let keepPrev = false;
    if (w !== this.w || h !== this.h) {
      const seed = this.pendingSeed;
      this.reset();
      this.pendingSeed = seed;
      this.w = w;
      this.h = h;
    }
    const pyr = buildPyramid(gray, this.w, this.h, LEVELS);
    const frame: Frame = { t: now, mediaTime, gray, H: null };

    // 1. Follow the QR from the previous frame
    if (this.H && this.prevPyr) {
      // Guesses for where each point is now, tried in order until one tracks:
      // 1. the phone's rotation (gyroscope) applied to the points, 2. constant velocity, 3. no motion
      const n = GX.length;
      const before = { x: new Float32Array(n), y: new Float32Array(n) };
      for (let i = 0; i < n; i++) [before.x[i], before.y[i]] = project(this.H, GX[i], GY[i]);
      const guesses: Array<{ x: Float32Array; y: Float32Array } | null> = [];
      if (prior) this.coastPrior = this.coastPrior ? mul3(prior, this.coastPrior) : prior;
      if (this.coastPrior) {
        const g = { x: new Float32Array(n), y: new Float32Array(n) };
        for (let i = 0; i < n; i++) [g.x[i], g.y[i]] = project(this.coastPrior, before.x[i], before.y[i]);
        guesses.push(g);
      }
      if (this.prevPts && this.lostFrames === 0) {
        const g = { x: new Float32Array(n), y: new Float32Array(n) };
        for (let i = 0; i < n; i++) {
          g.x[i] = before.x[i] + 0.7 * (before.x[i] - this.prevPts.x[i]);
          g.y[i] = before.y[i] + 0.7 * (before.y[i] - this.prevPts.y[i]);
        }
        guesses.push(g);
      }
      guesses.push(null);
      let r: ReturnType<TrackCore['track']> = null;
      for (const g of guesses) {
        r = this.track(this.prevPyr, pyr, this.H, g, this.areaOf(this.H));
        if (r) break;
      }
      if (r) {
        this.prevPts = this.lostFrames === 0 ? before : null;
        this.H = r.H;
        this.lostFrames = 0;
        this.coastPrior = null;
      } else if (++this.lostFrames <= MAX_COAST) {
        // A blurred frame: keep the last good frame and try again from it with the next frame
        keepPrev = true;
      } else {
        this.H = null; // lost: wait for the decoder
        this.prevPts = null;
        this.lostFrames = 0;
        this.coastPrior = null;
      }
    }

    // 2. Apply a decode: start tracking, switch QR, or correct drift
    const seed = this.pendingSeed;
    if (seed) {
      this.pendingSeed = null;
      const seedH = homography(UNIT, seed.corners);
      // The decoded frame is usually a few frames old: find exactly that frame (same video time)
      const gap = (f: Frame) => (seed.mediaTime !== undefined ? Math.abs(f.mediaTime - seed.mediaTime) * 1000 : Math.abs(f.t - seed.t));
      let past: Frame | null = null;
      for (const f of [...this.frames, frame]) if (!past || gap(f) < gap(past)) past = f;
      if (past && gap(past) > 60) past = null; // older than the history: cannot be placed reliably
      // While a blurred frame is being skipped, this.H belongs to an older frame: not tracking now
      const trackH = keepPrev ? null : this.H;
      const pastH = past === frame ? trackH : (past?.H ?? null);
      // While tracking, a decode that cannot be matched to a frame is not used (it could pull back)
      let agrees = !!trackH && !past;
      if (trackH && seed.text === this.text && pastH && seedH) {
        // Still tracking the same QR: only correct when it drifted noticeably
        const side = Math.sqrt(this.areaOf(pastH));
        let diff = 0;
        for (const u of UNIT) {
          const [ax, ay] = project(pastH, u.x, u.y);
          const [bx, by] = project(seedH, u.x, u.y);
          diff += Math.hypot(ax - bx, ay - by) / 4;
        }
        agrees = diff < side * 0.025;
      }
      if (!agrees && seedH) {
        let H: number[] | null = seedH;
        if (past && past !== frame && past.gray.length === gray.length) {
          // Carry the decoded position from that frame to this one
          const pastPyr = buildPyramid(past.gray, this.w, this.h, LEVELS);
          let guess: { x: Float32Array; y: Float32Array } | null = null;
          if (trackH && pastH) {
            // Use the tracked motion since then as the guess
            guess = { x: new Float32Array(GX.length), y: new Float32Array(GX.length) };
            for (let i = 0; i < GX.length; i++) {
              const [sx, sy] = project(seedH, GX[i], GY[i]);
              const [ax, ay] = project(pastH, GX[i], GY[i]);
              const [bx, by] = project(trackH, GX[i], GY[i]);
              guess.x[i] = sx + bx - ax;
              guess.y[i] = sy + by - ay;
            }
          }
          H = this.track(pastPyr, pyr, seedH, guess, 0)?.H ?? null;
        }
        if (H) {
          this.H = H;
          this.text = seed.text;
          this.prevPts = null;
          this.lostFrames = 0;
          this.coastPrior = null;
          keepPrev = false;
        }
      }
    }

    const coasting = keepPrev && this.lostFrames > 0;
    frame.H = coasting ? null : this.H;
    this.frames.push(frame);
    if (this.frames.length > HISTORY) this.frames.shift();
    if (!coasting) this.prevPyr = pyr;
    return this.H && !coasting ? { H: this.H, text: this.text } : null;
  }
}
