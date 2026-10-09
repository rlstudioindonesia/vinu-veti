import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { isLowEndDevice } from './platform';

export interface LoadedGLBResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

// Compressed models (Draco / Meshopt, e.g. from `gltf-transform optimize`) are much smaller to
// download and store. The Draco decoder is bundled in public/draco so it also works offline.
let sharedLoader: GLTFLoader | null = null;
function getLoader(): GLTFLoader {
  if (!sharedLoader) {
    const draco = new DRACOLoader();
    draco.setDecoderPath(new URL('./draco/', window.location.href).href);
    sharedLoader = new GLTFLoader();
    sharedLoader.setDRACOLoader(draco);
    // Big Meshopt models are decoded in background threads: the camera view keeps running smoothly
    try {
      (MeshoptDecoder as typeof MeshoptDecoder & { useWorkers?: (n: number) => void }).useWorkers?.(Math.min(2, Math.max(1, (navigator.hardwareConcurrency || 2) - 1)));
    } catch {
      // No workers (very old browser): decoded on the main thread as before
    }
    sharedLoader.setMeshoptDecoder(MeshoptDecoder);
  }
  return sharedLoader;
}

export async function loadGlbModel(source: string | ArrayBuffer | Blob): Promise<LoadedGLBResult> {
  const loader = getLoader();
  if (typeof source === 'string') {
    const gltf = await loader.loadAsync(source);
    return { scene: gltf.scene, animations: gltf.animations || [] };
  }
  const data = source instanceof Blob ? await source.arrayBuffer() : source;
  const gltf = await loader.parseAsync(data, '');
  return { scene: gltf.scene, animations: gltf.animations || [] };
}

// Largest texture side kept for the AR view. A character covers only part of the phone screen, so
// bigger textures cost GPU memory (and upload stutter) without visible detail.
const LOW_END = isLowEndDevice();
const AR_MAX_TEXTURE = LOW_END ? 1024 : 2048;

async function downscaleImage(image: unknown, maxSide: number): Promise<CanvasImageSource | null> {
  const img = image as { width?: number; height?: number; close?: () => void } | null;
  if (!img?.width || !img.height) return null;
  const k = maxSide / Math.max(img.width, img.height);
  if (k >= 1) return null;
  const w = Math.max(1, Math.round(img.width * k));
  const h = Math.max(1, Math.round(img.height * k));
  const src = image as ImageBitmapSource & CanvasImageSource;
  try {
    // Off the main thread where supported; keeps the orientation of the source (no flip)
    return await createImageBitmap(src, { resizeWidth: w, resizeHeight: h, resizeQuality: 'high', premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
  } catch {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, 0, 0, w, h);
    return canvas;
  }
}

/**
 * Makes a loaded model cheaper to draw on this phone, once per file (the result is cached):
 * - textures larger than the screen can show are scaled down (half the GPU memory per step);
 * - glass-like materials (transmission) are drawn as normal see-through materials: three.js would
 *   render the whole scene a second time for them every frame, and in AR that pass cannot see the
 *   camera picture behind the glass anyway, so it only costs speed.
 */
async function lightenForDevice(scene: THREE.Object3D): Promise<void> {
  const textures = new Set<THREE.Texture>();
  const replaced = new Map<THREE.Material, THREE.Material>();
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const next = mats.map((m) => {
      const phys = m as THREE.MeshPhysicalMaterial;
      if (!phys.isMeshPhysicalMaterial || !(phys.transmission > 0)) return m;
      const done = replaced.get(m);
      if (done) return done;
      const std = new THREE.MeshStandardMaterial().copy(phys);
      std.transparent = true;
      std.opacity = Math.min(phys.opacity, 1 - phys.transmission * 0.7);
      std.depthWrite = false;
      phys.dispose();
      replaced.set(m, std);
      return std;
    });
    mesh.material = Array.isArray(mesh.material) ? next : next[0];
    for (const m of next) for (const v of Object.values(m)) if (v instanceof THREE.Texture) textures.add(v);
  });
  // Several textures can share one image (same picture, different wrapping): resize each image once
  const byImage = new Map<unknown, THREE.Texture[]>();
  textures.forEach((tex) => {
    if (tex.image) byImage.set(tex.image, [...(byImage.get(tex.image) ?? []), tex]);
  });
  await Promise.all(
    [...byImage].map(async ([image, users]) => {
      try {
        const small = await downscaleImage(image, AR_MAX_TEXTURE);
        if (!small) return;
        for (const tex of users) {
          tex.image = small;
          tex.needsUpdate = true;
        }
        (image as { close?: () => void }).close?.();
      } catch (err) {
        console.warn('Texture kept at full size:', err);
      }
    })
  );
}

