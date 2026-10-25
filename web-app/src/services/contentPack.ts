/**
 * Content packs: how AR content reaches every phone that installs the app from the Play Store.
 *
 *  - Bundled pack: `public/content/` (manifest.json + files) is built into the APK, so the content
 *    works offline right after install.
 *  - Online pack: the admin publishes to Cloudflare R2 via the app's Worker (see cloudPublish.ts). Whenever the app is
 *    online it reads the small `manifest.json`, then downloads only the files whose SHA-256 changed and
 *    mirrors them into local storage, so everything keeps working offline afterwards.
 *
 * The manifest is the index: every file is listed with its SHA-256 and size, so unchanged models are
 * never downloaded twice. The admin panel can also export the same layout as a ZIP.
 */
import type { Zippable } from 'fflate';
import { ARQRTarget, VOICE_LANGS, VoiceFile, VoiceLang } from '../types/arBook';
import { ARDatabase, arrayBufferToBase64, audioKey, getModelEntries, pictureKey, resolveAudioSource, resolveModelSource, resolvePictureSource, voiceOf, ownerVoiceOf, secondVoiceOwner, voiceOwners, voicesOfOwner } from './db';
import { CHUNK_SIZE, currentContentUrl, partCount, REMOTE_CONTENT_BASE, sha256Hex } from './cloudConfig';

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
  // Extra animations; each may have its own voice per language (played when tapped to)
  assets?: Array<{ id: string; name: string; scale?: number; voices?: PackVoices } & PackFile>;
  // Narration voice per language
  voices?: PackVoices;
  // Second voice of the main animation (takes turns with `voices` when tapped back to it)
  voices2?: PackVoices;
  // Picture that shows the model too (picture tracking)
  picture?: PackFile & { name?: string };
  // Legacy single voice (= Indonesian), still written for older app versions
  audio?: string;
  audioSha?: string;
  audioSize?: number;
  audioName?: string;
}

type PackVoices = Partial<Record<VoiceLang, PackFile & { name?: string }>>;

/** Manifest voices -> sticker voices at `base`. */
function toVoiceFiles(v: PackVoices | undefined, base: string): Partial<Record<VoiceLang, VoiceFile>> | undefined {
  if (!v || Object.keys(v).length === 0) return undefined;
  return Object.fromEntries(
    Object.entries(v).map(([lang, f]) => [lang, { name: f!.name || 'audio', url: new URL(f!.file, base).href, sha: f!.sha, size: f!.size }])
  ) as Partial<Record<VoiceLang, VoiceFile>>;
}

/** Every extra voice of a manifest entry with its owner (2nd voice, extra animations' voices). */
function extraPackVoices(p: PackTarget): Array<{ owner: string; voices: PackVoices }> {
  const out: Array<{ owner: string; voices: PackVoices }> = [];
  if (p.voices2) out.push({ owner: secondVoiceOwner(p.id), voices: p.voices2 });
  (p.assets || []).forEach((a) => a.voices && out.push({ owner: a.id, voices: a.voices }));
  return out;
}

/** Voices of a manifest entry, including the legacy single voice (= Indonesian). */
function packVoices(p: PackTarget): Partial<Record<VoiceLang, PackFile & { name?: string }>> {
  const v = { ...(p.voices || {}) };
  if (!v.id && p.audio) v.id = { file: p.audio, sha: p.audioSha, size: p.audioSize, name: p.audioName };
  return v;
}

export interface ContentManifest {
  app: 'vinu-veti';
  version: 1;
  updatedAt: number;
  targets: PackTarget[];
  // Pack inside the APK holding only the first pages (the rest is online): never the full list
  partial?: boolean;
}

const BUNDLED_BASE = new URL('./content/', window.location.href).href;
const APPLIED_KEY = 'vv_content_pack_applied';
// Version (updatedAt) of the online sticker list installed on this phone, set as soon as the list is
// installed, even when some files are still missing
const REMOTE_LIST_KEY = 'vv_content_remote_list';
// Published stickers deleted in the admin panel of this device: not installed again by the sync
// (they are still in the online list until the next "Publish", which drops them for every phone)
const DELETED_KEY = 'vv_deleted_pack_stickers';

