import { ARQRTarget } from '../types/arBook';

const DB_NAME = 'ar_qr_stickers_v1';
const DB_VERSION = 1;
const STORE_TARGETS = 'targets';
const STORE_ASSETS = 'assets'; // for 3D GLB & manual audio files

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

const DEFAULT_SEEDS: ARQRTarget[] = [
  {
    id: 'seed-heart-1',
    name: 'Anatomi Jantung Manusia 3D',
    qrCode: 'QR-01',
    bookPage: 1,
    description: 'Model 3D interaktif anatomi jantung manusia dengan ventrikel, aorta, dan pembuluh darah.',
    modelType: 'heart',
    modelScale: 1.0,
    rotationSpeed: 0,
    elevationOffset: 0.15,
    accentColor: '#ef4444',
    playAnimation: true,
    createdAt: Date.now() - 50000,
    updatedAt: Date.now() - 50000,
  },
  {
    id: 'seed-solar-2',
    name: 'Tata Surya & Orbit Planet',
    qrCode: 'QR-02',
    bookPage: 2,
    description: 'Sistem tata surya dengan Matahari bercahaya dan planet yang mengorbit nyata.',
    modelType: 'solar',
    modelScale: 0.9,
    rotationSpeed: 0,
    elevationOffset: 0.2,
    accentColor: '#f59e0b',
    playAnimation: true,
    createdAt: Date.now() - 40000,
    updatedAt: Date.now() - 40000,
  },
  {
    id: 'seed-trex-3',
    name: 'Dinosaurus Tyrannosaurus Rex',
    qrCode: 'QR-03',
    bookPage: 3,
    description: 'T-Rex prasejarah hidup dengan rahang membuka dan tekstur sisik reptil 3D.',
    modelType: 'trex',
    modelScale: 1.0,
    rotationSpeed: 0,
    elevationOffset: 0.1,
    accentColor: '#10b981',
    playAnimation: true,
    createdAt: Date.now() - 30000,
    updatedAt: Date.now() - 30000,
  },
  {
    id: 'seed-dna-4',
    name: 'Struktur DNA Helix Ganda',
    qrCode: 'QR-04',
    bookPage: 4,
    description: 'Molekul DNA ganda berwarna dengan ikatan basa nitrogen Adenin, Timin, Guanin, dan Sitosin.',
    modelType: 'dna',
    modelScale: 0.95,
    rotationSpeed: 0,
    elevationOffset: 0.25,
    accentColor: '#8b5cf6',
    playAnimation: true,
    createdAt: Date.now() - 20000,
    updatedAt: Date.now() - 20000,
  },
  {
    id: 'seed-rocket-5',
    name: 'Roket Penjelajah Luar Angkasa',
    qrCode: 'QR-05',
    bookPage: 5,
    description: 'Roket antariksa berkecepatan tinggi dengan sirip aerodinamis dan nyala api thruster.',
    modelType: 'rocket',
    modelScale: 0.9,
    rotationSpeed: 0,
    elevationOffset: 0.2,
    accentColor: '#0ea5e9',
    playAnimation: true,
    createdAt: Date.now() - 10000,
    updatedAt: Date.now() - 10000,
  },
];

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function getDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }
  if (dbInitPromise) {
    return dbInitPromise;
  }

  dbInitPromise = new Promise((resolve, reject) => {
    try {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB not supported'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_TARGETS)) {
          const targetStore = db.createObjectStore(STORE_TARGETS, { keyPath: 'id' });
          targetStore.createIndex('qrCode', 'qrCode', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_ASSETS)) {
          db.createObjectStore(STORE_ASSETS, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        dbInstance.onclose = () => {
          dbInstance = null;
          dbInitPromise = null;
        };
        dbInstance.onversionchange = () => {
          dbInstance?.close();
          dbInstance = null;
          dbInitPromise = null;
        };
        resolve(dbInstance);
      };

      request.onerror = () => {
        dbInitPromise = null;
        reject(request.error || new Error('Gagal mengakses IndexedDB'));
      };
    } catch (err) {
      dbInitPromise = null;
      reject(err);
    }
  });

  return dbInitPromise;
}

const LOCAL_STORAGE_KEY = 'ar_qr_targets_offline_cache';

