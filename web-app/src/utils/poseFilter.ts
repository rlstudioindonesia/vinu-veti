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
// Size on screen is held still until the distance really changes by DISTANCE_UNLOCK (the phone moved
// closer/further, not noise or the camera's autofocus "breathing"), then follows smoothly until it
// matches again (within DISTANCE_SETTLE) and holds still once more
const DISTANCE_UNLOCK = 0.06;
const DISTANCE_SETTLE = 0.005;
// A smaller difference that stays for this many readings (~1 s) is real too: corrected as well
const DISTANCE_DRIFT = 0.025;
const DISTANCE_DRIFT_READINGS = 30;

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
  // Target pose (updated by QR readings) and displayed pose (eases towards the target every frame)
  private pos: THREE.Vector3 | null = null;
  private rot = new THREE.Quaternion();
  private shownPos: THREE.Vector3 | null = null;
  private shownRot = new THREE.Quaternion();
  private flipCount = 0;
  private lastMeasurement = 0;
  private recentDist: number[] = [];
  private distFollowing = false;
  private distOffCount = 0;
  // Readings from the frame-by-frame optical tracker are precise and arrive every camera frame:
  // they are followed closely (little smoothing = no lag); decoder readings are noisier
  private precise = false;
  // Sliding motion of the QR on screen that the gyroscope does not explain (the phone moving
  // sideways), from consecutive tracker readings: used to make up for the processing delay
  private lastMeasDir: THREE.Vector3 | null = null;
  private lastMeasT = 0;
  private slide = new THREE.Vector3(); // direction change per second (camera space)

  reset() {
    this.pos = null;
    this.shownPos = null;
    this.flipCount = 0;
    this.recentDist = [];
    this.distFollowing = false;
    this.lastMeasDir = null;
    this.slide.set(0, 0, 0);
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
    this.shownPos?.applyQuaternion(inv);
    this.shownRot.premultiply(inv);
    this.lastMeasDir?.applyQuaternion(inv);
    this.slide.applyQuaternion(inv);
  }

  /**
   * Feed a new QR measurement. `areaNorm` is the area of the QR on screen in normalised camera units
   * (pixels² / focal²): distance from the apparent size is far steadier than from the pose itself.
   * `precise`: the reading comes from the optical tracker (see qrTracker). `capturedAt`: when its
   * camera frame was taken (same clock as `now`).
   */
  addMeasurement(pose: THREE.Matrix4, now: number, areaNorm: number, precise = false, capturedAt = now) {
    this.precise = precise;
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
      // Small wobbles (< ~2°) are noise of the corners: follow them very little. Real turns: fast.
      const kRot = precise ? 0.05 + THREE.MathUtils.clamp((angle - 0.035) / 0.15, 0, 1) * 0.45 : 0.1;
      this.rot.slerp(q, reacquire ? 0.6 : kRot);
    }

    // Distance from the apparent size: area ≈ cos(tilt) / distance² for a unit square
    const dir = p.clone().normalize();
    // Make up for the time between the camera frame and now when the QR slides across the screen
    // (rotation is already handled with the gyroscope): continue the recent sliding motion a bit
    const dtCapture = capturedAt - this.lastMeasT;
    if (precise && this.lastMeasDir && dtCapture > 5 && dtCapture < 150) {
      const inst = dir.clone().sub(this.lastMeasDir).divideScalar(dtCapture / 1000);
      this.slide.lerp(inst, 0.5);
    } else {
      this.slide.set(0, 0, 0);
    }
    this.lastMeasDir = precise ? dir.clone() : null;
    this.lastMeasT = capturedAt;
    const speed = this.slide.length();
    if (precise && speed > 0.08) {
      const ahead = Math.min(now - capturedAt + 16, 120) / 1000; // until the next screen refresh
      dir.addScaledVector(this.slide, ahead * 0.8 * Math.min(1, (speed - 0.08) / 0.15)).normalize();
    }
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(this.rot);
    const cosTilt = Math.max(0.25, Math.abs(normal.dot(dir)));
    const sizeDist = areaNorm > 0 ? Math.sqrt(cosTilt / areaNorm) : p.length();
    this.recentDist.push(sizeDist);
    if (this.recentDist.length > (precise ? 15 : 7)) this.recentDist.shift();
    const median = [...this.recentDist].sort((a, b) => a - b)[Math.floor(this.recentDist.length / 2)];

    if (!this.pos || reacquire) {
      this.pos = dir.multiplyScalar(median);
      return;
    }
    // Direction (where on screen): follow quickly. Distance (size on screen): slow, with a dead band.
    const dist = this.pos.length();
    // Tiny shifts (a few px) are corner noise: follow them only slightly. Real moves: follow fast.
    const curDir = this.pos.clone().normalize();
    const shift = curDir.angleTo(dir); // radians; 0.001 ≈ 1 px at a typical focal length
    const kDir = precise
      ? THREE.MathUtils.clamp((shift - 0.001) / 0.005, 0, 1) * 0.7 + 0.3
      : THREE.MathUtils.clamp((shift - 0.002) / 0.02, 0, 1) * 0.85 + 0.08;
    const nextDir = curDir.lerp(dir, kDir).normalize();
    const ratio = median / dist;
    let nextDist = dist;
    const change = Math.abs(ratio - 1);
    if (change > 0.4) {
      nextDist = median; // moved much closer/further at once: follow
    } else {
      this.distOffCount = change > DISTANCE_DRIFT ? this.distOffCount + 1 : 0;
      if (change > DISTANCE_UNLOCK || this.distOffCount > DISTANCE_DRIFT_READINGS) this.distFollowing = true;
      else if (change < DISTANCE_SETTLE) this.distFollowing = false;
      if (this.distFollowing) nextDist = dist + (median - dist) * (precise ? 0.15 : 0.1);
    }
    this.pos.copy(nextDir.multiplyScalar(nextDist));
  }

  /** Displayed distance (for diagnostics/tests). */
  distance(): number {
    return this.shownPos?.length() ?? 0;
  }

  /** Displayed pose for this frame: eases smoothly towards the target (no jumps on each QR reading). */
  pose(dt: number): THREE.Matrix4 | null {
    if (!this.pos) return null;
    if (!this.shownPos) {
      this.shownPos = this.pos.clone();
      this.shownRot.copy(this.rot);
    } else {
      this.shownPos.lerp(this.pos, 1 - Math.exp(-dt / (this.precise ? 0.025 : 0.06)));
      this.shownRot.slerp(this.rot, 1 - Math.exp(-dt / (this.precise ? 0.06 : 0.15)));
    }
    return new THREE.Matrix4().compose(this.shownPos, this.shownRot, new THREE.Vector3(1, 1, 1));
  }
}

