/**
 * Content packs: how AR content reaches every phone that installs the app from the Play Store.
 *
 *  - Bundled pack: `public/content/` (manifest.json + models/ + audio/) is built into the APK, so the
 *    content works offline right after install.
 *  - Online pack (optional): when VITE_CONTENT_URL is set at build time, the app checks
 *    `<VITE_CONTENT_URL>/manifest.json` whenever it is online. Newer content is downloaded once and
 *    mirrored into local storage, so it keeps working offline afterwards. Any static hosting works
 *    (GitHub Pages, Firebase Hosting, ...); no database server is needed.
 *
 * The admin panel exports a pack as a ZIP with exactly this layout.
 */
import { unzipSync, zipSync, strToU8, strFromU8, Zippable } from 'fflate';
import { ARQRTarget } from '../types/arBook';
import { ARDatabase, arrayBufferToBase64, getModelEntries, resolveAudioSource, resolveModelSource } from './db';

export interface PackTarget {
  id: string;
  name: string;
  qrCode: string;
  bookPage?: number;
  modelScale: number;
  elevationOffset: number;
  autoPlayAudio?: boolean;
  updatedAt: number;
  model?: string; // path relative to the manifest, e.g. "models/target-1.glb"
  modelName?: string;
  assets?: Array<{ id: string; name: string; file: string }>;
  audio?: string;
  audioName?: string;
}

export interface ContentManifest {
  app: 'vinu-veti';
  version: 1;
  updatedAt: number;
  targets: PackTarget[];
}

const BUNDLED_BASE = new URL('./content/', window.location.href).href;
const REMOTE_BASE = (() => {
  const raw = (import.meta.env.VITE_CONTENT_URL as string | undefined)?.trim();
  if (!raw) return '';
  return raw.endsWith('/') ? raw : `${raw}/`;
})();
const APPLIED_KEY = 'vv_content_pack_applied';

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
  } finally {
    window.clearTimeout(timer);
  }
}

async function fetchManifest(base: string, timeoutMs: number): Promise<ContentManifest | null> {
  try {
    const res = await fetchWithTimeout(`${base}manifest.json`, timeoutMs);
    if (!res.ok) return null;
    const json = await res.json();
    return json && Array.isArray(json.targets) ? (json as ContentManifest) : null;
  } catch {
    return null;
  }
}

async function download(url: string): Promise<ArrayBuffer> {
  const res = await fetchWithTimeout(url, 120000);
  if (!res.ok) throw new Error(`Download gagal (${res.status}): ${url}`);
  return res.arrayBuffer();
}

function toTarget(p: PackTarget, base: string, createdAt: number): ARQRTarget {
  return {
    id: p.id,
    name: p.name,
    qrCode: p.qrCode,
    bookPage: p.bookPage,
    modelScale: p.modelScale ?? 1,
    elevationOffset: p.elevationOffset ?? 0,
    autoPlayAudio: p.autoPlayAudio ?? true,
    customGlbFileName: p.modelName,
    customGlbUrl: p.model ? new URL(p.model, base).href : undefined,
    assets: (p.assets || []).map((a) => ({ id: a.id, name: a.name, fileName: a.name, url: new URL(a.file, base).href })),
    hasCustomAudio: !!p.audio,
    customAudioName: p.audioName,
    audioUrl: p.audio ? new URL(p.audio, base).href : undefined,
    source: 'pack',
    createdAt,
    updatedAt: p.updatedAt,
  };
}

/**
 * Installs the newest available content pack. Returns true when local data changed.
 * Bundled files are read straight from the APK; online files are downloaded and stored locally.
 */
