/**
 * Recognises an uploaded picture (a book page, an illustration) in a camera frame, so a 3D model can
 * appear on the picture itself instead of on a QR sticker. No DOM: runs in a Web Worker and in tests.
 *
 * Classic natural-feature detection (ORB): FAST corners + orientation + rotated BRIEF bits, computed
 * once for the reference picture at several sizes and for every analysed camera frame. Descriptors
 * are matched by Hamming distance and a homography (picture → frame) is fitted with RANSAC. The result
 * only has to start the track: from there the frame-by-frame optical-flow tracker (qrTrackCore) follows
 * the picture like it follows a QR sticker.
 */
import { fitHomography, project } from './lkTracker';
import { homography } from './qrPose';

const PATCH_R = 15; // orientation radius (px)
const BORDER = 18; // keypoints keep this far from the image edge (patch + rotation)
const BITS = 256;
const WORDS = BITS / 32;
const ANGLE_BINS = 32;

export interface Features {
  n: number;
  x: Float32Array; // position in the picture's own pixels (reference) or frame pixels (query)
  y: Float32Array;
  desc: Uint32Array; // WORDS words per keypoint
  smooth?: Gray; // blurred image (camera frames: used to verify a detection)
}

export interface Gray {
  w: number;
  h: number;
  data: Uint8Array;
}

// BRIEF test pattern: 256 point pairs inside a circle (deterministic, same on every device)
const PAIRS: Int8Array = (() => {
  let s = 0x2545f491;
  const rnd = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
  const gauss = () => {
    const u = Math.max(1e-6, rnd());
    const v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const pt = (): [number, number] => {
    for (;;) {
      const x = Math.round(gauss() * 5.5);
      const y = Math.round(gauss() * 5.5);
      if (x * x + y * y <= 12 * 12) return [x, y];
    }
  };
  const out = new Int8Array(BITS * 4);
  for (let i = 0; i < BITS; i++) {
    const [ax, ay] = pt();
    let b = pt();
    while (b[0] === ax && b[1] === ay) b = pt();
    out.set([ax, ay, b[0], b[1]], i * 4);
  }
  return out;
})();

// The pattern rotated to each orientation bin
const ROTATED: Int8Array[] = Array.from({ length: ANGLE_BINS }, (_, k) => {
  const a = (k / ANGLE_BINS) * 2 * Math.PI;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const out = new Int8Array(PAIRS.length);
  for (let i = 0; i < PAIRS.length; i += 2) {
    out[i] = Math.round(c * PAIRS[i] - s * PAIRS[i + 1]);
    out[i + 1] = Math.round(s * PAIRS[i] + c * PAIRS[i + 1]);
  }
  return out;
});

// Offsets of the orientation patch (a disc of radius PATCH_R)
const DISC: Array<[number, number]> = [];
for (let y = -PATCH_R; y <= PATCH_R; y++) for (let x = -PATCH_R; x <= PATCH_R; x++) if (x * x + y * y <= PATCH_R * PATCH_R) DISC.push([x, y]);

/** Grayscale from RGBA pixels. */
export function toGray(rgba: Uint8ClampedArray | Uint8Array, w: number, h: number): Gray {
  const data = new Uint8Array(w * h);
  for (let i = 0, j = 0; i < data.length; i++, j += 4) data[i] = (rgba[j] * 77 + rgba[j + 1] * 150 + rgba[j + 2] * 29) >> 8;
  return { w, h, data };
}

/** Bilinear resize. */
export function resize(src: Gray, w: number, h: number): Gray {
  const out = new Uint8Array(w * h);
  const sx = src.w / w;
  const sy = src.h / h;
  for (let y = 0; y < h; y++) {
    // Box-average when shrinking a lot would be nicer; the blur below takes care of aliasing
    const fy = Math.min(src.h - 1.001, Math.max(0, (y + 0.5) * sy - 0.5));
    const y0 = fy | 0;
    const ty = fy - y0;
    for (let x = 0; x < w; x++) {
      const fx = Math.min(src.w - 1.001, Math.max(0, (x + 0.5) * sx - 0.5));
      const x0 = fx | 0;
      const tx = fx - x0;
      const i = y0 * src.w + x0;
      const d = src.data;
      out[y * w + x] = (d[i] * (1 - tx) + d[i + 1] * tx) * (1 - ty) + (d[i + src.w] * (1 - tx) + d[i + src.w + 1] * tx) * ty;
    }
  }
  return { w, h, data: out };
}

/** Gaussian blur (5-tap binomial, separable). */
function blur(src: Gray): Uint8Array {
  const { w, h, data } = src;
  const tmp = new Uint16Array(w * h);
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const r = y * w;
    for (let x = 0; x < w; x++) {
      const a = data[r + Math.max(0, x - 2)];
      const b = data[r + Math.max(0, x - 1)];
      const c = data[r + x];
      const d = data[r + Math.min(w - 1, x + 1)];
      const e = data[r + Math.min(w - 1, x + 2)];
      tmp[r + x] = a + 4 * b + 6 * c + 4 * d + e;
    }
  }
  for (let y = 0; y < h; y++) {
    const ym2 = Math.max(0, y - 2) * w;
    const ym1 = Math.max(0, y - 1) * w;
    const y0 = y * w;
    const yp1 = Math.min(h - 1, y + 1) * w;
    const yp2 = Math.min(h - 1, y + 2) * w;
    for (let x = 0; x < w; x++) out[y0 + x] = (tmp[ym2 + x] + 4 * tmp[ym1 + x] + 6 * tmp[y0 + x] + 4 * tmp[yp1 + x] + tmp[yp2 + x] + 128) >> 8;
  }
  return out;
}

