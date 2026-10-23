import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ARQRTarget } from '../../types/arBook';
import { loadGlbLight, normalizeModel } from '../../utils/modelLoader';
import { resolveModelSource } from '../../services/db';

interface GlbViewerPreviewProps {
  target: ARQRTarget;
  customBlobData?: Blob | ArrayBuffer | null;
}

const PREVIEW_TIMEOUT_MS = 60000;

export const GlbViewerPreview: React.FC<GlbViewerPreviewProps> = ({
  target,
  customBlobData,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animIdRef = useRef<number | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  // Size and height change with the sliders: applied every frame, without loading the model again
  const placementRef = useRef({ scale: target.modelScale || 1, elevation: target.elevationOffset || 0 });
  placementRef.current = { scale: target.modelScale || 1, elevation: target.elevationOffset || 0 };
  // Shown over the preview: a big model takes a while on a phone, and may not open at all
  const [status, setStatus] = useState<'empty' | 'loading' | 'ready' | 'failed' | 'heavy' | 'nogl'>('empty');

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
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false,
        });
      } catch (err) {
        // No 3D on this browser (graphics acceleration off, old graphics driver): the form stays usable
        console.warn('Preview: WebGL not available', err);
        setStatus('nogl');
        return;
      }
    }

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('Preview WebGL context lost handled');
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    // GPU out of memory while showing this model (not the context released on purpose when the
    // preview closes, see the cleanup below)
    renderer.domElement.addEventListener('webglcontextlost', () => !isCancelled && setStatus('heavy'), false);
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

    // A preview that has not opened after this long: the model is too heavy for this device
    const tooSlow = window.setTimeout(() => !isCancelled && setStatus((s) => (s === 'loading' ? 'heavy' : s)), PREVIEW_TIMEOUT_MS);
    const load = async () => {
      try {
        const source = customBlobData || (await resolveModelSource(target, 0));
        if (!source) {
          if (!isCancelled) setStatus('empty');
          return;
        }
        if (!isCancelled) setStatus('loading');
        const res = await loadGlbLight(source);
        if (isCancelled) return;

        if (res.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(res.scene);
          mixerRef.current = mixer;
          mixer.clipAction(res.animations[0]).play();
        }

        modelGroup = normalizeModel(res.scene).pivot;
        scene.add(modelGroup);
        setStatus((s) => (s === 'heavy' ? s : 'ready'));
      } catch (e) {
        console.warn('Preview load error:', e);
        if (!isCancelled) setStatus('failed');
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
        modelGroup.scale.setScalar(1.4 * placementRef.current.scale);
        modelGroup.position.y = -0.7 + placementRef.current.elevation;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isCancelled = true;
      window.clearTimeout(tooSlow);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      if (mixerRef.current) mixerRef.current.stopAllAction();
      mixerRef.current = null;
      // Free the model's GPU memory and the WebGL context itself (browsers allow only a few at once)
      modelGroup?.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        for (const m of mats) {
          for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose();
          m.dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
    // Only a different model file needs a new preview (not the size / height sliders)
  }, [target.id, target.customGlbUrl, customBlobData]);

  return (
    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800 flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full" />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-[11px] font-semibold text-emerald-300 pointer-events-none">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          Memuat pratinjau…
        </div>
      )}
      {status === 'nogl' && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-[11px] font-semibold text-amber-300 pointer-events-none">
          Pratinjau 3D tidak bisa tampil di browser ini (3D/WebGL mati). Di Chrome: Setelan → Sistem → nyalakan
          &quot;Gunakan akselerasi grafis&quot;, lalu buka ulang Chrome. Unggah &amp; simpan tetap bisa.
        </div>
      )}
      {(status === 'failed' || status === 'heavy') && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-[11px] font-semibold text-amber-300 pointer-events-none">
          {status === 'heavy'
            ? 'Model terlalu berat untuk dipratinjau di perangkat ini. Kompres dulu (unggah dari browser laptop), atau kecilkan tekstur/poligon.'
            : 'Pratinjau gagal dibuka. Pastikan file .glb tidak rusak (ekspor ulang dari Blender).'}
        </div>
      )}
      <span className="absolute bottom-2 left-2 text-[10px] text-emerald-400 font-mono bg-black/70 px-2 py-0.5 rounded-md border border-emerald-500/20">
        Pratinjau 3D
      </span>
    </div>
  );
};
