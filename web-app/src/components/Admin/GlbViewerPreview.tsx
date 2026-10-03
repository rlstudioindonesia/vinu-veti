import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ARQRTarget } from '../../types/arBook';
import { loadGlbModel, normalizeModel } from '../../utils/modelLoader';
import { resolveModelSource } from '../../services/db';

interface GlbViewerPreviewProps {
  target: ARQRTarget;
  customBlobData?: Blob | ArrayBuffer | null;
}

export const GlbViewerPreview: React.FC<GlbViewerPreviewProps> = ({
  target,
  customBlobData,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animIdRef = useRef<number | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 280;
    const height = container.clientHeight || 180;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0.1, 3);

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
      console.warn('Preview WebGL context lost handled');
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    let modelGroup: THREE.Group | null = null;
    let isCancelled = false;
    const clock = new THREE.Clock();

    const load = async () => {
      try {
        const source = customBlobData || (await resolveModelSource(target, 0));
        if (!source) return;
        const res = await loadGlbModel(source);
        if (isCancelled) return;

        if (res.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(res.scene);
          mixerRef.current = mixer;
          mixer.clipAction(res.animations[0]).play();
        }

        modelGroup = normalizeModel(res.scene).pivot;
        const s = 1.4 * (target.modelScale || 1.0);
        modelGroup.scale.setScalar(s);
        modelGroup.position.y = -0.7 + (target.elevationOffset || 0);
        scene.add(modelGroup);
      } catch (e) {
        console.warn('Preview load error:', e);
      }
    };

    load();

    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      if (modelGroup) {
        modelGroup.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isCancelled = true;
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      if (mixerRef.current) mixerRef.current.stopAllAction();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [target.id, target.customGlbUrl, target.modelScale, target.elevationOffset, customBlobData]);

  return (
    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800 flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full" />
      <span className="absolute bottom-2 left-2 text-[10px] text-emerald-400 font-mono bg-black/70 px-2 py-0.5 rounded-md border border-emerald-500/20">
        Pratinjau 3D
      </span>
    </div>
  );
};
