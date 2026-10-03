import * as THREE from 'three';

export interface Point2 {
  x: number;
  y: number;
}

/** Solves A·x = b (n×n) with Gaussian elimination + partial pivoting. Returns null when singular. */
function solve(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

/** 3×3 homography (row-major, h33 = 1) mapping 4 source points onto 4 destination points. */
export function homography(src: Point2[], dst: Point2[]): number[] | null {
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x: X, y: Y } = src[i];
    const { x, y } = dst[i];
    A.push([X, Y, 1, 0, 0, 0, -x * X, -x * Y]);
    b.push(x);
    A.push([0, 0, 0, X, Y, 1, -y * X, -y * Y]);
    b.push(y);
  }
  const h = solve(A, b);
  return h ? [...h, 1] : null;
}

export function applyHomography(h: number[], p: Point2): Point2 {
  const w = h[6] * p.x + h[7] * p.y + h[8];
  return { x: (h[0] * p.x + h[1] * p.y + h[2]) / w, y: (h[3] * p.x + h[4] * p.y + h[5]) / w };
}

// The QR is a unit square in its own plane (Z = 0), Y pointing to the QR's top edge.
const OBJECT_CORNERS: Point2[] = [
  { x: -0.5, y: 0.5 }, // top-left
  { x: 0.5, y: 0.5 }, // top-right
  { x: 0.5, y: -0.5 }, // bottom-right
  { x: -0.5, y: -0.5 }, // bottom-left
];

/**
 * Camera-space pose of a square QR sticker from its 4 corners on screen (planar homography → R|t).
 *
 * `corners` are screen pixels in the QR's own order (TL, TR, BR, BL); `focal` is the focal length in
 * screen pixels and (cx, cy) the principal point. The returned matrix maps QR space (unit square in the
 * X/Y plane, +Z = out of the paper towards the viewer) to three.js camera space (x right, y up, -z ahead).
 */
export function qrPoseFromCorners(corners: Point2[], focal: number, cx: number, cy: number): THREE.Matrix4 | null {
  if (corners.length !== 4) return null;
  // Normalised camera coordinates (OpenCV convention: x right, y down, z forward)
  const img = corners.map((p) => ({ x: (p.x - cx) / focal, y: (p.y - cy) / focal }));

  // Homography H: [x y 1]ᵀ ~ H [X Y 1]ᵀ
  const h = homography(OBJECT_CORNERS, img);
  if (!h) return null;

  const c1 = new THREE.Vector3(h[0], h[3], h[6]);
  const c2 = new THREE.Vector3(h[1], h[4], h[7]);
  const c3 = new THREE.Vector3(h[2], h[5], 1);
  let lambda = 2 / (c1.length() + c2.length());
  if (c3.z * lambda < 0) lambda = -lambda; // the sticker must be in front of the camera

  const r1 = c1.clone().multiplyScalar(lambda).normalize();
  let r2 = c2.clone().multiplyScalar(lambda);
  r2 = r2.sub(r1.clone().multiplyScalar(r1.dot(r2))).normalize(); // Gram-Schmidt
  const r3 = new THREE.Vector3().crossVectors(r1, r2);
  const t = c3.clone().multiplyScalar(lambda);
  if (!Number.isFinite(t.z) || t.z <= 0) return null;

  // OpenCV camera → three.js camera: flip Y and Z
  return new THREE.Matrix4().set(
    r1.x, r2.x, r3.x, t.x,
    -r1.y, -r2.y, -r3.y, -t.y,
    -r1.z, -r2.z, -r3.z, -t.z,
    0, 0, 0, 1
  );
}

/**
 * Assumed horizontal field of view of the phone camera for the long side of the video. Phone main
 * cameras are ~60–70°; a small error only slightly changes the tilt.
 */
export const CAMERA_LONG_SIDE_FOV_DEG = 63;

export function focalFromVideo(videoWidth: number, videoHeight: number): number {
  return Math.max(videoWidth, videoHeight) / 2 / Math.tan(THREE.MathUtils.degToRad(CAMERA_LONG_SIDE_FOV_DEG / 2));
}