/**
 * Ways phones/WebViews report DeviceMotionEvent.rotationRate. The spec says alpha = z, beta = x,
 * gamma = y (deg/s, right-handed), but axis order and signs differ between devices and WebView
 * versions. The tracker integrates all candidates and keeps the one that matches what the camera sees.
 */
const GYRO_MAPPINGS: Array<(a: number, b: number, g: number) => [number, number, number]> = [
  (a, b, g) => [b, g, a], // spec
  (a, b, g) => [-b, -g, -a],
  (a, b, g) => [a, b, g],
  (a, b, g) => [-a, -b, -g],
  (a, b, g) => [g, b, a],
  (a, b, g) => [-g, -b, -a],
];

const GYRO_MAPPING_KEY = 'vv_gyro_mapping';

// Smoothing of the Android rotation sensor: time constant while still / while turning, and the
// turning speeds (rad/s) between which it changes over (~6°/s … ~34°/s)
const NATIVE_STILL_TAU = 0.12;
const NATIVE_MOVING_TAU = 0.004;
const NATIVE_STILL_SPEED = 0.1;
const NATIVE_MOVING_SPEED = 0.6;

/**
 * Leaves out rotations too small to be real hand movement (remaining sensor noise): below `from`
 * radians nothing, above `from + width` everything, smoothly in between. Slow real turns are still
 * followed by the camera tracking; the gyroscope is there for fast movement.
 */
