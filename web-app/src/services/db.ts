import { ARQRTarget, VOICE_LANGS, VoiceFile, VoiceLang } from '../types/arBook';

const DB_NAME = 'ar_qr_stickers_v1';
const DB_VERSION = 1;
const STORE_TARGETS = 'targets';
const STORE_ASSETS = 'assets'; // GLB models & audio files

type FileData = Blob | ArrayBuffer;

interface AndroidBridge {
  saveModelBase64?: (id: string, b64: string) => string;
  saveAudioBase64?: (id: string, b64: string) => string;
  getModelUrl?: (id: string) => string;
  getAudioUrl?: (id: string) => string;
  deleteTargetFiles?: (id: string) => void;
}

export function getAndroidBridge(): AndroidBridge | undefined {
  return typeof window !== 'undefined'
    ? (window as unknown as { AndroidBridge?: AndroidBridge }).AndroidBridge
    : undefined;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize) as unknown as number[]);
  }
  return window.btoa(binary);
}

// Native copies are a backup in app-private storage in case the WebView evicts IndexedDB data.
const NATIVE_COPY_LIMIT = 15 * 1024 * 1024;

async function saveNativeCopy(kind: 'model' | 'audio', id: string, data: FileData) {
  const bridge = getAndroidBridge();
  const save = kind === 'model' ? bridge?.saveModelBase64 : bridge?.saveAudioBase64;
  if (!bridge || !save) return;
  try {
    const buffer = data instanceof Blob ? await data.arrayBuffer() : data;
    if (buffer.byteLength < NATIVE_COPY_LIMIT) {
      save.call(bridge, id, arrayBufferToBase64(buffer));
    }
  } catch (err) {
    console.warn('Native storage note:', err);
  }
}

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
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
      dbInstance.onclose = dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
        dbInitPromise = null;
      };
      resolve(dbInstance);
    };
    request.onerror = () => {
      dbInitPromise = null;
      reject(request.error || new Error('Gagal mengakses penyimpanan lokal'));
    };
  });
  return dbInitPromise;
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putAsset(key: string, data: FileData, name: string, type: 'glb' | 'audio', sha?: string) {
  const db = await getDB();
  const tx = db.transaction([STORE_ASSETS], 'readwrite');
  await requestToPromise(tx.objectStore(STORE_ASSETS).put({ id: key, data, name, type, sha, createdAt: Date.now() }));
}

/** SHA-256 recorded when a file was mirrored from the online content (used to skip unchanged files). */
async function getAssetSha(key: string): Promise<string | null> {
  try {
    const db = await getDB();
    const tx = db.transaction([STORE_ASSETS], 'readonly');
    const row = await requestToPromise(tx.objectStore(STORE_ASSETS).get(key));
    return row?.sha || null;
  } catch {
    return null;
  }
}

async function getAsset(key: string): Promise<FileData | null> {
  try {
    const db = await getDB();
    const tx = db.transaction([STORE_ASSETS], 'readonly');
    const row = await requestToPromise(tx.objectStore(STORE_ASSETS).get(key));
    return row ? row.data : null;
  } catch {
    return null;
  }
}

/** Storage key of a voice file. Indonesian keeps the original key for backwards compatibility. */
export function audioKey(id: string, lang: VoiceLang = 'id'): string {
  return lang === 'id' ? `${id}_audio` : `${id}_audio_${lang}`;
}

/** File id used for the native (app-private) copy of a voice. */
function nativeAudioId(id: string, lang: VoiceLang): string {
  return lang === 'id' ? id : `${id}_${lang}`;
}

/** The sticker's voice for a language (legacy single voice = Indonesian). */
export function voiceOf(target: ARQRTarget, lang: VoiceLang): VoiceFile | null {
  const v = target.voices?.[lang];
  if (v) return v;
  if (lang === 'id' && target.hasCustomAudio) return { name: target.customAudioName || 'audio', url: target.audioUrl };
  return null;
}

