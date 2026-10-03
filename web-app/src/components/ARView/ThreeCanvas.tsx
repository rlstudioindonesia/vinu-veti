import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ARQRTarget } from '../../types/arBook';
import { QRAnchor } from '../../services/barcodeScanner';
import { build3DModelForTarget, loadCustomGlbModel } from '../../utils/modelGenerators';
import { ARDatabase } from '../../services/db';
import { Sparkles, Hand } from 'lucide-react';

interface ThreeCanvasProps {
  target: ARQRTarget | null;
  qrAnchor: QRAnchor | null;
  isPaused?: boolean;
  onCycleNextAsset?: () => void;
  activeAssetIndex?: number;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  target,
  qrAnchor,
  isPaused = false,
  onCycleNextAsset,
  activeAssetIndex = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const currentModelGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // GLB Animations Management
  const animationMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animationActionsRef = useRef<THREE.AnimationAction[]>([]);
  const currentActionIndexRef = useRef<number>(0);
  const availableClipsRef = useRef<THREE.AnimationClip[]>([]);

  // Position interpolation for anchoring to QR sticker
  const target3DPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const current3DPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Touch interaction & Raycasting
  const rotationEulerRef = useRef<THREE.Euler>(new THREE.Euler(0.15, 0, 0));
  const userScaleMultiplierRef = useRef<number>(1.0);
  const isPointerDownRef = useRef<boolean>(false);
  const pointerStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPinchDistRef = useRef<number | null>(null);
  const basePinchScaleRef = useRef<number>(1.0);

  const [loadingModel, setLoadingModel] = useState<boolean>(false);
  const [touchFeedback, setTouchFeedback] = useState<string | null>(null);
  const [showInteractionHint, setShowInteractionHint] = useState<boolean>(false);

