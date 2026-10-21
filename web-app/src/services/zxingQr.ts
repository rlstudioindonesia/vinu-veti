/**
 * ZXing's QR reader only (the whole @zxing/library is several times bigger: barcodes, writers, PDF417…).
 * Loaded on demand by barcodeScanner: phones with the built-in Android QR detector only need it in
 * dark rooms, so it is not downloaded and parsed when the AR camera opens.
 */
import BarcodeFormat from '@zxing/library/esm/core/BarcodeFormat';
import BinaryBitmap from '@zxing/library/esm/core/BinaryBitmap';
import DecodeHintType from '@zxing/library/esm/core/DecodeHintType';
import BitMatrix from '@zxing/library/esm/core/common/BitMatrix';
import GridSamplerInstance from '@zxing/library/esm/core/common/GridSamplerInstance';
import HybridBinarizer from '@zxing/library/esm/core/common/HybridBinarizer';
import PerspectiveTransform from '@zxing/library/esm/core/common/PerspectiveTransform';
import QRCodeReader from '@zxing/library/esm/core/qrcode/QRCodeReader';
import Decoder from '@zxing/library/esm/core/qrcode/decoder/Decoder';
import Detector from '@zxing/library/esm/core/qrcode/detector/Detector';
import FinderPatternFinder from '@zxing/library/esm/core/qrcode/detector/FinderPatternFinder';
import { HTMLCanvasElementLuminanceSource } from '@zxing/library/esm/browser/HTMLCanvasElementLuminanceSource';

export interface ZxingQr {
  text: string;
  // [bottomLeft, topLeft, topRight] finder centres and, for version 2+, the alignment pattern (canvas px)
  points: Array<{ x: number; y: number; moduleSize: number }>;
  // Outer corners (TL, TR, BR, BL, canvas px) following the real perspective, when known
  corners?: Array<{ x: number; y: number }>;
}

const reader = new QRCodeReader();
const decoder = new Decoder();
const hints = new Map<DecodeHintType, unknown>([
  [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]],
  [DecodeHintType.TRY_HARDER, true],
]);

// Search range (modules) for the missing 4th corner of a small QR seen at an angle
const SEARCH = 5;
const OFFSETS: Array<[number, number]> = [];
for (let a = -SEARCH; a <= SEARCH; a++) for (let b = -SEARCH; b <= SEARCH; b++) OFFSETS.push([a, b]);
OFFSETS.sort((p, q) => Math.abs(p[0]) + Math.abs(p[1]) - (Math.abs(q[0]) + Math.abs(q[1])));

type Pt = { getX(): number; getY(): number; getEstimatedModuleSize?: () => number };

/**
 * Small QR codes (version 1, like the stickers' short codes) have no alignment pattern: ZXing then
 * assumes the code is a parallelogram, which fails (or gives slanted corners) when the book is seen
 * from the side, from behind or at a steep angle. Here the 4th corner is searched instead: the grid
 * is sampled for a range of positions of the bottom-right corner and the one whose bits decode with
 * the fewest corrected errors wins (Reed-Solomon makes a wrong position fail, so no false reads).
 */
function perspectiveDecode(matrix: BitMatrix): ZxingQr | null {
  let info;
  try {
    info = new FinderPatternFinder(matrix, null).find(hints);
  } catch {
    return null;
  }
  const tl = info.getTopLeft() as unknown as Pt;
  const tr = info.getTopRight() as unknown as Pt;
  const bl = info.getBottomLeft() as unknown as Pt;
  const det = new Detector(matrix) as unknown as { calculateModuleSize(a: Pt, b: Pt, c: Pt): number };
  const moduleSize = det.calculateModuleSize(tl, tr, bl);
  if (!(moduleSize >= 1)) return null;
  let dimension: number;
  try {
    dimension = (Detector as unknown as { computeDimension(a: Pt, b: Pt, c: Pt, m: number): number }).computeDimension(tl, tr, bl, moduleSize);
  } catch {
    return null;
  }
  const dims = [dimension, dimension - 4, dimension + 4].filter((d, i, all) => d >= 21 && d <= 41 && all.indexOf(d) === i);
  const sampler = GridSamplerInstance.getInstance();
  let best: { text: string; errors: number; br: { x: number; y: number }; dim: number; shift: number; bits: BitMatrix } | null = null;
  for (const dim of dims) {
    const span = dim - 7;
    const ux = (tr.getX() - tl.getX()) / span;
    const uy = (tr.getY() - tl.getY()) / span;
    const vx = (bl.getX() - tl.getX()) / span;
    const vy = (bl.getY() - tl.getY()) / span;
    const x0 = tr.getX() + bl.getX() - tl.getX();
    const y0 = tr.getY() + bl.getY() - tl.getY();
    for (const [a, b] of OFFSETS) {
      if (best && Math.abs(a) + Math.abs(b) > best.shift + 2) break; // the closest decodes are enough
      const br = { x: x0 + a * ux + b * vx, y: y0 + a * uy + b * vy };
      const far = dim - 3.5;
      const transform = PerspectiveTransform.quadrilateralToQuadrilateral(
        3.5, 3.5, far, 3.5, far, far, 3.5, far,
        tl.getX(), tl.getY(), tr.getX(), tr.getY(), br.x, br.y, bl.getX(), bl.getY()
      );
      try {
        const bits = sampler.sampleGridWithTransform(matrix, dim, dim, transform);
        // decoding unmasks (and may mirror) the matrix in place: keep the sampled bits for refine()
        const sampled = bits.clone();
        const r = decoder.decodeBitMatrix(bits, hints);
        const errors = r.getErrorsCorrected() ?? 0;
        if (!best || errors < best.errors) best = { text: r.getText(), errors, br, dim, shift: Math.abs(a) + Math.abs(b), bits: sampled };
        if (errors === 0) break;
      } catch {
        // wrong corner position (or outside the image): try the next one
      }
    }
    if (best) break;
  }
  if (!best) return null;
  // Outer corners from the 4 finder-centre positions (3.5 modules inside the edge), refined
  const far = best.dim - 3.5;
  const anchors = refine(matrix, best.bits, best.dim, [tl.getX(), tl.getY(), tr.getX(), tr.getY(), best.br.x, best.br.y, bl.getX(), bl.getY()], moduleSize);
  const toImage = PerspectiveTransform.quadrilateralToQuadrilateral(3.5, 3.5, far, 3.5, far, far, 3.5, far, ...(anchors as [number, number, number, number, number, number, number, number]));
  const pts = Float32Array.from([0, 0, best.dim, 0, best.dim, best.dim, 0, best.dim]);
  toImage.transformPoints(pts);
  const corners = [0, 2, 4, 6].map((i) => ({ x: pts[i], y: pts[i + 1] }));
  const ms = (p: Pt) => p.getEstimatedModuleSize?.() ?? moduleSize;
  return {
    text: best.text,
    points: [bl, tl, tr].map((p) => ({ x: p.getX(), y: p.getY(), moduleSize: ms(p) })),
    corners,
  };
}

