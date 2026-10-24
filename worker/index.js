/**
 * Cloudflare Worker of the web / iPhone version (wrangler.jsonc). The app itself is served from the
 * static build (ASSETS); this Worker adds the online content, stored in Cloudflare R2 (no download
 * costs, unlike the Supabase free plan whose download quota ran out):
 *
 *   GET/HEAD /cdn/<path>          public: manifest.json and files/<sha256>.<ext>[.partN] (Range works)
 *   POST     /api/login           admin email + password (secret ADMIN_USERS) -> token for 30 days
 *   PUT      /api/files/<path>    admin: store one file
 *   GET      /api/list?prefix=    admin: names of the stored files
 *   POST     /api/delete          admin: { keys: [...] } removes files no longer used
 *
 * A file that is not in R2 yet is copied once from the old Supabase bucket (LEGACY_CONTENT_URL), so
 * the content already published there does not have to be uploaded again (works once Supabase serves
 * files again). Setup: docs/R2.md.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, PUT, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Range, Cache-Control',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, ETag',
  'Access-Control-Max-Age': '86400',
};

const TOKEN_DAYS = 30;
const MAX_KEY = /^(manifest\.json|files\/[A-Za-z0-9._-]{1,200})$/;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

function cacheControlFor(key) {
  // Files are content-addressed (name = SHA-256): they never change. The list must always be fresh.
  return key === 'manifest.json' ? 'no-cache' : 'public, max-age=31536000, immutable';
}

function contentTypeFor(key) {
  if (key === 'manifest.json') return 'application/json';
  if (/\.part\d+$/.test(key)) return 'application/octet-stream';
  const ext = key.split('.').pop().toLowerCase();
  return (
    { glb: 'model/gltf-binary', mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', ogg: 'audio/ogg', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[ext] ||
    'application/octet-stream'
  );
}

/** "bytes=start-end" / "bytes=start-" / "bytes=-suffix" -> R2 range, null when absent or not understood. */
function parseRange(header) {
  const m = /^bytes=(\d*)-(\d*)$/.exec((header || '').trim());
  if (!m || (m[1] === '' && m[2] === '')) return null;
  if (m[1] === '') return { suffix: Number(m[2]) };
  const offset = Number(m[1]);
  return m[2] === '' ? { offset } : { offset, length: Number(m[2]) - offset + 1 };
}

/** Copies a file that is missing in R2 from the old Supabase bucket (once). */
async function copyFromLegacy(env, key) {
  const base = (env.LEGACY_CONTENT_URL || '').trim();
  // Only files: the list in R2 comes from the first publish there, which makes sure that every file
  // it names really is in R2 (copied, or uploaded from the admin device)
  if (!base || key === 'manifest.json') return null;
  let res;
  try {
    res = await fetch(base.replace(/\/?$/, '/') + key, { cf: { cacheTtl: 0 } });
  } catch {
    return null;
  }
  if (!res.ok || !res.body) return null;
  // R2 needs the length of a stream up front; without it the file is read first
  const body = res.headers.get('Content-Length') ? res.body : await res.arrayBuffer();
  await env.CONTENT.put(key, body, { httpMetadata: { contentType: contentTypeFor(key), cacheControl: cacheControlFor(key) } });
  return env.CONTENT.head(key);
}

async function serveContent(request, env, key) {
  if (!MAX_KEY.test(key)) return json({ error: 'not found' }, 404);
  const head = request.method === 'HEAD';
  let object = await env.CONTENT.head(key);
  if (!object) object = await copyFromLegacy(env, key);
  if (!object) return new Response('Not found', { status: 404, headers: CORS });

  const headers = new Headers(CORS);
  object.writeHttpMetadata(headers);
  headers.set('Content-Type', headers.get('Content-Type') || contentTypeFor(key));
  headers.set('Cache-Control', cacheControlFor(key));
  headers.set('ETag', object.httpEtag);
  headers.set('Accept-Ranges', 'bytes');
  const size = object.size;
  if (head) {
    headers.set('Content-Length', String(size));
    return new Response(null, { headers });
  }

  // Big files are downloaded by the app in parallel pieces (Range)
  const range = parseRange(request.headers.get('Range'));
  if (range) {
    const start = range.suffix !== undefined ? Math.max(0, size - range.suffix) : range.offset;
    const end = range.suffix !== undefined ? size - 1 : Math.min(size - 1, range.length !== undefined ? range.offset + range.length - 1 : size - 1);
    if (start >= size || end < start) {
      headers.set('Content-Range', `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }
    const part = await env.CONTENT.get(key, { range: { offset: start, length: end - start + 1 } });
    if (!part) return new Response('Not found', { status: 404, headers: CORS });
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(part.body, { status: 206, headers });
  }
  const full = await env.CONTENT.get(key);
  if (!full) return new Response('Not found', { status: 404, headers: CORS });
  headers.set('Content-Length', String(size));
  return new Response(full.body, { headers });
}

// ---- Admin login: signed token (HMAC-SHA256), no database needed ----

const enc = new TextEncoder();
const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function hmac(env, text) {
  // The key is derived from the accounts: changing a password signs every admin out
  const key = await crypto.subtle.importKey('raw', enc.encode(`vv-admin:${env.ADMIN_USERS}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(text)));
}

/** ADMIN_USERS: "email:password" pairs separated by commas or new lines. */
function adminUsers(env) {
  return String(env.ADMIN_USERS || '')
    .split(/[\n,]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf(':');
      return { email: line.slice(0, i).trim().toLowerCase(), password: line.slice(i + 1) };
    })
    .filter((u) => u.email && u.password);
}

