import { ARQRTarget, VOICE_LANGS, VoiceFile, VoiceLang } from '../types/arBook';

const DB_NAME = 'ar_qr_stickers_v1';
const DB_VERSION = 1;
const STORE_TARGETS = 'targets';
const STORE_ASSETS = 'assets'; // GLB models & audio files

type FileData = Blob | ArrayBuffer;

interface AndroidBridge {
  saveModelBase64?: (id: string, b64: string) => string;
  beginNativeFile?: (kind: string, id: string) => boolean;
  appendNativeFile?: (b64: string) => boolean;
  finishNativeFile?: () => string;
  cancelNativeFile?: () => void;
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

// Native copies are a backup in app-private storage in case the WebView evicts IndexedDB data, so a
// file that was downloaded once keeps working offline. Older app builds without the chunked bridge
// only take files up to NATIVE_COPY_LIMIT in one call.
const NATIVE_COPY_LIMIT = 15 * 1024 * 1024;
// Multiple of 3, so the base64 pieces concatenate cleanly
const NATIVE_CHUNK = 768 * 1024;

async function writeNativeCopy(kind: 'model' | 'audio', id: string, data: FileData) {
  const bridge = getAndroidBridge();
  if (!bridge) return;
  try {
    const buffer = data instanceof Blob ? await data.arrayBuffer() : data;
    if (bridge.beginNativeFile && bridge.appendNativeFile && bridge.finishNativeFile) {
      if (!bridge.beginNativeFile(kind, id)) return;
      for (let i = 0; i < buffer.byteLength; i += NATIVE_CHUNK) {
        if (!bridge.appendNativeFile(arrayBufferToBase64(buffer.slice(i, i + NATIVE_CHUNK)))) {
          bridge.cancelNativeFile?.();
          return;
        }
        // Let the camera / AR view run between pieces
        await new Promise((r) => window.setTimeout(r, 0));
      }
      bridge.finishNativeFile();
      return;
    }
    const save = kind === 'model' ? bridge.saveModelBase64 : bridge.saveAudioBase64;
    if (save && buffer.byteLength < NATIVE_COPY_LIMIT) save.call(bridge, id, arrayBufferToBase64(buffer));
  } catch (err) {
    console.warn('Native storage note:', err);
  }
}

// Native copies are written one after the other (the bridge writes one file at a time); deletes wait
// for pending writes, so a deleted file can never come back
let nativeQueue: Promise<void> = Promise.resolve();

function saveNativeCopy(kind: 'model' | 'audio', id: string, data: FileData): Promise<void> {
  const job = nativeQueue.then(() => writeNativeCopy(kind, id, data));
  nativeQueue = job.catch(() => undefined);
  return nativeQueue;
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

// Small companion row with only the SHA-256 of a stored file: checking whether a file is up to date
// must not read the whole (possibly 50 MB) file into memory
function shaKey(key: string): string {
  return `${key}#sha`;
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function putAsset(key: string, data: FileData, name: string, type: 'glb' | 'audio', sha?: string) {
  const db = await getDB();
  const tx = db.transaction([STORE_ASSETS], 'readwrite');
  const store = tx.objectStore(STORE_ASSETS);
  store.put({ id: key, data, name, type, sha, createdAt: Date.now() });
  if (sha) store.put({ id: shaKey(key), sha });
  else store.delete(shaKey(key));
  await txDone(tx);
}

/** Deletes stored files and their SHA rows. */
function deleteKeys(store: IDBObjectStore, keys: string[]) {
  keys.forEach((k) => {
    store.delete(k);
    store.delete(shaKey(k));
  });
}

/** SHA-256 recorded when a file was mirrored from the online content (used to skip unchanged files). */
async function getAssetSha(key: string): Promise<string | null> {
  try {
    const db = await getDB();
    const store = db.transaction([STORE_ASSETS], 'readonly').objectStore(STORE_ASSETS);
    const meta = await requestToPromise(store.get(shaKey(key)));
    if (meta) return meta.sha || null;
    // Files stored by older versions have no SHA row yet: read the file row once and add it
    if ((await requestToPromise(db.transaction([STORE_ASSETS], 'readonly').objectStore(STORE_ASSETS).count(key))) === 0) return null;
    const row = await requestToPromise(db.transaction([STORE_ASSETS], 'readonly').objectStore(STORE_ASSETS).get(key));
    if (row?.sha) db.transaction([STORE_ASSETS], 'readwrite').objectStore(STORE_ASSETS).put({ id: shaKey(key), sha: row.sha });
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
    await nativeQueue;
    try {
      [...ids, ...VOICE_LANGS.map((l) => nativeAudioId(target.id, l))].forEach((id) => getAndroidBridge()?.deleteTargetFiles?.(id));
    } catch {
      // ignore
    }
    const db = await getDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction([STORE_TARGETS, STORE_ASSETS], 'readwrite');
      tx.objectStore(STORE_TARGETS).delete(target.id);
      deleteKeys(tx.objectStore(STORE_ASSETS), [...ids, ...VOICE_LANGS.map((l) => audioKey(target.id, l))]);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  },

  /** Removes locally stored files (so a newer bundled/online copy is used instead). */
  async deleteStoredFiles(ids: string[]): Promise<void> {
    await nativeQueue;
    try {
      ids.forEach((id) => getAndroidBridge()?.deleteTargetFiles?.(id));
    } catch {
      // ignore
    }
    const db = await getDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction([STORE_ASSETS], 'readwrite');
      ids.forEach((id) => deleteKeys(tx.objectStore(STORE_ASSETS), [id, ...VOICE_LANGS.map((l) => audioKey(id, l))]));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  },

  /** Deletes exact stored file keys (`<id>` for models, `audioKey()` for voices), including native copies. */
  async deleteAssetKeys(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await nativeQueue;
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
      deleteKeys(tx.objectStore(STORE_ASSETS), keys);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  },

  /** `waitForBackup: false` returns once the file is in IndexedDB; the native backup follows. */
  async saveAssetBlob(id: string, fileData: FileData, fileName: string, sha?: string, waitForBackup = true): Promise<void> {
    await putAsset(id, fileData, fileName, 'glb', sha);
    const backup = saveNativeCopy('model', id, fileData);
    if (waitForBackup) await backup;
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

  async saveAudioBlob(id: string, fileData: FileData, fileName: string, sha?: string, lang: VoiceLang = 'id', waitForBackup = true): Promise<void> {
    await putAsset(audioKey(id, lang), fileData, fileName, 'audio', sha);
    const backup = saveNativeCopy('audio', nativeAudioId(id, lang), fileData);
    if (waitForBackup) await backup;
  },

  /** Native (app-private) backup copy of a model, when IndexedDB lost it. */
  nativeModelUrl(id: string): string | null {
    return getAndroidBridge()?.getModelUrl?.(id) || null;
  },

  nativeAudioUrl(id: string, lang: VoiceLang = 'id'): string | null {
    return getAndroidBridge()?.getAudioUrl?.(nativeAudioId(id, lang)) || null;
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
