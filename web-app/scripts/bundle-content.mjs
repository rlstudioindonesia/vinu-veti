/**
 * Copies the published online content (Supabase) into public/content before every build, so the APK
 * on the Play Store already contains every sticker, animation and voice: it works offline straight
 * after install / update. Newer content published later is still mirrored by the app when online.
 *
 * Runs automatically with `npm run build` / `npm run build:admin`. If the server can't be reached the
 * build continues with the content that is already in public/content.
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

  // Every file referenced by the manifest (models, extra animations, voices)
  const files = new Map();
  for (const t of manifest.targets) {
    if (t.model) files.set(t.model, { sha: t.modelSha, size: t.modelSize });
    for (const a of t.assets || []) files.set(a.file, { sha: a.sha, size: a.size });
    for (const v of Object.values(t.voices || {})) if (v?.file) files.set(v.file, { sha: v.sha, size: v.size });
    if (t.audio && !files.has(t.audio)) files.set(t.audio, { sha: t.audioSha, size: t.audioSize });
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
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(
    `[konten] ${manifest.targets.length} stiker siap offline di APK: ${downloaded} file diunduh, ${kept} tetap, ` +
      `${removed} dihapus (${(bytes / 1048576).toFixed(1)} MB).`
  );
}

main().catch((err) => {
  console.warn(`[konten] PERINGATAN: konten online tidak bisa diambil (${err.message}).`);
  console.warn('[konten] Build tetap dilanjutkan dengan konten yang sudah ada di public/content.');
});