export async function syncContentPack(): Promise<boolean> {
  const [bundled, remote] = await Promise.all([
    fetchManifest(BUNDLED_BASE, 5000),
    REMOTE_BASE && navigator.onLine !== false ? fetchManifest(REMOTE_BASE, 8000) : Promise.resolve(null),
  ]);

  let manifest = bundled;
  let base = BUNDLED_BASE;
  if (remote && (!bundled || remote.updatedAt >= bundled.updatedAt)) {
    manifest = remote;
    base = REMOTE_BASE;
  }
  if (!manifest) return false;

  const isRemote = base === REMOTE_BASE;
  const stamp = `${isRemote ? 'remote' : 'bundled'}:${manifest.updatedAt}`;
  try {
    if (localStorage.getItem(APPLIED_KEY) === stamp) return false;
  } catch {
    // ignore
  }

  const existing = await ARDatabase.getAllTargets();
  const byId = new Map(existing.map((t) => [t.id, t]));
  let changed = false;
  let allOk = true;

  for (const p of manifest.targets) {
    const local = byId.get(p.id);
    // Content made on this device in the admin panel always wins over the pack
    if (local && local.source !== 'pack') continue;
    if (local && local.updatedAt === p.updatedAt) continue;

    const target = toTarget(p, base, local?.createdAt ?? Date.now());
    const fileIds = getModelEntries(target).map((e) => e.id);
    try {
      if (isRemote) {
        // Mirror online files into local storage so they work offline
        if (target.customGlbUrl) await ARDatabase.saveAssetBlob(target.id, await download(target.customGlbUrl), p.modelName || `${p.id}.glb`);
        for (const a of target.assets || []) {
          if (a.url) await ARDatabase.saveAssetBlob(a.id, await download(a.url), a.fileName);
        }
        if (target.audioUrl) await ARDatabase.saveAudioBlob(target.id, await download(target.audioUrl), p.audioName || 'audio');
      } else {
        // Bundled files live in the APK; drop stale mirrored copies so the bundled ones are used
        await ARDatabase.deleteStoredFiles(fileIds);
      }
      await ARDatabase.saveTarget(target, true);
      changed = true;
    } catch (err) {
      console.warn('Content pack item skipped:', p.id, err);
      allOk = false;
    }
  }

  // Remove pack items that are no longer published
  const published = new Set(manifest.targets.map((t) => t.id));
  for (const t of existing) {
    if (t.source === 'pack' && !published.has(t.id)) {
      await ARDatabase.deleteTarget(t);
      changed = true;
    }
  }

  if (allOk) {
    try {
      localStorage.setItem(APPLIED_KEY, stamp);
    } catch {
      // ignore
    }
  }
  return changed;
}

function extOf(name: string | undefined, fallback: string): string {
  const m = (name || '').match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : fallback;
}

async function toBytes(src: Blob | ArrayBuffer | string | null): Promise<Uint8Array | null> {
  if (!src) return null;
  if (typeof src === 'string') return new Uint8Array(await download(src));
  if (src instanceof Blob) return new Uint8Array(await src.arrayBuffer());
  return new Uint8Array(src);
}

/** Builds a ZIP content pack (manifest.json + models/ + audio/) from the given targets. */
export async function exportContentPack(targets: ARQRTarget[]): Promise<Blob> {
  const files: Zippable = {};
  const packTargets: PackTarget[] = [];

  for (const t of targets) {
    const p: PackTarget = {
      id: t.id,
      name: t.name,
      qrCode: t.qrCode,
      bookPage: t.bookPage,
      modelScale: t.modelScale,
      elevationOffset: t.elevationOffset,
      autoPlayAudio: t.autoPlayAudio,
      updatedAt: t.updatedAt,
    };

    const main = await toBytes(await resolveModelSource(t, 0));
    if (main) {
      p.model = `models/${t.id}.glb`;
      p.modelName = t.customGlbFileName;
      files[p.model] = [main, { level: 0 }];
    }
    const extras = t.assets || [];
    p.assets = [];
    for (let i = 0; i < extras.length; i++) {
      const bytes = await toBytes(await resolveModelSource(t, i + 1));
      if (!bytes) continue;
      const file = `models/${extras[i].id}.glb`;
      files[file] = [bytes, { level: 0 }];
      p.assets.push({ id: extras[i].id, name: extras[i].fileName, file });
    }
    const audio = await toBytes(await resolveAudioSource(t));
    if (audio) {
      p.audio = `audio/${t.id}.${extOf(t.customAudioName, 'mp3')}`;
      p.audioName = t.customAudioName;
      files[p.audio] = [audio, { level: 0 }];
    }
    packTargets.push(p);
  }

  const manifest: ContentManifest = { app: 'vinu-veti', version: 1, updatedAt: Date.now(), targets: packTargets };
  files['manifest.json'] = strToU8(JSON.stringify(manifest, null, 2));
  const zipped = zipSync(files);
  return new Blob([zipped], { type: 'application/zip' });
}