/** FAST-9 corners with a strength score, non-maximum suppressed, spread over the picture. */
function fastCorners(img: Uint8Array, w: number, h: number, threshold: number, max: number): Array<{ x: number; y: number; s: number }> {
  const circle = [
    [0, -3], [1, -3], [2, -2], [3, -1], [3, 0], [3, 1], [2, 2], [1, 3],
    [0, 3], [-1, 3], [-2, 2], [-3, 1], [-3, 0], [-3, -1], [-2, -2], [-1, -3],
  ].map(([x, y]) => y * w + x);
  const score = new Float32Array(w * h);
  const vals = new Int16Array(16);
  for (let y = BORDER; y < h - BORDER; y++) {
    for (let x = BORDER; x < w - BORDER; x++) {
      const i = y * w + x;
      const p = img[i];
      const hi = p + threshold;
      const lo = p - threshold;
      // Quick rejection with the 4 compass pixels: 3 of them must be all brighter or all darker
      const c0 = img[i + circle[0]];
      const c4 = img[i + circle[4]];
      const c8 = img[i + circle[8]];
      const c12 = img[i + circle[12]];
      const nb = +(c0 > hi) + +(c4 > hi) + +(c8 > hi) + +(c12 > hi);
      const nd = +(c0 < lo) + +(c4 < lo) + +(c8 < lo) + +(c12 < lo);
      if (nb < 3 && nd < 3) continue;
      for (let k = 0; k < 16; k++) vals[k] = img[i + circle[k]] - p;
      // 9 contiguous pixels (wrapping) all brighter or all darker
      let best = 0;
      for (const sign of [1, -1]) {
        let run = 0;
        for (let k = 0; k < 25; k++) {
          if (sign * vals[k & 15] > threshold) {
            if (++run >= 9) {
              best = 1;
              break;
            }
          } else run = 0;
        }
        if (best) break;
      }
      if (!best) continue;
      let s = 0;
      for (let k = 0; k < 16; k++) s += Math.max(0, Math.abs(vals[k]) - threshold);
      score[i] = s;
    }
  }
  // Non-maximum suppression, then the strongest corners per grid cell (so the whole picture is used)
  const CELLS = 8;
  const cw = w / CELLS;
  const ch = h / CELLS;
  const buckets: Array<Array<{ x: number; y: number; s: number }>> = Array.from({ length: CELLS * CELLS }, () => []);
  for (let y = BORDER; y < h - BORDER; y++) {
    for (let x = BORDER; x < w - BORDER; x++) {
      const i = y * w + x;
      const s = score[i];
      if (!s) continue;
      if (
        s < score[i - 1] || s <= score[i + 1] || s < score[i - w - 1] || s < score[i - w] || s < score[i - w + 1] ||
        s <= score[i + w - 1] || s <= score[i + w] || s <= score[i + w + 1]
      )
        continue;
      buckets[Math.min(CELLS - 1, (y / ch) | 0) * CELLS + Math.min(CELLS - 1, (x / cw) | 0)].push({ x, y, s });
    }
  }
  const perCell = Math.ceil((max * 2) / (CELLS * CELLS));
  const all: Array<{ x: number; y: number; s: number }> = [];
  for (const b of buckets) {
    b.sort((p, q) => q.s - p.s);
    for (let k = 0; k < Math.min(perCell, b.length); k++) all.push(b[k]);
  }
  all.sort((p, q) => q.s - p.s);
  return all.slice(0, max);
}