function deletedPackIds(): Set<string> {
  try {
    const ids = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
    return new Set(Array.isArray(ids) ? ids.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

function saveDeletedPackIds(ids: Set<string>) {
  try {
    if (ids.size > 0) localStorage.setItem(DELETED_KEY, JSON.stringify([...ids]));
    else localStorage.removeItem(DELETED_KEY);
  } catch {
    // ignore
  }
}

/** After a publish: deletions no longer in the online list need no remembering. */
export function forgetPublishedDeletions(publishedIds: Set<string>) {
  const ids = deletedPackIds();
  ids.forEach((id) => !publishedIds.has(id) && ids.delete(id));
  saveDeletedPackIds(ids);
}

// When this device last published (epoch ms): stickers changed after it are not on other devices yet
const PUBLISHED_AT_KEY = 'vv_last_publish_at';

export function lastPublishedAt(): number {
  try {
    return Number(localStorage.getItem(PUBLISHED_AT_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function markPublishedAt(time: number) {
  try {
    localStorage.setItem(PUBLISHED_AT_KEY, String(time));
  } catch {
    // ignore
  }
}

/** Created or changed on this device after its last publish: other devices do not have it yet. */
export function isUnpublished(t: ARQRTarget, publishedAt = lastPublishedAt()): boolean {
  return t.source === 'local' && t.updatedAt > publishedAt;
}

/** Published stickers deleted on this device whose deletion is not published yet. */
export function pendingDeletionCount(): number {
  return deletedPackIds().size;
}

/** Remember that a published sticker was deleted here, so the next sync does not bring it back. */
export function markPackStickerDeleted(id: string) {
  const ids = deletedPackIds();
  ids.add(id);
  saveDeletedPackIds(ids);
}

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

// Big files are fetched as several byte ranges at the same time: on mobile networks one connection
// rarely uses the full speed, and a dropped connection only repeats one small piece, not the file.
const SEGMENT_SIZE = 4 * 1024 * 1024;
const PARALLEL_SEGMENTS = 4;
const SEGMENT_RETRIES = 3;

async function fetchBytes(url: string, timeoutMs: number, range?: [number, number]): Promise<{ status: number; data: Uint8Array }> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      cache: 'no-store',
      headers: range ? { Range: `bytes=${range[0]}-${range[1] - 1}` } : undefined,
    });
    if (!res.ok) throw new HttpError(res.status, url);
    return { status: res.status, data: new Uint8Array(await res.arrayBuffer()) };
  } finally {
    window.clearTimeout(timer);
  }
}

class HttpError extends Error {
  constructor(public status: number, url: string) {
    super(`Download gagal (${status}): ${url}`);
  }
}

async function withRetries<T>(job: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await job();
    } catch (err) {
      // Retrying does not help when the file is not there (4xx) or the phone is offline
      const permanent = err instanceof HttpError && err.status >= 400 && err.status < 500 && err.status !== 408 && err.status !== 429;
      if (attempt >= SEGMENT_RETRIES || permanent || navigator.onLine === false) throw err;
      await new Promise((r) => window.setTimeout(r, 800 * attempt));
    }
  }
}

/** Runs `jobs` with at most `limit` of them at the same time. */
async function runLimited(jobs: Array<() => Promise<void>>, limit: number): Promise<void> {
  let next = 0;
  let failure: unknown = null;
  const worker = async () => {
    while (next < jobs.length && !failure) {
      const job = jobs[next++];
      try {
        await job();
      } catch (err) {
        failure = err;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, jobs.length) }, worker));
  if (failure) throw failure;
}

// Bytes received so far per running download (for the "loading 3D object… 40 %" indicator)
const received = new Map<string, { done: number; total: number }>();

/** Progress (0-1) of the download of `url`, or null when it is not being downloaded. */
export function downloadProgress(url: string | undefined): number | null {
  const r = url ? received.get(currentContentUrl(url)) : undefined;
  return r && r.total > 0 ? Math.min(1, r.done / r.total) : null;
}

function addReceived(url: string, bytes: number) {
  const r = received.get(url);
  if (r) r.done += bytes;
}

/** Downloads one stored file (`size` bytes known) into `out` at `offset`, in parallel byte ranges. */
async function downloadInto(url: string, size: number, out: Uint8Array, offset: number, owner: string): Promise<void> {
  if (size <= SEGMENT_SIZE) {
    const { data } = await withRetries(() => fetchBytes(url, 180000));
    if (data.byteLength !== size) throw new Error(`Ukuran file tidak cocok: ${url}`);
    out.set(data, offset);
    addReceived(owner, size);
    return;
  }
  // First piece also tells whether the server supports ranges (206); otherwise it sent the whole file.
  // An older WebView that refuses the Range header falls back to one plain download.
  const first = await withRetries(() => fetchBytes(url, 180000, [0, SEGMENT_SIZE])).catch((err) => {
    if ((err instanceof HttpError && err.status !== 416) || navigator.onLine === false) throw err;
    return withRetries(() => fetchBytes(url, 300000));
  });
  if (first.status !== 206) {
    if (first.data.byteLength !== size) throw new Error(`Ukuran file tidak cocok: ${url}`);
    out.set(first.data, offset);
    addReceived(owner, size);
    return;
  }
  if (first.data.byteLength !== SEGMENT_SIZE) throw new Error(`Ukuran file tidak cocok: ${url}`);
  out.set(first.data, offset);
  addReceived(owner, SEGMENT_SIZE);
  const jobs: Array<() => Promise<void>> = [];
  for (let start = SEGMENT_SIZE; start < size; start += SEGMENT_SIZE) {
    const end = Math.min(size, start + SEGMENT_SIZE);
    jobs.push(async () => {
      const { status, data } = await withRetries(() => fetchBytes(url, 180000, [start, end]));
      if (status !== 206 || data.byteLength !== end - start) throw new Error(`Ukuran file tidak cocok: ${url}`);
      out.set(data, offset + start);
      addReceived(owner, end - start);
    });
  }
  await runLimited(jobs, PARALLEL_SEGMENTS);
}