export const ARDatabase = {
  async init(): Promise<void> {
    await getDB();
  },

  async getAllTargets(): Promise<ARQRTarget[]> {
    try {
      const db = await getDB();
      const tx = db.transaction([STORE_TARGETS], 'readonly');
      const all: ARQRTarget[] = (await requestToPromise(tx.objectStore(STORE_TARGETS).getAll())) || [];
      return all.sort((a, b) => (a.bookPage ?? 9999) - (b.bookPage ?? 9999) || a.createdAt - b.createdAt);
    } catch {
      return [];
    }
  },

  async getTargetById(id: string): Promise<ARQRTarget | null> {
    const db = await getDB();
    const tx = db.transaction([STORE_TARGETS], 'readonly');
    return (await requestToPromise(tx.objectStore(STORE_TARGETS).get(id))) || null;
  },

  /** Saves target metadata. `keepTimestamp` preserves updatedAt (used when installing content packs). */
  async saveTarget(target: ARQRTarget, keepTimestamp = false): Promise<void> {
    const db = await getDB();
    const tx = db.transaction([STORE_TARGETS], 'readwrite');
    await requestToPromise(
      tx.objectStore(STORE_TARGETS).put(keepTimestamp ? target : { ...target, updatedAt: Date.now() })
    );
  },

  async deleteTarget(target: ARQRTarget): Promise<void> {
    const ids = [target.id, ...(target.assets || []).map((a) => a.id)];
    try {
      [...ids, ...VOICE_LANGS.map((l) => nativeAudioId(target.id, l))].forEach((id) => getAndroidBridge()?.deleteTargetFiles?.(id));
    } catch {
      // ignore
    }
    const db = await getDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction([STORE_TARGETS, STORE_ASSETS], 'readwrite');
      tx.objectStore(STORE_TARGETS).delete(target.id);
      ids.forEach((id) => tx.objectStore(STORE_ASSETS).delete(id));
      VOICE_LANGS.forEach((l) => tx.objectStore(STORE_ASSETS).delete(audioKey(target.id, l)));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  },

  /** Removes locally stored files (so a newer bundled/online copy is used instead). */
  async deleteStoredFiles(ids: string[]): Promise<void> {
    try {
      ids.forEach((id) => getAndroidBridge()?.deleteTargetFiles?.(id));
    } catch {
      // ignore
    }
    const db = await getDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction([STORE_ASSETS], 'readwrite');
      ids.forEach((id) => {
        tx.objectStore(STORE_ASSETS).delete(id);
        VOICE_LANGS.forEach((l) => tx.objectStore(STORE_ASSETS).delete(audioKey(id, l)));
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  },

  /** Deletes exact stored file keys (`<id>` for models, `audioKey()` for voices), including native copies. */
  async deleteAssetKeys(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      new Set(keys.map((k) => k.replace(/_audio$/, '').replace(/_audio_(en|tl)$/, '_$1'))).forEach((id) =>
        getAndroidBridge()?.deleteTargetFiles?.(id)
      );
    } catch {
      // ignore
    }
    const db = await getDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction([STORE_ASSETS], 'readwrite');
      keys.forEach((k) => tx.objectStore(STORE_ASSETS).delete(k));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  },

  async saveAssetBlob(id: string, fileData: FileData, fileName: string, sha?: string): Promise<void> {
    await putAsset(id, fileData, fileName, 'glb', sha);
    await saveNativeCopy('model', id, fileData);
  },

  getAssetBlob(id: string): Promise<FileData | null> {
    return getAsset(id);
  },

  getAssetSha(id: string): Promise<string | null> {
    return getAssetSha(id);
  },

  getAudioSha(id: string, lang: VoiceLang = 'id'): Promise<string | null> {
    return getAssetSha(audioKey(id, lang));
  },

  async saveAudioBlob(id: string, fileData: FileData, fileName: string, sha?: string, lang: VoiceLang = 'id'): Promise<void> {
    await putAsset(audioKey(id, lang), fileData, fileName, 'audio', sha);
    await saveNativeCopy('audio', nativeAudioId(id, lang), fileData);
  },

  getAudioBlob(id: string, lang: VoiceLang = 'id'): Promise<FileData | null> {
    return getAsset(audioKey(id, lang));
  },
};

/** All models attached to a QR: the main model first, then the extra assets. */
export function getModelEntries(target: ARQRTarget): Array<{ id: string; url?: string }> {
  return [
    { id: target.id, url: target.customGlbUrl },
    ...(target.assets || []).map((a) => ({ id: a.id, url: a.url })),
  ];
}

/** Finds the best available source for a model: local copy first, then bundled/online URL. */
export async function resolveModelSource(
  target: ARQRTarget,
  index: number
): Promise<FileData | string | null> {
  const entries = getModelEntries(target);
  const entry = entries[index] || entries[0];
  const stored = await ARDatabase.getAssetBlob(entry.id);
  if (stored) return stored;
  const nativeUrl = getAndroidBridge()?.getModelUrl?.(entry.id);
  if (nativeUrl) return nativeUrl;
  return entry.url || null;
}

/** Best available source of the sticker's voice in a language (null when there is none). */
export async function resolveAudioSource(target: ARQRTarget, lang: VoiceLang = 'id'): Promise<FileData | string | null> {
  const voice = voiceOf(target, lang);
  if (!voice) return null;
  const stored = await ARDatabase.getAudioBlob(target.id, lang);
  if (stored) return stored;
  const nativeUrl = getAndroidBridge()?.getAudioUrl?.(nativeAudioId(target.id, lang));
  if (nativeUrl) return nativeUrl;
  return voice.url || null;
}