export const ARDatabase = {
  async init(): Promise<void> {
    try {
      await getDB();
      const existing = await this.getAllTargets();
      if (existing.length === 0) {
        for (const seed of DEFAULT_SEEDS) {
          await this.saveTarget(seed);
        }
      }
    } catch (e) {
      console.warn('Using LocalStorage fallback for metadata:', e);
      const existing = this.getLocalStorageTargets();
      if (existing.length === 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SEEDS));
      }
    }
  },

  async getAllTargets(): Promise<ARQRTarget[]> {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const tx = db.transaction([STORE_TARGETS], 'readonly');
        const store = tx.objectStore(STORE_TARGETS);
        const req = store.getAll();
        req.onsuccess = () => {
          let result: ARQRTarget[] = req.result || [];
          if (result.length === 0) {
            result = this.getLocalStorageTargets();
          }
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
          } catch {
            // ignore
          }
          resolve(result);
        };
        req.onerror = () => {
          resolve(this.getLocalStorageTargets());
        };
      });
    } catch {
      return this.getLocalStorageTargets();
    }
  },

  getLocalStorageTargets(): ARQRTarget[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_SEEDS;
    } catch {
      return DEFAULT_SEEDS;
    }
  },

  async getTargetById(id: string): Promise<ARQRTarget | null> {
    const targets = await this.getAllTargets();
    return targets.find((t) => t.id === id) || null;
  },

  async findTargetByBarcode(qrValue: string): Promise<ARQRTarget | null> {
    const clean = qrValue.trim().toLowerCase();
    const targets = await this.getAllTargets();
    const match = targets.find((t) => {
      const targetClean = (t.qrCode || '').trim().toLowerCase();
      return targetClean === clean || clean.includes(targetClean) || targetClean.includes(clean);
    });
    return match || null;
  },

  async saveTarget(target: ARQRTarget): Promise<void> {
    const targetWithTimestamp: ARQRTarget = {
      ...target,
      updatedAt: Date.now(),
    };

    // 1. Instant LocalStorage backup so metadata is never lost
    try {
      const existing = this.getLocalStorageTargets();
      const idx = existing.findIndex((t) => t.id === target.id);
      if (idx >= 0) {
        existing[idx] = targetWithTimestamp;
      } else {
        existing.push(targetWithTimestamp);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }

    // 2. Persistent IndexedDB save
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_TARGETS], 'readwrite');
        const store = tx.objectStore(STORE_TARGETS);
        const req = store.put(targetWithTimestamp);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error || new Error('Gagal menyimpan target ke IndexedDB'));
      });
    } catch (err) {
      console.warn('IndexedDB target save fallback:', err);
    }
  },

  async deleteTarget(id: string): Promise<void> {
    // Also delete from native Android internal filesDir if running in Android container
    try {
      if (typeof window !== 'undefined' && (window as unknown as { AndroidBridge?: { deleteTargetFiles?: (id: string) => void } }).AndroidBridge?.deleteTargetFiles) {
        (window as unknown as { AndroidBridge: { deleteTargetFiles: (id: string) => void } }).AndroidBridge.deleteTargetFiles(id);
      }
    } catch {
      // ignore
    }

    try {
      const existing = this.getLocalStorageTargets().filter((t) => t.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // ignore
    }

    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const tx = db.transaction([STORE_TARGETS, STORE_ASSETS], 'readwrite');
        tx.objectStore(STORE_TARGETS).delete(id);
        tx.objectStore(STORE_ASSETS).delete(id); // GLB model
        tx.objectStore(STORE_ASSETS).delete(`${id}_audio`); // Manual audio
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // ignore
    }
  },

  async saveAssetBlob(id: string, fileData: Blob | ArrayBuffer, fileName: string): Promise<string> {
    // 1. Save directly into Android's app-private storage (context.filesDir) if available
    try {
      const bridge = typeof window !== 'undefined' ? (window as unknown as { AndroidBridge?: { saveModelBase64?: (id: string, b64: string) => string } }).AndroidBridge : undefined;
      if (bridge?.saveModelBase64) {
        const buffer = fileData instanceof Blob ? await fileData.arrayBuffer() : fileData;
        const b64 = arrayBufferToBase64(buffer);
        bridge.saveModelBase64(id, b64);
      }
    } catch (err) {
      console.warn('Native model storage bridge note:', err);
    }

    // 2. Also save into IndexedDB as backup
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_ASSETS], 'readwrite');
      const store = tx.objectStore(STORE_ASSETS);
      const req = store.put({
        id,
        data: fileData,
        name: fileName,
        type: 'glb',
        createdAt: Date.now(),
      });
      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error || new Error('Gagal menyimpan file GLB'));
    });
  },

  async getAssetBlob(id: string): Promise<Blob | ArrayBuffer | null> {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const tx = db.transaction([STORE_ASSETS], 'readonly');
        const store = tx.objectStore(STORE_ASSETS);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  async saveAudioBlob(id: string, fileData: Blob | ArrayBuffer, fileName: string): Promise<string> {
    // 1. Save directly into Android app-private storage
    try {
      const bridge = typeof window !== 'undefined' ? (window as unknown as { AndroidBridge?: { saveAudioBase64?: (id: string, b64: string) => string } }).AndroidBridge : undefined;
      if (bridge?.saveAudioBase64) {
        const buffer = fileData instanceof Blob ? await fileData.arrayBuffer() : fileData;
        const b64 = arrayBufferToBase64(buffer);
        bridge.saveAudioBase64(id, b64);
      }
    } catch (err) {
      console.warn('Native audio storage bridge note:', err);
    }

    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_ASSETS], 'readwrite');
      const store = tx.objectStore(STORE_ASSETS);
      const audioKey = `${id}_audio`;
      const req = store.put({
        id: audioKey,
        data: fileData,
        name: fileName,
        type: 'audio',
        createdAt: Date.now(),
      });
      req.onsuccess = () => resolve(audioKey);
      req.onerror = () => reject(req.error || new Error('Gagal menyimpan file audio'));
    });
  },

  async getAudioBlob(id: string): Promise<Blob | ArrayBuffer | null> {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const tx = db.transaction([STORE_ASSETS], 'readonly');
        const store = tx.objectStore(STORE_ASSETS);
        const req = store.get(`${id}_audio`);
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      const db = await getDB();
      return new Promise((resolve) => {
        const tx = db.transaction([STORE_TARGETS, STORE_ASSETS], 'readwrite');
        tx.objectStore(STORE_TARGETS).clear();
        tx.objectStore(STORE_ASSETS).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // ignore
    }
  },
};
