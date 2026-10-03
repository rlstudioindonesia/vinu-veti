import * as THREE from 'three';
import { Point2 } from './qrPose';

/**
 * One Euro filter (Casiez et al. 2012): heavy smoothing when the signal is still (kills jitter),
 * light smoothing when it moves fast (no lag). Standard for tracking in AR/VR.
 */
export class OneEuroFilter {
  private x: number | null = null;
  private dx = 0;

  constructor(
    private minCutoff = 1.0, // Hz: lower = steadier when still
    private beta = 0.02, // how quickly the cutoff rises with speed
    private dCutoff = 1.0
  ) {}

  private static alpha(cutoff: number, dt: number) {
    const tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / dt);
  }

  filter(value: number, dt: number): number {
    if (this.x === null || dt <= 0) {
      this.x = value;
      this.dx = 0;
      return value;
    }
    const dxRaw = (value - this.x) / dt;
    this.dx += OneEuroFilter.alpha(this.dCutoff, dt) * (dxRaw - this.dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    this.x += OneEuroFilter.alpha(cutoff, dt) * (value - this.x);
    return this.x;
  }

  reset() {
    this.x = null;
    this.dx = 0;
  }
}

// A sudden rotation bigger than this (radians) is treated as a misread until it persists
const FLIP_ANGLE = 0.6; // ~34°
const FLIP_CONFIRM_FRAMES = 6;

/**
 * Stabilises the tracked QR: filters the 4 screen corners, then smooths the resulting pose
 * (position + rotation) and ignores one-off pose flips caused by noisy corners on small QR codes.
 */
export class QrPoseStabilizer {
  private corners = Array.from({ length: 8 }, () => new OneEuroFilter(1.0, 0.02));
  private pos: THREE.Vector3 | null = null;
  private rot = new THREE.Quaternion();
  private flipFrames = 0;

  reset() {
    this.corners.forEach((f) => f.reset());
    this.pos = null;
    this.flipFrames = 0;
  }

  filterCorners(raw: Point2[], dt: number): Point2[] {
    return raw.map((p, i) => ({
      x: this.corners[i * 2].filter(p.x, dt),
      y: this.corners[i * 2 + 1].filter(p.y, dt),
    }));
  }

  /** Returns the smoothed pose matrix for a freshly computed one. */
  smoothPose(pose: THREE.Matrix4, dt: number): THREE.Matrix4 {
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    pose.decompose(p, q, s);

    if (!this.pos) {
      this.pos = p.clone();
      this.rot.copy(q);
    } else {
      const angle = this.rot.angleTo(q);
      if (angle > FLIP_ANGLE && this.flipFrames < FLIP_CONFIRM_FRAMES) {
        // Probably a misread: keep the previous rotation, but still follow the position
        this.flipFrames++;
      } else {
        this.flipFrames = 0;
        // Rotation: slow and steady (time-based so it behaves the same at any frame rate)
        const kRot = 1 - Math.exp(-dt * (4 + 20 * Math.min(angle, 0.5)));
        this.rot.slerp(q, kRot);
      }
      const kPos = 1 - Math.exp(-dt * 18);
      this.pos.lerp(p, kPos);
    }
    return new THREE.Matrix4().compose(this.pos, this.rot, new THREE.Vector3(1, 1, 1));
  }
}

/**
 * "Up" direction of the real world in three.js camera space, from the phone's accelerometer.
 * For a back camera in portrait, the device axes equal the camera axes (x right, y up, z towards the
 * user), and accelerationIncludingGravity points up when the phone is at rest.
 */
export class GravityTracker {
  private up: THREE.Vector3 | null = null;
  private lastEvent = 0;
  private readonly onMotion = (e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity;
    if (!a || a.x === null || a.y === null || a.z === null) return;
    const v = new THREE.Vector3(a.x, a.y, a.z);
    if (v.lengthSq() < 1) return;
    // Compensate a rotated screen (landscape)
    const angle = THREE.MathUtils.degToRad(screen.orientation?.angle ?? 0);
    v.applyAxisAngle(new THREE.Vector3(0, 0, 1), -angle).normalize();
    // Low-pass: keep gravity, drop hand shake
    this.up = this.up ? this.up.lerp(v, 0.15).normalize() : v;
    this.lastEvent = performance.now();
  };

  start() {
    window.addEventListener('devicemotion', this.onMotion);
  }

  stop() {
    window.removeEventListener('devicemotion', this.onMotion);
  }

  /** World up in camera space, or null when the sensor is unavailable / silent. */
  get(): THREE.Vector3 | null {
    return this.up && performance.now() - this.lastEvent < 500 ? this.up : null;
  }
}

// Within this angle of horizontal, the sticker is treated as lying flat (book on a table)
const FLAT_LIMIT = THREE.MathUtils.degToRad(40);

/**
 * When the sticker lies roughly flat, replace its (noisy) normal with true vertical from the
 * accelerometer, so the model can never fall over sideways. Position and heading still come from the QR.
 */
export function uprightPose(pose: THREE.Matrix4, up: THREE.Vector3 | null): THREE.Matrix4 {
  if (!up) return pose;
  const e = pose.elements; // column-major
  const right = new THREE.Vector3(e[0], e[1], e[2]).normalize(); // QR +X
  const normal = new THREE.Vector3(e[8], e[9], e[10]).normalize(); // QR +Z (out of the paper)
  if (normal.angleTo(up) > FLAT_LIMIT) return pose;

  const z = up.clone();
  const x = right.sub(z.clone().multiplyScalar(right.dot(z))).normalize();
  if (x.lengthSq() < 0.5) return pose;
  const y = new THREE.Vector3().crossVectors(z, x);
  const out = new THREE.Matrix4().makeBasis(x, y, z);
  out.setPosition(e[12], e[13], e[14]);
  return out;
}