/** ORB features of one image: positions (scaled by `scale` back to the caller's pixels) + descriptors. */
function describe(g: Gray, max: number, scale: number, threshold: number): Features {
  const img = blur(g);
  const { w, h } = g;
  let corners = fastCorners(img, w, h, threshold, max);
  // Too little contrast for the threshold (dim picture): try again more sensitively
  if (corners.length < max / 3 && threshold > 8) corners = fastCorners(img, w, h, Math.max(8, threshold >> 1), max);
  const n = corners.length;
  const f: Features = { n, x: new Float32Array(n), y: new Float32Array(n), desc: new Uint32Array(n * WORDS), smooth: { w, h, data: img } };
  for (let k = 0; k < n; k++) {
    const { x, y } = corners[k];
    // Orientation from the intensity centroid of the patch
    let m10 = 0;
    let m01 = 0;
    for (const [dx, dy] of DISC) {
      const v = img[(y + dy) * w + x + dx];
      m10 += dx * v;
      m01 += dy * v;
    }
    const angle = Math.atan2(m01, m10);
    const bin = ((Math.round((angle / (2 * Math.PI)) * ANGLE_BINS) % ANGLE_BINS) + ANGLE_BINS) % ANGLE_BINS;
    const pat = ROTATED[bin];
    const c = y * w + x;
    for (let b = 0; b < BITS; b++) {
      const o = b * 4;
      if (img[c + pat[o + 1] * w + pat[o]] < img[c + pat[o + 3] * w + pat[o + 2]]) f.desc[k * WORDS + (b >> 5)] |= 1 << (b & 31);
    }
    f.x[k] = x * scale;
    f.y[k] = y * scale;
  }
  return f;
}

function concat(list: Features[]): Features {
  const n = list.reduce((s, f) => s + f.n, 0);
  const out: Features = { n, x: new Float32Array(n), y: new Float32Array(n), desc: new Uint32Array(n * WORDS) };
  let o = 0;
  for (const f of list) {
    out.x.set(f.x, o);
    out.y.set(f.y, o);
    out.desc.set(f.desc, o * WORDS);
    o += f.n;
  }
  return out;
}

export interface Reference {
  w: number; // picture size (px) that positions refer to
  h: number;
  features: Features;
  thumb: Gray; // small blurred copy (THUMB px long side) to verify detections
  frontal: number; // keypoints of the picture seen straight on (how detailed it is)
}

const THUMB = 64;

/**
 * Features of a reference picture at several sizes, so it is recognised from close by (big in the
 * frame) and from further away (small). Positions are in the picture's pixels at `REF_SIZE`.
 */
