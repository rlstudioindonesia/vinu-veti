/**
 * Pyramidal Lucas-Kanade optical flow (Bouguet) + robust homography fit.
 *
 * Used to follow the QR sticker in every camera frame between (slow) QR decodes: dozens of points on
 * the QR pattern are tracked from one frame to the next and a homography is fitted through them, which
 * is far steadier than the 4 corners from the decoder and also follows the phone when it slides
 * sideways (the gyroscope only knows about rotation).
 */

export interface Level {
  w: number;
  h: number;
  img: Float32Array;
  gx: Float32Array;
  gy: Float32Array;
}

export type Pyramid = Level[];

function gradients(img: Float32Array, w: number, h: number): { gx: Float32Array; gy: Float32Array } {
  const gx = new Float32Array(w * h);
  const gy = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    const row = y * w;
    for (let x = 1; x < w - 1; x++) {
      const i = row + x;
      // Scharr-like (3/10/3) derivative, scaled to an intensity difference per pixel
      gx[i] =
        (3 * (img[i - w + 1] - img[i - w - 1]) + 10 * (img[i + 1] - img[i - 1]) + 3 * (img[i + w + 1] - img[i + w - 1])) / 32;
      gy[i] =
        (3 * (img[i + w - 1] - img[i - w - 1]) + 10 * (img[i + w] - img[i - w]) + 3 * (img[i + w + 1] - img[i - w + 1])) / 32;
    }
  }
  return { gx, gy };
}

/** Builds an image pyramid from an 8-bit grayscale image (level 0 = full size). */
export function buildPyramid(gray: Uint8Array | Float32Array, w: number, h: number, levels: number): Pyramid {
  const out: Pyramid = [];
  let img = gray instanceof Float32Array ? gray : Float32Array.from(gray);
  let cw = w;
  let ch = h;
  for (let l = 0; l < levels; l++) {
    out.push({ w: cw, h: ch, img, ...gradients(img, cw, ch) });
    if (l === levels - 1) break;
    const nw = cw >> 1;
    const nh = ch >> 1;
    if (nw < 16 || nh < 16) break;
    const next = new Float32Array(nw * nh);
    for (let y = 0; y < nh; y++) {
      const r0 = 2 * y * cw;
      const r1 = r0 + cw;
      for (let x = 0; x < nw; x++) {
        const c = 2 * x;
        next[y * nw + x] = (img[r0 + c] + img[r0 + c + 1] + img[r1 + c] + img[r1 + c + 1]) * 0.25;
      }
    }
    img = next;
    cw = nw;
    ch = nh;
  }
  return out;
}

function sample(img: Float32Array, w: number, x: number, y: number): number {
  const x0 = x | 0;
  const y0 = y | 0;
  const ax = x - x0;
  const ay = y - y0;
  const i = y0 * w + x0;
  return (img[i] * (1 - ax) + img[i + 1] * ax) * (1 - ay) + (img[i + w] * (1 - ax) + img[i + w + 1] * ax) * ay;
}

const HALF = 6; // 13×13 window
const WIN = (2 * HALF + 1) ** 2;
const MAX_ITER = 10;
const MIN_EIG = 4; // per-pixel gradient energy (intensity²): rejects flat, texture-less spots

// Reused buffers for the window of the previous image
let patchI = new Float32Array(WIN);
let patchX = new Float32Array(WIN);
let patchY = new Float32Array(WIN);

export interface TrackResult {
  x: Float32Array;
  y: Float32Array;
  ok: Uint8Array;
  err: Float32Array; // mean absolute intensity difference of the window (0-255)
}

/**
 * Tracks points from `prev` to `next`. `guessX/guessY` are the predicted positions in `next`
 * (e.g. from the motion so far); pass the same as px/py for "no motion".
 */
