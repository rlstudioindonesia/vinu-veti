import { ARQRTarget } from '../types/arBook';

const DB_NAME = 'ar_qr_stickers_v1';
const DB_VERSION = 1;
const STORE_TARGETS = 'targets';
const STORE_ASSETS = 'assets'; // for 3D GLB & manual audio files

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

const DEFAULT_SEEDS: ARQRTarget[] = [];

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 0x8000; // 32KB chunks to prevent stack overflow and memory freezes
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
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
      // Automatically clean up all dummy seed targets
      for (const t of existing) {
        if (t.id.startsWith('seed-')) {
          await this.deleteTarget(t.id);
        }
      }
    } catch (e) {
      console.warn('Using LocalStorage fallback for metadata:', e);
      const existing = this.getLocalStorageTargets();
      const cleaned = existing.filter((t) => !t.id.startsWith('seed-'));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
    }
  },

  async clearAllDummyTargets(): Promise<void> {
    const existing = await this.getAllTargets();
    for (const t of existing) {
      if (t.id.startsWith('seed-')) {
        await this.deleteTarget(t.id);
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
    const clean = (qrValue || '').trim().toLowerCase();
    if (!clean) return null;
    const targets = await this.getAllTargets();
    const match = targets.find((t) => {
      const targetClean = (t.qrCode || '').trim().toLowerCase();
      if (!targetClean) return false;
      return targetClean === clean;
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
        if (buffer.byteLength < 8 * 1024 * 1024) {
          const b64 = arrayBufferToBase64(buffer);
          bridge.saveModelBase64(id, b64);
        }
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
        if (buffer.byteLength < 8 * 1024 * 1024) {
          const b64 = arrayBufferToBase64(buffer);
          bridge.saveAudioBase64(id, b64);
        }
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