export const REF_SIZE = 640;
export function buildReference(src: Gray): Reference {
  const s = REF_SIZE / Math.max(src.w, src.h);
  const w = Math.round(src.w * s);
  const h = Math.round(src.h * s);
  const base = resize(src, w, h);
  const levels: Features[] = [];
  for (let k = 0, f = 1; k < 7 && Math.min(w, h) * f >= 90; k++, f *= 0.78) {
    const lw = Math.round(w * f);
    const lh = Math.round(h * f);
    levels.push(describe(f === 1 ? base : resize(base, lw, lh), k === 0 ? 400 : 260, w / lw, 20));
  }
  const frontal = levels.reduce((n, f) => n + f.n, 0);
  // The picture seen at a steep angle (from the side, from behind the book): corner patterns are
  // squeezed in one direction and no longer match the frontal ones. Squeezed copies in 4 directions
  // are described too, their keypoints mapped back to the picture (affine simulation, as in ASIFT).
  for (const angle of TILT_DIRECTIONS) {
    const c = Math.cos(angle);
    const sn = Math.sin(angle);
    // Squeeze along (c, sn) by TILT_SQUEEZE: M = R · diag(TILT_SQUEEZE, 1) · Rᵀ
    const k = TILT_SQUEEZE;
    const M = [c * c * k + sn * sn, c * sn * (k - 1), c * sn * (k - 1), sn * sn * k + c * c];
    for (let lv = 0, f = 1; lv < 3 && Math.min(w, h) * f * k >= 90; lv++, f *= 0.72) {
      const warped = warpAffine(base, M.map((v) => v * f));
      const feats = describe(warped.img, 220, 1, 20);
      const inv = invert2(M.map((v) => v * f));
      for (let i = 0; i < feats.n; i++) {
        const x = feats.x[i] - warped.tx;
        const y = feats.y[i] - warped.ty;
        feats.x[i] = inv[0] * x + inv[1] * y;
        feats.y[i] = inv[2] * x + inv[3] * y;
      }
      levels.push(feats);
    }
  }
  const tw = Math.max(8, Math.round((w / Math.max(w, h)) * THUMB));
  const th = Math.max(8, Math.round((h / Math.max(w, h)) * THUMB));
  const thumb = { w: tw, h: th, data: blur(resize({ w, h, data: blur(base) }, tw, th)) };
  return { w, h, features: concat(levels), thumb, frontal };
}

const TILT_DIRECTIONS = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4];
const TILT_SQUEEZE = 0.5; // ≈ 60° away from looking straight at the picture

function invert2(m: number[]): number[] {
  const det = m[0] * m[3] - m[1] * m[2];
  return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det];
}

/** The picture transformed by the 2×2 matrix `m` (row-major), fitted into a new image. */
function warpAffine(src: Gray, m: number[]): { img: Gray; tx: number; ty: number } {
  const xs = [0, src.w, 0, src.w].map((x, i) => m[0] * x + m[1] * (i < 2 ? 0 : src.h));
  const ys = [0, src.w, 0, src.w].map((x, i) => m[2] * x + m[3] * (i < 2 ? 0 : src.h));
  const tx = -Math.min(...xs) + BORDER;
  const ty = -Math.min(...ys) + BORDER;
  const w = Math.ceil(Math.max(...xs) - Math.min(...xs)) + 2 * BORDER;
  const h = Math.ceil(Math.max(...ys) - Math.min(...ys)) + 2 * BORDER;
  const inv = invert2(m);
  const out = new Uint8Array(w * h).fill(128);
  const d = src.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = inv[0] * (x - tx) + inv[1] * (y - ty);
      const v = inv[2] * (x - tx) + inv[3] * (y - ty);
      if (u < 0 || v < 0 || u >= src.w - 1 || v >= src.h - 1) continue;
      const x0 = u | 0;
      const y0 = v | 0;
      const fx = u - x0;
      const fy = v - y0;
      const i = y0 * src.w + x0;
      out[y * w + x] = (d[i] * (1 - fx) + d[i + 1] * fx) * (1 - fy) + (d[i + src.w] * (1 - fx) + d[i + src.w + 1] * fx) * fy;
    }
  }
  return { img: { w, h, data: out }, tx, ty };
}

