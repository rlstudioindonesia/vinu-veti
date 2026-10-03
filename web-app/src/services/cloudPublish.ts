/**
 * Publishes the stickers on this device to Supabase Storage (admin build only).
 *
 * Files are stored content-addressed as `files/<sha256>.<ext>`, so:
 *  - a model that did not change is never uploaded again,
 *  - phones never download it again (same SHA in the manifest),
 *  - CDN caching is safe (a changed file gets a new URL).
 * `manifest.json` (the index) is uploaded last, so phones never see a half-published state.
 */
import { ARQRTarget } from '../types/arBook';
import { buildManifest, fetchManifest } from './contentPack';
import { REMOTE_CONTENT_BASE, SUPABASE_ANON_KEY, SUPABASE_BUCKET, SUPABASE_URL } from './cloudConfig';

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch seconds
  email: string;
}

const SESSION_KEY = 'vv_supabase_session';

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
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

async function authRequest(grant: 'password' | 'refresh_token', body: object): Promise<Session> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=${grant}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error_description || json.msg || 'Login gagal. Periksa email dan password.');
  }
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: json.expires_at || Math.floor(Date.now() / 1000) + (json.expires_in || 3600),
    email: json.user?.email || '',
  };
}

export function getCloudUser(): string | null {
  return loadSession()?.email || null;
}

export async function cloudLogin(email: string, password: string): Promise<string> {
  const s = await authRequest('password', { email: email.trim(), password });
  storeSession(s);
  return s.email;
}

export function cloudLogout() {
  storeSession(null);
}

async function accessToken(): Promise<string> {
  let s = loadSession();
  if (!s) throw new Error('Silakan login akun publikasi terlebih dahulu.');
  if (s.expires_at - 60 < Date.now() / 1000) {
    try {
      s = await authRequest('refresh_token', { refresh_token: s.refresh_token });
      storeSession(s);
    } catch {
      storeSession(null);
      throw new Error('Sesi login habis. Silakan login lagi.');
    }
  }
  return s.access_token;
}

async function upload(path: string, body: Uint8Array | string, contentType: string, cacheControl: string) {
  const token = await accessToken();
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': contentType,
      'cache-control': cacheControl,
      'x-upsert': 'true',
    },
    body: body as BodyInit,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const msg = json.message || json.error || res.statusText;
    if (res.status === 413 || /size/i.test(msg)) throw new Error(`File terlalu besar untuk diunggah (${path}). Kompres model .GLB terlebih dahulu.`);
    if (res.status === 401 || res.status === 403) throw new Error('Akun tidak punya izin unggah. Periksa policy bucket Supabase.');
    throw new Error(`Unggah gagal (${res.status}): ${msg}`);
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
  const token = await accessToken();
  const headers = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${SUPABASE_BUCKET}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prefix: 'files', limit: 1000, offset: 0 }),
  });
  if (!res.ok) return;
  const items = (await res.json()) as Array<{ name: string }>;
  const unused = items.map((i) => `files/${i.name}`).filter((p) => !keep.has(p));
  if (unused.length === 0) return;
  await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ prefixes: unused }),
  });
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
};

/** Uploads changed files + a new manifest. Returns how many files were uploaded / skipped. */
export async function publishToCloud(
  targets: ARQRTarget[],
  onProgress?: (p: PublishProgress) => void
): Promise<PublishProgress> {
  await accessToken(); // fail early when not logged in
  const previous = await fetchManifest(REMOTE_CONTENT_BASE, 10000);
  const known = new Set<string>();
  previous?.targets.forEach((t) => {
    if (t.model) known.add(t.model);
    if (t.audio) known.add(t.audio);
    t.assets?.forEach((a) => known.add(a.file));
  });

  const progress: PublishProgress = { done: 0, uploaded: 0, skipped: 0 };
  const referenced = new Set<string>();
  const manifest = await buildManifest(
    targets,
    (_t, f) => `files/${f.sha}.${f.ext}`,
    async (t, f, path) => {
      referenced.add(path);
      progress.current = t.name;
      onProgress?.({ ...progress });
      if (known.has(path) || (await remoteExists(path))) {
        progress.skipped++;
      } else {
        await upload(path, f.bytes, MIME[f.ext] || 'application/octet-stream', 'public, max-age=31536000, immutable');
        progress.uploaded++;
      }
      progress.done++;
      onProgress?.({ ...progress });
    }
  );

  await upload('manifest.json', JSON.stringify(manifest), 'application/json', 'no-cache');
  try {
    await removeUnused(referenced);
  } catch {
    // Cleanup is best-effort; old files are harmless
  }
  progress.current = undefined;
  return progress;
}