async function downloadNow(url: string, size?: number): Promise<ArrayBuffer> {
  // Files inside the APK are always whole and local: read directly
  if (url.startsWith(BUNDLED_BASE) || !size) {
    const res = await fetchWithTimeout(url, 180000);
    if (!res.ok) throw new Error(`Download gagal (${res.status}): ${url}`);
    return res.arrayBuffer();
  }
  // Big files are stored online in parts (see CHUNK_SIZE)
  const out = new Uint8Array(size);
  const parts = partCount(size);
  received.set(url, { done: 0, total: size });
  try {
    if (parts === 0) {
      await downloadInto(url, size, out, 0, url);
    } else {
      for (let i = 0; i < parts; i++) {
        const start = i * CHUNK_SIZE;
        await downloadInto(`${url}.part${i}`, Math.min(CHUNK_SIZE, size - start), out, start, url);
      }
    }
  } finally {
    received.delete(url);
  }
  return out.buffer;
}

// One download per file at a time: the AR view (sticker scanned before its file was mirrored) and the
// background sync share it instead of fetching the same file twice
const inFlight = new Map<string, Promise<ArrayBuffer>>();

async function download(saved: string, size?: number): Promise<ArrayBuffer> {
  const url = currentContentUrl(saved);
  let job = inFlight.get(url);
  if (!job) {
    job = downloadNow(url, size).finally(() => inFlight.delete(url));
    inFlight.set(url, job);
  }
  return job;
}

/** Same file locations and versions (also fills in SHA/size for stickers stored by older versions). */
function sameFiles(a: ARQRTarget, b: ARQRTarget): boolean {
  const files = (t: ARQRTarget) =>
    JSON.stringify([
      t.customGlbUrl,
      t.customGlbSha,
      t.customGlbSize,
      (t.assets || []).map((x) => [x.id, x.url, x.sha, x.size]),
      VOICE_LANGS.map((l) => [t.voices?.[l]?.url, t.voices?.[l]?.sha, t.voices?.[l]?.size]),
      voiceOwners(t)
        .slice(1)
        .map((o) => VOICE_LANGS.map((l) => [voicesOfOwner(t, o)?.[l]?.url, voicesOfOwner(t, o)?.[l]?.sha, voicesOfOwner(t, o)?.[l]?.size])),
      [t.picture?.url, t.picture?.sha, t.picture?.size],
    ]);
  return files(a) === files(b);
}

// Files shown from an older local copy because the new version could not be downloaded (offline).
// When the new version arrives, the AR view is told to load it ('vv-file-updated' event).
const servedOutdated = new Set<string>();

/**
 * Downloads a mirror job, checks it against the published SHA-256 and stores it on the phone.
 * `waitForBackup: false` (AR view) returns as soon as the file can be shown; the native backup copy
 * is written right after.
 */
const mirroring = new Map<string, Promise<ArrayBuffer>>();

async function mirrorFile(job: MirrorJob, waitForBackup = true): Promise<ArrayBuffer> {
  // The same file requested twice at once (AR view + sync, or prefetch + playback): stored once
  const id = `${job.key}|${job.url}`;
  let running = mirroring.get(id);
  if (!running) {
    running = mirrorFileNow(job, waitForBackup).finally(() => mirroring.delete(id));
    mirroring.set(id, running);
  }
  return running;
}

async function mirrorFileNow(job: MirrorJob, waitForBackup: boolean): Promise<ArrayBuffer> {
  const data = await download(job.url, job.size);
  // Integrity check: the bytes (joined from parts for big files) must match the published index
  const sha = await sha256Hex(data);
  if (job.sha && sha !== job.sha) throw new Error(`File rusak saat diunduh (SHA tidak cocok): ${job.url}`);
  if (job.kind === 'model') await ARDatabase.saveAssetBlob(job.id, data, job.name, sha, waitForBackup);
  else await ARDatabase.saveAudioBlob(job.id, data, job.name, sha, job.lang, waitForBackup);
  if (servedOutdated.delete(job.key)) window.dispatchEvent(new CustomEvent('vv-file-updated', { detail: job.key }));
  return data;
}

function isOnlineUrl(url: string | undefined): url is string {
  return !!url && !!REMOTE_CONTENT_BASE && url.startsWith(REMOTE_CONTENT_BASE);
}

/**
 * Best source of an online file for the AR view, so that anything seen once also works offline:
 * 1. the local copy when it is up to date (SHA-256 matches the published one);
 * 2. otherwise (missing or outdated) download it once, fast and shared with the background sync,
 *    save it on the phone and show it;
 * 3. no internet / download failed: an older local copy, then the native backup copy, is still
 *    better than nothing (replaced as soon as the new version is downloaded).
 */
