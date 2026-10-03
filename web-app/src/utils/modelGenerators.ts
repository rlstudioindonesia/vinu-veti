import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ARQRTarget } from '../types/arBook';

export function createHeartModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'heart_anatomy_root';

  // Main heart body (ventricles)
  const heartShape = new THREE.Shape();
  const x = 0, y = 0;
  heartShape.moveTo(x + 0.25, y + 0.25);
  heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
  heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
  heartShape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 1.0);
  heartShape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
  heartShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
  heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

  const extrudeSettings = {
    depth: 0.45,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 2,
    bevelSize: 0.15,
    bevelThickness: 0.2,
  };

  const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
  heartGeo.center();
  heartGeo.scale(1.2, 1.2, 1.2);

  const muscleMaterial = new THREE.MeshStandardMaterial({
    color: 0xcc2222,
    roughness: 0.35,
    metalness: 0.1,
  });

  const heartMesh = new THREE.Mesh(heartGeo, muscleMaterial);
  heartMesh.rotation.z = Math.PI; // flip right-side up
  heartMesh.name = 'heart_muscle';
  group.add(heartMesh);

  // Aorta arch (curved tube using CatmullRomCurve3)
  const aortaPoints = [
    new THREE.Vector3(-0.25, 0.45, 0),
    new THREE.Vector3(-0.15, 0.72, 0.1),
    new THREE.Vector3(0.15, 0.72, 0.1),
    new THREE.Vector3(0.28, 0.45, 0),
  ];
  const aortaPath = new THREE.CatmullRomCurve3(aortaPoints);
  const aortaGeo = new THREE.TubeGeometry(aortaPath, 20, 0.1, 12, false);
  const aortaMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
  const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
  group.add(aortaMesh);

  // Superior Vena Cava (blue vein)
  const veinGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16);
  const veinMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
  const veinMesh = new THREE.Mesh(veinGeo, veinMat);
  veinMesh.position.set(-0.35, 0.45, -0.05);
  veinMesh.rotation.z = -0.2;
  group.add(veinMesh);

  // Pulmonary Artery (branched)
  const pulmoGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.4, 16);
  const pulmoMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4 });
  const pulmoMesh = new THREE.Mesh(pulmoGeo, pulmoMat);
  pulmoMesh.position.set(0.25, 0.35, 0.15);
  pulmoMesh.rotation.z = 0.5;
  group.add(pulmoMesh);

  return group;
}

export function createSolarSystemModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'solar_system_root';

  // Glowing Sun in center
  const sunGeo = new THREE.SphereGeometry(0.38, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.name = 'sun_center';
  group.add(sunMesh);

  // Sun point light
  const sunLight = new THREE.PointLight(0xffdd66, 2.5, 10);
  group.add(sunLight);

  // Sun outer glow atmosphere
  const glowGeo = new THREE.SphereGeometry(0.44, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xff7700,
    transparent: true,
    opacity: 0.35,
    side: THREE.BackSide,
  });
  group.add(new THREE.Mesh(glowGeo, glowMat));

  // Planets data: [name, radius, distance, color, speed, hasRing]
  const planetsConfig: Array<{ name: string; radius: number; dist: number; color: number; speed: number; ring?: boolean }> = [
    { name: 'Merkurius', radius: 0.05, dist: 0.6, color: 0xa8a29e, speed: 2.2 },
    { name: 'Venus', radius: 0.08, dist: 0.85, color: 0xf59e0b, speed: 1.6 },
    { name: 'Bumi', radius: 0.09, dist: 1.15, color: 0x38bdf8, speed: 1.1 },
    { name: 'Mars', radius: 0.06, dist: 1.45, color: 0xef4444, speed: 0.8 },
    { name: 'Jupiter', radius: 0.17, dist: 1.85, color: 0xd97706, speed: 0.5 },
    { name: 'Saturnus', radius: 0.14, dist: 2.3, color: 0xfde047, speed: 0.35, ring: true },
  ];

  planetsConfig.forEach((p) => {
    const pivot = new THREE.Group();
    pivot.name = `orbit_${p.name}`;
    (pivot as unknown as { orbitSpeed: number }).orbitSpeed = p.speed;

    // Orbit trail line
    const orbitPoints: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      orbitPoints.push(new THREE.Vector3(Math.cos(theta) * p.dist, 0, Math.sin(theta) * p.dist));
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.4 });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    group.add(orbitLine);

    // Planet mesh
    const pGeo = new THREE.SphereGeometry(p.radius, 24, 24);
    const pMat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.6 });
    const pMesh = new THREE.Mesh(pGeo, pMat);
    pMesh.position.set(p.dist, 0, 0);

    if (p.ring) {
      const ringGeo = new THREE.RingGeometry(p.radius * 1.5, p.radius * 2.4, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xeab308, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2.3;
      pMesh.add(ringMesh);
    }

    pivot.add(pMesh);
    group.add(pivot);
  });

  return group;
}

