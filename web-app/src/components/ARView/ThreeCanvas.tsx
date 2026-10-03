import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ARQRTarget } from '../../types/arBook';
import { QRAnchor } from '../../services/barcodeScanner';
import { getModelEntries, resolveModelSource } from '../../services/db';
import { loadGlbModel, normalizeModel } from '../../utils/modelLoader';
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

// Model height in QR-sticker widths when modelScale = 1
const BASE_MODEL_HEIGHT = 2.0;
/** Video pixels → screen (CSS) pixels, taking the object-cover crop of the video into account. */
function videoToScreen(anchor: QRAnchor, cw: number, ch: number) {
  const scale = Math.max(cw / anchor.videoWidth, ch / anchor.videoHeight);
  const offX = (cw - anchor.videoWidth * scale) / 2;
  const offY = (ch - anchor.videoHeight * scale) / 2;
  return { scale, map: (p: Point2): Point2 => ({ x: offX + p.x * scale, y: offY + p.y * scale }) };
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
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  // Anchor on the QR (pose set every frame); holds every animation variant of the character
  const modelRef = useRef<THREE.Group | null>(null);
  const variantsRef = useRef<Array<Variant | null>>([]);
  const stepsRef = useRef<Step[]>([]);
  const stepIndexRef = useRef<number>(0);
  const activeVariantRef = useRef<number>(-1);
  const bounceStartRef = useRef<number>(0);

  // Latest props for the render loop (avoids stale closures)
  const anchorRef = useRef<QRAnchor | null>(qrAnchor);
  anchorRef.current = qrAnchor;
  const targetRef = useRef<ARQRTarget | null>(target);
  targetRef.current = target;

  // Jitter filtering of the tracked QR + real-world "up" from the accelerometer
  const stabilizerRef = useRef(new QrPoseStabilizer());
  const lastAnchorRef = useRef<QRAnchor | null>(null);
  // Previous QR reading (centre direction + capture time), to calibrate the gyroscope
  const lastReadingRef = useRef<{ dir: THREE.Vector3; t: number } | null>(null);

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
        if (!anchor || !t) {
          model.visible = false;
          announcedRef.current = false;
          stabilizerRef.current.reset();
          lastAnchorRef.current = null;
          lastReadingRef.current = null;
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
          stab.applyCameraRotation(gyro.take());
          if (lastAnchorRef.current !== anchor) {
            lastAnchorRef.current = anchor;
            const raw = (anchor.cornerPoints?.length === 4 ? anchor.cornerPoints : boxCorners(anchor)).map(map);
            const measured = qrPoseFromCorners(raw, focal, cw / 2, ch / 2);
            if (measured) {
              // The reading describes the frame captured a moment ago (scan latency)
              const capturedAt = anchor.timestamp ? now - (Date.now() - anchor.timestamp) : now;
              const dir = new THREE.Vector3().setFromMatrixPosition(measured).normalize();
              const prev = lastReadingRef.current;
              if (prev && capturedAt - prev.t < 400) gyro.calibrate(prev.dir, prev.t, dir, capturedAt);
              lastReadingRef.current = { dir, t: capturedAt };
              // Bring it forward to "now" with the phone's rotation since that frame, so the model does
              // not trail behind the QR while the phone is shaken
              const since = gyro.rotationSince(capturedAt);
              if (since) measured.premultiply(new THREE.Matrix4().makeRotationFromQuaternion(since.invert()));
              stab.addMeasurement(measured, now, quadArea(raw) / (focal * focal));
            }
          }
          // QR briefly not detected (motion blur): with a gyroscope the model stays put on the sticker;
          // without one, hide it soon so it does not float in the wrong place
          const lostFor = stab.msSinceMeasurement(now);
          const smoothed = lostFor < (gyro.active ? 2500 : 700) ? stab.pose(delta) : null;
          const pose = smoothed ? uprightPose(smoothed, gravity.get()) : null;
          if (!pose) model.visible = false;
          if (pose) {
            // Touch feedback: a quick squash-and-stretch jump
            const b = (now - bounceStartRef.current) / BOUNCE_MS;
            const bounce = b >= 0 && b < 1 ? 1 + 0.12 * Math.sin(b * Math.PI) : 1;
            const size = BASE_MODEL_HEIGHT * (t.modelScale || 1) * userScaleRef.current * bounce;
            model.matrixAutoUpdate = false;
            model.matrix
              .copy(pose)
              .multiply(STAND_ON_QR)
              .multiply(new THREE.Matrix4().makeTranslation(0, t.elevationOffset || 0, 0))
              .multiply(new THREE.Matrix4().makeRotationY(yawRef.current))
              .multiply(new THREE.Matrix4().makeScale(size, size, size));
            model.visible = model.children.some((c) => c.visible);
            if (model.visible && !announcedRef.current) {
              announcedRef.current = true;
              onShownRef.current?.();
            }
          }
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      gravity.stop();
      gyro.stop();
      cancelAnimationFrame(frameId);
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

  // Load every .glb of the sticker once (main first, extra animations in the background), so
  // switching animations on touch is instant
  useEffect(() => {
    const root = modelRef.current;
    if (!root) return;

    variantsRef.current.forEach((v) => v?.mixer?.stopAllAction());
    root.clear();
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
          const source = await resolveModelSource(target, i);
          if (!source) {
            if (i === 0) throw new Error('missing');
            continue;
          }
          const { scene: gltfScene, animations } = await loadGlbModel(source);
          if (cancelled) return;
          // Same scale as the main model: the character keeps its size in every animation
          const { pivot, scale } = normalizeModel(gltfScene, mainScale);
          if (i === 0) mainScale = scale;
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
  }, [target, activateStep]);

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

      {showHint && qrAnchor && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 bg-black/70 px-3 py-1.5 rounded-full border border-white/10 text-white/90 text-[11px] shadow-lg flex items-center gap-1.5">
          <Hand className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
          <span>{tr('tapToChange')}</span>
        </div>
      )}
    </div>
  );
};