async function resolveForAR(
  job: MirrorJob,
  stored: () => Promise<Blob | ArrayBuffer | null>,
  backupUrl: () => string | null
): Promise<Blob | ArrayBuffer | string | null> {
  const [local, localSha] = await Promise.all([stored(), storedSha(job)]);
  if (local && (!job.sha || localSha === job.sha)) return local;
  let failure: unknown = null;
  if (navigator.onLine !== false) {
    try {
      return await mirrorFile(job, false);
    } catch (err) {
      console.warn('Download failed, using what is on the phone:', job.url, err);
      failure = err;
    }
  }
  const fallback = local ?? backupUrl();
  if (fallback) {
    servedOutdated.add(job.key);
    return fallback;
  }
  // Unknown size (older manifest, file stored whole): let the loader / player try it directly
  if (navigator.onLine !== false && !job.size && !(failure instanceof HttpError)) return job.url;
  if (job.kind === 'audio') return null;
  // A load failure, not "missing": the file exists, the connection failed
  throw failure instanceof Error ? failure : new Error('offline');
}

function modelJob(target: ARQRTarget, index: number): MirrorJob | null {
  const entry = getModelEntries(target)[index];
  if (!entry || !isOnlineUrl(entry.url)) return null;
  const asset = index > 0 ? target.assets?.[index - 1] : undefined;
  return {
    key: entry.id,
    id: entry.id,
    kind: 'model',
    url: entry.url,
    sha: index > 0 ? asset?.sha : target.customGlbSha,
    size: index > 0 ? asset?.size : target.customGlbSize,
    name: (index > 0 ? asset?.fileName : target.customGlbFileName) || `${entry.id}.glb`,
  };
}

function audioJob(target: ARQRTarget, lang: VoiceLang, owner: string = target.id): MirrorJob | null {
  const voice = ownerVoiceOf(target, owner, lang);
  if (!voice || !isOnlineUrl(voice.url)) return null;
  return { key: audioKey(owner, lang), id: owner, kind: 'audio', lang, url: voice.url, sha: voice.sha, size: voice.size, name: voice.name || 'audio' };
}

function pictureJob(target: ARQRTarget): MirrorJob | null {
  const pic = target.picture;
  if (!pic || !isOnlineUrl(pic.url)) return null;
  const key = pictureKey(target.id);
  return { key, id: key, kind: 'model', url: pic.url, sha: pic.sha, size: pic.size, name: pic.name || 'picture.jpg' };
}

/** Picture source for picture tracking (see resolveForAR): a picture seen once also works offline. */
export async function resolvePictureForAR(target: ARQRTarget): Promise<Blob | ArrayBuffer | string | null> {
  const job = pictureJob(target);
  if (!job) return resolvePictureSource(target);
  return resolveForAR(
    job,
    () => ARDatabase.getAssetBlob(job.id),
    () => ARDatabase.nativeModelUrl(job.id)
  );
}

/** Model source for the AR view (see resolveForAR). */
export async function resolveModelForAR(target: ARQRTarget, index: number): Promise<Blob | ArrayBuffer | string | null> {
  const job = modelJob(target, index);
  if (!job) return resolveModelSource(target, index);
  return resolveForAR(
    job,
    () => ARDatabase.getAssetBlob(job.id),
    () => ARDatabase.nativeModelUrl(job.id)
  );
}

/**
 * Makes sure an online file is stored on the phone (downloads it when missing or outdated), without
 * reading the stored file itself: used to get the next pages ready in the background.
 */
async function ensureStored(job: MirrorJob | null): Promise<void> {
  if (!job || navigator.onLine === false) return;
  const sha = await storedSha(job);
  if (sha && (!job.sha || sha === job.sha)) return;
  await mirrorFile(job);
}

/** Gets a sticker's main model and its voice in `lang` onto the phone ahead of time. */
export async function prefetchSticker(target: ARQRTarget, lang: VoiceLang): Promise<void> {
  await ensureStored(modelJob(target, 0));
  await ensureStored(audioJob(target, lang));
  // The other voices of this sticker (2nd voice, extra animations) are small: ready for the taps
  for (const owner of voiceOwners(target).slice(1)) await ensureStored(audioJob(target, lang, owner));
}

/** Voice source for the AR view (see resolveForAR): a voice heard once also plays offline. */
export async function resolveAudioForAR(target: ARQRTarget, lang: VoiceLang, owner: string = target.id): Promise<Blob | ArrayBuffer | string | null> {
  const job = audioJob(target, lang, owner);
  if (!job) return resolveAudioSource(target, lang, owner);
  return resolveForAR(
    job,
    () => ARDatabase.getAudioBlob(owner, lang),
    () => ARDatabase.nativeAudioUrl(owner, lang)
  );
}

