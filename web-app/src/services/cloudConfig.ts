/**
 * Online content location.
 *
 * Supabase Storage (recommended): set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (+ optional
 * VITE_SUPABASE_BUCKET, default "vinu-veti"). The admin build publishes there; every app reads the
 * public bucket. Alternatively VITE_CONTENT_URL can point at any static folder (read-only).
 */
const env = import.meta.env;

export const SUPABASE_URL = (env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
export const SUPABASE_ANON_KEY = (env.VITE_SUPABASE_ANON_KEY || '').trim();
export const SUPABASE_BUCKET = (env.VITE_SUPABASE_BUCKET || 'vinu-veti').trim();

export const CLOUD_PUBLISH_ENABLED = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

function withSlash(u: string) {
  return u.endsWith('/') ? u : `${u}/`;
}

export const REMOTE_CONTENT_BASE: string = (() => {
  const custom = (env.VITE_CONTENT_URL || '').trim();
  if (custom) return withSlash(custom);
  if (SUPABASE_URL) return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/`;
  return '';
})();

export async function sha256Hex(data: ArrayBuffer | Uint8Array): Promise<string> {
  const buf = data instanceof Uint8Array ? data : new Uint8Array(data);
  const digest = await crypto.subtle.digest('SHA-256', buf as unknown as ArrayBuffer);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
