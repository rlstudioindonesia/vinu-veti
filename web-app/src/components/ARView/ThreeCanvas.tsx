import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ARQRTarget } from '../../types/arBook';
import { barcodeScanner, QRAnchor } from '../../services/barcodeScanner';
import { getModelEntries, resolveModelSource } from '../../services/db';
import { loadGlbCached, normalizeModel } from '../../utils/modelLoader';
import { qrTracker } from '../../services/qrTracker';
import { focalFromVideo, Point2, qrPoseFromCorners } from '../../utils/qrPose';
import { GravityTracker, GyroTracker, QrPoseStabilizer, uprightPose } from '../../utils/poseFilter';
import { Hand, AlertTriangle } from 'lucide-react';
import { useI18n } from '../../i18n';

interface ThreeCanvasProps {
  target: ARQRTarget | null;
  qrAnchor: QRAnchor | null;
  /** Called once each time the character appears on screen (new sticker, or back after losing the QR). */
  onModelShown?: () => void;
}

/** One uploaded .glb of the sticker's character (main model or an extra animation file). */
interface Variant {
  pivot: THREE.Group;
  mixer: THREE.AnimationMixer | null;
  actions: THREE.AnimationAction[];
}

/** One step of the tap cycle: a variant and one of its animation clips (-1 = no animation). */
interface Step {
  variant: number;
  clip: number;
}

// Taps this close to the character (screen px) also count, so small fingers do not miss it
const TAP_PADDING_PX = 36;
// Little "jump" when the character is touched
const BOUNCE_MS = 280;
// Appear (springy pop) / disappear (shrink) animation durations
const APPEAR_S = 0.42;
const DISAPPEAR_S = 0.24;

/** Ease-out with a small overshoot: grows a bit past full size, then settles (a friendly "pop"). */
function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function smoothstep(x: number): number {
  return x * x * (3 - 2 * x);
}

/** Frees GPU memory of a model that is no longer shown (important for big .glb files). */
function disposeObject(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const m of mats) {
      for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose();
      m.dispose();
    }
  });
}

interface Outgoing {
  group: THREE.Group;
  base: THREE.Matrix4;
  start: number;
  mixer: THREE.AnimationMixer | null;
}

// Model height in QR-sticker widths when modelScale = 1
const BASE_MODEL_HEIGHT = 2.0;
/** Video pixels → screen (CSS) pixels, taking the object-cover crop of the video into account. */
function videoToScreen(anchor: QRAnchor, cw: number, ch: number) {
  const scale = Math.max(cw / anchor.videoWidth, ch / anchor.videoHeight);
  const offX = (cw - anchor.videoWidth * scale) / 2;
  const offY = (ch - anchor.videoHeight * scale) / 2;
  return { scale, map: (p: Point2): Point2 => ({ x: offX + p.x * scale, y: offY + p.y * scale }) };
}

function normalizeCode(code: string) {
  return (code || '').trim().toLowerCase();
}

/** Fallback when no corners are known: corners of the axis-aligned box (QR assumed facing the camera). */
function boxCorners(a: QRAnchor): Point2[] {
  return [
    { x: a.x, y: a.y },
    { x: a.x + a.width, y: a.y },
    { x: a.x + a.width, y: a.y + a.height },
    { x: a.x, y: a.y + a.height },
  ];
}

/** Area of a quadrilateral (shoelace formula). */
function quadArea(p: Point2[]): number {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const j = (i + 1) % p.length;
    a += p[i].x * p[j].y - p[j].x * p[i].y;
  }
  return Math.abs(a) / 2;
}

