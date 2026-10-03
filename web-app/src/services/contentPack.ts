/**
 * Content packs: how AR content reaches every phone that installs the app from the Play Store.
 *
 *  - Bundled pack: `public/content/` (manifest.json + files) is built into the APK, so the content
 *    works offline right after install.
 *  - Online pack: the admin publishes to Supabase Storage (see cloudPublish.ts). Whenever the app is
 *    online it reads the small `manifest.json`, then downloads only the files whose SHA-256 changed and
 *    mirrors them into local storage, so everything keeps working offline afterwards.
 *
 * The manifest is the index: every file is listed with its SHA-256 and size, so unchanged models are
 * never downloaded twice. The admin panel can also export the same layout as a ZIP.
 */
import { unzipSync, zipSync, strToU8, strFromU8, Zippable } from 'fflate';
import { ARQRTarget } from '../types/arBook';
import { ARDatabase, arrayBufferToBase64, getModelEntries, resolveAudioSource, resolveModelSource } from './db';
import { REMOTE_CONTENT_BASE, sha256Hex } from './cloudConfig';

export interface PackFile {
  file: string; // path relative to the manifest
  sha?: string; // SHA-256 (hex) of the file contents
  size?: number;
}

export interface PackTarget {
  id: string;
  name: string;
  qrCode: string;
  bookPage?: number;
  modelScale: number;
  elevationOffset: number;
  autoPlayAudio?: boolean;
  updatedAt: number;
  model?: string;
  modelSha?: string;
  modelSize?: number;
  modelName?: string;
  assets?: Array<{ id: string; name: string } & PackFile>;
  audio?: string;
  audioSha?: string;
  audioSize?: number;
  audioName?: string;
}

export interface ContentManifest {
  app: 'vinu-veti';
  version: 1;
  updatedAt: number;
  targets: PackTarget[];
}

const BUNDLED_BASE = new URL('./content/', window.location.href).href;
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

export async function fetchManifest(base: string, timeoutMs: number): Promise<ContentManifest | null> {
  try {
    // Cache-buster: the manifest is tiny and must always be fresh
    const res = await fetchWithTimeout(`${base}manifest.json?t=${Date.now()}`, timeoutMs);
    if (!res.ok) return null;
    const json = await res.json();
    return json && Array.isArray(json.targets) ? (json as ContentManifest) : null;
  } catch {
    return null;
  }
}