function softDeadband(q: THREE.Quaternion, from: number, width: number): THREE.Quaternion {
  const angle = 2 * Math.acos(Math.min(1, Math.abs(q.w)));
  const k = THREE.MathUtils.clamp((angle - from) / width, 0, 1);
  return k >= 1 ? q : new THREE.Quaternion().slerp(q, k);
}

interface GyroSample {
  t: number;
  q: THREE.Quaternion[]; // cumulative camera orientation per mapping
}

/**
 * Phone rotation from the gyroscope, in camera space. For a back camera in portrait the device axes
 * equal the camera axes.
 *
 * - `take()` gives the rotation since the previous frame (moves the model with the camera).
 * - `rotationSince(t)` gives the rotation since a past time: a QR reading describes the frame captured
 *   ~50-100 ms ago, so it is brought forward to "now" before use (otherwise the model trails behind
 *   when the phone is shaken).
 * - `calibrate()` compares each axis mapping with the QR movement seen by the camera and selects the
 *   one that explains it; if none does, the gyroscope is not used at all.
 */
export class GyroTracker {
  // Preferred source: Android's fused rotation sensor via the app bridge (exact axes, no calibration)
  private nativeQ: THREE.Quaternion | null = null;
  private nativeTaken: THREE.Quaternion | null = null;
  private nativeLast = 0;
  private nativeHistory: Array<{ t: number; q: THREE.Quaternion }> = [];
  // Fallback: WebView devicemotion with axis-mapping calibration
  private cumulative = GYRO_MAPPINGS.map(() => new THREE.Quaternion());
  private history: GyroSample[] = [];
  private lastTaken = GYRO_MAPPINGS.map(() => new THREE.Quaternion());
  private lastEventTime = 0;
  private lastEvent = 0;
  private selected = 0;
  private scores = GYRO_MAPPINGS.map(() => 0);
  private noGyroScore = 0;
  private samples = 0;
  // Not used until calibrated against the camera (a wrong axis mapping would push the model away);
  // the result is remembered on the phone so later sessions start calibrated.
  private trusted = false;

  constructor() {
    try {
      const saved = Number(localStorage.getItem(GYRO_MAPPING_KEY));
      if (Number.isInteger(saved) && saved >= 0 && saved < GYRO_MAPPINGS.length && localStorage.getItem(GYRO_MAPPING_KEY) !== null) {
        this.selected = saved;
        this.trusted = true;
      }
    } catch {
      // ignore
    }
  }

  private readonly onMotion = (e: DeviceMotionEvent) => {
    const r = e.rotationRate;
    const now = performance.now();
    const dt = this.lastEventTime ? Math.min((now - this.lastEventTime) / 1000, 0.1) : 0;
    this.lastEventTime = now;
    if (!r || r.alpha === null || r.beta === null || r.gamma === null || dt <= 0) return;
    const screenAngle = THREE.MathUtils.degToRad(screen.orientation?.angle ?? 0);
    GYRO_MAPPINGS.forEach((map, i) => {
      const w = new THREE.Vector3(...map(r.alpha!, r.beta!, r.gamma!)).multiplyScalar(Math.PI / 180);
      w.applyAxisAngle(new THREE.Vector3(0, 0, 1), -screenAngle);
      const mag = w.length();
      // Below ~0.8°/s it is sensor noise of a phone held still, not real rotation
      if (mag > 0.014) this.cumulative[i].multiply(new THREE.Quaternion().setFromAxisAngle(w.divideScalar(mag), mag * dt));
    });
    this.history.push({ t: now, q: this.cumulative.map((q) => q.clone()) });
    while (this.history.length > 0 && now - this.history[0].t > 1500) this.history.shift();
    this.lastEvent = now;
  };

