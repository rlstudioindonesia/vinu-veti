/**
 * Publishes the stickers on this device to the online content store: Cloudflare R2 behind the app's
 * Worker (worker/index.js, docs/R2.md). Admin build only.
 *
 * Files are stored content-addressed as `files/<sha256>.<ext>`, so:
 *  - a model that did not change is never uploaded again,
 *  - phones never download it again (same SHA in the manifest),
 *  - CDN caching is safe (a changed file gets a new URL).
 * `manifest.json` (the index) is uploaded last, so phones never see a half-published state.
 */
import { ARQRTarget } from '../types/arBook';
import { buildManifest, forgetPublishedDeletions, markPublishedAt, syncContentPack } from './contentPack';
import { ARDatabase } from './db';
import { CHUNK_SIZE, CONTENT_API, partCount, REMOTE_CONTENT_BASE } from './cloudConfig';

interface Session {
  access_token: string;
  expires_at: number; // epoch seconds
  email: string;
}

// Own key: a login saved by the earlier Supabase version is not valid here and is simply ignored
const SESSION_KEY = 'vv_admin_session';
export { isUnpublished, lastPublishedAt } from './contentPack';

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const s = raw ? (JSON.parse(raw) as Session) : null;
    return s && s.expires_at > Date.now() / 1000 ? s : null;
  } catch {
    return null;
  }
}

function storeSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function getCloudUser(): string | null {
  return loadSession()?.email || null;
}

export async function cloudLogin(email: string, password: string): Promise<string> {
  const res = await fetch(`${CONTENT_API}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Login gagal. Periksa email dan password.');
  const s: Session = { access_token: json.access_token, expires_at: json.expires_at, email: json.email || email.trim() };
  storeSession(s);
  return s.email;
}

export function cloudLogout() {
  storeSession(null);
}

function accessToken(): string {
  const s = loadSession();
  if (!s) throw new Error('Sesi login habis. Silakan login lagi.');
  return s.access_token;
}

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${CONTENT_API}/api/${path}`, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${accessToken()}` },
  });
  if (res.status === 401) {
    storeSession(null);
    throw new Error('Sesi login habis. Silakan login lagi.');
  }
  return res;
}

async function upload(path: string, body: Uint8Array | string, contentType: string) {
  const res = await api(path, { method: 'PUT', headers: { 'Content-Type': contentType }, body: body as BodyInit });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    if (res.status === 413) throw new Error(`File terlalu besar untuk diunggah (${path}). Kompres model .GLB terlebih dahulu.`);
    throw new Error(`Unggah gagal (${res.status}): ${json.error || res.statusText}`);
  }
}

async function remoteExists(path: string): Promise<boolean> {
  try {
    const res = await fetch(`${REMOTE_CONTENT_BASE}${path}`, { method: 'HEAD', cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

async function removeUnused(keep: Set<string>) {
  const res = await api('list?prefix=files/');
  if (!res.ok) return;
  const { keys } = (await res.json()) as { keys: string[] };
  const unused = (keys || []).filter((k) => !keep.has(k));
  if (unused.length === 0) return;
  await api('delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keys: unused }) });
}

/**
 * A file that is neither stored on this device nor in R2 yet, while the old location (Supabase) cannot
 * be reached: say what to do instead of only "download failed".
 */
async function withMissingFileHint<T>(job: () => Promise<T>): Promise<T> {
  try {
    return await job();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/Download gagal/.test(msg)) throw err;
    throw new Error(
      'Sebagian file tidak tersimpan di perangkat ini dan belum ada di server baru (server lama belum bisa diakses). ' +
        'Impor ZIP cadangan lewat "Impor Paket Konten", lalu Publikasikan lagi. (' + msg + ')'
    );
  }
}

export interface PublishProgress {
  done: number;
  uploaded: number;
  skipped: number;
  current?: string;
}

const MIME: Record<string, string> = {
  glb: 'model/gltf-binary',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

/** Uploads changed files + a new manifest. Returns how many files were uploaded / skipped. */
/**
 * Publishes this device's sticker list. Several admins may publish (e.g. two laptops): first the
 * changes other devices published meanwhile are taken in (list only, files stay online), so this
 * publish never removes or reverts their work. Stickers changed here and not published yet win.
 */
export async function publishToCloud(onProgress?: (p: PublishProgress) => void): Promise<PublishProgress> {
  accessToken(); // fail early when not logged in
  // Changes saved while publishing runs are not in this upload: they stay marked as unpublished
  const publishStartedAt = Date.now();
  await syncContentPack(undefined, undefined, { listOnly: true });
  const targets = await ARDatabase.getAllTargets();

  const progress: PublishProgress = { done: 0, uploaded: 0, skipped: 0 };
  const referenced = new Set<string>();
  const manifest = await withMissingFileHint(() =>
    buildManifest(
      targets,
      (_t, f) => `files/${f.sha}.${f.ext}`,
      async (t, f, path) => {
        // Over the 50 MB upload limit: store it as parts, the app joins them again after download
        const parts = partCount(f.bytes.byteLength);
        const objects = parts > 0 ? Array.from({ length: parts }, (_, i) => `${path}.part${i}`) : [path];
        objects.forEach((o) => referenced.add(o));
        progress.current = t.name;
        onProgress?.({ ...progress });
        // Parts are uploaded in order: only when the LAST part is there was a big file uploaded
        // completely (an interrupted upload is completed now instead of breaking that model for everyone).
        // Always checked on the server: a file listed online may still only be at the old location (the
        // Worker copies it from there when it can; otherwise it is uploaded from this device now)
        if (await remoteExists(objects[objects.length - 1])) {
          progress.skipped++;
        } else {
          for (let i = 0; i < objects.length; i++) {
            const body = parts > 0 ? f.bytes.subarray(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE) : f.bytes;
            await upload(objects[i], body, parts > 0 ? 'application/octet-stream' : MIME[f.ext] || 'application/octet-stream');
          }
          progress.uploaded++;
        }
        progress.done++;
        onProgress?.({ ...progress });
      },
      (t, ref) => {
        // Already online (another device published it): keep it referenced so cleanup keeps it
        const parts = partCount(ref.size);
        (parts > 0 ? Array.from({ length: parts }, (_, i) => `${ref.file}.part${i}`) : [ref.file]).forEach((o) => referenced.add(o));
        progress.current = t.name;
        progress.skipped++;
        progress.done++;
        onProgress?.({ ...progress });
      }
    )
  );

  await upload('manifest.json', JSON.stringify(manifest), 'application/json');
  markPublishedAt(publishStartedAt);
  forgetPublishedDeletions(new Set(manifest.targets.map((t) => t.id)));
  try {
    await removeUnused(referenced);
  } catch {
    // Cleanup is best-effort; old files are harmless
  }
  progress.current = undefined;
  return progress;
}