// Parsed models stay in memory for a while: flipping back to a page shows its character instantly
// (no reading from storage, no decoding). Each use gets its own copy that shares geometry and
// textures. The oldest models are dropped when the estimated memory use passes the budget, which
// follows the phone's RAM (2 GB phone ≈ 96 MB, 4 GB ≈ 192 MB, at most 256 MB).
const DEVICE_GB = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 2;
const CACHE_BUDGET = Math.min(256, Math.max(64, DEVICE_GB * 48)) * 1048576;
const CACHE_MAX = 8;
const modelCache = new Map<string, { result: Promise<LoadedGLBResult>; bytes: number }>();

function estimateBytes(scene: THREE.Object3D): number {
  const seen = new Set<unknown>();
  let bytes = 0;
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry && !seen.has(mesh.geometry)) {
      seen.add(mesh.geometry);
      const g = mesh.geometry;
      Object.values(g.attributes).forEach((a) => (bytes += (a as THREE.BufferAttribute).array.byteLength));
      if (g.index) bytes += g.index.array.byteLength;
    }
    const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const m of mats) {
      for (const v of Object.values(m)) {
        if (!(v instanceof THREE.Texture) || seen.has(v)) continue;
        seen.add(v);
        const img = v.image as { width?: number; height?: number } | undefined;
        bytes += (img?.width || 0) * (img?.height || 0) * 4;
      }
    }
  });
  return bytes;
}

function trimCache(keep: string) {
  let total = 0;
  modelCache.forEach((e) => (total += e.bytes));
  for (const [key, e] of modelCache) {
    if (key === keep) continue;
    if (total <= CACHE_BUDGET && modelCache.size <= CACHE_MAX) break;
    modelCache.delete(key);
    total -= e.bytes;
  }
}

/**
 * Like loadGlbModel, but remembers the parsed model under `key` (include a version so an updated
 * file is loaded again). Returns a fresh copy for every call.
 */
export async function loadGlbCached(
  key: string,
  getSource: () => Promise<string | ArrayBuffer | Blob | null>
): Promise<LoadedGLBResult> {
  let entry = modelCache.get(key);
  if (entry) {
    modelCache.delete(key); // re-insert: most recently used last
    modelCache.set(key, entry);
  } else {
    const result = (async () => {
      const source = await getSource();
      if (!source) throw new Error('missing');
      const loaded = await loadGlbModel(source);
      await lightenForDevice(loaded.scene);
      return loaded;
    })();
    entry = { result, bytes: 0 };
    modelCache.set(key, entry);
    const e = entry;
    result.then(
      (r) => {
        e.bytes = estimateBytes(r.scene);
        trimCache(key);
      },
      () => modelCache.get(key) === e && modelCache.delete(key)
    );
  }
  const { scene, animations } = await entry.result;
  return { scene: cloneSkinned(scene) as THREE.Group, animations };
}

/** Forgets every cached model (e.g. after content was updated). */
export function clearModelCache() {
  modelCache.clear();
}

/**
 * Wraps a model in a pivot so that it is 1 unit tall, centred on X/Z and standing on y = 0.
 * Models exported from different tools then all appear at a predictable size on the QR sticker.
 *
 * Pass `fixedScale` (the scale returned for the main model) for the other animation files of the same
 * character, so the character keeps exactly the same size when switching animations.
 */
export function normalizeModel(model: THREE.Object3D, fixedScale?: number): { pivot: THREE.Group; scale: number } {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const pivot = new THREE.Group();
  pivot.add(model);
  if (box.isEmpty()) return { pivot, scale: fixedScale ?? 1 };

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  // Flat models (e.g. a card) are sized by their largest side instead of their height
  const ref = size.y > Math.max(size.x, size.z) * 0.2 ? size.y : Math.max(size.x, size.y, size.z);
  const s = fixedScale ?? (ref > 0 ? 1 / ref : 1);
  model.scale.multiplyScalar(s);
  model.position.set(-center.x * s, -box.min.y * s, -center.z * s);
  return { pivot, scale: s };
}