  start() {
    window.addEventListener('devicemotion', this.onMotion);
  }

  stop() {
    window.removeEventListener('devicemotion', this.onMotion);
  }

  /** Read the native rotation sensor (call once per frame). */
  poll() {
    const bridge = (window as unknown as { AndroidBridge?: { getRotationQuat?: () => string } }).AndroidBridge;
    const raw = bridge?.getRotationQuat?.();
    if (!raw) return;
    const [w, x, y, z] = raw.split(',').map(Number);
    if (![w, x, y, z].every(Number.isFinite)) return;
    // Device axes → camera/screen axes (only differs when the screen is rotated to landscape)
    const screenAngle = THREE.MathUtils.degToRad(screen.orientation?.angle ?? 0);
    const q = new THREE.Quaternion(x, y, z, w)
      .normalize()
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), screenAngle));
    const now = performance.now();
    // The sensor's small noise would move the model every frame (tremor): smooth it strongly while
    // the phone is (almost) still, and hardly at all while it really turns (no lag)
    if (this.nativeQ) {
      const dt = Math.max(0.001, (now - this.nativeLast) / 1000);
      const speed = this.nativeQ.angleTo(q) / dt; // rad/s
      const k = THREE.MathUtils.clamp((speed - NATIVE_STILL_SPEED) / (NATIVE_MOVING_SPEED - NATIVE_STILL_SPEED), 0, 1);
      const tau = NATIVE_STILL_TAU + (NATIVE_MOVING_TAU - NATIVE_STILL_TAU) * k;
      q.copy(this.nativeQ.clone().slerp(q, 1 - Math.exp(-dt / tau)));
    }
    this.nativeQ = q;
    this.nativeLast = now;
    if (!this.nativeTaken) this.nativeTaken = q.clone();
    this.nativeHistory.push({ t: now, q });
    while (this.nativeHistory.length > 0 && now - this.nativeHistory[0].t > 1500) this.nativeHistory.shift();
  }

  private get usingNative(): boolean {
    return !!this.nativeQ && performance.now() - this.nativeLast < 500;
  }

  /** Gyroscope present and its axes are known to match the camera. */
  get active(): boolean {
    return this.usingNative || (performance.now() - this.lastEvent < 500 && this.trusted);
  }

  /** Short status for the diagnostics overlay. */
  status(): string {
    if (this.usingNative) return 'sensor Android ✓';
    if (performance.now() - this.lastEvent >= 500) return 'tidak ada';
    return this.trusted ? `web ✓ (sumbu ${this.selected})` : `web: kalibrasi ${this.samples}`;
  }

  private sampleAt(t: number): GyroSample | null {
    if (this.history.length === 0) return null;
    let best = this.history[0];
    for (const s of this.history) {
      if (Math.abs(s.t - t) < Math.abs(best.t - t)) best = s;
      if (s.t > t) break;
    }
    return best;
  }

  /** Camera rotation since the previous call (null when the gyroscope is absent or untrusted). */
  take(): THREE.Quaternion | null {
    if (this.usingNative) {
      const delta = this.nativeTaken!.clone().invert().multiply(this.nativeQ!);
      this.nativeTaken = this.nativeQ!.clone();
      return softDeadband(delta, 0.0004, 0.0008); // ~0.02°…0.07° per frame
    }
    const i = this.selected;
    const delta = this.lastTaken[i].clone().invert().multiply(this.cumulative[i]);
    this.lastTaken = this.cumulative.map((q) => q.clone());
    return this.active ? delta : null;
  }

  /** Camera rotation between a past time (performance.now() clock) and now. */
  rotationSince(t: number): THREE.Quaternion | null {
    if (this.usingNative) {
      let best = this.nativeHistory[0];
      for (const h of this.nativeHistory) if (Math.abs(h.t - t) < Math.abs(best.t - t)) best = h;
      return best ? softDeadband(best.q.clone().invert().multiply(this.nativeQ!), 0.001, 0.002) : null;
    }
    if (!this.active) return null;
    const s = this.sampleAt(t);
    if (!s) return null;
    return s.q[this.selected].clone().invert().multiply(this.cumulative[this.selected]);
  }

  /**
   * Teach the tracker with two QR readings: the QR centre direction (camera space) at two capture
   * times. Each mapping predicts the second direction from the first; the best one is selected.
   */
  calibrate(dirA: THREE.Vector3, tA: number, dirB: THREE.Vector3, tB: number) {
    if (this.usingNative) return; // native sensor axes are known, nothing to learn
    const sa = this.sampleAt(tA);
    const sb = this.sampleAt(tB);
    if (!sa || !sb || sa === sb) return;
    const moved = dirA.angleTo(dirB);
    if (moved < 0.03 || moved > 0.8) return; // too little motion to judge, or a different QR / glitch
    const decay = 0.85;
    this.noGyroScore = this.noGyroScore * decay + moved;
    GYRO_MAPPINGS.forEach((_, i) => {
      const camDelta = sa.q[i].clone().invert().multiply(sb.q[i]);
      const predicted = dirA.clone().applyQuaternion(camDelta.invert());
      this.scores[i] = this.scores[i] * decay + predicted.angleTo(dirB);
    });
    this.samples++;
    if (this.samples < 3) return;
    const order = this.scores.map((sc, i) => [sc, i] as const).sort((x, y) => x[0] - y[0]);
    const [bestScore, best] = order[0];
    const clearWinner = bestScore < order[1][0] * 0.5 && bestScore < this.noGyroScore * 0.6;
    if (clearWinner) {
      if (best !== this.selected) {
        this.selected = best;
        this.lastTaken = this.cumulative.map((q) => q.clone());
      }
      if (!this.trusted) {
        try {
          localStorage.setItem(GYRO_MAPPING_KEY, String(best));
        } catch {
          // ignore
        }
      }
      this.trusted = true;
    } else if (this.trusted && this.scores[this.selected] > this.noGyroScore * 0.9) {
      // The selected mapping stopped matching the camera: stop using the gyroscope
      this.trusted = false;
      try {
        localStorage.removeItem(GYRO_MAPPING_KEY);
      } catch {
        // ignore
      }
    }
  }
}

