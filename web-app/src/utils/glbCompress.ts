/**
 * Shrinks a .glb in the admin app before it is saved/published (loaded on demand, not in the kids' path).
 *
 * Quality comes first; every step is either lossless or checked:
 * - Textures: resized only when bigger than MAX_TEXTURE px (phones cannot show more and run out of
 *   GPU memory), then re-encoded as WebP. Each result is decoded again and compared with the source
 *   pixels (PSNR); when it is not visually identical the next higher quality is tried, up to lossless
 *   WebP, and otherwise the original image is kept. Textures with transparency are never re-encoded
 *   (the browser canvas would darken the edges of cut-outs like hair or leaves).
 * - Normal / roughness / occlusion maps (data, not colours) get a stricter threshold than colour maps.
 * - Geometry + animations: duplicates removed, unused data pruned, redundant animation keyframes
 *   dropped (within 1e-6, see RESAMPLE_TOLERANCE), then Meshopt with high-precision quantisation (positions 16 bit,
 *   normals 14 bit, texture coordinates 14 bit), far below what can be seen on screen.
 * - Draw calls (lossless, the main cost of detailed models on phones): parts that share a material
 *   are merged into one mesh, and objects repeated many times (leaves, buttons…) are drawn as GPU
 *   instances. Animated, skinned and morphing parts are left untouched, so animations stay the same.
 *
 * - Optional (`simplifyScenery`), for very detailed scenes (more than SIMPLIFY_ABOVE triangles, e.g.
 *   the book's dioramas of 200k-400k): the static surroundings (ground, stalls, houses…) are simplified to at most half the triangles,
 *   never moving the surface by more than 0.1 % of its size. The characters (skinned or morphing
 *   parts) keep every triangle: children look at them from close by, where fine folds would soften.
 *   Off by default: from very close, small objects of the surroundings can look slightly smoother.
 *
 * The AR viewer already decodes WebP textures and Meshopt geometry, also offline.
 */
