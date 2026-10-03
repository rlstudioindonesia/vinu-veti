import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

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