// Model space → QR space: the model's up (+Y) becomes the QR normal (+Z, out of the paper) and the
// model's front (+Z) faces the QR's bottom edge, i.e. the reader holding the book.
const STAND_ON_QR = new THREE.Matrix4().makeRotationX(Math.PI / 2);

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ target, qrAnchor, onModelShown }) => {
  const { t: tr } = useI18n();
  const onShownRef = useRef(onModelShown);
  onShownRef.current = onModelShown;
  const announcedRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const warmupRef = useRef<Array<{ pivot: THREE.Object3D; done: () => void }>>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  // Anchor on the QR (pose set every frame); holds every animation variant of the character
  const modelRef = useRef<THREE.Group | null>(null);
  const variantsRef = useRef<Array<Variant | null>>([]);
  const stepsRef = useRef<Step[]>([]);
  const stepIndexRef = useRef<number>(0);
  const activeVariantRef = useRef<number>(-1);
  const bounceStartRef = useRef<number>(0);
  // Appear/disappear animation: 0 = hidden, 1 = fully shown
  const presenceRef = useRef<number>(0);
  const risingRef = useRef<boolean>(true);
  const baseMatrixRef = useRef<THREE.Matrix4 | null>(null);
  const outgoingRef = useRef<Outgoing[]>([]);

  // Latest props for the render loop (avoids stale closures)
  const anchorRef = useRef<QRAnchor | null>(qrAnchor);
  anchorRef.current = qrAnchor;
  const targetRef = useRef<ARQRTarget | null>(target);
  targetRef.current = target;

  // Jitter filtering of the tracked QR + real-world "up" from the accelerometer
  const stabilizerRef = useRef(new QrPoseStabilizer());
  const lastAnchorRef = useRef<QRAnchor | null>(null);
  const lastTrackSeqRef = useRef(0);
  // Previous QR reading (centre direction + capture time), to calibrate the gyroscope
  const lastReadingRef = useRef<{ dir: THREE.Vector3; t: number } | null>(null);
  // Diagnostics overlay (tap the sticker name 5x in the AR view)
  const statsRef = useRef<{ reads: number[]; latency: number }>({ reads: [], latency: 0 });
  const [debugText, setDebugText] = useState<string | null>(null);
  const gyroRef = useRef<GyroTracker | null>(null);

  // Touch interaction
  const yawRef = useRef<number>(0);
  const userScaleRef = useRef<number>(1);
  const pointerRef = useRef<{ down: boolean; x: number; y: number; startX: number; startY: number }>({
    down: false, x: 0, y: 0, startX: 0, startY: 0,
  });
  const pinchRef = useRef<{ dist: number; base: number } | null>(null);

  const [loadingModel, setLoadingModel] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Scene setup + render loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 500);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'default' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault(), false);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const root = new THREE.Group();
    root.matrixAutoUpdate = false;
    root.visible = false;
    scene.add(root);
    modelRef.current = root;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 1.6));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(1.5, 3, 2.5);
    scene.add(keyLight);

    const resize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const gravity = new GravityTracker();
    gravity.start();
    const gyro = new GyroTracker();
    gyro.start();
    // The optical tracker uses the phone's rotation to predict where the QR moves between frames
    qrTracker.rotationSince = (t) => (gyro.active ? gyro.rotationSince(t) : null);
    gyroRef.current = gyro;

    const clock = new THREE.Clock();
    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const active = variantsRef.current[activeVariantRef.current];
      active?.mixer?.update(delta);

      const model = modelRef.current;
      const anchor = anchorRef.current;
      const t = targetRef.current;
      if (model) {
        let want = false;
        if (!anchor || !t) {
          announcedRef.current = false;
          stabilizerRef.current.reset();
          lastAnchorRef.current = null;
          lastReadingRef.current = null;
          gyro.poll();
          gyro.take(); // drop rotation accumulated while nothing was tracked
        } else {
          const cw = container.clientWidth || window.innerWidth;
          const ch = container.clientHeight || window.innerHeight;
          const { scale: coverScale, map } = videoToScreen(anchor, cw, ch);

          // Match the 3D camera to the phone camera so 3D and video line up
          const focal = focalFromVideo(anchor.videoWidth, anchor.videoHeight) * coverScale;
          const fov = THREE.MathUtils.radToDeg(2 * Math.atan(ch / 2 / focal));
          if (Math.abs(camera.fov - fov) > 0.01) {
            camera.fov = fov;
            camera.updateProjectionMatrix();
          }

          // Follow the phone's own rotation (gyroscope) every frame, then correct with new QR readings
          const stab = stabilizerRef.current;
          const now = performance.now();
          gyro.poll();
          stab.applyCameraRotation(gyro.take());
          // Measurement for this frame: the frame-by-frame tracker when it follows this sticker
          // (every camera frame, steady), otherwise a new decode result
          let reading: QRAnchor | null = null;
          let precise = false;
          const tracked = qrTracker.latest;
          const tracking = qrTracker.isTracking() && tracked && normalizeCode(tracked.text) === normalizeCode(t.qrCode);
          if (tracking && tracked.seq !== lastTrackSeqRef.current) {
            lastTrackSeqRef.current = tracked.seq;
            reading = tracked.anchor;
            precise = true;
          }
          if (lastAnchorRef.current !== anchor) {
            lastAnchorRef.current = anchor;
            if (!tracking) reading = anchor;
          }
          if (reading) {
            const anchor = reading;
            const raw = (anchor.cornerPoints?.length === 4 ? anchor.cornerPoints : boxCorners(anchor)).map(map);
            const measured = qrPoseFromCorners(raw, focal, cw / 2, ch / 2);
            if (measured) {
              // The reading describes the frame captured a moment ago (scan latency)
              const capturedAt = anchor.timestamp ? now - (Date.now() - anchor.timestamp) : now;
              const st = statsRef.current;
              st.reads.push(now);
              st.latency = st.latency * 0.8 + (now - capturedAt) * 0.2;
              const dir = new THREE.Vector3().setFromMatrixPosition(measured).normalize();
              const prev = lastReadingRef.current;
              if (prev && capturedAt - prev.t < 400) gyro.calibrate(prev.dir, prev.t, dir, capturedAt);
              lastReadingRef.current = { dir, t: capturedAt };
              // Bring it forward to "now" with the phone's rotation since that frame, so the model does
              // not trail behind the QR while the phone is shaken
              const since = gyro.rotationSince(capturedAt);
              if (since) measured.premultiply(new THREE.Matrix4().makeRotationFromQuaternion(since.invert()));
              stab.addMeasurement(measured, now, quadArea(raw) / (focal * focal), precise, capturedAt);
            }
          }
          // QR briefly not detected (motion blur): with a gyroscope the model stays put on the sticker;
          // without one, hide it soon so it does not float in the wrong place
          const lostFor = stab.msSinceMeasurement(now);
          const smoothed = lostFor < (gyro.active ? 1000 : 500) ? stab.pose(delta) : null;
          const pose = smoothed ? uprightPose(smoothed, gravity.get()) : null;
          if (pose) {
            // Touch feedback: a quick squash-and-stretch jump
            const b = (now - bounceStartRef.current) / BOUNCE_MS;
            const bounce = b >= 0 && b < 1 ? 1 + 0.12 * Math.sin(b * Math.PI) : 1;
            const size = BASE_MODEL_HEIGHT * (t.modelScale || 1) * userScaleRef.current * bounce;
            baseMatrixRef.current = (baseMatrixRef.current ?? new THREE.Matrix4())
              .copy(pose)
              .multiply(STAND_ON_QR)
              .multiply(new THREE.Matrix4().makeTranslation(0, t.elevationOffset || 0, 0))
              .multiply(new THREE.Matrix4().makeRotationY(yawRef.current))
              .multiply(new THREE.Matrix4().makeScale(size, size, size));
            want = model.children.some((c) => c.visible);
            if (want && !announcedRef.current) {
              announcedRef.current = true;
              onShownRef.current?.();
            }
          }
        }

        // Pop in when the character appears, shrink away when the QR is gone (scaled at its feet)
        const p = presenceRef.current;
        if (want && !risingRef.current) risingRef.current = true;
        if (!want && risingRef.current) risingRef.current = false;
        presenceRef.current = want ? Math.min(1, p + delta / APPEAR_S) : Math.max(0, p - delta / DISAPPEAR_S);
        const pr = presenceRef.current;
        const s = risingRef.current ? easeOutBack(pr) : smoothstep(pr);
        if (baseMatrixRef.current && pr > 0.001) {
          model.matrixAutoUpdate = false;
          model.matrix.copy(baseMatrixRef.current).multiply(new THREE.Matrix4().makeScale(s, s, s));
          model.visible = true;
        } else {
          model.visible = false;
        }
      }

      // Exposed for automated tests / diagnostics (appear-disappear progress)
      let at: [number, number] | null = null;
      if (model?.visible) {
        const p0 = new THREE.Vector3().setFromMatrixPosition(model.matrix).project(camera);
        at = [((p0.x + 1) / 2) * (container.clientWidth || window.innerWidth), ((1 - p0.y) / 2) * (container.clientHeight || window.innerHeight)];
      }
      (window as unknown as { __vvAR?: object }).__vvAR = { presence: presenceRef.current, outgoing: outgoingRef.current.length, at, track: `${qrTracker.mode} ${qrTracker.fps}fps ${qrTracker.ms.toFixed(1)}ms` };

      // Character of the previous QR shrinking away while the new one appears
      const now2 = performance.now();
      outgoingRef.current = outgoingRef.current.filter((o) => {
        const k = (now2 - o.start) / (DISAPPEAR_S * 1000);
        if (k >= 1) {
          scene.remove(o.group);
          o.mixer?.stopAllAction();
          disposeObject(o.group);
          return false;
        }
        o.mixer?.update(delta);
        const sc = 1 - smoothstep(k);
        o.group.matrix.copy(o.base).multiply(new THREE.Matrix4().makeScale(sc, sc, sc));
        return true;
      });

      // GPU warm-up of newly loaded models (see prepareForGpu), in the same frame as the real render
      if (warmupRef.current.length > 0) {
        const holder = new THREE.Group();
        holder.matrixAutoUpdate = false;
        holder.matrix.makeTranslation(0, -0.5, -3).premultiply(camera.matrixWorld);
        const jobs = warmupRef.current.splice(0);
        jobs.forEach((j) => {
          j.pivot.visible = true;
          holder.add(j.pivot);
        });
        scene.add(holder);
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        renderer.setScissorTest(true);
        renderer.setScissor(Math.floor(w / 2), Math.floor(h / 2), 1, 1);
        renderer.render(scene, camera);
        renderer.setScissorTest(false);
        scene.remove(holder);
        jobs.forEach((j) => {
          holder.remove(j.pivot);
          j.pivot.visible = false;
          j.done();
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      gravity.stop();
      gyro.stop();
      qrTracker.rotationSince = null;
      cancelAnimationFrame(frameId);
      warmupRef.current.splice(0).forEach((j) => j.done());
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      sceneRef.current = null;
      rendererRef.current = null;
    };
  }, []);

  /** Show one step of the cycle: its variant becomes visible and its clip plays from the start. */
  const activateStep = useCallback((index: number) => {
    const step = stepsRef.current[index];
    if (!step) return;
    stepIndexRef.current = index;
    variantsRef.current.forEach((v, i) => {
      if (!v) return;
      v.pivot.visible = i === step.variant;
      if (i !== step.variant) v.mixer?.stopAllAction();
    });
    const v = variantsRef.current[step.variant];
    activeVariantRef.current = step.variant;
    if (v && step.clip >= 0) {
      v.actions.forEach((a, i) => i !== step.clip && a.stop());
      v.actions[step.clip].reset().setLoop(THREE.LoopRepeat, Infinity).play();
    }
  }, []);

  const prepareForGpu = useCallback(async (pivot: THREE.Object3D) => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!renderer || !camera || !scene) return;
    pivot.visible = true;
    try {
      await renderer.compileAsync(pivot, camera, scene);
      pivot.traverse((o) => {
        const mesh = o as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        for (const m of mats) for (const v of Object.values(m)) if (v instanceof THREE.Texture) renderer.initTexture(v);
      });
      // Many phone GPU drivers only finish shaders/textures on the first real draw: the render loop
      // draws the model once into a single, invisible pixel so that cost is paid before it appears
      await new Promise<void>((done) => warmupRef.current.push({ pivot, done }));
    } catch (err) {
      console.warn('GPU warm-up skipped:', err);
    }
    pivot.visible = false;
  }, []);

  // Load every .glb of the sticker once (main first, extra animations in the background), so
  // switching animations on touch is instant
  useEffect(() => {
    const root = modelRef.current;
    if (!root) return;

    const scene = sceneRef.current;
    if (scene && root.visible && root.children.length > 0) {
      // Previous sticker's character: shrink it away smoothly instead of cutting it off
      const group = new THREE.Group();
      group.matrixAutoUpdate = false;
      [...root.children].forEach((c) => group.add(c));
      const active = variantsRef.current[activeVariantRef.current];
      outgoingRef.current.push({ group, base: root.matrix.clone(), start: performance.now(), mixer: active?.mixer ?? null });
      scene.add(group);
      variantsRef.current.forEach((v) => v && v !== active && v.mixer?.stopAllAction());
    } else {
      variantsRef.current.forEach((v) => {
        v?.mixer?.stopAllAction();
        if (v) disposeObject(v.pivot);
      });
      root.clear();
    }
    root.visible = false;
    presenceRef.current = 0;
    baseMatrixRef.current = null;
    variantsRef.current = [];
    stepsRef.current = [];
    stepIndexRef.current = 0;
    activeVariantRef.current = -1;
    setLoadError(null);
    setShowHint(false);
    announcedRef.current = false;
    if (!target) return;

    let cancelled = false;
    setLoadingModel(true);
    yawRef.current = 0;
    userScaleRef.current = 1;
    const entries = getModelEntries(target);
    variantsRef.current = entries.map(() => null);

    const rebuildSteps = () => {
      const steps: Step[] = [];
      variantsRef.current.forEach((v, i) => {
        if (!v) return;
        if (v.actions.length === 0) steps.push({ variant: i, clip: -1 });
        else v.actions.forEach((_, c) => steps.push({ variant: i, clip: c }));
      });
      stepsRef.current = steps;
    };

    (async () => {
      let mainScale: number | undefined;
      for (let i = 0; i < entries.length; i++) {
        try {
          let loaded;
          try {
            // Cached per file + version: scanning a page again shows its character instantly
            loaded = await loadGlbCached(`${entries[i].id}|${target.updatedAt ?? ''}|${entries[i].url ?? ''}`, () =>
              resolveModelSource(target, i)
            );
          } catch (err) {
            if (i > 0 && err instanceof Error && err.message === 'missing') continue;
            throw err;
          }
          if (cancelled) return;
          const { scene: gltfScene, animations } = loaded;
          // Same scale as the main model: the character keeps its size in every animation
          const { pivot, scale } = normalizeModel(gltfScene, mainScale);
          if (i === 0) mainScale = scale;
          // Compile shaders and upload textures before the character pops in, so the appear
          // animation (and the first tap on an extra animation) does not stutter
          await prepareForGpu(pivot);
          if (cancelled) {
            disposeObject(pivot);
            return;
          }
          pivot.visible = false;
          const mixer = animations.length > 0 ? new THREE.AnimationMixer(gltfScene) : null;
          const actions = mixer ? animations.map((clip) => mixer.clipAction(clip)) : [];
          variantsRef.current[i] = { pivot, mixer, actions };
          root.add(pivot);
          rebuildSteps();
          if (activeVariantRef.current < 0) {
            activateStep(0);
            setLoadingModel(false);
          }
          if (stepsRef.current.length > 1) {
            setShowHint(true);
            window.setTimeout(() => setShowHint(false), 3500);
          }
        } catch (err) {
          console.warn('Model load failed:', entries[i]?.id, err);
          if (i === 0 && !cancelled) {
            setLoadError(err instanceof Error && err.message === 'missing' ? 'missing' : 'failed');
            setLoadingModel(false);
          }
        }
      }
      if (!cancelled) setLoadingModel(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [target, activateStep, prepareForGpu]);

  // Touching the character: next animation (next clip / next uploaded .glb of the same QR)
  // Only when the sticker has more than one animation; otherwise touching does nothing at all.
  const handleTapObject = useCallback(() => {
    const steps = stepsRef.current;
    if (steps.length < 2) return;
    navigator.vibrate?.(35);
    bounceStartRef.current = performance.now();
    activateStep((stepIndexRef.current + 1) % steps.length);
    setShowHint(false);
  }, [activateStep]);

  // Diagnostics overlay, toggled by tapping the sticker name 5 times (see ARScannerOverlay)
  useEffect(() => {
    let timer: number | undefined;
    const toggle = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = undefined;
        setDebugText(null);
        return;
      }
      timer = window.setInterval(() => {
        const now = performance.now();
        const st = statsRef.current;
        st.reads = st.reads.filter((t) => now - t < 1000);
        setDebugText(
          `Pembaca QR: ${barcodeScanner.lastMethod || '-'} · ${st.reads.length} baca/dtk · telat ${Math.round(st.latency)} ms\n` +
            `Pelacak optik: ${qrTracker.isTracking() ? `aktif ✓ ${qrTracker.fps} fps · ${qrTracker.ms.toFixed(0)} ms (${qrTracker.mode}${qrTracker.rotationSince ? ' + gyro' : ''})` : 'menunggu QR'}\n` +
            `Sensor gerak: ${gyroRef.current?.status() ?? '-'}`
        );
      }, 250);
    };
    window.addEventListener('vv-debug-toggle', toggle);
    return () => {
      window.removeEventListener('vv-debug-toggle', toggle);
      if (timer) window.clearInterval(timer);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerRef.current = { down: true, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current;
    if (!p.down || pinchRef.current) return;
    yawRef.current += (e.clientX - p.x) * 0.01;
    p.x = e.clientX;
    p.y = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current;
    p.down = false;
    const moved = Math.hypot(e.clientX - p.startX, e.clientY - p.startY);
    const root = modelRef.current;
    const camera = cameraRef.current;
    const container = containerRef.current;
    const active = variantsRef.current[activeVariantRef.current];
    if (moved > 12 || !root || !root.visible || !active || !camera || !container) return;

    // Hit when the finger is on the character's on-screen outline box (+ padding for small fingers)
    const rect = container.getBoundingClientRect();
    const box = new THREE.Box3().setFromObject(active.pivot);
    if (box.isEmpty()) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const x of [box.min.x, box.max.x])
      for (const y of [box.min.y, box.max.y])
        for (const z of [box.min.z, box.max.z]) {
          const v = new THREE.Vector3(x, y, z).project(camera);
          const sx = ((v.x + 1) / 2) * rect.width;
          const sy = ((1 - v.y) / 2) * rect.height;
          minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
          minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
        }
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    if (px >= minX - TAP_PADDING_PX && px <= maxX + TAP_PADDING_PX && py >= minY - TAP_PADDING_PX && py <= maxY + TAP_PADDING_PX) {
      handleTapObject();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      pinchRef.current = { dist, base: userScaleRef.current };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      userScaleRef.current = THREE.MathUtils.clamp(pinchRef.current.base * (dist / pinchRef.current.dist), 0.3, 3.5);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) pinchRef.current = null;
  };

  return (
    <div
      className="absolute inset-0 z-20 select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => (pointerRef.current.down = false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div ref={containerRef} className="w-full h-full" />

      {loadingModel && qrAnchor && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full text-white">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-semibold text-emerald-300">{tr('loadingModel')}</p>
        </div>
      )}

      {loadError && qrAnchor && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-full text-amber-300 text-[11px] font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{tr(loadError === 'missing' ? 'modelMissing' : 'modelFailed')}</span>
        </div>
      )}

      {debugText && (
        <pre className="absolute bottom-6 left-3 right-3 whitespace-pre-wrap rounded-xl bg-black/75 px-3 py-2 text-[11px] leading-snug text-lime-300 pointer-events-none">
          {debugText}
        </pre>
      )}

      {showHint && qrAnchor && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 bg-black/70 px-3 py-1.5 rounded-full border border-white/10 text-white/90 text-[11px] shadow-lg flex items-center gap-1.5">
          <Hand className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
          <span>{tr('tapToChange')}</span>
        </div>
      )}
    </div>
  );
};
