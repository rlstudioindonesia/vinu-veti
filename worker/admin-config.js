// Admin accounts given as a Cloudflare *build* variable ADMIN_USERS (Settings → Build → Variables and
// secrets) instead of a Worker secret. Filled in by worker/write-admin-config.mjs during the build on
// Cloudflare; empty in the repository. The Worker secret ADMIN_USERS, when set, takes precedence.
// The Worker code is not public (visitors only get the responses), so the value stays private.
export const BUILD_ADMIN_USERS = '';