/** Features of a camera frame (already scaled to the analysis width). */
export function describeFrame(g: Gray, max = 700): Features {
  return describe(g, max, 1, 20);
}

function popcount(v: number): number {
  v -= (v >>> 1) & 0x55555555;
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

const MAX_DIST = 64;

/**
 * Matches every frame keypoint to its nearest reference keypoint. The second-nearest one must be
 * clearly further away (ratio test), ignoring copies of the same picture spot at other sizes.
 */
function match(q: Features, r: Features): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const qd = q.desc;
  const rd = r.desc;
  for (let i = 0; i < q.n; i++) {
    const qo = i * WORDS;
    let d1 = 999;
    let d2 = 999;
    let j1 = -1;
    for (let j = 0; j < r.n; j++) {
      const ro = j * WORDS;
      let d = 0;
      for (let k = 0; k < WORDS && d < d2; k++) d += popcount(qd[qo + k] ^ rd[ro + k]);
      if (d >= d2) continue;
      if (d < d1) {
        // The previous best becomes the runner-up only when it is a different spot of the picture
        if (j1 >= 0 && Math.abs(r.x[j] - r.x[j1]) + Math.abs(r.y[j] - r.y[j1]) > 10) d2 = d1;
        d1 = d;
        j1 = j;
      } else if (Math.abs(r.x[j] - r.x[j1]) + Math.abs(r.y[j] - r.y[j1]) > 10) {
        d2 = d;
      }
    }
    if (j1 >= 0 && d1 <= MAX_DIST && d1 < 0.8 * d2) out.push([i, j1]);
  }
  return out;
}

export interface Detection {
  H: number[]; // reference picture pixels → frame pixels
  inliers: number;
  matches: number;
  similarity: number; // correlation of the picture with the frame where it was found (-1..1)
}

/**
 * Does the frame really show the picture where the homography puts it? Pages of one book share
 * characters and fonts, so feature matches alone can find the right character on the wrong page.
 * The frame is sampled at the picture's thumbnail grid and correlated with it (normalised, so
 * lighting does not matter). Returns -1 when too little of the picture is inside the frame.
 */
function similarity(H: number[], ref: Reference, frame: Gray): number {
  const { thumb } = ref;
  const sx = ref.w / thumb.w;
  const sy = ref.h / thumb.h;
  const img = frame.data;
  const fw = frame.w;
  let n = 0;
  let sa = 0;
  let sb = 0;
  let saa = 0;
  let sbb = 0;
  let sab = 0;
  for (let y = 0; y < thumb.h; y++) {
    for (let x = 0; x < thumb.w; x++) {
      const [px, py] = project(H, (x + 0.5) * sx, (y + 0.5) * sy);
      if (!(px >= 0 && py >= 0 && px < frame.w - 1 && py < frame.h - 1)) continue;
      const x0 = px | 0;
      const y0 = py | 0;
      const tx = px - x0;
      const ty = py - y0;
      const i = y0 * fw + x0;
      const b = (img[i] * (1 - tx) + img[i + 1] * tx) * (1 - ty) + (img[i + fw] * (1 - tx) + img[i + fw + 1] * tx) * ty;
      const a = thumb.data[y * thumb.w + x];
      n++;
      sa += a;
      sb += b;
      saa += a * a;
      sbb += b * b;
      sab += a * b;
    }
  }
  if (n < thumb.w * thumb.h * 0.3) return -1;
  const va = saa - (sa * sa) / n;
  const vb = sbb - (sb * sb) / n;
  if (va <= 1e-6 || vb <= 1e-6) return 0;
  return (sab - (sa * sb) / n) / Math.sqrt(va * vb);
}