/**
 * Sub-module refinement of the code's position. The search above only places the 4th corner to
 * about half a module, and the finder centres are a pixel or two off: under perspective that tilts
 * and turns the model by several degrees, and the frame-by-frame tracker keeps following that error.
 * Now that the bits are known, the 4 anchor points are moved in shrinking steps so that points near
 * the edges of every module (not only its centre) land on the module's own colour.
 */
function refine(matrix: BitMatrix, bits: BitMatrix, dim: number, anchors: number[], moduleSize: number): number[] {
  const far = dim - 3.5;
  const SUB = [-0.35, 0.35];
  const w = matrix.getWidth();
  const h = matrix.getHeight();
  const src = new Float32Array(dim * dim * SUB.length * SUB.length * 2);
  const want: boolean[] = [];
  let k = 0;
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      const v = bits.get(x, y);
      for (const dy of SUB) {
        for (const dx of SUB) {
          src[k++] = x + 0.5 + dx;
          src[k++] = y + 0.5 + dy;
          want.push(v);
        }
      }
    }
  }
  const pts = new Float32Array(src.length);
  const score = (a: number[]) => {
    const t = PerspectiveTransform.quadrilateralToQuadrilateral(3.5, 3.5, far, 3.5, far, far, 3.5, far, ...(a as [number, number, number, number, number, number, number, number]));
    pts.set(src);
    t.transformPoints(pts);
    let s = 0;
    for (let i = 0, j = 0; i < pts.length; i += 2, j++) {
      const x = pts[i] | 0;
      const y = pts[i + 1] | 0;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      if (matrix.get(x, y) === want[j]) s++;
    }
    return s;
  };
  let cur = anchors.slice();
  let bestScore = score(cur);
  for (const step of [0.5, 0.25, 0.12, 0.06]) {
    const d = step * moduleSize;
    for (let pass = 0; pass < 4; pass++) {
      let improved = false;
      for (let i = 0; i < 8; i++) {
        for (const sign of [1, -1]) {
          const next = cur.slice();
          next[i] += sign * d;
          const sc = score(next);
          if (sc > bestScore) {
            bestScore = sc;
            cur = next;
            improved = true;
          }
        }
      }
      if (!improved) break;
    }
  }
  return cur;
}

// A book seen at a steep angle squeezes the code vertically: ZXing then rejects its finder patterns
// (their height no longer matches their width). Frames are also tried stretched by these factors,
// one factor per call so a frame without any QR does not cost several decodes.
const STRETCH = [1.7, 2.4];
let stretchTurn = 0;
let stretchCanvas: HTMLCanvasElement | null = null;

/** Reads a QR code from the canvas, or null when there is none. */
export function decodeQr(canvas: HTMLCanvasElement): ZxingQr | null {
  const found = decodePlain(canvas);
  if (found) return found;
  const f = STRETCH[stretchTurn++ % STRETCH.length];
  stretchCanvas ??= document.createElement('canvas');
  const c = stretchCanvas;
  c.width = canvas.width;
  c.height = Math.round(canvas.height * f);
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(canvas, 0, 0, c.width, c.height);
  const r = decodePlain(c);
  if (!r) return null;
  const back = <T extends { y: number }>(p: T): T => ({ ...p, y: p.y / f });
  return { text: r.text, points: r.points.map(back), corners: r.corners?.map(back) };
}

function decodePlain(canvas: HTMLCanvasElement): ZxingQr | null {
  const bitmap = new BinaryBitmap(new HybridBinarizer(new HTMLCanvasElementLuminanceSource(canvas)));
  let found: ZxingQr | null = null;
  try {
    const result = reader.decode(bitmap, hints);
    found = {
      text: result.getText(),
      points: result.getResultPoints().map((p) => ({
        x: p.getX(),
        y: p.getY(),
        moduleSize: (p as unknown as { getEstimatedModuleSize?: () => number }).getEstimatedModuleSize?.() ?? 0,
      })),
    };
  } catch {
    // not readable as a parallelogram: try with perspective below
  } finally {
    reader.reset();
  }
  // Version 2+ codes were located with their alignment pattern: corners are already right
  if (found && found.points.length >= 4) return found;
  try {
    const persp = perspectiveDecode(bitmap.getBlackMatrix());
    if (persp && (!found || persp.text === found.text)) return persp;
  } catch {
    // ignore
  }
  return found;
}