/** Asks the browser not to clear the downloaded content when the phone runs low on space. */
let persistAsked = false;
function askPersistentStorage() {
  if (persistAsked) return;
  persistAsked = true;
  try {
    navigator.storage?.persist?.().catch(() => undefined);
  } catch {
    // not supported
  }
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
    customGlbSha: p.modelSha,
    customGlbSize: p.modelSize,
    assets: (p.assets || []).map((a) => ({
      id: a.id,
      name: a.name,
      fileName: a.name,
      url: new URL(a.file, base).href,
      scale: a.scale,
      sha: a.sha,
      size: a.size,
      voices: toVoiceFiles(a.voices, base),
    })),
    voices2: toVoiceFiles(p.voices2, base),
    voices: Object.fromEntries(
      Object.entries(packVoices(p)).map(([lang, f]) => [lang, { name: f!.name || 'audio', url: new URL(f!.file, base).href, sha: f!.sha, size: f!.size }])
    ) as Partial<Record<VoiceLang, VoiceFile>>,
    picture: p.picture?.file
      ? { name: p.picture.name || 'picture.jpg', url: new URL(p.picture.file, base).href, sha: p.picture.sha, size: p.picture.size }
      : undefined,
    source: 'pack',
    createdAt,
    updatedAt: p.updatedAt,
  };
}

interface MirrorJob {
  key: string; // storage key: "<id>" for models, audioKey() for voices
  id: string;
  kind: 'model' | 'audio';
  lang?: VoiceLang;
  url: string;
  sha?: string;
  size?: number;
  name: string;
}

function mirrorJobs(p: PackTarget, t: ARQRTarget): MirrorJob[] {
  const jobs: MirrorJob[] = [];
  if (t.customGlbUrl) jobs.push({ key: t.id, id: t.id, kind: 'model', url: t.customGlbUrl, sha: p.modelSha, size: p.modelSize, name: p.modelName || `${t.id}.glb` });
  (t.assets || []).forEach((a, i) => {
    if (a.url) jobs.push({ key: a.id, id: a.id, kind: 'model', url: a.url, sha: p.assets?.[i]?.sha, size: p.assets?.[i]?.size, name: a.fileName });
  });
  const voices = packVoices(p);
  VOICE_LANGS.forEach((lang) => {
    const url = t.voices?.[lang]?.url;
    if (url) jobs.push({ key: audioKey(t.id, lang), id: t.id, kind: 'audio', lang, url, sha: voices[lang]?.sha, size: voices[lang]?.size, name: voices[lang]?.name || 'audio' });
  });
  // 2nd voice and the extra animations' own voices
  for (const { owner, voices: pv } of extraPackVoices(p)) {
    VOICE_LANGS.forEach((lang) => {
      const url = voicesOfOwner(t, owner)?.[lang]?.url;
      if (url) jobs.push({ key: audioKey(owner, lang), id: owner, kind: 'audio', lang, url, sha: pv[lang]?.sha, size: pv[lang]?.size, name: pv[lang]?.name || 'audio' });
    });
  }
  if (t.picture?.url) {
    const key = pictureKey(t.id);
    jobs.push({ key, id: key, kind: 'model', url: t.picture.url, sha: p.picture?.sha, size: p.picture?.size, name: p.picture?.name || 'picture.jpg' });
  }
  return jobs;
}

async function storedSha(job: MirrorJob): Promise<string | null> {
  return job.kind === 'model' ? ARDatabase.getAssetSha(job.id) : ARDatabase.getAudioSha(job.id, job.lang);
}

/**
 * Installs the newest available content (online first, bundled as fallback).
 *
 * `onMetadataChanged` fires as soon as the sticker list changed, so new stickers are usable right away
 * (streamed from the internet); files are then mirrored in the background for offline use. Only files
 * whose SHA-256 differs from the local copy are downloaded.
 */
export interface SyncProgress {
  done: number;
  total: number;
}

/** Result of a sync: how many files were mirrored and whether everything is now available offline. */
export interface SyncResult {
  downloaded: number;
  failed: number;
}