// Minimum correlation of a detected picture with the frame
const MIN_SIMILARITY = 0.65;

function convexQuad(c: Array<[number, number]>): boolean {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = c[i];
    const b = c[(i + 1) % 4];
    const d = c[(i + 2) % 4];
    const cross = (b[0] - a[0]) * (d[1] - b[1]) - (b[1] - a[1]) * (d[0] - b[0]);
    if (Math.abs(cross) < 1e-6) return false;
    if (sign === 0) sign = Math.sign(cross);
    else if (Math.sign(cross) !== sign) return false;
  }
  return true;
}

const MIN_INLIERS = 12;
// Largest descriptor distance (of 256 bits) accepted as a match
const MATCH_DIST = 56;

/** Finds the reference picture in the frame. null when it is not (reliably) there. */
export function detect(frame: Features, ref: Reference, frameW: number, frameH: number, matches?: Array<[number, number]>): Detection | null {
  const m = matches ?? match(frame, ref.features);
  if (m.length < MIN_INLIERS) return null;
  const sx = new Float32Array(m.length);
  const sy = new Float32Array(m.length);
  const dx = new Float32Array(m.length);
  const dy = new Float32Array(m.length);
  m.forEach(([qi, ri], k) => {
    sx[k] = ref.features.x[ri];
    sy[k] = ref.features.y[ri];
    dx[k] = frame.x[qi];
    dy[k] = frame.y[qi];
  });
  const tol = Math.max(4, frameW / 120);
  const inliersOf = (H: number[], use: Uint8Array) => {
    let c = 0;
    for (let k = 0; k < m.length; k++) {
      const [x, y] = project(H, sx[k], sy[k]);
      const ok = Math.abs(x - dx[k]) + Math.abs(y - dy[k]) < tol * 1.4 ? 1 : 0;
      use[k] = ok;
      c += ok;
    }
    return c;
  };
  let seed = 12345;
  const rnd = (n: number) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % n;
  };
  let bestH: number[] | null = null;
  let best = 0;
  const use = new Uint8Array(m.length);
  const bestUse = new Uint8Array(m.length);
  for (let it = 0; it < 400; it++) {
    const pick: number[] = [];
    while (pick.length < 4) {
      const k = rnd(m.length);
      if (!pick.includes(k)) pick.push(k);
    }
    const H = homography(
      pick.map((k) => ({ x: sx[k], y: sy[k] })),
      pick.map((k) => ({ x: dx[k], y: dy[k] }))
    );
    if (!H || H.some((v) => !Number.isFinite(v))) continue;
    const c = inliersOf(H, use);
    if (c > best) {
      best = c;
      bestH = H;
      bestUse.set(use);
      if (c > m.length * 0.8) break;
    }
  }
  if (!bestH || best < MIN_INLIERS) return null;
  // Least-squares refinement over all inliers (twice: the inlier set grows a little)
  let H = fitHomography(sx, sy, dx, dy, bestUse) ?? bestH;
  const refined = new Uint8Array(m.length);
  const count = inliersOf(H, refined);
  if (count >= best) H = fitHomography(sx, sy, dx, dy, refined) ?? H;
  const inliers = Math.max(best, count);
  if (inliers < MIN_INLIERS || inliers < m.length * 0.2) return null;
  // Sanity: the picture must appear as a convex, not absurdly distorted, reasonably large shape
  const quad: Array<[number, number]> = [
    project(H, 0, 0),
    project(H, ref.w, 0),
    project(H, ref.w, ref.h),
    project(H, 0, ref.h),
  ];
  if (!convexQuad(quad)) return null;
  const side = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const s = [side(quad[0], quad[1]), side(quad[1], quad[2]), side(quad[2], quad[3]), side(quad[3], quad[0])];
  if (Math.min(...s) < Math.min(frameW, frameH) * 0.08) return null;
  if (s[0] / s[2] > 4 || s[2] / s[0] > 4 || s[1] / s[3] > 4 || s[3] / s[1] > 4) return null;
  const sim = frame.smooth ? similarity(H, ref, frame.smooth) : 1;
  // Close up, only part of the picture is in view: then the feature evidence must be strong
  if (sim < MIN_SIMILARITY && !(sim === -1 && inliers >= 40)) return null;
  return { H, inliers, matches: m.length, similarity: sim };
}

