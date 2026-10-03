/**
 * Shrinks a .glb in the admin app before it is saved/published (loaded on demand, not in the kids' path).
 *
 * - Textures: resized to at most MAX_TEXTURE px and re-encoded as WebP (EXT_texture_webp) with the
 *   browser's own encoder. Big textures are almost always what makes character files huge.
 * - Geometry + animations: duplicates removed, unused data pruned, animation keyframes resampled,
 *   then Meshopt compression (EXT_meshopt_compression).
 *
 * The AR viewer already decodes WebP textures and Meshopt geometry, also offline.
 */
import { Document, WebIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, resample } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const MAX_TEXTURE = 2048;
const WEBP_QUALITY = 0.86;

export interface CompressResult {
  data: ArrayBuffer;
  before: number;
  after: number;
}

async function toWebp(image: Uint8Array, mime: string): Promise<Uint8Array | null> {
  const bitmap = await createImageBitmap(new Blob([image as BlobPart], { type: mime }));
  const scale = Math.min(1, MAX_TEXTURE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY));
  if (!blob || blob.type !== 'image/webp') return null; // browser without a WebP encoder
  return new Uint8Array(await blob.arrayBuffer());
}

async function compressTextures(doc: Document, onStep?: (msg: string) => void) {
  const textures = doc.getRoot().listTextures();
  let converted = 0;
  for (let i = 0; i < textures.length; i++) {
    const tex = textures[i];
    const image = tex.getImage();
    const mime = tex.getMimeType();
    if (!image || (mime !== 'image/png' && mime !== 'image/jpeg' && mime !== 'image/webp')) continue;
    onStep?.(`Mengompres tekstur ${i + 1}/${textures.length}…`);
    try {
      const webp = await toWebp(image, mime);
      if (webp && webp.byteLength < image.byteLength) {
        tex.setImage(webp).setMimeType('image/webp');
        if (tex.getURI()) tex.setURI(tex.getURI().replace(/\.(png|jpe?g)$/i, '.webp'));
        converted++;
      }
    } catch (err) {
      console.warn('Texture kept as is:', err);
    }
  }
  if (converted > 0) doc.createExtension(EXTTextureWebP).setRequired(true);
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
  await compressTextures(doc, onStep);
  onStep?.('Merapikan geometri & animasi…');
  await doc.transform(dedup(), prune(), resample());
  onStep?.('Mengompres geometri…');
  await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  onStep?.('Menyimpan…');
  const out = await io.writeBinary(doc);

  if (out.byteLength >= input.byteLength) return { data: input, before: input.byteLength, after: input.byteLength };
  return { data: out.slice().buffer as ArrayBuffer, before: input.byteLength, after: out.byteLength };
}