/** Compares without revealing through timing how much of the text was right. */
function sameText(a, b) {
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

async function login(request, env) {
  const users = adminUsers(env);
  if (users.length === 0) return json({ error: 'Akun admin belum diatur di Cloudflare (secret ADMIN_USERS).' }, 503);
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const user = users.find((u) => u.email === email);
  // Same answer (and similar time) for a wrong email and a wrong password
  const ok = sameText(password, user ? user.password : `x${password}`) && !!user;
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800));
    return json({ error: 'Email atau password salah.' }, 401);
  }
  const expires = Math.floor(Date.now() / 1000) + TOKEN_DAYS * 86400;
  const payload = b64url(enc.encode(JSON.stringify({ email, exp: expires })));
  return json({ access_token: `${payload}.${await hmac(env, payload)}`, expires_at: expires, email });
}

async function adminEmail(request, env) {
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const [payload, signature] = token.split('.');
  if (!payload || !signature || adminUsers(env).length === 0) return null;
  if (!sameText(signature, await hmac(env, payload))) return null;
  try {
    const data = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return data.exp > Date.now() / 1000 ? data.email : null;
  } catch {
    return null;
  }
}

async function handleApi(request, env, path) {
  if (path === 'login' && request.method === 'POST') return login(request, env);
  const email = await adminEmail(request, env);
  if (!email) return json({ error: 'Sesi login habis. Silakan login lagi.' }, 401);

  if (request.method === 'PUT' && (path === 'manifest.json' || path.startsWith('files/'))) {
    const key = path;
    if (!MAX_KEY.test(key)) return json({ error: 'Nama file tidak valid' }, 400);
    if (!request.body) return json({ error: 'File kosong' }, 400);
    await env.CONTENT.put(key, request.body, { httpMetadata: { contentType: contentTypeFor(key), cacheControl: cacheControlFor(key) } });
    return json({ ok: true, key });
  }
  if (path === 'list' && request.method === 'GET') {
    const prefix = new URL(request.url).searchParams.get('prefix') || 'files/';
    const keys = [];
    let cursor;
    do {
      const page = await env.CONTENT.list({ prefix, cursor, limit: 1000 });
      page.objects.forEach((o) => keys.push(o.key));
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);
    return json({ keys });
  }
  if (path === 'delete' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const keys = (Array.isArray(body.keys) ? body.keys : []).filter((k) => typeof k === 'string' && k.startsWith('files/') && MAX_KEY.test(k));
    for (let i = 0; i < keys.length; i += 1000) await env.CONTENT.delete(keys.slice(i, i + 1000));
    return json({ ok: true, deleted: keys.length });
  }
  return json({ error: 'not found' }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/cdn/') || url.pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
      if (!env.CONTENT) return json({ error: 'Bucket R2 belum dihubungkan (lihat docs/R2.md).' }, 503);
      try {
        if (url.pathname.startsWith('/cdn/')) {
          if (request.method !== 'GET' && request.method !== 'HEAD') return json({ error: 'method' }, 405);
          return await serveContent(request, env, decodeURIComponent(url.pathname.slice(5)));
        }
        return await handleApi(request, env, decodeURIComponent(url.pathname.slice(5)));
      } catch (err) {
        return json({ error: err instanceof Error ? err.message : 'error' }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
};