async function download(url: string): Promise<ArrayBuffer> {
  const res = await fetchWithTimeout(url, 180000);
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

interface MirrorJob {
  key: string; // storage key: "<id>" for models, "<id>_audio" for audio
  id: string;
  kind: 'model' | 'audio';
  url: string;
  sha?: string;
  name: string;
}

function mirrorJobs(p: PackTarget, t: ARQRTarget): MirrorJob[] {
  const jobs: MirrorJob[] = [];
  if (t.customGlbUrl) jobs.push({ key: t.id, id: t.id, kind: 'model', url: t.customGlbUrl, sha: p.modelSha, name: p.modelName || `${t.id}.glb` });
  (t.assets || []).forEach((a, i) => {
    if (a.url) jobs.push({ key: a.id, id: a.id, kind: 'model', url: a.url, sha: p.assets?.[i]?.sha, name: a.fileName });
  });
  if (t.audioUrl) jobs.push({ key: `${t.id}_audio`, id: t.id, kind: 'audio', url: t.audioUrl, sha: p.audioSha, name: p.audioName || 'audio' });
  return jobs;
}

async function storedSha(job: MirrorJob): Promise<string | null> {
  return job.kind === 'model' ? ARDatabase.getAssetSha(job.id) : ARDatabase.getAudioSha(job.id);
}

/**
 * Installs the newest available content (online first, bundled as fallback).
 *
 * `onMetadataChanged` fires as soon as the sticker list changed, so new stickers are usable right away
 * (streamed from the internet); files are then mirrored in the background for offline use. Only files
 * whose SHA-256 differs from the local copy are downloaded.
 */
export async function syncContentPack(onMetadataChanged?: () => void): Promise<void> {
  const [bundled, remote] = await Promise.all([
    fetchManifest(BUNDLED_BASE, 5000),
    REMOTE_CONTENT_BASE && navigator.onLine !== false ? fetchManifest(REMOTE_CONTENT_BASE, 10000) : Promise.resolve(null),
  ]);

  let applied: string | null = null;
  try {
    applied = localStorage.getItem(APPLIED_KEY);
  } catch {
    // ignore
  }
  // Server unreachable (offline) but this phone already has online content: keep it as it is.
  // Falling back to the (older) bundled pack here would delete the mirrored stickers.
  if (!remote && REMOTE_CONTENT_BASE && applied?.startsWith('remote:')) return;

  let manifest = bundled;
  let base = BUNDLED_BASE;
  if (remote && (!bundled || remote.updatedAt >= bundled.updatedAt)) {
    manifest = remote;
    base = REMOTE_CONTENT_BASE;
  }
  if (!manifest) return;

  const isRemote = base === REMOTE_CONTENT_BASE;
  const stamp = `${isRemote ? 'remote' : 'bundled'}:${manifest.updatedAt}`;
  if (applied === stamp) return;

  const existing = await ARDatabase.getAllTargets();
  const byId = new Map(existing.map((t) => [t.id, t]));
  let changed = false;
  const queue: MirrorJob[] = [];

  for (const p of manifest.targets) {
    const local = byId.get(p.id);
    // Content made on this device in the admin panel always wins over the pack
    if (local && local.source !== 'pack') continue;
    const target = toTarget(p, base, local?.createdAt ?? Date.now());

    if (isRemote) {
      const stale: MirrorJob[] = [];
      for (const job of mirrorJobs(p, target)) {
        const sha = await storedSha(job);
        if (!sha || !job.sha || sha !== job.sha) stale.push(job);
      }
      if (local && local.updatedAt === p.updatedAt && stale.length === 0) continue;
      // Drop outdated copies first, so an old model is never shown; until the new file is mirrored
      // the app streams it from the online URL.
      await ARDatabase.deleteAssetKeys(stale.map((j) => j.key));
      queue.push(...stale);
    } else {
      if (local && local.updatedAt === p.updatedAt) continue;
      // Bundled files live in the APK; drop mirrored copies so the bundled ones are used
      await ARDatabase.deleteStoredFiles(getModelEntries(target).map((e) => e.id));
    }
    await ARDatabase.saveTarget(target, true);
    changed = true;
  }

  // Remove pack stickers that are no longer published
  const published = new Set(manifest.targets.map((t) => t.id));
  for (const t of existing) {
    if (t.source === 'pack' && !published.has(t.id)) {
      await ARDatabase.deleteTarget(t);
      changed = true;
    }
  }

  if (changed) onMetadataChanged?.();

  // Mirror changed files one by one (keeps memory low on cheap phones)
  let allOk = true;
  for (const job of queue) {
    try {
      const data = await download(job.url);
      const sha = job.sha || (await sha256Hex(data));
      if (job.kind === 'model') await ARDatabase.saveAssetBlob(job.id, data, job.name, sha);
      else await ARDatabase.saveAudioBlob(job.id, data, job.name, sha);
    } catch (err) {
      console.warn('Mirror skipped, retried next time:', job.url, err);
      allOk = false;
    }
  }

  if (allOk) {
    try {
      localStorage.setItem(APPLIED_KEY, stamp);
    } catch {
      // ignore
    }
  }
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

export interface CollectedFile {
  role: 'model' | 'asset' | 'audio';
  assetIndex?: number;
  bytes: Uint8Array;
  sha: string;
  ext: string;
}

/**
 * Reads every file of every sticker and builds the manifest. `pathFor` decides where each file lives
 * (ZIP export: readable names; online publish: content-addressed names).
 */
export async function buildManifest(
  targets: ARQRTarget[],
  pathFor: (t: ARQRTarget, f: CollectedFile) => string,
  onFile?: (t: ARQRTarget, f: CollectedFile, path: string) => Promise<void>
): Promise<ContentManifest> {
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
      assets: [],
    };
    const take = async (src: Blob | ArrayBuffer | string | null, role: CollectedFile['role'], ext: string, assetIndex?: number) => {
      const bytes = await toBytes(src);
      if (!bytes) return null;
      const f: CollectedFile = { role, assetIndex, bytes, sha: await sha256Hex(bytes), ext };
      const path = pathFor(t, f);
      if (onFile) await onFile(t, f, path);
      return { f, path };
    };

    const main = await take(await resolveModelSource(t, 0), 'model', 'glb');
    if (main) {
      p.model = main.path;
      p.modelSha = main.f.sha;
      p.modelSize = main.f.bytes.byteLength;
      p.modelName = t.customGlbFileName;
    }
    const extras = t.assets || [];
    for (let i = 0; i < extras.length; i++) {
      const r = await take(await resolveModelSource(t, i + 1), 'asset', 'glb', i);
      if (r) p.assets!.push({ id: extras[i].id, name: extras[i].fileName, file: r.path, sha: r.f.sha, size: r.f.bytes.byteLength });
    }
    const audio = await take(await resolveAudioSource(t), 'audio', extOf(t.customAudioName, 'mp3'));
    if (audio) {
      p.audio = audio.path;
      p.audioSha = audio.f.sha;
      p.audioSize = audio.f.bytes.byteLength;
      p.audioName = t.customAudioName;
    }
    packTargets.push(p);
  }
  return { app: 'vinu-veti', version: 1, updatedAt: Date.now(), targets: packTargets };
}

/** Builds a ZIP content pack (manifest.json + models/ + audio/) from the given targets. */
export async function exportContentPack(targets: ARQRTarget[]): Promise<Blob> {
  const files: Zippable = {};
  const manifest = await buildManifest(
    targets,
    (t, f) =>
      f.role === 'audio'
        ? `audio/${t.id}.${f.ext}`
        : `models/${f.role === 'asset' ? t.assets![f.assetIndex!].id : t.id}.glb`,
    async (_t, f, path) => {
      files[path] = [f.bytes, { level: 0 }];
    }
  );
  files['manifest.json'] = strToU8(JSON.stringify(manifest, null, 2));
  return new Blob([zipSync(files)], { type: 'application/zip' });
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