/**
 * Corners (TL, TR, BR, BL, frame pixels) of the centred square of the picture whose side is the
 * picture's shorter side: what the tracker follows (like a QR sticker's square).
 */
export function centreSquare(det: Detection, ref: Reference): Array<{ x: number; y: number }> {
  const s = Math.min(ref.w, ref.h);
  const x0 = (ref.w - s) / 2;
  const y0 = (ref.h - s) / 2;
  return [
    [x0, y0],
    [x0 + s, y0],
    [x0 + s, y0 + s],
    [x0, y0 + s],
  ].map(([x, y]) => {
    const [px, py] = project(det.H, x, y);
    return { x: px, y: py };
  });
}

/** Ranks competing detections: matches that agree, weighted by how well the whole picture matches. */
function score(d: Detection): number {
  const sim = d.similarity < 0 ? 0.7 : d.similarity;
  return d.inliers * sim * sim * sim;
}

// Fast lookup over the keypoints of all pictures (locality-sensitive hashing on descriptor bits):
// a frame keypoint is only compared with the few reference keypoints that share a bucket
const TABLES = 12;
const HASH_BITS = 16;
const HASH_PICKS: number[][] = (() => {
  let s = 0x9e3779b9;
  const rnd = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) % BITS;
  };
  return Array.from({ length: TABLES }, () => {
    const set = new Set<number>();
    while (set.size < HASH_BITS) set.add(rnd());
    return [...set];
  });
})();

function hashOf(desc: Uint32Array, k: number, table: number): number {
  let h = 0;
  const o = k * WORDS;
  for (const b of HASH_PICKS[table]) h = (h << 1) | ((desc[o + (b >> 5)] >>> (b & 31)) & 1);
  return h;
}

/** All reference pictures, for recognising which one is in the frame. */
export class ReferenceIndex {
  private refs = new Map<string, Reference>();
  private tables: Array<Map<number, number[]>> = [];
  private owner: string[] = []; // keypoint slot → picture key
  private offset = new Map<string, number>(); // first keypoint slot of each picture
  private desc = new Uint32Array(0);
  private dirty = true;
  private seen = new Uint32Array(0);
  private stamp = 0;
  /** Descriptor comparisons of the last search (diagnostics). */
  compared = 0;

  set(key: string, ref: Reference) {
    this.refs.set(key, ref);
    this.dirty = true;
  }

  delete(key: string) {
    if (this.refs.delete(key)) this.dirty = true;
  }

  has(key: string): boolean {
    return this.refs.has(key);
  }

  get(key: string): Reference | undefined {
    return this.refs.get(key);
  }

  keys(): string[] {
    return [...this.refs.keys()];
  }

  private rebuild() {
    this.dirty = false;
    const total = [...this.refs.values()].reduce((s, r) => s + r.features.n, 0);
    this.desc = new Uint32Array(total * WORDS);
    this.owner = new Array(total);
    this.tables = Array.from({ length: TABLES }, () => new Map<number, number[]>());
    let o = 0;
    this.offset.clear();
    for (const [key, r] of this.refs) {
      this.offset.set(key, o);
      this.desc.set(r.features.desc, o * WORDS);
      for (let k = 0; k < r.features.n; k++) {
        this.owner[o + k] = key;
        for (let t = 0; t < TABLES; t++) {
          const h = hashOf(r.features.desc, k, t);
          const bucket = this.tables[t].get(h);
          if (bucket) bucket.push(o + k);
          else this.tables[t].set(h, [o + k]);
        }
      }
      o += r.features.n;
    }
  }