export async function syncContentPack(
  onMetadataChanged?: () => void,
  onProgress?: (p: SyncProgress) => void,
  // listOnly: update the sticker list but do not download files (used right before publishing)
  options: { listOnly?: boolean } = {}
): Promise<SyncResult> {
  askPersistentStorage();
  const [bundled, remote] = await Promise.all([
    fetchManifest(BUNDLED_BASE, 5000),
    REMOTE_CONTENT_BASE && navigator.onLine !== false ? fetchManifest(REMOTE_CONTENT_BASE, 10000) : Promise.resolve(null),
  ]);

  let applied: string | null = null;
  let remoteList = 0;
  try {
    applied = localStorage.getItem(APPLIED_KEY);
    remoteList = Number(localStorage.getItem(REMOTE_LIST_KEY)) || (applied?.startsWith('remote:') ? Number(applied.slice(7)) || 1 : 0);
  } catch {
    // ignore
  }
  // Server unreachable (offline) but this phone already has online content: keep it as it is.
  // Falling back to the (older) bundled pack here would delete the mirrored stickers, also when an
  // earlier download was incomplete. Only a newer pack inside an updated APK replaces it.
  // A partial pack (first pages only) never replaces the online list: that would drop the other pages.
  if (!remote && REMOTE_CONTENT_BASE && remoteList > 0 && (!bundled || bundled.partial || !(bundled.updatedAt > remoteList))) {
    return { downloaded: 0, failed: 0 };
  }

  let manifest = bundled;
  let base = BUNDLED_BASE;
  // Same version online as inside the APK: use the APK copy, nothing to download. A partial APK copy:
  // always the complete online list (files that are inside the APK are still read from there)
  if (remote && (!bundled || bundled.partial || remote.updatedAt > bundled.updatedAt)) {
    manifest = remote;
    base = REMOTE_CONTENT_BASE;
  }
  if (!manifest) return { downloaded: 0, failed: 0 };

  const isRemote = base === REMOTE_CONTENT_BASE;
  const stamp = `${isRemote ? 'remote' : 'bundled'}:${manifest.updatedAt}`;
  // Bundled files live in the APK: nothing can go missing. Online files are checked every time
  // (cheap: only the small SHA rows are read), so a file lost from storage is downloaded again.
  if (!isRemote && applied === stamp) return { downloaded: 0, failed: 0 };

  const existing = await ARDatabase.getAllTargets();
  const byId = new Map(existing.map((t) => [t.id, t]));

  // SHA-256 → file inside the APK (from the bundled manifest)
  const bundledBySha = new Map<string, string>();
  for (const bt of bundled?.targets || []) {
    const add = (file?: string, sha?: string) => file && sha && bundledBySha.set(sha, new URL(file, BUNDLED_BASE).href);
    add(bt.model, bt.modelSha);
    (bt.assets || []).forEach((a) => add(a.file, a.sha));
    Object.values(packVoices(bt)).forEach((v) => add(v?.file, v?.sha));
    extraPackVoices(bt).forEach(({ voices }) => Object.values(voices).forEach((v) => add(v?.file, v?.sha)));
    add(bt.picture?.file, bt.picture?.sha);
  }
  let changed = false;
  const queue: MirrorJob[] = [];

  const deleted = deletedPackIds();
  for (const p of manifest.targets) {
    // Deleted in the admin panel here and not published yet: keep it deleted
    if (deleted.has(p.id)) continue;
    const local = byId.get(p.id);
    // A sticker edited in this device's admin panel keeps its local version while it has changes
    // that are not published yet, or when the online one is not newer. Once published, a newer online
    // version (another admin device changed it, e.g. uploaded its model) replaces it.
    if (local && local.source !== 'pack' && (isUnpublished(local) || !(p.updatedAt > local.updatedAt))) continue;
    const target = toTarget(p, base, local?.createdAt ?? Date.now());

    if (isRemote) {
      // Files that are byte-identical to ones shipped inside the APK are read from the APK: no download
      if (bundledBySha.size > 0) {
        const fromApk = (url: string | undefined, sha: string | undefined) => (sha && bundledBySha.get(sha)) || url;
        target.customGlbUrl = fromApk(target.customGlbUrl, p.modelSha);
        target.assets = (target.assets || []).map((a, i) => ({ ...a, url: fromApk(a.url, p.assets?.[i]?.sha) }));
        const pv = packVoices(p);
        for (const lang of VOICE_LANGS) {
          const v = target.voices?.[lang];
          if (v) v.url = fromApk(v.url, pv[lang]?.sha);
        }
        for (const owner of voiceOwners(target).slice(1)) {
          const vs = voicesOfOwner(target, owner);
          for (const lang of VOICE_LANGS) {
            const v = vs?.[lang];
            if (v) v.url = fromApk(v.url, v.sha);
          }
        }
        if (target.picture) target.picture.url = fromApk(target.picture.url, p.picture?.sha);
      }
      const stale: MirrorJob[] = [];
      for (const job of mirrorJobs(p, target)) {
        if (job.url.startsWith(BUNDLED_BASE)) {
          // Served from the APK; drop an outdated local copy so it does not hide the APK file
          const sha = await storedSha(job);
          if (sha && sha !== job.sha) await ARDatabase.deleteAssetKeys([job.key]);
          continue;
        }
        const sha = await storedSha(job);
        if (!sha || !job.sha || sha !== job.sha) stale.push(job);
      }
      // Outdated copies are kept until the new file is stored: offline the sticker still shows its
      // previous version instead of nothing (online the AR view fetches the new one, see resolveForAR)
      queue.push(...stale);
      if (local && local.updatedAt === p.updatedAt && sameFiles(local, target)) continue;
    } else {
      if (local && local.updatedAt === p.updatedAt) continue;
      // Bundled files live in the APK; drop mirrored copies so the bundled ones are used
      await ARDatabase.deleteStoredFiles([...getModelEntries(target).map((e) => e.id), pictureKey(target.id)]);
    }
    await ARDatabase.saveTarget(target, true);
    changed = true;
  }

  // Remove pack stickers that are no longer published
  const published = new Set(manifest.targets.map((t) => t.id));
  // A deletion that has been published (no longer in the list) needs no remembering any more
  let forgotten = false;
  deleted.forEach((id) => {
    if (!published.has(id)) forgotten = deleted.delete(id) || forgotten;
  });
  if (forgotten) saveDeletedPackIds(deleted);
  for (const t of existing) {
    if (t.source === 'pack' && !published.has(t.id)) {
      await ARDatabase.deleteTarget(t);
      changed = true;
    }
  }

  if (isRemote) {
    try {
      localStorage.setItem(REMOTE_LIST_KEY, String(manifest.updatedAt));
    } catch {
      // ignore
    }
  }
  if (changed) onMetadataChanged?.();
  if (options.listOnly) return { downloaded: 0, failed: 0 };

  // Mirror changed files, two at a time (each one in parallel pieces; memory stays low on cheap
  // phones). Small files first, so most stickers work offline as early as possible.
  let allOk = true;
  let downloaded = 0;
  let failed = 0;
  if (queue.length > 0) onProgress?.({ done: 0, total: queue.length });
  queue.sort((a, b) => (a.size ?? Infinity) - (b.size ?? Infinity));
  await runLimited(
    queue.map((job) => async () => {
      try {
        // Already stored meanwhile (scanned in the AR view while this sync ran)
        const sha = await storedSha(job);
        if (!(sha && job.sha && sha === job.sha)) await mirrorFile(job);
        downloaded++;
      } catch (err) {
        console.warn('Mirror skipped, retried next time:', job.url, err);
        allOk = false;
        failed++;
      }
      onProgress?.({ done: downloaded + failed, total: queue.length });
    }),
    2
  );

  if (allOk) {
    try {
      localStorage.setItem(APPLIED_KEY, stamp);
    } catch {
      // ignore
    }
  }
  return { downloaded, failed };
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
  role: 'model' | 'asset' | 'audio' | 'picture';
  assetIndex?: number;
  lang?: VoiceLang;
  bytes: Uint8Array;
  sha: string;
  ext: string;
  // Voices other than the main one: their owner (secondVoiceOwner(id) or an extra animation's id)
  owner?: string;
}