export function trackPoints(
  prev: Pyramid,
  next: Pyramid,
  px: Float32Array,
  py: Float32Array,
  guessX: Float32Array,
  guessY: Float32Array,
  half = HALF
): TrackResult {
  const maxWin = (2 * half + 1) ** 2;
  if (patchI.length < maxWin) {
    patchI = new Float32Array(maxWin);
    patchX = new Float32Array(maxWin);
    patchY = new Float32Array(maxWin);
  }
  const n = px.length;
  const res: TrackResult = { x: new Float32Array(n), y: new Float32Array(n), ok: new Uint8Array(n), err: new Float32Array(n) };
  const levels = Math.min(prev.length, next.length);
  for (let k = 0; k < n; k++) {
    // Displacement guess carried down the pyramid (in level-0 pixels at the start)
    let gX = (guessX[k] - px[k]) / (1 << levels);
    let gY = (guessY[k] - py[k]) / (1 << levels);
    let ok = true;
    let lastErr = 0;
    for (let l = levels - 1; l >= 0 && ok; l--) {
      gX *= 2;
      gY *= 2;
      const P = prev[l];
      const N = next[l];
      // Large windows are shrunk on the small, coarse levels so they still fit in the image
      const HALF = Math.min(half, (Math.min(P.w, P.h) >> 1) - 4);
      if (HALF < 3) continue;
      const WIN = (2 * HALF + 1) ** 2;
      const s = 1 / (1 << l);
      const cx = px[k] * s;
      const cy = py[k] * s;
      if (cx < HALF + 1 || cy < HALF + 1 || cx > P.w - HALF - 2 || cy > P.h - HALF - 2) {
        if (l === 0) ok = false;
        continue; // point too close to the border at this level: keep the guess
      }
      let gxx = 0;
      let gxy = 0;
      let gyy = 0;
      let j = 0;
      for (let dy = -HALF; dy <= HALF; dy++) {
        for (let dx = -HALF; dx <= HALF; dx++, j++) {
          const ix = sample(P.gx, P.w, cx + dx, cy + dy);
          const iy = sample(P.gy, P.w, cx + dx, cy + dy);
          patchI[j] = sample(P.img, P.w, cx + dx, cy + dy);
          patchX[j] = ix;
          patchY[j] = iy;
          gxx += ix * ix;
          gxy += ix * iy;
          gyy += iy * iy;
        }
      }
      const det = gxx * gyy - gxy * gxy;
      const tr = gxx + gyy;
      const minEig = (tr - Math.sqrt(Math.max(0, tr * tr - 4 * det))) / 2 / WIN;
      if (minEig < MIN_EIG || det < 1e-6) {
        if (l === 0) ok = false;
        continue;
      }
      let vx = 0;
      let vy = 0;
      for (let it = 0; it < MAX_ITER; it++) {
        const qx = cx + gX + vx;
        const qy = cy + gY + vy;
        if (qx < HALF + 1 || qy < HALF + 1 || qx > N.w - HALF - 2 || qy > N.h - HALF - 2) {
          if (l === 0) ok = false; // on coarser levels keep the estimate so far, finer levels refine it
          break;
        }
        let bx = 0;
        let by = 0;
        let e = 0;
        j = 0;
        for (let dy = -HALF; dy <= HALF; dy++) {
          for (let dx = -HALF; dx <= HALF; dx++, j++) {
            const diff = patchI[j] - sample(N.img, N.w, qx + dx, qy + dy);
            bx += diff * patchX[j];
            by += diff * patchY[j];
            e += Math.abs(diff);
          }
        }
        lastErr = e / WIN;
        const ux = (gyy * bx - gxy * by) / det;
        const uy = (gxx * by - gxy * bx) / det;
        vx += ux;
        vy += uy;
        if (ux * ux + uy * uy < 0.0009) break; // < 0.03 px
      }
      gX += vx;
      gY += vy;
    }
    res.x[k] = px[k] + gX;
    res.y[k] = py[k] + gY;
    res.ok[k] = ok ? 1 : 0;
    res.err[k] = lastErr;
  }
  return res;
}

/** Solves A x = b (n×n, Gaussian elimination with partial pivoting). */
function solve(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / M[r][r];
  }
  return x;
}

/** Least-squares homography (h33 = 1) mapping (sx, sy) → (dx, dy) for the selected points. */
export function fitHomography(
  sx: ArrayLike<number>,
  sy: ArrayLike<number>,
  dx: ArrayLike<number>,
  dy: ArrayLike<number>,
  use: ArrayLike<number>
): number[] | null {
  // Normalise the destination (pixels) for a well-conditioned system
  let mx = 0;
  let my = 0;
  let n = 0;
  for (let i = 0; i < use.length; i++) {
    if (!use[i]) continue;
    mx += dx[i];
    my += dy[i];
    n++;
  }
  if (n < 4) return null;
  mx /= n;
  my /= n;
  let spread = 0;
  for (let i = 0; i < use.length; i++) if (use[i]) spread += Math.hypot(dx[i] - mx, dy[i] - my);
  const sc = spread > 0 ? n / spread : 1;

  const AtA = Array.from({ length: 8 }, () => new Array(8).fill(0));
  const Atb = new Array(8).fill(0);
  const add = (row: number[], b: number) => {
    for (let r = 0; r < 8; r++) {
      if (row[r] === 0) continue;
      Atb[r] += row[r] * b;
      for (let c = 0; c < 8; c++) AtA[r][c] += row[r] * row[c];
    }
  };
  for (let i = 0; i < use.length; i++) {
    if (!use[i]) continue;
    const X = sx[i];
    const Y = sy[i];
    const x = (dx[i] - mx) * sc;
    const y = (dy[i] - my) * sc;
    add([X, Y, 1, 0, 0, 0, -x * X, -x * Y], x);
    add([0, 0, 0, X, Y, 1, -y * X, -y * Y], y);
  }
  const h = solve(AtA, Atb);
  if (!h) return null;
  // Undo the normalisation: H = T⁻¹ · Hn, with T = [sc 0 -sc·mx; 0 sc -sc·my; 0 0 1]
  const Hn = [...h, 1];
  const inv = 1 / sc;
  const H = [
    Hn[0] * inv + mx * Hn[6],
    Hn[1] * inv + mx * Hn[7],
    Hn[2] * inv + mx * Hn[8],
    Hn[3] * inv + my * Hn[6],
    Hn[4] * inv + my * Hn[7],
    Hn[5] * inv + my * Hn[8],
    Hn[6],
    Hn[7],
    Hn[8],
  ];
  return H.map((v) => v / H[8]);
}

export function project(H: number[], X: number, Y: number): [number, number] {
  const w = H[6] * X + H[7] * Y + H[8];
  return [(H[0] * X + H[1] * Y + H[2]) / w, (H[3] * X + H[4] * Y + H[5]) / w];
}