import { Document, Primitive, Texture, WebIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions';
import { dedup, getTextureColorSpace, instance, join, listTextureSlots, meshopt, prune, resample, simplifyPrimitive, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const MAX_TEXTURE = 2048;
// Minimum PSNR (dB) against the source pixels. ≥ 40 dB is visually indistinguishable for colour
// images; normal maps change shading, so they must match more closely.
const MIN_PSNR_COLOR = 40;
const MIN_PSNR_DATA = 44;
// Normal maps steer the lighting of every pixel: only (almost) exact copies are accepted
const MIN_PSNR_NORMAL = 50;
// Qualities tried in order; 1.0 is lossless WebP in Chromium (Android WebView)
const QUALITIES_COLOR = [0.9, 0.95, 1];
const QUALITIES_DATA = [0.95, 0.98, 1];
// Re-encoding must save at least this much, otherwise the original image is kept untouched
const MIN_SAVING = 0.85;
// Keyframes are dropped only where linear interpolation reproduces them within this tolerance. It is
// absolute (scene units), and the book's models use very small units: 1e-4 dropped up to 95 % of
// the keyframes and visibly changed poses (a head turned the other way); 1e-6 renders identically
// (~67 dB) and still removes 40-80 % of the animation data.
const RESAMPLE_TOLERANCE = 1e-6;
// Simplification: only above this many triangles, to at most this share, within this error (relative
// to each mesh's size)
const SIMPLIFY_ABOVE = 120000;
const SIMPLIFY_RATIO = 0.5;
const SIMPLIFY_ERROR = 0.001;

export interface TextureReport {
  name: string;
  kind: 'color' | 'data';
  from: string; // e.g. "4096×4096 png 12.1 MB"
  to: string; // e.g. "2048×2048 webp 1.3 MB" or "unchanged"
  psnr?: number; // dB, Infinity = lossless
  reason?: string;
}

export interface CompressResult {
  data: ArrayBuffer;
  before: number;
  after: number;
  textures: TextureReport[];
  trianglesBefore: number;
  trianglesAfter: number;
}

/** Characters and other animated surfaces: never simplified. */
function isAnimatedSurface(prim: Primitive): boolean {
  return !!prim.getAttribute('JOINTS_0') || prim.listTargets().length > 0;
}

function countTriangles(doc: Document, filter: (p: Primitive) => boolean = () => true): number {
  let n = 0;
  for (const mesh of doc.getRoot().listMeshes())
    for (const prim of mesh.listPrimitives()) {
      if (prim.getMode() !== 4 || !filter(prim)) continue; // TRIANGLES
      const idx = prim.getIndices();
      n += (idx ? idx.getCount() : prim.getAttribute('POSITION')?.getCount() ?? 0) / 3;
    }
  return Math.round(n);
}

const BITMAP_OPTS: ImageBitmapOptions = { premultiplyAlpha: 'none', colorSpaceConversion: 'none' };

function mb(n: number): string {
  return `${(n / 1048576).toFixed(n < 1048576 ? 2 : 1)} MB`;
}

function pixels(source: CanvasImageSource, w: number, h: number): ImageData | null {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

function hasTransparency(img: ImageData): boolean {
  const d = img.data;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 255) return true;
  return false;
}

/** Peak signal-to-noise ratio of the RGB channels (Infinity when identical). */
export function psnr(a: ImageData, b: ImageData): number {
  const x = a.data;
  const y = b.data;
  let sum = 0;
  for (let i = 0; i < x.length; i += 4) {
    const r = x[i] - y[i];
    const g = x[i + 1] - y[i + 1];
    const bl = x[i + 2] - y[i + 2];
    sum += r * r + g * g + bl * bl;
  }
  if (sum === 0) return Infinity;
  const mse = sum / ((x.length / 4) * 3);
  return 10 * Math.log10((255 * 255) / mse);
}

function toBlob(img: ImageData, type: string, quality?: number): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d')!.putImageData(img, 0, 0);
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function compressTexture(tex: Texture, index: number): Promise<TextureReport> {
  const image = tex.getImage()!;
  const mime = tex.getMimeType();
  const ext = mime.replace('image/', '').replace('jpeg', 'jpg');
  const kind: 'color' | 'data' = getTextureColorSpace(tex) === 'srgb' ? 'color' : 'data';
  const report: TextureReport = { name: tex.getName() || tex.getURI() || `#${index + 1}`, kind, from: '', to: 'unchanged' };

  const bitmap = await createImageBitmap(new Blob([image as BlobPart], { type: mime }), BITMAP_OPTS);
  const { width, height } = bitmap;
  report.from = `${width}×${height} ${ext} ${mb(image.byteLength)}`;
  const scale = Math.min(1, MAX_TEXTURE / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const source = pixels(bitmap, w, h);
  bitmap.close();
  if (!source) return { ...report, reason: 'no canvas' };
  if (hasTransparency(source)) return { ...report, reason: 'transparent: kept as is' };

  const resized = scale < 1;
  const isNormal = listTextureSlots(tex).some((s) => /normal/i.test(s));
  const minPsnr = kind === 'color' ? MIN_PSNR_COLOR : isNormal ? MIN_PSNR_NORMAL : MIN_PSNR_DATA;
  for (const q of kind === 'color' ? QUALITIES_COLOR : QUALITIES_DATA) {
    const blob = await toBlob(source, 'image/webp', q);
    if (!blob || blob.type !== 'image/webp') return { ...report, reason: 'no WebP encoder' };
    const bytes = new Uint8Array(await blob.arrayBuffer());
    // Only worth it when clearly smaller (or when the image had to be resized anyway)
    if (!resized && bytes.byteLength > image.byteLength * MIN_SAVING) continue;
    const check = await createImageBitmap(blob, BITMAP_OPTS);
    const decoded = pixels(check, w, h);
    check.close();
    if (!decoded) continue;
    const score = psnr(source, decoded);
    if (score < minPsnr) continue;
    tex.setImage(bytes).setMimeType('image/webp');
    if (tex.getURI()) tex.setURI(tex.getURI().replace(/\.(png|jpe?g|webp)$/i, '.webp'));
    return { ...report, to: `${w}×${h} webp ${mb(bytes.byteLength)}`, psnr: score };
  }

  if (resized) {
    // Too big for phones but WebP could not keep the quality: store the resized image losslessly
    const png = await toBlob(source, 'image/png');
    if (png) {
      tex.setImage(new Uint8Array(await png.arrayBuffer())).setMimeType('image/png');
      if (tex.getURI()) tex.setURI(tex.getURI().replace(/\.(jpe?g|webp)$/i, '.png'));
      return { ...report, to: `${w}×${h} png ${mb(png.size)}`, psnr: Infinity };
    }
  }
  return { ...report, reason: 'no smaller version with the same quality' };
}

async function compressTextures(doc: Document, onStep?: (msg: string) => void): Promise<TextureReport[]> {
  const textures = doc.getRoot().listTextures();
  const reports: TextureReport[] = [];
  for (let i = 0; i < textures.length; i++) {
    const tex = textures[i];
    const mime = tex.getMimeType();
    if (!tex.getImage() || (mime !== 'image/png' && mime !== 'image/jpeg' && mime !== 'image/webp')) continue;
    onStep?.(`Mengompres tekstur ${i + 1}/${textures.length}…`);
    try {
      reports.push(await compressTexture(tex, i));
    } catch (err) {
      console.warn('Texture kept as is:', err);
    }
  }
  const usesWebp = textures.some((t) => t.getMimeType() === 'image/webp');
  if (usesWebp) doc.createExtension(EXTTextureWebP).setRequired(true);
  return reports;
}

/** Compresses a .glb. Returns the original data when compression would not make it smaller. */
export async function compressGlb(
  input: ArrayBuffer,
  onStep?: (msg: string) => void,
  options: { simplifyScenery?: boolean } = {}
): Promise<CompressResult> {
  await MeshoptEncoder.ready;
  await MeshoptDecoder.ready;
  await MeshoptSimplifier.ready;
  const io = new WebIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

  onStep?.('Membaca model…');
  const doc = await io.readBinary(new Uint8Array(input));
  const textures = await compressTextures(doc, onStep);
  onStep?.('Merapikan geometri & animasi…');
  await doc.transform(dedup(), instance({ min: 5 }), join({ keepNamed: false }), prune(), resample({ tolerance: RESAMPLE_TOLERANCE }));
  const trianglesBefore = countTriangles(doc);
  if (options.simplifyScenery && trianglesBefore > SIMPLIFY_ABOVE && countTriangles(doc, (p) => !isAnimatedSurface(p)) > 0) {
    onStep?.('Menyederhanakan lingkungan…');
    await doc.transform(weld());
    for (const mesh of doc.getRoot().listMeshes())
      for (const prim of mesh.listPrimitives()) {
        if (prim.getMode() !== 4 || isAnimatedSurface(prim)) continue;
        simplifyPrimitive(prim, { simplifier: MeshoptSimplifier, ratio: SIMPLIFY_RATIO, error: SIMPLIFY_ERROR });
      }
    await doc.transform(prune());
  }
  const trianglesAfter = countTriangles(doc);
  onStep?.('Mengompres geometri…');
  await doc.transform(
    meshopt({
      encoder: MeshoptEncoder,
      level: 'medium',
      quantizePosition: 16,
      quantizeNormal: 14,
      quantizeTexcoord: 14,
      quantizeColor: 10,
      quantizeWeight: 10,
      quantizeGeneric: 14,
    })
  );
  onStep?.('Menyimpan…');
  const out = await io.writeBinary(doc);

  if (out.byteLength >= input.byteLength) {
    return { data: input, before: input.byteLength, after: input.byteLength, textures, trianglesBefore, trianglesAfter: trianglesBefore };
  }
  return { data: out.slice().buffer as ArrayBuffer, before: input.byteLength, after: out.byteLength, textures, trianglesBefore, trianglesAfter };
}
