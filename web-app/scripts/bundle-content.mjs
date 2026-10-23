/**
 * Copies the first pages of the published online content (Supabase) into public/content before every
 * build (hybrid): those stickers work offline straight after install / update, the rest is downloaded
 * by the app in the background, as before. Google Play limits the app itself to about 200 MB, so only
 * up to CONTENT_BUNDLE_MB (default 30 MB: light to install, the first pages work offline) is taken, page by page from page 1; a sticker that does not
 * fit any more is skipped and smaller later ones are still taken. The manifest written here is marked
 * `partial`, so the app always switches to the complete online list once it is online. Content
 * published later replaces the shipped copy automatically (files are compared by SHA-256).
 *
 * Runs automatically with `npm run build` / `npm run build:admin`. If the server can't be reached the
 * build continues with the content that is already in public/content. The content is not committed
 * (see .gitignore): build the AAB on the computer that ran `npm run build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'public', 'content');

function readEnv() {
  const env = {};
  for (const name of ['.env', '.env.local']) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return { ...env, ...process.env };
}

const env = readEnv();
const custom = (env.VITE_CONTENT_URL || '').trim();
const supabase = (env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const bucket = (env.VITE_SUPABASE_BUCKET || 'vinu-veti').trim();
const base = custom
  ? custom.replace(/\/?$/, '/')
  : supabase
    ? `${supabase}/storage/v1/object/public/${bucket}/`
    : '';

// About 200 MB is the Play Store limit for the app itself; the rest of the app is small
const BUDGET = Math.max(0, Number(env.CONTENT_BUNDLE_MB ?? 30)) * 1024 * 1024;

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
// Same as CHUNK_SIZE in src/services/cloudConfig.ts: bigger files are stored online in parts
const CHUNK_SIZE = 45 * 1024 * 1024;

async function fetchFile(rel, size) {
  const parts = size && size > CHUNK_SIZE ? Math.ceil(size / CHUNK_SIZE) : 0;
  if (parts === 0) {
    const r = await fetch(new URL(rel, base));
    if (!r.ok) throw new Error(`${rel}: HTTP ${r.status}`);
    return Buffer.from(await r.arrayBuffer());
  }
  const chunks = [];
  for (let i = 0; i < parts; i++) {
    const r = await fetch(new URL(`${rel}.part${i}`, base));
    if (!r.ok) throw new Error(`${rel}.part${i}: HTTP ${r.status}`);
    chunks.push(Buffer.from(await r.arrayBuffer()));
  }
  return Buffer.concat(chunks); // the APK keeps the whole file
}

async function main() {
  if (!base) {
    console.log('[konten] VITE_SUPABASE_URL belum diisi — melewati penggabungan konten ke APK.');
    return;
  }
  console.log(`[konten] Mengambil konten terbaru dari ${base}`);
  const res = await fetch(`${base}manifest.json?t=${Date.now()}`, { cache: 'no-store' });
  if (res.status === 400 || res.status === 404) {
    console.log('[konten] Belum ada konten yang dipublikasikan — APK memakai konten yang ada.');
    return;
  }
  if (!res.ok) throw new Error(`manifest.json: HTTP ${res.status}`);
  const manifest = await res.json();
  if (!Array.isArray(manifest.targets)) throw new Error('manifest.json tidak valid');

  // Files of one sticker (models, extra animations, voices, picture)
  const filesOf = (t) => {
    const out = new Map();
    if (t.model) out.set(t.model, { sha: t.modelSha, size: t.modelSize });
    for (const a of t.assets || []) out.set(a.file, { sha: a.sha, size: a.size });
    for (const v of Object.values(t.voices || {})) if (v?.file) out.set(v.file, { sha: v.sha, size: v.size });
    if (t.picture?.file) out.set(t.picture.file, { sha: t.picture.sha, size: t.picture.size });
    if (t.audio && !out.has(t.audio)) out.set(t.audio, { sha: t.audioSha, size: t.audioSize });
    return out;
  };

  // From the first page on, as long as it fits in the budget
  const byPage = [...manifest.targets].sort(
    (a, b) => (a.bookPage ?? Infinity) - (b.bookPage ?? Infinity) || String(a.qrCode).localeCompare(String(b.qrCode))
  );
  const files = new Map();
  const included = [];
  const skipped = [];
  let planned = 0;
  for (const t of byPage) {
    const own = [...filesOf(t)].filter(([rel]) => !files.has(rel));
    const size = own.reduce((sum, [, f]) => sum + (f.size || 0), 0);
    if (planned + size > BUDGET) {
      skipped.push(t);
      continue;
    }
    planned += size;
    for (const [rel, f] of own) files.set(rel, f);
    included.push(t);
  }

  let downloaded = 0;
  let kept = 0;
  let bytes = 0;
  for (const [rel, { sha, size }] of files) {
    const dest = path.join(outDir, rel);
    if (fs.existsSync(dest) && sha && sha256(fs.readFileSync(dest)) === sha) {
      kept++;
      bytes += fs.statSync(dest).size;
      continue;
    }
    const buf = await fetchFile(rel, size);
    if (sha && sha256(buf) !== sha) throw new Error(`${rel}: isi file tidak cocok dengan manifest`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    downloaded++;
    bytes += buf.length;
  }

  // Remove files that are no longer published
  const filesDir = path.join(outDir, 'files');
  let removed = 0;
  if (fs.existsSync(filesDir)) {
    for (const name of fs.readdirSync(filesDir)) {
      if (!files.has(`files/${name}`)) {
        fs.rmSync(path.join(filesDir, name));
        removed++;
      }
    }
  }

  fs.mkdirSync(outDir, { recursive: true });
  // Same order as online; `partial`: the app uses the complete online list as soon as it is online
  const keep = new Set(included.map((t) => t.id));
  const bundled = { ...manifest, partial: skipped.length > 0, targets: manifest.targets.filter((t) => keep.has(t.id)) };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(bundled, null, 2));
  const pages = (list) => list.map((t) => t.bookPage ?? t.qrCode).join(', ');
  console.log(
    `[konten] ${included.length} dari ${manifest.targets.length} stiker ikut di APK (batas ${(BUDGET / 1048576).toFixed(0)} MB): ` +
      `${downloaded} file diunduh, ${kept} tetap, ${removed} dihapus (${(bytes / 1048576).toFixed(1)} MB).`
  );
  if (included.length) console.log(`[konten] Di APK (offline sejak instal): halaman ${pages(included)}`);
  if (skipped.length) console.log(`[konten] Diunduh aplikasi saat online: halaman ${pages(skipped)}`);
}

main().catch((err) => {
  console.warn(`[konten] PERINGATAN: konten online tidak bisa diambil (${err.message}).`);
  console.warn('[konten] Build tetap dilanjutkan dengan konten yang sudah ada di public/content.');
});
