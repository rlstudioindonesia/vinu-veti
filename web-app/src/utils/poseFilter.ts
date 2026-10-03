import * as THREE from 'three';

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
const FLIP_CONFIRM_MEASUREMENTS = 4;
// Distance changes smaller than this fraction are treated as noise (stops "growing/shrinking")
const DISTANCE_DEADBAND = 0.03;

/**
 * Keeps the QR pose in camera space steady.
 *
 * - Every frame the phone's own rotation (gyroscope) is applied, so the model stays glued to the
 *   sticker while the camera turns, even when the QR is briefly not detected (motion blur).
 * - Each new QR measurement then only corrects the remaining error, so it can be smoothed heavily
 *   without lag: direction quickly, distance (= size on screen) slowly with a dead band, rotation
 *   slowly, ignoring one-off flips caused by noisy corners on small QR codes.
 */
export class QrPoseStabilizer {
  private pos: THREE.Vector3 | null = null;
  private rot = new THREE.Quaternion();
  private flipCount = 0;
  private lastMeasurement = 0;
  private recentDist: number[] = [];

  reset() {
    this.pos = null;
    this.flipCount = 0;
    this.recentDist = [];
  }

  /** Time since the last QR measurement (ms). */
  msSinceMeasurement(now: number): number {
    return this.pos ? now - this.lastMeasurement : Infinity;
  }

  /** Apply the camera's rotation since the previous frame (from the gyroscope). */
  applyCameraRotation(delta: THREE.Quaternion | null) {
    if (!this.pos || !delta) return;
    const inv = delta.clone().invert();
    this.pos.applyQuaternion(inv);
    this.rot.premultiply(inv);
  }

  /**
   * Feed a new QR measurement. `areaNorm` is the area of the QR on screen in normalised camera units
   * (pixels² / focal²): distance from the apparent size is far steadier than from the pose itself.
   */
  addMeasurement(pose: THREE.Matrix4, now: number, areaNorm: number) {
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    pose.decompose(p, q, new THREE.Vector3());
    const gap = now - this.lastMeasurement;
    this.lastMeasurement = now;
    // After a gap (QR was lost), trust the new measurement more to remove any drift
    const reacquire = !this.pos || gap > 300;
    if (reacquire) this.recentDist = [];

    const angle = this.pos ? this.rot.angleTo(q) : 0;
    if (!this.pos) this.rot.copy(q);
    if (!reacquire && angle > FLIP_ANGLE && this.flipCount < FLIP_CONFIRM_MEASUREMENTS) {
      this.flipCount++; // probably a misread: keep the previous rotation
    } else {
      this.flipCount = 0;
      this.rot.slerp(q, reacquire ? 0.6 : 0.15);
    }

    // Distance from the apparent size: area ≈ cos(tilt) / distance² for a unit square
    const dir = p.clone().normalize();
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(this.rot);
    const cosTilt = Math.max(0.25, Math.abs(normal.dot(dir)));
    const sizeDist = areaNorm > 0 ? Math.sqrt(cosTilt / areaNorm) : p.length();
    this.recentDist.push(sizeDist);
    if (this.recentDist.length > 7) this.recentDist.shift();
    const median = [...this.recentDist].sort((a, b) => a - b)[Math.floor(this.recentDist.length / 2)];

    if (!this.pos || reacquire) {
      this.pos = dir.multiplyScalar(median);
      return;
    }
    // Direction (where on screen): follow quickly. Distance (size on screen): slow, with a dead band.
    const dist = this.pos.length();
    const nextDir = this.pos.clone().normalize().lerp(dir, 0.5).normalize();
    const ratio = median / dist;
    let nextDist = dist;
    if (Math.abs(ratio - 1) > 0.5) nextDist = median; // moved much closer/further: follow
    else if (Math.abs(ratio - 1) > DISTANCE_DEADBAND) nextDist = dist + (median - dist) * 0.1;
    this.pos.copy(nextDir.multiplyScalar(nextDist));
  }

  pose(): THREE.Matrix4 | null {
    return this.pos ? new THREE.Matrix4().compose(this.pos, this.rot, new THREE.Vector3(1, 1, 1)) : null;
  }
}

/**
 * Phone rotation from the gyroscope, as camera-space rotation since the last read. For a back camera
 * in portrait the device axes equal the camera axes; rotationRate is in deg/s (alpha = z, beta = x,
 * gamma = y, right-handed).
 */
export class GyroTracker {
  private pending = new THREE.Quaternion();
  private lastEventTime = 0;
  private lastEvent = 0;
  private readonly onMotion = (e: DeviceMotionEvent) => {
    const r = e.rotationRate;
    const now = performance.now();
    const dt = this.lastEventTime ? Math.min((now - this.lastEventTime) / 1000, 0.1) : 0;
    this.lastEventTime = now;
    if (!r || r.alpha === null || r.beta === null || r.gamma === null || dt <= 0) return;
    const w = new THREE.Vector3(r.beta, r.gamma, r.alpha).multiplyScalar(Math.PI / 180);
    const angle = THREE.MathUtils.degToRad(screen.orientation?.angle ?? 0);
    w.applyAxisAngle(new THREE.Vector3(0, 0, 1), -angle);
    const mag = w.length();
    if (mag * dt > 1e-5) {
      this.pending.multiply(new THREE.Quaternion().setFromAxisAngle(w.divideScalar(mag), mag * dt));
    }
    this.lastEvent = now;
  };

  start() {
    window.addEventListener('devicemotion', this.onMotion);
  }

  stop() {
    window.removeEventListener('devicemotion', this.onMotion);
  }

  get active(): boolean {
    return performance.now() - this.lastEvent < 500;
  }

  /** Camera rotation accumulated since the previous call (null when no gyroscope). */
  take(): THREE.Quaternion | null {
    if (!this.active) return null;
    const q = this.pending.clone();
    this.pending.identity();
    return q;
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