  // Position 3D model relative to detected physical QR code sticker in camera frame
  useEffect(() => {
    if (!qrAnchor) {
      target3DPosRef.current.set(0, 0, 0);
      return;
    }
    const vW = qrAnchor.videoWidth || 1280;
    const vH = qrAnchor.videoHeight || 720;
    const centerX = qrAnchor.x + qrAnchor.width / 2;
    const centerY = qrAnchor.y + qrAnchor.height / 2;

    const ndcX = (centerX / vW) * 2 - 1;
    const ndcY = -((centerY / vH) * 2 - 1);

    const mappedX = ndcX * 1.55;
    const mappedY = ndcY * 1.35;
    const relativeSize = qrAnchor.width / vW;
    const mappedZ = Math.max(-0.6, Math.min(0.6, (0.28 - relativeSize) * 2.5));

    target3DPosRef.current.set(mappedX, mappedY, mappedZ);
  }, [qrAnchor]);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
      });
    } catch {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
      });
    }

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('WebGL context lost recovered');
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Realistic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(2.5, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.8);
    fillLight.position.set(-3, -1, -1);
    scene.add(fillLight);

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Load / Update 3D Model when target or asset index changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (currentModelGroupRef.current) {
      scene.remove(currentModelGroupRef.current);
      currentModelGroupRef.current = null;
    }
    if (animationMixerRef.current) {
      animationMixerRef.current.stopAllAction();
      animationMixerRef.current = null;
    }
    animationActionsRef.current = [];
    availableClipsRef.current = [];
    currentActionIndexRef.current = 0;

    if (!target) return;

    let isCancelled = false;
    setLoadingModel(true);

    const setupModel = async () => {
      let modelGroup: THREE.Group;
      let clips: THREE.AnimationClip[] = [];

      try {
        const activeId = (target.assets && target.assets[activeAssetIndex]) ? target.assets[activeAssetIndex].id : target.id;
        const bridge = typeof window !== 'undefined' ? (window as unknown as { AndroidBridge?: { getModelUrl?: (id: string) => string } }).AndroidBridge : undefined;
        const nativeUrl = bridge?.getModelUrl ? bridge.getModelUrl(activeId) : '';

        if (nativeUrl) {
          const glbRes = await loadCustomGlbModel(nativeUrl);
          modelGroup = glbRes.scene;
          clips = glbRes.animations || [];
        } else {
          let assetBlob: Blob | ArrayBuffer | null = null;
          if (target.assets && target.assets.length > 0 && target.assets[activeAssetIndex]) {
            const subAssetId = target.assets[activeAssetIndex].id;
            assetBlob = await ARDatabase.getAssetBlob(subAssetId);
          }
          if (!assetBlob) {
            assetBlob = await ARDatabase.getAssetBlob(target.id);
          }

          if (assetBlob) {
            const glbRes = await loadCustomGlbModel(assetBlob);
            modelGroup = glbRes.scene;
            clips = glbRes.animations || [];
          } else if (target.customGlbData) {
            const glbRes = await loadCustomGlbModel(target.customGlbData);
            modelGroup = glbRes.scene;
            clips = glbRes.animations || [];
          } else {
            modelGroup = build3DModelForTarget(target);
          }
        }

        if (isCancelled || !sceneRef.current) return;

        // Initialize GLB animations
        if (clips.length > 0) {
          availableClipsRef.current = clips;
          const mixer = new THREE.AnimationMixer(modelGroup);
          animationMixerRef.current = mixer;
          const actions = clips.map((clip) => {
            const action = mixer.clipAction(clip);
            action.setEffectiveTimeScale(1.0);
            return action;
          });
          animationActionsRef.current = actions;
          if (actions[0]) {
            actions[0].play();
          }
          setShowInteractionHint(true);
          setTimeout(() => setShowInteractionHint(false), 3000);
        } else if (target.assets && target.assets.length > 1) {
          setShowInteractionHint(true);
          setTimeout(() => setShowInteractionHint(false), 3000);
        }
      } catch (err) {
        console.warn('Fallback to procedural model:', err);
        modelGroup = build3DModelForTarget(target);
      }

      // Build dedicated AR QR Sticker Ground Hologram
      const anchorPlate = new THREE.Group();
      anchorPlate.name = 'qr_anchor_ground_plate';
      const ringColor = new THREE.Color(target.accentColor || '#10b981');

      const halfSize = 0.75;
      const platePoints = [
        new THREE.Vector3(-halfSize, -0.65, -halfSize),
        new THREE.Vector3(halfSize, -0.65, -halfSize),
        new THREE.Vector3(halfSize, -0.65, halfSize),
        new THREE.Vector3(-halfSize, -0.65, halfSize),
        new THREE.Vector3(-halfSize, -0.65, -halfSize),
      ];
      const borderGeo = new THREE.BufferGeometry().setFromPoints(platePoints);
      const borderMat = new THREE.LineBasicMaterial({ color: ringColor });
      anchorPlate.add(new THREE.Line(borderGeo, borderMat));

      const ringGeo = new THREE.RingGeometry(0.55, 0.62, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = -0.65;
      anchorPlate.add(ringMesh);

      modelGroup.add(anchorPlate);

      // Stable non-rotating orientation
      rotationEulerRef.current.set(0.15, 0, 0);
      userScaleMultiplierRef.current = 1.0;
      current3DPosRef.current.copy(target3DPosRef.current);

      if (sceneRef.current) {
        sceneRef.current.add(modelGroup);
      }
      currentModelGroupRef.current = modelGroup;
      setLoadingModel(false);
    };

    setupModel();

    return () => {
      isCancelled = true;
    };
  }, [target, activeAssetIndex]);

  // Main Render Loop
  useEffect(() => {
    const clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      if (isPaused) return;

      const delta = Math.min(clock.getDelta(), 0.05);

      // Update GLB animations
      if (animationMixerRef.current) {
        animationMixerRef.current.update(delta);
      }

      const model = currentModelGroupRef.current;
      if (model && target) {
        // Interpolate position smoothly to physical QR code coordinates
        const lerpFactor = 0.18;
        current3DPosRef.current.lerp(target3DPosRef.current, lerpFactor);

        model.position.x = current3DPosRef.current.x;
        model.position.y = current3DPosRef.current.y + (target.elevationOffset || 0);
        model.position.z = current3DPosRef.current.z;

        // Rotation from touch or subtle rotation
        model.rotation.copy(rotationEulerRef.current);

        // Apply scale
        const baseScale = target.modelScale || 1.0;
        const totalScale = baseScale * userScaleMultiplierRef.current;
        model.scale.set(totalScale, totalScale, totalScale);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [target, isPaused]);

  // Trigger next animation clip or next asset on touch
  const handleTriggerNextAnimationOrAsset = useCallback(() => {
    const actions = animationActionsRef.current;
    const clips = availableClipsRef.current;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(45);
    }

    if (currentModelGroupRef.current) {
      const origScale = userScaleMultiplierRef.current;
      userScaleMultiplierRef.current = origScale * 1.08;
      setTimeout(() => {
        userScaleMultiplierRef.current = origScale;
      }, 160);
    }

    if (actions.length > 1) {
      const prevIndex = currentActionIndexRef.current;
      const nextIndex = (prevIndex + 1) % actions.length;
      currentActionIndexRef.current = nextIndex;
      const prevAction = actions[prevIndex];
      const nextAction = actions[nextIndex];
      prevAction.fadeOut(0.25);
      nextAction.reset().fadeIn(0.25).play();
      const clipName = clips[nextIndex]?.name || `Animasi #${nextIndex + 1}`;
      setTouchFeedback(`Animasi: ${clipName}`);
      setTimeout(() => setTouchFeedback(null), 2000);
      return;
    }

    if (target?.assets && target.assets.length > 1 && onCycleNextAsset) {
      onCycleNextAsset();
      setTouchFeedback('Beralih ke Model Berikutnya...');
      setTimeout(() => setTouchFeedback(null), 2000);
      return;
    }

    if (actions.length === 1) {
      actions[0].reset().play();
      setTouchFeedback('Animasi Berulang');
      setTimeout(() => setTouchFeedback(null), 1500);
    } else {
      setTouchFeedback('Objek 3D Aktif');
      setTimeout(() => setTouchFeedback(null), 1500);
    }
  }, [target, onCycleNextAsset]);

  // Touch and Mouse Interaction with 3D Object Raycasting
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = true;
    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const deltaX = e.clientX - pointerStartPosRef.current.x;
    const deltaY = e.clientY - pointerStartPosRef.current.y;

    rotationEulerRef.current.y += deltaX * 0.008;
    rotationEulerRef.current.x += deltaY * 0.008;
    rotationEulerRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotationEulerRef.current.x));

    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = false;
    const dist = Math.hypot(
      e.clientX - pointerStartPosRef.current.x,
      e.clientY - pointerStartPosRef.current.y
    );

    if (dist < 12 && containerRef.current && cameraRef.current && currentModelGroupRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(currentModelGroupRef.current.children, true);
      const meshHits = intersects.filter((hit) => {
        let parent: THREE.Object3D | null = hit.object;
        while (parent) {
          if (parent.name === 'qr_anchor_ground_plate') return false;
          parent = parent.parent;
        }
        return true;
      });

      if (meshHits.length > 0) {
        handleTriggerNextAnimationOrAsset();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistRef.current = dist;
      basePinchScaleRef.current = userScaleMultiplierRef.current;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / initialPinchDistRef.current;
      const newScale = Math.min(3.5, Math.max(0.3, basePinchScaleRef.current * ratio));
      userScaleMultiplierRef.current = newScale;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      initialPinchDistRef.current = null;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.0015;
    userScaleMultiplierRef.current = Math.min(3.5, Math.max(0.3, userScaleMultiplierRef.current + zoomDelta));
  };

  return (
    <div
      className="absolute inset-0 z-20 pointer-events-auto select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        isPointerDownRef.current = false;
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading Model */}
      {loadingModel && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-2xs text-white">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] font-semibold tracking-wider uppercase text-emerald-300">
              Menempatkan Objek 3D pada QR...
            </p>
          </div>
        </div>
      )}

      {/* Visual Feedback on Touching 3D Object */}
      {touchFeedback && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-400/40 text-emerald-300 text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{touchFeedback}</span>
        </div>
      )}

      {/* Touch Interaction Hint */}
      {showInteractionHint && !touchFeedback && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white/90 text-[11px] shadow-lg animate-in fade-in duration-200 flex items-center gap-1.5">
          <Hand className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
          <span>Sentuh objek 3D untuk merespon animasi berikutnya</span>
        </div>
      )}
    </div>
  );
};
