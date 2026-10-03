import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ARQRTarget } from '../../types/arBook';
import { QRAnchor } from '../../services/barcodeScanner';
import { getModelEntries, resolveModelSource } from '../../services/db';
import { loadGlbModel, normalizeModel } from '../../utils/modelLoader';
import { Sparkles, Hand, AlertTriangle } from 'lucide-react';

interface ThreeCanvasProps {
  target: ARQRTarget | null;
  qrAnchor: QRAnchor | null;
  activeAssetIndex: number;
  onCycleNextAsset: () => void;
}

const FOV = 50;
const TAN_HALF_FOV = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
// Model height in QR-sticker widths when modelScale = 1
const BASE_MODEL_HEIGHT = 2.0;

/** Where the QR sticker is on screen (CSS pixels), taking the object-cover crop of the video into account. */
function anchorToScreen(anchor: QRAnchor, cw: number, ch: number) {
  const scale = Math.max(cw / anchor.videoWidth, ch / anchor.videoHeight);
  const offX = (cw - anchor.videoWidth * scale) / 2;
  const offY = (ch - anchor.videoHeight * scale) / 2;
  return {
    x: offX + (anchor.x + anchor.width / 2) * scale,
    y: offY + (anchor.y + anchor.height / 2) * scale,
    size: Math.max(anchor.width, anchor.height) * scale,
  };
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ target, qrAnchor, activeAssetIndex, onCycleNextAsset }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<THREE.AnimationAction[]>([]);
  const clipsRef = useRef<THREE.AnimationClip[]>([]);
  const actionIndexRef = useRef<number>(0);

  // Latest props for the render loop (avoids stale closures)
  const anchorRef = useRef<QRAnchor | null>(qrAnchor);
  anchorRef.current = qrAnchor;
  const targetRef = useRef<ARQRTarget | null>(target);
  targetRef.current = target;

  // Smoothed placement: screen position (px) and QR size (px)
  const smoothRef = useRef<{ x: number; y: number; size: number } | null>(null);

  // Touch interaction
  const yawRef = useRef<number>(0);
  const userScaleRef = useRef<number>(1);
  const pointerRef = useRef<{ down: boolean; x: number; y: number; startX: number; startY: number }>({
    down: false, x: 0, y: 0, startX: 0, startY: 0,
  });
  const pinchRef = useRef<{ dist: number; base: number } | null>(null);

  const [loadingModel, setLoadingModel] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [touchFeedback, setTouchFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Scene setup + render loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 200);
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

    const clock = new THREE.Clock();
    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      mixerRef.current?.update(delta);

      const model = modelRef.current;
      const anchor = anchorRef.current;
      const t = targetRef.current;
      if (model) {
        if (!anchor || !t) {
          model.visible = false;
          smoothRef.current = null;
        } else {
          const cw = container.clientWidth || window.innerWidth;
          const ch = container.clientHeight || window.innerHeight;
          const s = anchorToScreen(anchor, cw, ch);
          const prev = smoothRef.current;
          // Snap on first detection, then smooth out scanner jitter
          smoothRef.current = prev
            ? { x: prev.x + (s.x - prev.x) * 0.35, y: prev.y + (s.y - prev.y) * 0.35, size: prev.size + (s.size - prev.size) * 0.25 }
            : s;
          const p = smoothRef.current;

          // Put the QR plane at the depth where 1 world unit = QR width on screen.
          // The model then sits on the sticker and grows/shrinks as the camera moves closer/further.
          const qrPx = Math.max(p.size, 8);
          const depth = THREE.MathUtils.clamp(ch / (2 * TAN_HALF_FOV * qrPx), 0.2, 150);
          const ndcX = (p.x / cw) * 2 - 1;
          const ndcY = -((p.y / ch) * 2 - 1);
          const halfH = depth * TAN_HALF_FOV;
          model.position.set(ndcX * halfH * camera.aspect, ndcY * halfH + (t.elevationOffset || 0), -depth);
          model.rotation.set(0.12, yawRef.current, 0);
          const scale = BASE_MODEL_HEIGHT * (t.modelScale || 1) * userScaleRef.current;
          model.scale.setScalar(scale);
          model.visible = true;
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      sceneRef.current = null;
      rendererRef.current = null;
    };
  }, []);

  // Load the model whenever the target or the selected asset changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (modelRef.current) {
      scene.remove(modelRef.current);
      modelRef.current = null;
    }
    mixerRef.current?.stopAllAction();
    mixerRef.current = null;
    actionsRef.current = [];
    clipsRef.current = [];
    actionIndexRef.current = 0;
    setLoadError(null);
    if (!target) return;

    let cancelled = false;
    setLoadingModel(true);
    yawRef.current = 0;
    userScaleRef.current = 1;

    (async () => {
      try {
        const source = await resolveModelSource(target, activeAssetIndex);
        if (!source) throw new Error('File model 3D belum diunggah untuk stiker ini');
        const { scene: gltfScene, animations } = await loadGlbModel(source);
        if (cancelled || !sceneRef.current) return;

        const model = normalizeModel(gltfScene);
        model.visible = false;
        if (animations.length > 0) {
          const mixer = new THREE.AnimationMixer(gltfScene);
          mixerRef.current = mixer;
          actionsRef.current = animations.map((clip) => mixer.clipAction(clip));
          clipsRef.current = animations;
          actionsRef.current[0].play();
        }
        if (animations.length > 1 || getModelEntries(target).length > 1) {
          setShowHint(true);
          window.setTimeout(() => setShowHint(false), 3000);
        }
        sceneRef.current.add(model);
        modelRef.current = model;
      } catch (err) {
        console.warn('Model load failed:', err);
        if (!cancelled) setLoadError(err instanceof Error && err.message.includes('belum') ? err.message : 'Model 3D gagal dimuat');
      } finally {
        if (!cancelled) setLoadingModel(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [target, activeAssetIndex]);

  const flash = (msg: string, ms = 1800) => {
    setTouchFeedback(msg);
    window.setTimeout(() => setTouchFeedback(null), ms);
  };

  // Tap on the object: next animation clip, or next model attached to the same QR
  const handleTapObject = useCallback(() => {
    navigator.vibrate?.(40);
    const actions = actionsRef.current;
    if (actions.length > 1) {
      const prev = actionIndexRef.current;
      const next = (prev + 1) % actions.length;
      actionIndexRef.current = next;
      actions[prev].fadeOut(0.25);
      actions[next].reset().fadeIn(0.25).play();
      flash(`Animasi: ${clipsRef.current[next]?.name || `#${next + 1}`}`);
      return;
    }
    if (target && getModelEntries(target).length > 1) {
      onCycleNextAsset();
      flash('Model berikutnya...');
      return;
    }
    if (actions.length === 1) {
      actions[0].reset().play();
    }
  }, [target, onCycleNextAsset]);

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
    const model = modelRef.current;
    const camera = cameraRef.current;
    const container = containerRef.current;
    if (moved > 12 || !model || !model.visible || !camera || !container) return;

    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    // Skinned meshes raycast poorly, so also accept taps inside the model's bounding box
    const hit = raycaster.intersectObject(model, true).length > 0 ||
      raycaster.ray.intersectsBox(new THREE.Box3().setFromObject(model));
    if (hit) handleTapObject();
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
          <p className="text-[11px] font-semibold text-emerald-300">Memuat objek 3D...</p>
        </div>
      )}

      {loadError && qrAnchor && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-full text-amber-300 text-[11px] font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{loadError}</span>
        </div>
      )}

      {touchFeedback && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 bg-black/75 px-3.5 py-1.5 rounded-full border border-emerald-400/40 text-emerald-300 text-xs font-semibold shadow-lg flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{touchFeedback}</span>
        </div>
      )}

      {showHint && !touchFeedback && qrAnchor && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 bg-black/70 px-3 py-1.5 rounded-full border border-white/10 text-white/90 text-[11px] shadow-lg flex items-center gap-1.5">
          <Hand className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
          <span>Sentuh objek 3D untuk animasi berikutnya</span>
        </div>
      )}
    </div>
  );
};
