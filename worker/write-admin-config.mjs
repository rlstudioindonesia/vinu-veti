/**
 * Runs at the end of `npm run build:web` (Cloudflare build): copies the build variable ADMIN_USERS
 * into worker/admin-config.js, so the admin login also works when the accounts were entered under
 * Build → Variables and secrets instead of the Worker's own Variables and Secrets. Does nothing when
 * the variable is not set (the file keeps its empty value).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const value = (process.env.ADMIN_USERS || '').trim();
if (!value) {
  console.log('[admin] ADMIN_USERS tidak ada di variabel build (memakai secret Worker bila ada).');
} else {
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), 'admin-config.js');
  const src = fs.readFileSync(file, 'utf8').replace(/export const BUILD_ADMIN_USERS = .*;/, `export const BUILD_ADMIN_USERS = ${JSON.stringify(value)};`);
  fs.writeFileSync(file, src);
  console.log('[admin] Akun admin dari variabel build ADMIN_USERS dipasang ke Worker.');
}
