import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface LoadedGLBResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

export async function loadGlbModel(source: string | ArrayBuffer | Blob): Promise<LoadedGLBResult> {
  const loader = new GLTFLoader();
  if (typeof source === 'string') {
    const gltf = await loader.loadAsync(source);
    return { scene: gltf.scene, animations: gltf.animations || [] };
  }
  const data = source instanceof Blob ? await source.arrayBuffer() : source;
  const gltf = await loader.parseAsync(data, '');
  return { scene: gltf.scene, animations: gltf.animations || [] };
}

/**
 * Wraps a model in a pivot so that it is exactly 1 unit tall, centred on X/Z and standing on y = 0.
 * Models exported from different tools then all appear at a predictable size on the QR sticker.
 */
export function normalizeModel(model: THREE.Object3D): THREE.Group {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const pivot = new THREE.Group();
  pivot.add(model);
  if (box.isEmpty()) return pivot;

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  // Flat models (e.g. a card) are sized by their largest side instead of their height
  const ref = size.y > Math.max(size.x, size.z) * 0.2 ? size.y : Math.max(size.x, size.y, size.z);
  const s = ref > 0 ? 1 / ref : 1;
  model.scale.multiplyScalar(s);
  model.position.set(-center.x * s, -box.min.y * s, -center.z * s);
  return pivot;
}
