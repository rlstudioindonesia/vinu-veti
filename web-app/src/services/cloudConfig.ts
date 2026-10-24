/**
 * Online content location.
 *
 * Cloudflare R2 behind the app's own Worker (worker/index.js, docs/R2.md): set VITE_CONTENT_API to the
 * Worker address. The admin build logs in and publishes there (/api), every app reads the content from
 * /cdn/. R2 has no download costs. Alternatively VITE_CONTENT_URL can point at any static folder
 * (read-only, no publishing).
 */
const env = import.meta.env;

export const CONTENT_API = (env.VITE_CONTENT_API || '').trim().replace(/\/+$/, '');

export const CLOUD_PUBLISH_ENABLED = !!CONTENT_API;

function withSlash(u: string) {
  return u.endsWith('/') ? u : `${u}/`;
}

export const REMOTE_CONTENT_BASE: string = (() => {
  const custom = (env.VITE_CONTENT_URL || '').trim();
  if (custom) return withSlash(custom);
  if (CONTENT_API) return `${CONTENT_API}/cdn/`;
  return '';
})();

/**
 * Where the content was published before (Supabase). Addresses saved with that location are read
 * through the Worker instead, which copies a missing file from there into R2 once: nothing has to be
 * uploaded again.
 */
export const LEGACY_CONTENT_BASE = withSlash((env.VITE_LEGACY_CONTENT_URL || '').trim() || '/');

/** A saved file address on its current location (old Supabase address -> same file via the Worker). */
export function currentContentUrl(url: string): string {
  return LEGACY_CONTENT_BASE !== '/' && REMOTE_CONTENT_BASE && url.startsWith(LEGACY_CONTENT_BASE)
    ? REMOTE_CONTENT_BASE + url.slice(LEGACY_CONTENT_BASE.length)
    : url;
}

export async function sha256Hex(data: ArrayBuffer | Uint8Array): Promise<string> {
  const buf = data instanceof Uint8Array ? data : new Uint8Array(data);
  const digest = await crypto.subtle.digest('SHA-256', buf as unknown as ArrayBuffer);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Files bigger than this are stored online as numbered parts (`<file>.part0`, `.part1`, …): one upload
 * to the Worker may be at most 100 MB, and smaller pieces resume better on a slow connection.
 * Readers know a file is split from its size.
 */
export const CHUNK_SIZE = 45 * 1024 * 1024;

export function partCount(size: number | undefined): number {
  return size && size > CHUNK_SIZE ? Math.ceil(size / CHUNK_SIZE) : 0;
}