/**
 * "Up" direction of the real world in three.js camera space, from the phone's accelerometer.
 * For a back camera in portrait, the device axes equal the camera axes (x right, y up, z towards the
 * user), and accelerationIncludingGravity points up when the phone is at rest.
 */
export class GravityTracker {
  private up: THREE.Vector3 | null = null;
  private votes: number[] = [];
  private lastEvent = 0;
  private readonly onMotion = (e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity;
    if (!a || a.x === null || a.y === null || a.z === null) return;
    const v = new THREE.Vector3(a.x, a.y, a.z);
    if (v.lengthSq() < 1) return;
    // Some browsers (Safari on iPhone) report the opposite sign. A phone used in portrait has its
    // top edge pointing up most of the time, so the sign is learned from the first readings.
    if (Math.abs(v.y) > 4 && this.votes.length < 30) this.votes.push(Math.sign(v.y));
    if (this.votes.length >= 30 && this.votes.reduce((x, y) => x + y, 0) < -10) v.negate();
    // Compensate a rotated screen (landscape)
    const angle = THREE.MathUtils.degToRad(screen.orientation?.angle ?? 0);
    v.applyAxisAngle(new THREE.Vector3(0, 0, 1), -angle).normalize();
    // Low-pass (~0.35 s): keep gravity, drop hand shake
    const now = performance.now();
    const dt = this.lastEvent ? Math.min((now - this.lastEvent) / 1000, 0.1) : 0;
    this.up = this.up ? this.up.lerp(v, 1 - Math.exp(-dt / 0.35)).normalize() : v;
    this.lastEvent = now;
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