/**
 * Reads every file of every sticker and builds the manifest. `pathFor` decides where each file lives
 * (ZIP export: readable names; online publish: content-addressed names).
 */
export async function buildManifest(
  targets: ARQRTarget[],
  pathFor: (t: ARQRTarget, f: CollectedFile) => string,
  onFile?: (t: ARQRTarget, f: CollectedFile, path: string) => Promise<void>,
  // Publishing: a file that is already online (known path, SHA-256 and size) is referenced as it is,
  // without downloading it to this device first (e.g. models another admin device published)
  reuseOnline?: (t: ARQRTarget, ref: PackFile & { sha: string; size: number }) => void
): Promise<ContentManifest> {
  const online = (t: ARQRTarget, url: string | undefined, sha: string | undefined, size: number | undefined) => {
    if (!reuseOnline || !isOnlineUrl(url) || !sha || !size) return null;
    const ref = { file: url.slice(REMOTE_CONTENT_BASE.length), sha, size };
    reuseOnline(t, ref);
    return ref;
  };
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
    const take = async (src: Blob | ArrayBuffer | string | null, role: CollectedFile['role'], ext: string, assetIndex?: number, lang?: VoiceLang, owner?: string) => {
      const bytes = await toBytes(src);
      if (!bytes) return null;
      const f: CollectedFile = { role, assetIndex, lang, bytes, sha: await sha256Hex(bytes), ext, owner };
      const path = pathFor(t, f);
      if (onFile) await onFile(t, f, path);
      return { f, path };
    };

    const mainRef = online(t, t.customGlbUrl, t.customGlbSha, t.customGlbSize);
    const main = mainRef ? null : await take(await resolveModelSource(t, 0), 'model', 'glb');
    if (mainRef) {
      p.model = mainRef.file;
      p.modelSha = mainRef.sha;
      p.modelSize = mainRef.size;
      p.modelName = t.customGlbFileName;
    } else if (main) {
      p.model = main.path;
      p.modelSha = main.f.sha;
      p.modelSize = main.f.bytes.byteLength;
      p.modelName = t.customGlbFileName;
    }
    const extras = t.assets || [];
    for (let i = 0; i < extras.length; i++) {
      const ref = online(t, extras[i].url, extras[i].sha, extras[i].size);
      if (ref) {
        p.assets!.push({ id: extras[i].id, name: extras[i].fileName, file: ref.file, sha: ref.sha, size: ref.size, scale: extras[i].scale });
        continue;
      }
      const r = await take(await resolveModelSource(t, i + 1), 'asset', 'glb', i);
      if (r) p.assets!.push({ id: extras[i].id, name: extras[i].fileName, file: r.path, sha: r.f.sha, size: r.f.bytes.byteLength, scale: extras[i].scale });
    }
    for (const lang of VOICE_LANGS) {
      const voice = voiceOf(t, lang);
      if (!voice) continue;
      const ref = online(t, voice.url, voice.sha, voice.size);
      const r = ref
        ? { path: ref.file, f: { sha: ref.sha, bytes: { byteLength: ref.size } } }
        : await take(await resolveAudioSource(t, lang), 'audio', extOf(voice.name, 'mp3'), undefined, lang);
      if (!r) continue;
      (p.voices ??= {})[lang] = { file: r.path, sha: r.f.sha, size: r.f.bytes.byteLength, name: voice.name };
      if (lang === 'id') {
        p.audio = r.path;
        p.audioSha = r.f.sha;
        p.audioSize = r.f.bytes.byteLength;
        p.audioName = voice.name;
      }
    }
    // The main animation's 2nd voice and the extra animations' own voices
    const ownerVoices = async (owner: string): Promise<PackVoices | undefined> => {
      const out: PackVoices = {};
      for (const lang of VOICE_LANGS) {
        const voice = ownerVoiceOf(t, owner, lang);
        if (!voice) continue;
        const ref = online(t, voice.url, voice.sha, voice.size);
        const r = ref
          ? { path: ref.file, f: { sha: ref.sha, bytes: { byteLength: ref.size } } }
          : await take(await resolveAudioSource(t, lang, owner), 'audio', extOf(voice.name, 'mp3'), undefined, lang, owner);
        if (r) out[lang] = { file: r.path, sha: r.f.sha, size: r.f.bytes.byteLength, name: voice.name };
      }
      return Object.keys(out).length > 0 ? out : undefined;
    };
    const voices2 = await ownerVoices(secondVoiceOwner(t.id));
    if (voices2) p.voices2 = voices2;
    for (const a of p.assets!) {
      const v = await ownerVoices(a.id);
      if (v) a.voices = v;
    }
    if (t.picture) {
      const ref = online(t, t.picture.url, t.picture.sha, t.picture.size);
      const r = ref
        ? { path: ref.file, f: { sha: ref.sha, bytes: { byteLength: ref.size } } }
        : await take(await resolvePictureSource(t), 'picture', extOf(t.picture.name, 'jpg'));
      if (r) p.picture = { file: r.path, sha: r.f.sha, size: r.f.bytes.byteLength, name: t.picture.name };
    }
    packTargets.push(p);
  }
  return { app: 'vinu-veti', version: 1, updatedAt: Date.now(), targets: packTargets };
}