  /**
   * Matches frame keypoints to the reference keypoints that share a hash bucket. Each frame keypoint
   * gives its nearest keypoint, and the nearest one of another picture (pages of a book share
   * characters, the right page must still get its matches). Result per picture: [frame kp, own kp].
   */
  private lookup(frame: Features, only?: string): Map<string, Array<[number, number]>> {
    if (this.dirty) this.rebuild();
    const out = new Map<string, Array<[number, number]>>();
    if (this.seen.length < this.owner.length) this.seen = new Uint32Array(this.owner.length);
    const seen = this.seen;
    let compared = 0;
    // Nearest keypoint of each of the 3 closest pictures (sorted by distance)
    const bd = [0, 0, 0];
    const bj = [-1, -1, -1];
    for (let i = 0; i < frame.n; i++) {
      const stamp = ++this.stamp;
      bd.fill(MATCH_DIST + 1);
      bj.fill(-1);
      for (let t = 0; t < TABLES; t++) {
        const bucket = this.tables[t].get(hashOf(frame.desc, i, t));
        if (!bucket) continue;
        for (const j of bucket) {
          if (seen[j] === stamp) continue;
          seen[j] = stamp;
          const owner = this.owner[j];
          if (only && owner !== only) continue;
          compared++;
          let d = 0;
          for (let k = 0; k < WORDS && d < bd[2]; k++) d += popcount(frame.desc[i * WORDS + k] ^ this.desc[j * WORDS + k]);
          if (d >= bd[2]) continue;
          // Same picture already listed: keep its nearer keypoint; else insert in order
          let slot = 2;
          for (let s = 0; s < 3; s++) {
            if (bj[s] >= 0 && this.owner[bj[s]] === owner) {
              slot = s;
              break;
            }
          }
          if (d >= bd[slot]) continue;
          bd[slot] = d;
          bj[slot] = j;
          for (let s = slot; s > 0 && bd[s] < bd[s - 1]; s--) {
            [bd[s], bd[s - 1]] = [bd[s - 1], bd[s]];
            [bj[s], bj[s - 1]] = [bj[s - 1], bj[s]];
          }
        }
      }
      for (const j of bj) {
        if (j < 0) continue;
        const key = this.owner[j];
        let list = out.get(key);
        if (!list) out.set(key, (list = []));
        list.push([i, j - this.offset.get(key)!]);
      }
    }
    this.compared = compared;
    return out;
  }

  /** Pictures that share the most close keypoints with the frame, best first. */
  candidates(frame: Features, limit = 2): string[] {
    return [...this.lookup(frame).entries()]
      .filter(([, v]) => v.length >= MIN_INLIERS)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, limit)
      .map(([k]) => k);
  }

  /**
   * The picture in the frame and where it is, or null. `only`: just look for this picture (it is
   * being tracked already; this corrects drift).
   */
  find(frame: Features, frameW: number, frameH: number, only?: string): { key: string; det: Detection } | null {
    if (only && !this.refs.has(only)) return null;
    const matches = this.lookup(frame, only);
    const keys = [...matches.entries()]
      .filter(([, v]) => v.length >= MIN_INLIERS)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3)
      .map(([k]) => k);
    const found = keys
      .map((key) => ({ key, det: detect(frame, this.refs.get(key)!, frameW, frameH, matches.get(key)) }))
      .filter((r): r is { key: string; det: Detection } => !!r.det)
      .sort((a, b) => score(b.det) - score(a.det));
    if (found.length === 0) return null;
    // Pages of one book share characters: the winner must be clearly better than the runner-up,
    // by its matches or by how much of the whole picture looks right
    if (found.length > 1) {
      const [a, b] = found;
      if (score(b.det) > score(a.det) * 0.8 && Math.abs(a.det.similarity - b.det.similarity) < 0.06) return null;
    }
    return found[0];
  }
}
