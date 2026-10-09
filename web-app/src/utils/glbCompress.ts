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
 *   dropped (lossless within 1e-4), then Meshopt with high-precision quantisation (positions 16 bit,
 *   normals 14 bit, texture coordinates 14 bit), far below what can be seen on screen.
 * - Draw calls (lossless, the main cost of detailed models on phones): parts that share a material
 *   are merged into one mesh, and objects repeated many times (leaves, buttons…) are drawn as GPU
 *   instances. Animated, skinned and morphing parts are left untouched, so animations stay the same.
 *
 * The AR viewer already decodes WebP textures and Meshopt geometry, also offline.
 */
import { Document, Texture, WebIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions';
import { dedup, getTextureColorSpace, instance, join, listTextureSlots, meshopt, prune, resample } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

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
export async function compressGlb(input: ArrayBuffer, onStep?: (msg: string) => void): Promise<CompressResult> {
  await MeshoptEncoder.ready;
  await MeshoptDecoder.ready;
  const io = new WebIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

  onStep?.('Membaca model…');
  const doc = await io.readBinary(new Uint8Array(input));
  const textures = await compressTextures(doc, onStep);
  onStep?.('Merapikan geometri & animasi…');
  await doc.transform(dedup(), instance({ min: 5 }), join({ keepNamed: false }), prune(), resample({ tolerance: 1e-4 }));
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

  if (out.byteLength >= input.byteLength) return { data: input, before: input.byteLength, after: input.byteLength, textures };
  return { data: out.slice().buffer as ArrayBuffer, before: input.byteLength, after: out.byteLength, textures };
}