/** Imports a ZIP content pack as locally editable stickers. Returns the number of stickers imported. */
export async function importContentPack(file: Blob): Promise<number> {
  const entries = unzipSync(new Uint8Array(await file.arrayBuffer()));
  const manifestKey = Object.keys(entries).find((k) => k === 'manifest.json' || k.endsWith('/manifest.json'));
  if (!manifestKey) throw new Error('manifest.json tidak ditemukan di dalam ZIP');
  const prefix = manifestKey.slice(0, manifestKey.length - 'manifest.json'.length);
  const manifest = JSON.parse(strFromU8(entries[manifestKey])) as ContentManifest;
  if (!Array.isArray(manifest.targets)) throw new Error('Format manifest.json tidak valid');

  const copy = (u8: Uint8Array) => u8.slice().buffer as ArrayBuffer;
  let count = 0;
  for (const p of manifest.targets) {
    const target: ARQRTarget = {
      ...toTarget(p, BUNDLED_BASE, Date.now()),
      customGlbUrl: undefined,
      audioUrl: undefined,
      assets: [],
      hasCustomAudio: false,
      source: 'local',
    };
    const main = p.model && entries[prefix + p.model];
    if (main) await ARDatabase.saveAssetBlob(p.id, copy(main), p.modelName || `${p.id}.glb`);
    for (const a of p.assets || []) {
      const data = entries[prefix + a.file];
      if (!data) continue;
      await ARDatabase.saveAssetBlob(a.id, copy(data), a.name);
      target.assets!.push({ id: a.id, name: a.name.replace(/\.[^/.]+$/, ''), fileName: a.name });
    }
    const audio = p.audio && entries[prefix + p.audio];
    if (audio) {
      await ARDatabase.saveAudioBlob(p.id, copy(audio), p.audioName || 'audio');
      target.hasCustomAudio = true;
    }
    await ARDatabase.saveTarget(target);
    count++;
  }
  return count;
}

interface DownloadBridge {
  beginDownload?: (fileName: string, mimeType: string) => boolean;
  appendDownloadChunk?: (b64: string) => boolean;
  finishDownload?: () => string;
}

/** Saves a file to the device: Downloads folder inside the Android app, normal download in a browser. */
export async function saveFileToDevice(blob: Blob, fileName: string): Promise<string> {
  const bridge = (window as unknown as { AndroidBridge?: DownloadBridge }).AndroidBridge;
  if (bridge?.beginDownload && bridge.appendDownloadChunk && bridge.finishDownload) {
    if (!bridge.beginDownload(fileName, blob.type || 'application/octet-stream')) {
      throw new Error('Gagal membuat file di folder Download');
    }
    const chunk = 768 * 1024; // multiple of 3 so base64 chunks concatenate cleanly
    for (let i = 0; i < blob.size; i += chunk) {
      const b64 = arrayBufferToBase64(await blob.slice(i, i + chunk).arrayBuffer());
      if (!bridge.appendDownloadChunk(b64)) throw new Error('Gagal menulis file');
    }
    const location = bridge.finishDownload();
    if (!location) throw new Error('Gagal menyimpan file');
    return location;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  return `Download/${fileName}`;
}