/** Builds a ZIP content pack (manifest.json + models/ + audio/<id>_<lang>.*) from the given targets. */
export async function exportContentPack(targets: ARQRTarget[]): Promise<Blob> {
  // ZIP code is only needed in the admin tools: loaded here instead of with the app
  const { strToU8, zipSync } = await import('fflate');
  const files: Zippable = {};
  const manifest = await buildManifest(
    targets,
    (t, f) =>
      f.role === 'audio'
        ? `audio/${f.owner ?? t.id}_${f.lang ?? 'id'}.${f.ext}`
        : f.role === 'picture'
          ? `pictures/${t.id}.${f.ext}`
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
  const { strFromU8, unzipSync } = await import('fflate');
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
      voices: {},
      voices2: undefined,
      assets: [],
      picture: undefined,
      source: 'local',
    };
    // A voice of any owner (main, 2nd voice, extra animation) from the ZIP into this device's storage
    const importVoices = async (owner: string, voices: PackVoices | undefined) => {
      const out: Partial<Record<VoiceLang, VoiceFile>> = {};
      for (const [lang, f] of Object.entries(voices || {}) as Array<[VoiceLang, PackFile & { name?: string }]>) {
        const data = entries[prefix + f.file];
        if (!data) continue;
        await ARDatabase.saveAudioBlob(owner, copy(data), f.name || 'audio', undefined, lang);
        out[lang] = { name: f.name || 'audio' };
      }
      return Object.keys(out).length > 0 ? out : undefined;
    };
    const main = p.model && entries[prefix + p.model];
    if (main) await ARDatabase.saveAssetBlob(p.id, copy(main), p.modelName || `${p.id}.glb`);
    for (const a of p.assets || []) {
      const data = entries[prefix + a.file];
      if (!data) continue;
      await ARDatabase.saveAssetBlob(a.id, copy(data), a.name);
      target.assets!.push({ id: a.id, name: a.name.replace(/\.[^/.]+$/, ''), fileName: a.name, scale: a.scale, voices: await importVoices(a.id, a.voices) });
    }
    target.voices2 = await importVoices(secondVoiceOwner(p.id), p.voices2);
    for (const [lang, f] of Object.entries(packVoices(p)) as Array<[VoiceLang, PackFile & { name?: string }]>) {
      const data = entries[prefix + f.file];
      if (!data) continue;
      await ARDatabase.saveAudioBlob(p.id, copy(data), f.name || 'audio', undefined, lang);
      target.voices![lang] = { name: f.name || 'audio' };
    }
    const pic = p.picture?.file && entries[prefix + p.picture.file];
    if (pic) {
      await ARDatabase.saveAssetBlob(pictureKey(p.id), copy(pic), p.picture!.name || 'picture.jpg');
      target.picture = { name: p.picture!.name || 'picture.jpg' };
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