export function createTRexModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'trex_root';

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x2d6a4f,
    roughness: 0.7,
    metalness: 0.1,
  });
  const bellyMat = new THREE.MeshStandardMaterial({
    color: 0x74c69d,
    roughness: 0.8,
  });

  // Body torso
  const torsoGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.9, 16);
  const torso = new THREE.Mesh(torsoGeo, skinMat);
  torso.rotation.z = Math.PI / 3;
  torso.position.set(-0.2, 0.1, 0);
  group.add(torso);

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.2, 0.28, 0.45, 12);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.set(0.22, 0.38, 0);
  neck.rotation.z = -Math.PI / 4;
  group.add(neck);

  // Head base
  const headGeo = new THREE.BoxGeometry(0.48, 0.28, 0.28);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0.46, 0.52, 0);
  group.add(head);

  // Jaw
  const jawGeo = new THREE.BoxGeometry(0.42, 0.12, 0.24);
  const jaw = new THREE.Mesh(jawGeo, bellyMat);
  jaw.position.set(0.44, 0.38, 0);
  jaw.name = 'trex_jaw';
  group.add(jaw);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.04, 12, 12);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(0.48, 0.6, 0.13);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.48, 0.6, -0.13);
  group.add(eyeL);
  group.add(eyeR);

  // Tail
  const tailGeo = new THREE.ConeGeometry(0.25, 1.2, 12);
  const tail = new THREE.Mesh(tailGeo, skinMat);
  tail.position.set(-0.85, 0.25, 0);
  tail.rotation.z = Math.PI / 2.3;
  group.add(tail);

  // Strong Hind Legs
  const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.6, 12);
  const legL = new THREE.Mesh(legGeo, skinMat);
  legL.position.set(-0.15, -0.35, 0.25);
  const legR = new THREE.Mesh(legGeo, skinMat);
  legR.position.set(-0.15, -0.35, -0.25);
  group.add(legL);
  group.add(legR);

  // Tiny arms
  const armGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.22, 8);
  const armL = new THREE.Mesh(armGeo, skinMat);
  armL.position.set(0.15, 0.1, 0.2);
  armL.rotation.z = Math.PI / 3;
  const armR = new THREE.Mesh(armGeo, skinMat);
  armR.position.set(0.15, 0.1, -0.2);
  armR.rotation.z = Math.PI / 3;
  group.add(armL);
  group.add(armR);

  return group;
}

export function createDnaHelixModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'dna_helix_root';

  const pairColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b]; // A, T, G, C
  const totalRungs = 24;
  const heightSpan = 2.4;
  const radius = 0.5;

  const strandMat1 = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3 });
  const strandMat2 = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3 });
  const nodeGeo = new THREE.SphereGeometry(0.07, 16, 16);

  for (let i = 0; i < totalRungs; i++) {
    const t = i / totalRungs;
    const y = (t - 0.5) * heightSpan;
    const angle = t * Math.PI * 4;
    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    const x2 = Math.cos(angle + Math.PI) * radius;
    const z2 = Math.sin(angle + Math.PI) * radius;

    // Backbone nodes
    const node1 = new THREE.Mesh(nodeGeo, strandMat1);
    node1.position.set(x1, y, z1);
    group.add(node1);

    const node2 = new THREE.Mesh(nodeGeo, strandMat2);
    node2.position.set(x2, y, z2);
    group.add(node2);

    // Connecting nucleotide bar
    const barLength = radius * 2;
    const barGeo = new THREE.CylinderGeometry(0.025, 0.025, barLength, 8);
    const colorIndex = i % pairColors.length;
    const barMat = new THREE.MeshStandardMaterial({ color: pairColors[colorIndex], roughness: 0.4 });
    const barMesh = new THREE.Mesh(barGeo, barMat);
    barMesh.position.set(0, y, 0);
    barMesh.rotation.z = Math.PI / 2;
    barMesh.rotation.y = -angle;
    group.add(barMesh);
  }

  return group;
}

export function createRocketModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'rocket_root';

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2, metalness: 0.3 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });

  // Main rocket cylinder
  const bodyGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.4, 32);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  // Nose cone
  const coneGeo = new THREE.ConeGeometry(0.24, 0.6, 32);
  const cone = new THREE.Mesh(coneGeo, accentMat);
  cone.position.set(0, 1.0, 0);
  group.add(cone);

  // Command cabin window
  const winGeo = new THREE.SphereGeometry(0.07, 16, 16);
  const winMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const win = new THREE.Mesh(winGeo, winMat);
  win.position.set(0, 0.4, 0.22);
  group.add(win);

  // Fins (3 aerodynamic fins)
  const finGeo = new THREE.BoxGeometry(0.04, 0.4, 0.3);
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const fin = new THREE.Mesh(finGeo, accentMat);
    fin.position.set(Math.cos(angle) * 0.28, -0.6, Math.sin(angle) * 0.28);
    fin.rotation.y = -angle;
    group.add(fin);
  }

  // Thruster nozzle
  const nozzleGeo = new THREE.ConeGeometry(0.18, 0.25, 24);
  const nozzle = new THREE.Mesh(nozzleGeo, darkMat);
  nozzle.position.set(0, -0.8, 0);
  group.add(nozzle);

  // Engine flame
  const flameGeo = new THREE.ConeGeometry(0.14, 0.6, 16);
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xf97316,
    transparent: true,
    opacity: 0.8,
  });
  const flame = new THREE.Mesh(flameGeo, flameMat);
  flame.name = 'rocket_flame';
  flame.position.set(0, -1.15, 0);
  flame.rotation.x = Math.PI;
  group.add(flame);

  return group;
}

export interface LoadedGLBResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

export async function loadCustomGlbModel(glbDataOrUrl: string | ArrayBuffer | Blob): Promise<LoadedGLBResult> {
  const loader = new GLTFLoader();

  const parseData = (data: ArrayBuffer): Promise<LoadedGLBResult> => {
    return new Promise((resolve, reject) => {
      loader.parse(
        data,
        '',
        (gltf) => {
          resolve({ scene: gltf.scene, animations: gltf.animations || [] });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  if (glbDataOrUrl instanceof Blob) {
    const arrayBuffer = await glbDataOrUrl.arrayBuffer();
    return parseData(arrayBuffer);
  } else if (typeof glbDataOrUrl === 'string') {
    return new Promise((resolve, reject) => {
      loader.load(
        glbDataOrUrl,
        (gltf) => {
          resolve({ scene: gltf.scene, animations: gltf.animations || [] });
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  } else {
    return parseData(glbDataOrUrl);
  }
}

export function build3DModelForTarget(target: ARQRTarget): THREE.Group {
  const qr = (target.qrCode || '').toLowerCase();
  const name = (target.name || '').toLowerCase();

  // If matched to specialized procedural themes
  if (target.modelType === 'heart' || qr.includes('heart') || name.includes('jantung') || qr.includes('qr-01')) {
    const heart = createHeartModel();
    const scale = (target.modelScale || 1.0) * 0.85;
    heart.scale.set(scale, scale, scale);
    heart.position.y += target.elevationOffset || 0.1;
    return heart;
  }

  if (target.modelType === 'solar' || qr.includes('solar') || name.includes('surya') || qr.includes('qr-02')) {
    const solar = createSolarSystemModel();
    const scale = (target.modelScale || 1.0) * 0.7;
    solar.scale.set(scale, scale, scale);
    solar.position.y += target.elevationOffset || 0.1;
    return solar;
  }

  if (target.modelType === 'trex' || qr.includes('trex') || qr.includes('dino') || name.includes('dino') || qr.includes('qr-03')) {
    const trex = createTRexModel();
    const scale = (target.modelScale || 1.0) * 0.8;
    trex.scale.set(scale, scale, scale);
    trex.position.y += target.elevationOffset || 0.1;
    return trex;
  }

  if (target.modelType === 'dna' || qr.includes('dna') || name.includes('dna') || qr.includes('qr-04')) {
    const dna = createDnaHelixModel();
    const scale = (target.modelScale || 1.0) * 0.65;
    dna.scale.set(scale, scale, scale);
    dna.position.y += target.elevationOffset || 0.1;
    return dna;
  }

  if (target.modelType === 'rocket' || qr.includes('rocket') || name.includes('roket') || qr.includes('qr-05')) {
    const rocket = createRocketModel();
    const scale = (target.modelScale || 1.0) * 0.75;
    rocket.scale.set(scale, scale, scale);
    rocket.position.y += target.elevationOffset || 0.1;
    return rocket;
  }

  // Clean Holographic 3D AR Cube Placeholder
  const model = new THREE.Group();
  const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const boxMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(target.accentColor || '#10b981'),
    roughness: 0.3,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85,
  });
  const box = new THREE.Mesh(boxGeo, boxMat);
  model.add(box);

  // Wireframe edges
  const edges = new THREE.EdgesGeometry(boxGeo);
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 2,
  });
  const wireframe = new THREE.LineSegments(edges, lineMat);
  model.add(wireframe);

  const scale = target.modelScale || 1.0;
  model.scale.set(scale, scale, scale);
  model.position.y += target.elevationOffset || 0;
  return model;
}
